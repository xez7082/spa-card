import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- ÉDITEUR DE CONFIGURATION ---
class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {}, _tab: { type: Number } };
  }
  
  constructor() {
    super();
    this._tab = 0;
  }

  setConfig(config) {
    this._config = config;
  }

  _selectTab(idx) {
    this._tab = idx;
    this.requestUpdate();
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const event = new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this._config) return html``;
    
    // On définit les onglets pour l'éditeur
    const tabs = ["Général", "Boutons", "Sondes", "Système", "Caméra", "Cibles"];
    
    // Schéma simplifié pour l'exemple (à compléter selon vos besoins)
    const currentSchema = [
      { name: "card_title", label: "Titre", selector: { text: {} } },
      { name: "background_image", label: "URL Image de fond", selector: { text: {} } },
      { name: "card_height_v", label: "Hauteur (vh)", selector: { number: { min: 20, max: 100 } } }
    ];

    return html`
      <div class="editor-container">
        <div class="tabs">
          ${tabs.map((n, i) => html`
            <div class="tab ${this._tab === i ? 'active' : ''}" @click=${() => this._selectTab(i)}>${n}</div>
          `)}
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${currentSchema}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }

  static styles = css`
    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
    .tab { padding: 8px 12px; background: #333; color: white; border-radius: 8px; cursor: pointer; font-size: 12px; border: 1px solid #555; }
    .tab.active { background: #00f9f9; color: black; font-weight: bold; border-color: #00f9f9; }
  `;
}

// --- CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  static get properties() {
    return { hass: {}, config: {} };
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration invalide");
    this.config = config;
  }

  _getState(id, icon) {
    if (!this.hass || !id || !this.hass.states[id]) {
        return { val: '?', unit: '', active: false, icon: icon || 'mdi:help-circle' };
    }
    const s = this.hass.states[id];
    const rawVal = parseFloat(s.state);
    const val = !isNaN(rawVal) ? rawVal.toFixed(1) : s.state;
    const unit = s.attributes.unit_of_measurement || '';
    const active = !['off', 'unavailable', 'unknown', 'standby'].includes(s.state.toLowerCase());
    return { val, unit, icon: icon || s.attributes.icon, active };
  }

  _getChemColor(type, value) {
    const v = parseFloat(value);
    if (isNaN(v)) return '#00f9f9';
    if (type === 'ph') return (v < 7.2 || v > 7.6) ? '#ff4d4d' : '#00f9f9';
    if (type === 'orp') return (v < 650) ? '#ff4d4d' : '#00f9f9';
    if (type === 'br') return (v < 3.0 || v > 5.0) ? '#ff4d4d' : '#00f9f9';
    return '#00f9f9';
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="background-image: url('${c.background_image}'); height: ${c.card_height_v || 80}vh;">
        <div class="overlay"></div>
        
        <div class="header" style="justify-content: ${c.title_align || 'center'}">
           <h1>${c.card_title || 'SPA CONTROL'}</h1>
        </div>

        <div class="button-grid" style="top: ${c.btn_y || 15}%;">
          ${Array.from({length: 8}).map((_, i) => {
            const entity = c[`switch_${i+1}_entity`];
            if (!entity) return '';
            const state = this._getState(entity);
            return html`
              <div class="btn-item ${state.active ? 'active' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: entity})}>
                <ha-icon icon="${c[`switch_${i+1}_icon`] || 'mdi:power'}"></ha-icon>
                <span>${c[`switch_${i+1}_label`] || 'B'+(i+1)}</span>
              </div>
            `;
          })}
        </div>

        <div class="glass-panel temp-panel" style="left:${c.pos_temp_x}%; top:${c.pos_temp_y}%;">
          <div class="panel-header">THERMIQUE</div>
          <div class="temp-main">
            <span class="temp-value">${this._getState(c.entity_water_temp).val}</span>
            <span class="temp-unit">${this._getState(c.entity_water_temp).unit}</span>
          </div>
        </div>

        <div class="glass-panel" style="left:${c.pos_chem_x}%; top:${c.pos_chem_y}%;">
          <div class="panel-header">CHIMIE</div>
          <div class="data-row"><span>pH</span><span class="value" style="color:${this._getChemColor('ph', this._getState(c.entity_ph).val)}">${this._getState(c.entity_ph).val}</span></div>
          <div class="data-row"><span>ORP</span><span class="value" style="color:${this._getChemColor('orp', this._getState(c.entity_orp).val)}">${this._getState(c.entity_orp).val}mV</span></div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { 
      background-size: cover; background-position: center; border-radius: 20px; 
      overflow: hidden; position: relative; color: white; border: 1px solid rgba(0,249,249,0.3);
    }
    .overlay { position: absolute; width: 100%; height: 100%; background: rgba(0,0,0,0.3); }
    .header { position: absolute; top: 15px; width: 100%; display: flex; z-index: 2; }
    h1 { font-size: 20px; font-weight: 200; letter-spacing: 3px; color: #00f9f9; margin: 0 20px; text-shadow: 0 0 10px rgba(0,0,0,0.5); }
    .button-grid { position: absolute; width: 94%; left: 3%; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; z-index: 2; }
    .btn-item { background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); padding: 10px; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
    .btn-item.active { background: rgba(0,249,249,0.2); border-color: #00f9f9; color: #00f9f9; box-shadow: 0 0 10px rgba(0,249,249,0.3); }
    .glass-panel { position: absolute; background: rgba(0,0,0,0.6); backdrop-filter: blur(15px); border-radius: 15px; padding: 12px; border: 1px solid rgba(255,255,255,0.1); z-index: 2; }
    .panel-header { font-size: 9px; font-weight: bold; color: #00f9f9; margin-bottom: 5px; opacity: 0.7; }
    .temp-value { font-size: 28px; font-weight: 200; color: #00f9f9; }
    .data-row { display: flex; justify-content: space-between; font-size: 11px; min-width: 100px; }
    .value { font-weight: bold; }
  `;
}

// --- ENREGISTREMENT ---
customElements.define("spa-card-editor", SpaCardEditor);
customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "SPA MASTER ULTIMATE",
  description: "Une carte élégante pour piloter votre Spa",
  preview: true
});
