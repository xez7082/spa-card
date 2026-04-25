import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- 1. L'ÉDITEUR AVEC ONGLETS VISIBLES ET SÉPARÉS ---
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {}, _selectedTab: { type: String } }; }
  
  constructor() { super(); this._selectedTab = 'gen'; }
  setConfig(config) { this._config = config; }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const config = { ...this._config, ...ev.detail.value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const schemas = {
      gen: [
        { name: "card_title", label: "Titre du Spa", selector: { text: {} } },
        { name: "background_image", label: "Image de fond (URL)", selector: { text: {} } },
        { name: "card_height", label: "Hauteur de la Carte (ex: 500px)", selector: { text: {} } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Sonde Température Eau", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ph", label: "Sonde pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "Sonde ORP", selector: { entity: { domain: "sensor" } } },
        { name: "entity_tds", label: "Sonde TDS", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ext_temp", label: "Température Extérieure", selector: { entity: { domain: "sensor" } } }
      ],
      camera: [
        { name: "entity_camera", label: "Choisir la Caméra", selector: { entity: { domain: "camera" } } },
        { name: "camera_height", label: "Hauteur de l'image (ex: 250px)", selector: { text: {} } }
      ],
      switches: Array.from({ length: 10 }, (_, i) => ({
        name: `switch_${i + 1}`, label: `Interrupteur ${i + 1}`, selector: { entity: {} }
      }))
    };

    return html`
      <div class="editor-tabs">
        <button class="${this._selectedTab === 'gen' ? 'active' : ''}" @click=${() => this._selectedTab = 'gen'}>Général</button>
        <button class="${this._selectedTab === 'sensors' ? 'active' : ''}" @click=${() => this._selectedTab = 'sensors'}>Sondes</button>
        <button class="${this._selectedTab === 'camera' ? 'active' : ''}" @click=${() => this._selectedTab = 'camera'}>Caméra</button>
        <button class="${this._selectedTab === 'switches' ? 'active' : ''}" @click=${() => this._selectedTab = 'switches'}>Boutons</button>
      </div>
      <div class="editor-form">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${schemas[this._selectedTab]}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }

  static styles = css`
    .editor-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; background: #222; padding: 10px; border-radius: 8px; }
    button { 
      padding: 10px 15px; cursor: pointer; border-radius: 6px; border: none;
      background: #444; color: white; font-weight: bold; transition: 0.3s;
    }
    button:hover { background: #666; }
    button.active { background: #00f9f9; color: #000; }
    .editor-form { background: var(--card-background-color); padding: 10px; border-radius: 8px; }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- 2. LA CARTE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(entityId) {
    if (!this.hass || !entityId) return '--';
    const stateObj = this.hass.states[entityId];
    return stateObj ? stateObj.state : '--';
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="height: ${c.card_height || '500px'}; background-image: url('${c.background_image}');">
        <div class="overlay">
          <div class="header">
             <div class="ext">EXT: ${this._get(c.entity_ext_temp)}°C</div>
             <h1>${c.card_title || 'SPA'}</h1>
          </div>

          <div class="content">
            ${this._renderContent()}
          </div>

          <div class="nav-bar">
            <div class="n-item ${this._tab === 'home' ? 'active' : ''}" @click=${() => this._tab = 'home'}><ha-icon icon="mdi:hot-tub"></ha-icon><span>HOME</span></div>
            <div class="n-item ${this._tab === 'cam' ? 'active' : ''}" @click=${() => this._tab = 'cam'}><ha-icon icon="mdi:camera"></ha-icon><span>CAM</span></div>
            <div class="n-item ${this._tab === 'chem' ? 'active' : ''}" @click=${() => this._tab = 'chem'}><ha-icon icon="mdi:flask"></ha-icon><span>EAU</span></div>
            <div class="n-item ${this._tab === 'sw' ? 'active' : ''}" @click=${() => this._tab = 'sw'}><ha-icon icon="mdi:view-grid"></ha-icon><span>CMD</span></div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderContent() {
    const c = this.config;
    if (this._tab === 'home') return html`<div class="circle"><div class="v">${this._get(c.entity_water_temp)}</div><div class="u">TEMP EAU</div></div>`;
    if (this._tab === 'cam') return html`<div class="cam-container" style="height:${c.camera_height || '250px'}">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Caméra non configurée'}</div>`;
    if (this._tab === 'chem') return html`
      <div class="chem-list">
        <div class="c-box"><span>pH</span> <b>${this._get(c.entity_ph)}</b></div>
        <div class="c-box"><span>ORP</span> <b>${this._get(c.entity_orp)} mV</b></div>
        <div class="c-box"><span>TDS</span> <b>${this._get(c.entity_tds)}</b></div>
      </div>`;
    if (this._tab === 'sw') return html`<div class="sw-grid">${Array.from({length:10},(_,i)=>{const id=c[`switch_${i+1}`]; if(!id) return ''; return html`<div class="sw-btn ${this.hass.states[id]?.state === 'on' ? 'on' : ''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}><ha-icon icon="${this.hass.states[id]?.attributes.icon || 'mdi:power'}"></ha-icon></div>`})}</div>`;
  }

  static styles = css`
    ha-card { background-size: cover; border-radius: 20px; overflow: hidden; color: white; border: 1px solid rgba(255,255,255,0.1); }
    .overlay { height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; flex-direction: column; padding: 15px; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 18px; margin: 0; color: #00f9f9; letter-spacing: 2px; }
    .ext { font-size: 10px; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 10px; }
    .content { flex-grow: 1; display: flex; align-items: center; justify-content: center; width: 100%; }
    .circle { width: 140px; height: 140px; border: 2px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,249,249,0.2); }
    .v { font-size: 45px; color: #00f9f9; font-weight: 100; }
    .u { font-size: 10px; opacity: 0.6; }
    .cam-container { width: 100%; border-radius: 12px; overflow: hidden; background: #000; border: 1px solid #333; }
    .chem-list { width: 100%; display: flex; flex-direction: column; gap: 10px; }
    .c-box { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; border: 1px solid rgba(255,255,255,0.1); }
    .c-box b { color: #00f9f9; font-size: 18px; }
    .sw-grid { display: grid; grid-template-columns: repeat(5, 2fr); gap: 8px; width: 100%; }
    .sw-btn { height: 50px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
    .sw-btn.on { background: rgba(0,249,249,0.3); border: 1px solid #00f9f9; color: #00f9f9; }
    .nav-bar { display: flex; justify-content: space-around; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
    .n-item { opacity: 0.3; cursor: pointer; text-align: center; display: flex; flex-direction: column; align-items: center; }
    .n-item span { font-size: 8px; margin-top: 2px; }
    .n-item.active { opacity: 1; color: #00f9f9; }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master 4-Tabs", preview: true });
