import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- 1. ÉDITEUR AVEC SÉLECTEUR D'IMAGE ET HAUTEUR ---
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
        { name: "background_image", label: "Image de fond (URL ou /local/img.jpg)", selector: { text: {} } },
        { name: "card_height", label: "Hauteur de la Carte (ex: 600px)", selector: { text: {} } },
        { name: "btn_text_color", label: "Couleur Texte Boutons", selector: { color_rgb: {} } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ext_temp", label: "Temp Extérieure", selector: { entity: { domain: "sensor" } } }
      ],
      camera: [
        { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
        { name: "camera_height", label: "Hauteur Caméra (ex: 350px)", selector: { text: {} } }
      ],
      switches: Array.from({ length: 10 }, (_, i) => ([
        { name: `switch_${i + 1}`, label: `Entité Bouton ${i + 1}`, selector: { entity: {} } },
        { name: `name_switch_${i + 1}`, label: `Nom Bouton ${i + 1}`, selector: { text: {} } }
      ])).flat()
    };

    return html`
      <div class="editor-tabs">
        <button class="${this._selectedTab === 'gen' ? 'active' : ''}" @click=${() => this._selectedTab = 'gen'}>Général</button>
        <button class="${this._selectedTab === 'sensors' ? 'active' : ''}" @click=${() => this._selectedTab = 'sensors'}>Sondes</button>
        <button class="${this._selectedTab === 'camera' ? 'active' : ''}" @click=${() => this._selectedTab = 'camera'}>Caméra</button>
        <button class="${this._selectedTab === 'switches' ? 'active' : ''}" @click=${() => this._selectedTab = 'switches'}>Boutons</button>
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schemas[this._selectedTab]}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  static styles = css`
    .editor-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; background: #222; padding: 10px; border-radius: 8px; }
    button { padding: 10px; cursor: pointer; border-radius: 6px; border: none; background: #444; color: white; font-weight: bold; }
    button.active { background: #00f9f9; color: #000; }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- 2. LA CARTE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) {
    if (!this.hass || !id || !this.hass.states[id]) return '--';
    return this.hass.states[id].state;
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const bg = c.background_image ? `url('${c.background_image}')` : 'none';
    const btnColor = c.btn_text_color ? `rgb(${c.btn_text_color.join(',')})` : '#ffffff';

    return html`
      <ha-card style="height: ${c.card_height || '550px'}; background-image: ${bg}; background-size: cover; background-position: center;">
        <div class="overlay" style="--btn-color: ${btnColor};">
          
          <div class="header">
             <div class="ext-tag">EXT: ${this._get(c.entity_ext_temp)}°C</div>
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
    if (this._tab === 'home') return html`<div class="big-circle"><div class="v">${this._get(c.entity_water_temp)}</div><div class="u">°C EAU</div></div>`;
    
    if (this._tab === 'cam') return html`<div class="camera-box" style="height:${c.camera_height || '300px'}">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Sélectionnez une caméra'}</div>`;
    
    if (this._tab === 'chem') return html`
      <div class="chem-grid">
        <div class="chem-item"><span>pH</span> <b>${this._get(c.entity_ph)}</b></div>
        <div class="chem-item"><span>ORP</span> <b>${this._get(c.entity_orp)} mV</b></div>
      </div>`;
    
    if (this._tab === 'sw') return html`
      <div class="switches-grid">
        ${Array.from({length:10},(_,i)=>{
          const id = c[`switch_${i+1}`];
          const name = c[`name_switch_${i+1}`] || '';
          if(!id) return '';
          const active = this.hass.states[id]?.state === 'on';
          return html`
            <div class="sw-unit">
              <div class="sw-icon ${active ? 'active' : ''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}>
                <ha-icon icon="${this.hass.states[id]?.attributes.icon || 'mdi:power'}"></ha-icon>
              </div>
              <div class="sw-label">${name}</div>
            </div>`;
        })}
      </div>`;
  }

  static styles = css`
    ha-card { border-radius: 24px; overflow: hidden; color: white; position: relative; border: 1px solid rgba(255,255,255,0.1); }
    .overlay { height: 100%; width: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .header h1 { font-size: 18px; font-weight: 300; letter-spacing: 2px; color: #00f9f9; margin: 0; }
    .ext-tag { font-size: 10px; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 15px; }

    .main-view { flex-grow: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    
    .big-circle { width: 150px; height: 150px; border: 2px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); box-shadow: 0 0 20px rgba(0,249,249,0.1); }
    .v { font-size: 50px; color: #00f9f9; font-weight: 100; }
    .u { font-size: 10px; opacity: 0.5; }

    .camera-box { width: 100%; background: #000; border-radius: 15px; overflow: hidden; border: 1px solid #333; }
    .chem-grid { width: 100%; display: grid; gap: 10px; }
    .chem-item { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
    .chem-item b { color: #00f9f9; font-size: 20px; }

    .switches-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; width: 100%; }
    .sw-unit { display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .sw-icon { width: 100%; height: 45px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
    .sw-icon.active { background: rgba(0,249,249,0.3); border: 1px solid #00f9f9; color: #00f9f9; }
    .sw-label { font-size: 9px; color: var(--btn-color); text-align: center; }

    .bottom-nav { display: flex; justify-content: space-around; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; }
    .nav-i { opacity: 0.3; cursor: pointer; transition: 0.4s; }
    .nav-i.on { opacity: 1; color: #00f9f9; transform: scale(1.2); }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master Pro", preview: true });
