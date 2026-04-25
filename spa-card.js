import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR ---
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
      { name: "background_image", label: "Image de fond", selector: { text: {} } },
      { name: "card_height", label: "Hauteur de la carte (ex: 600px)", selector: { text: {} } },
      { name: "camera_height", label: "Hauteur Caméra (ex: 300px)", selector: { text: {} } },
      { 
        name: "design", label: "Styles", type: "grid", 
        schema: [
          { name: "text_color", label: "Couleur Texte", selector: { color_rgb: {} } },
          { name: "font_size_val", label: "Taille Textes", selector: { text: {} } }
        ]
      },
      {
        name: "entities", label: "Capteurs & Caméra", type: "grid",
        schema: [
          { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
          { name: "entity_water_temp", label: "Temp Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ext_temp", label: "Temp Ext", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ec", label: "EC", selector: { entity: { domain: "sensor" } } },
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

// --- CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  constructor() {
    super();
    this.activeTab = 'spa'; // Onglet par défaut
  }

  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, activeTab: { type: String } }; }
  
  setConfig(config) { this.config = config; }

  _getState(id) {
    if (!this.hass || !id || !this.hass.states[id]) return { state: '--', active: false, icon: 'mdi:help' };
    const s = this.hass.states[id];
    return { state: s.state, active: !['off','unavailable','unknown'].includes(s.state.toLowerCase()), icon: s.attributes.icon || 'mdi:power' };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const color = c.text_color ? `rgb(${c.text_color.join(',')})` : '#00f9f9';

    return html`
      <ha-card style="height: ${c.card_height || '550px'}; background-image: url('${c.background_image}');">
        <div class="overlay" style="color: ${color};">
          
          <div class="header">
            <div class="ext-badge">EXT: ${this._getState(c.entity_ext_temp).state}°</div>
            <h1>${c.card_title || 'SPA MASTER'}</h1>
          </div>

          <div class="main-content">
            ${this._renderTabContent()}
          </div>

          <div class="tab-bar">
            <div class="tab ${this.activeTab === 'spa' ? 'active' : ''}" @click=${() => this.activeTab = 'spa'}><ha-icon icon="mdi:hot-tub"></ha-icon></div>
            <div class="tab ${this.activeTab === 'cam' ? 'active' : ''}" @click=${() => this.activeTab = 'cam'}><ha-icon icon="mdi:camera"></ha-icon></div>
            <div class="tab ${this.activeTab === 'chem' ? 'active' : ''}" @click=${() => this.activeTab = 'chem'}><ha-icon icon="mdi:flask"></ha-icon></div>
            <div class="tab ${this.activeTab === 'sw' ? 'active' : ''}" @click=${() => this.activeTab = 'sw'}><ha-icon icon="mdi:toggle-switch"></ha-icon></div>
          </div>

        </div>
      </ha-card>
    `;
  }

  _renderTabContent() {
    const c = this.config;
    const color = c.text_color ? `rgb(${c.text_color.join(',')})` : '#00f9f9';

    if (this.activeTab === 'spa') {
      return html`
        <div class="spa-home">
          <div class="circle" style="border-color: ${color}">
            <div class="val" style="color: ${color}">${this._getState(c.entity_water_temp).state}</div>
            <div class="unit">°C EAU</div>
          </div>
        </div>`;
    }

    if (this.activeTab === 'cam') {
      return html`
        <div class="camera-view" style="height: ${c.camera_height || '250px'}">
          ${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Aucune caméra'}
        </div>`;
    }

    if (this.activeTab === 'chem') {
      return html`
        <div class="chem-grid" style="font-size: ${c.font_size_val || '16px'}">
          <div class="c-item"><span>pH</span>${this._getState(c.entity_ph).state}</div>
          <div class="c-item"><span>ORP</span>${this._getState(c.entity_orp).state} mV</div>
          <div class="c-item"><span>TDS</span>${this._getState(c.entity_tds).state}</div>
          <div class="c-item"><span>EC</span>${this._getState(c.entity_ec).state}</div>
        </div>`;
    }

    if (this.activeTab === 'sw') {
      return html`
        <div class="sw-grid">
          ${Array.from({ length: 10 }, (_, i) => {
            const id = c[`switch_${i + 1}`];
            if (!id) return '';
            const s = this._getState(id);
            return html`<div class="btn ${s.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: id})}><ha-icon icon="${s.icon}"></ha-icon></div>`;
          })}
        </div>`;
    }
  }

  static styles = css`
    ha-card { background-size: cover; border-radius: 25px; overflow: hidden; position: relative; }
    .overlay { height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; flex-direction: column; padding: 15px; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .ext-badge { background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 15px; font-size: 12px; color: white; }
    h1 { margin: 0; font-weight: 200; font-size: 20px; letter-spacing: 2px; }
    .main-content { flex-grow: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; margin: 15px 0; }
    
    /* Onglet SPA */
    .circle { width: 150px; height: 150px; border-radius: 50%; border: 3px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); }
    .val { font-size: 55px; font-weight: 100; }
    .unit { font-size: 10px; color: white; opacity: 0.6; }

    /* Onglet CAM */
    .camera-view { width: 100%; border-radius: 15px; overflow: hidden; background: #000; border: 1px solid rgba(255,255,255,0.1); }
    hui-image { width: 100%; height: 100%; object-fit: cover; }

    /* Onglet CHEM */
    .chem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }
    .c-item { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
    .c-item span { display: block; font-size: 10px; opacity: 0.5; margin-bottom: 5px; text-transform: uppercase; }

    /* Onglet SWITCH */
    .sw-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; width: 100%; }
    .btn { height: 50px; border-radius: 12px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: white; }
    .btn.on { background: rgba(0,249,249,0.3); border: 1px solid #00f9f9; color: #00f9f9; box-shadow: 0 0 10px rgba(0,249,249,0.3); }

    /* Barres Onglets */
    .tab-bar { display: flex; justify-content: space-around; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); }
    .tab { cursor: pointer; opacity: 0.4; transition: 0.3s; padding: 5px 15px; }
    .tab.active { opacity: 1; color: #00f9f9; transform: scale(1.2); }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master TABS", preview: true });
