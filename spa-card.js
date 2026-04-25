import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- 1. L'ÉDITEUR VISUEL (CELUI QUE TU REVEUX) ---
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  
  setConfig(config) { this._config = config; }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const config = { ...this._config, ...ev.detail.value };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true, composed: true
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const schema = [
      { name: "card_title", label: "Titre du Spa", selector: { text: {} } },
      { name: "background_image", label: "Image de fond (URL)", selector: { text: {} } },
      { name: "card_height", label: "Hauteur de la carte (ex: 600px)", selector: { text: {} } },
      { name: "camera_height", label: "Hauteur Caméra (ex: 350px)", selector: { text: {} } },
      { 
        name: "entities", label: "Sondes Tuya & Caméra", type: "grid",
        schema: [
          { name: "entity_water_temp", label: "Temp Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ext_temp", label: "Temp Ext", selector: { entity: { domain: "sensor" } } },
          { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
          { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } },
        ]
      },
      {
        name: "switches", label: "Les 10 Interrupteurs", type: "grid",
        schema: Array.from({ length: 10 }, (_, i) => ({
          name: `switch_${i + 1}`, label: `Bouton ${i + 1}`, selector: { entity: {} }
        }))
      }
    ];

    return html`<div style="padding:20px;"><ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form></div>`;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- 2. LA CARTE (AVEC ONGLETS ET SENSORS) ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }

  constructor() {
    super();
    this._tab = 'home';
  }

  setConfig(config) { this.config = config; }

  // Système de lecture robuste
  _val(entityId) {
    if (!this.hass || !entityId) return { s: '?', a: false };
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return { s: 'Err', a: false };
    return { 
      s: stateObj.state, 
      a: !['off', 'unavailable', 'unknown'].includes(stateObj.state.toLowerCase()),
      i: stateObj.attributes.icon || 'mdi:power'
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="height: ${c.card_height || '550px'}; background-image: url('${c.background_image}');">
        <div class="glass-overlay">
          
          <div class="top-row">
            <div class="ext-t">EXT: ${this._val(c.entity_ext_temp).s}°C</div>
            <h1>${c.card_title || 'SPA MASTER'}</h1>
          </div>

          <div class="main-content">
            ${this._renderView()}
          </div>

          <div class="nav-tabs">
            <div class="t-item ${this._tab === 'home' ? 'active' : ''}" @click=${() => this._tab = 'home'}><ha-icon icon="mdi:hot-tub"></ha-icon></div>
            <div class="t-item ${this._tab === 'cam' ? 'active' : ''}" @click=${() => this._tab = 'cam'}><ha-icon icon="mdi:camera"></ha-icon></div>
            <div class="t-item ${this._tab === 'chem' ? 'active' : ''}" @click=${() => this._tab = 'chem'}><ha-icon icon="mdi:flask-outline"></ha-icon></div>
            <div class="t-item ${this._tab === 'sw' ? 'active' : ''}" @click=${() => this._tab = 'sw'}><ha-icon icon="mdi:view-grid-outline"></ha-icon></div>
          </div>

        </div>
      </ha-card>
    `;
  }

  _renderView() {
    const c = this.config;
    if (this._tab === 'home') {
      return html`
        <div class="circle-big">
          <div class="temp-v">${this._val(c.entity_water_temp).s}</div>
          <div class="temp-u">°C EAU</div>
        </div>
      `;
    }
    if (this._tab === 'cam') {
      return html`
        <div class="cam-box" style="height: ${c.camera_height || '300px'}">
          ${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Caméra non configurée'}
        </div>
      `;
    }
    if (this._tab === 'chem') {
      return html`
        <div class="chem-panel">
          <div class="c-card"><span>pH</span><b>${this._val(c.entity_ph).s}</b></div>
          <div class="c-card"><span>ORP</span><b>${this._val(c.entity_orp).s} <small>mV</small></b></div>
          <div class="c-card"><span>TDS</span><b>${this._val(c.entity_tds).s}</b></div>
        </div>
      `;
    }
    if (this._tab === 'sw') {
      return html`
        <div class="sw-panel">
          ${Array.from({ length: 10 }, (_, i) => {
            const id = c[`switch_${i + 1}`];
            if (!id) return '';
            const st = this._val(id);
            return html`
              <div class="btn ${st.a ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: id})}>
                <ha-icon icon="${st.i}"></ha-icon>
              </div>
            `;
          })}
        </div>
      `;
    }
  }

  static styles = css`
    ha-card { background-size: cover; border-radius: 28px; overflow: hidden; color: white; border: 1px solid rgba(255,255,255,0.1); }
    .glass-overlay { height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .top-row { display: flex; justify-content: space-between; align-items: center; }
    .ext-t { font-size: 11px; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; }
    h1 { font-size: 18px; font-weight: 300; letter-spacing: 3px; color: #00f9f9; margin:0; }
    .main-content { flex-grow: 1; display: flex; align-items: center; justify-content: center; width: 100%; margin: 15px 0; }
    
    .circle-big { width: 160px; height: 160px; border: 2px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(0,249,249,0.2); }
    .temp-v { font-size: 50px; font-weight: 100; color: #00f9f9; }
    .temp-u { font-size: 10px; opacity: 0.6; }

    .cam-box { width: 100%; background: #000; border-radius: 15px; overflow: hidden; border: 1px solid #333; }
    .chem-panel { width: 100%; display: grid; gap: 10px; }
    .c-card { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 15px; display: flex; justify-content: space-between; align-items: center; }
    .c-card span { font-size: 10px; opacity: 0.5; text-transform: uppercase; }
    .c-card b { color: #00f9f9; font-size: 20px; }

    .sw-panel { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; width: 100%; }
    .btn { height: 50px; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
    .btn.on { background: rgba(0,249,249,0.2); border: 1px solid #00f9f9; color: #00f9f9; }

    .nav-tabs { display: flex; justify-content: space-around; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 20px; }
    .t-item { opacity: 0.3; cursor: pointer; transition: 0.3s; }
    .t-item.active { opacity: 1; color: #00f9f9; transform: scale(1.1); }
  `;
}
customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master Ultimate", preview: true });
