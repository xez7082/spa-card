import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- 1. ÉDITEUR ---
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
        { name: "background_image", label: "URL Image (/local/sparond2.png)", selector: { text: {} } },
        { name: "card_height", label: "Hauteur Carte (ex: 600px)", selector: { text: {} } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ext_temp", label: "Température Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ph", label: "Sonde pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "Sonde ORP", selector: { entity: { domain: "sensor" } } },
        { name: "entity_tds", label: "Sonde TDS", selector: { entity: { domain: "sensor" } } },
        { name: "entity_salt", label: "Sonde Sel / Salinité", selector: { entity: { domain: "sensor" } } }
      ],
      camera: [
        { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
        { name: "camera_height", label: "Hauteur Caméra (ex: 300px)", selector: { text: {} } }
      ],
      switches: Array.from({ length: 10 }, (_, i) => ([
        { name: `switch_${i + 1}`, label: `Bouton ${i + 1}`, selector: { entity: {} } },
        { name: `name_switch_${i + 1}`, label: `Nom ${i + 1}`, selector: { text: {} } }
      ])).flat()
    };

    return html`
      <div class="editor-tabs">
        <button class="${this._selectedTab === 'gen' ? 'active' : ''}" @click=${() => this._selectedTab = 'gen'}>Général</button>
        <button class="${this._selectedTab === 'sensors' ? 'active' : ''}" @click=${() => this._selectedTab = 'sensors'}>Sondes</button>
        <button class="${this._selectedTab === 'camera' ? 'active' : ''}" @click=${() => this._selectedTab = 'camera'}>Caméra</button>
        <button class="${this._selectedTab === 'switches' ? 'active' : ''}" @click=${() => this._selectedTab = 'switches'}>Boutons</button>
      </div>
      <ha-form .hass=${this.hass} .data=${this._config} .schema=${schemas[this._selectedTab]} @value-changed=${this._valueChanged}></ha-form>
    `;
  }

  static styles = css`
    .editor-tabs { display: flex; gap: 8px; margin-bottom: 20px; background: #222; padding: 10px; border-radius: 8px; }
    button { padding: 8px 12px; cursor: pointer; border-radius: 4px; border: none; background: #444; color: white; }
    button.active { background: #00f9f9; color: black; font-weight: bold; }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- 2. CARTE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) {
    if (!this.hass || !id || !this.hass.states[id]) return null;
    return this.hass.states[id].state;
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const bg = c.background_image || '/local/sparond2.png';
    const h = c.card_height || '550px';

    return html`
      <ha-card style="height: ${h}; min-height: ${h}; background-image: url('${bg}'); background-size: cover;">
        <div class="overlay">
          
          <div class="header">
             <div class="ext-tag">EXT: ${this._get(c.entity_ext_temp) || '--'}°C</div>
             <h1>${c.card_title || 'SPA'}</h1>
          </div>

          <div class="main-view">
            ${this._renderTab()}
          </div>

          <div class="bottom-nav">
            <div class="nav-i ${this._tab === 'home' ? 'on' : ''}" @click=${() => this._tab = 'home'}><ha-icon icon="mdi:hot-tub"></ha-icon></div>
            <div class="nav-i ${this._tab === 'cam' ? 'on' : ''}" @click=${() => this._tab = 'cam'}><ha-icon icon="mdi:camera"></ha-icon></div>
            <div class="nav-i ${this._tab === 'chem' ? 'on' : ''}" @click=${() => this._tab = 'chem'}><ha-icon icon="mdi:flask-round-bottom"></ha-icon></div>
            <div class="nav-i ${this._tab === 'sw' ? 'on' : ''}" @click=${() => this._tab = 'sw'}><ha-icon icon="mdi:dots-grid"></ha-icon></div>
          </div>
          
        </div>
      </ha-card>
    `;
  }

  _renderTab() {
    const c = this.config;
    if (this._tab === 'home') return html`<div class="big-circle"><div class="v">${this._get(c.entity_water_temp) || '--'}</div><div class="u">°C EAU</div></div>`;
    
    if (this._tab === 'cam') return html`<div class="camera-box" style="height:${c.camera_height || '300px'}">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Caméra non configurée'}</div>`;
    
    if (this._tab === 'chem') {
      const sensors = [
        { n: 'pH', v: this._get(c.entity_ph) },
        { n: 'ORP', v: this._get(c.entity_orp), u: 'mV' },
        { n: 'TDS', v: this._get(c.entity_tds) },
        { n: 'SEL', v: this._get(c.entity_salt) }
      ];
      return html`<div class="chem-grid">
        ${sensors.map(s => s.v ? html`<div class="chem-item"><span>${s.n}</span> <b>${s.v} ${s.u || ''}</b></div>` : '')}
      </div>`;
    }
    
    if (this._tab === 'sw') return html`<div class="switches-grid">
        ${Array.from({length:10},(_,i)=>{
          const id = c[`switch_${i+1}`];
          if(!id) return '';
          const active = this.hass.states[id]?.state === 'on';
          return html`<div class="sw-unit">
              <div class="sw-icon ${active ? 'active' : ''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}>
                <ha-icon icon="${this.hass.states[id]?.attributes.icon || 'mdi:power'}"></ha-icon>
              </div>
              <div class="sw-label">${c[`name_switch_${i+1}`] || ''}</div>
            </div>`;
        })}
    </div>`;
  }

  static styles = css`
    ha-card { border-radius: 24px; overflow: hidden; color: white; display: block; }
    .overlay { height: 100%; width: 100%; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 18px; color: #00f9f9; margin: 0; }
    .ext-tag { font-size: 10px; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 15px; }
    .main-view { flex-grow: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .big-circle { width: 140px; height: 140px; border: 2px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .v { font-size: 45px; color: #00f9f9; }
    .camera-box { width: 100%; border-radius: 15px; overflow: hidden; background: #000; }
    .chem-grid { width: 100%; display: flex; flex-direction: column; gap: 8px; }
    .chem-item { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; display: flex; justify-content: space-between; }
    .switches-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; width: 100%; }
    .sw-unit { display: flex; flex-direction: column; align-items: center; }
    .sw-icon { width: 100%; height: 40px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .sw-icon.active { background: rgba(0,249,249,0.3); border: 1px solid #00f9f9; color: #00f9f9; }
    .sw-label { font-size: 8px; margin-top: 4px; text-align: center; }
    .bottom-nav { display: flex; justify-content: space-around; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
    .nav-i { opacity: 0.3; cursor: pointer; }
    .nav-i.on { opacity: 1; color: #00f9f9; }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master V7", preview: true });
