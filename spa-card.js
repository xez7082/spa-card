import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- 1. L'ÉDITEUR AVEC ONGLETS INTERNES ---
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
        { name: "card_title", label: "Titre", selector: { text: {} } },
        { name: "background_image", label: "Image (URL)", selector: { text: {} } },
        { name: "card_height", label: "Hauteur Carte", selector: { text: {} } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Sensor Temp Eau", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ph", label: "Sensor pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "Sensor ORP", selector: { entity: { domain: "sensor" } } },
        { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
        { name: "camera_height", label: "Hauteur Caméra", selector: { text: {} } }
      ],
      switches: Array.from({ length: 10 }, (_, i) => ({
        name: `switch_${i + 1}`, label: `Bouton ${i + 1}`, selector: { entity: {} }
      }))
    };

    return html`
      <div class="editor-tabs">
        <button @click=${() => this._selectedTab = 'gen'}>Général</button>
        <button @click=${() => this._selectedTab = 'sensors'}>Sondes/Cam</button>
        <button @click=${() => this._selectedTab = 'switches'}>Boutons</button>
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
    .editor-tabs { display: flex; gap: 5px; margin-bottom: 15px; }
    button { padding: 8px; cursor: pointer; border-radius: 5px; border: 1px solid #ccc; background: #eee; }
    button:hover { background: #ddd; }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- 2. LA CARTE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  // Lecture directe sans intermédiaire
  _get(entityId) {
    if (!this.hass || !entityId) return '--';
    const stateObj = this.hass.states[entityId];
    return stateObj ? stateObj.state : 'N/A';
  }

  _isActive(entityId) {
    if (!this.hass || !entityId) return false;
    const s = this.hass.states[entityId];
    return s && !['off', 'unavailable', 'unknown'].includes(s.state.toLowerCase());
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="height: ${c.card_height || '450px'}; background-image: url('${c.background_image}');">
        <div class="overlay">
          <div class="header"><h1>${c.card_title || 'SPA'}</h1></div>

          <div class="content">
            ${this._renderContent()}
          </div>

          <div class="nav">
            <div class="n-item ${this._tab === 'home' ? 'on' : ''}" @click=${() => this._tab = 'home'}><ha-icon icon="mdi:hot-tub"></ha-icon></div>
            <div class="n-item ${this._tab === 'cam' ? 'on' : ''}" @click=${() => this._tab = 'cam'}><ha-icon icon="mdi:camera"></ha-icon></div>
            <div class="n-item ${this._tab === 'chem' ? 'on' : ''}" @click=${() => this._tab = 'chem'}><ha-icon icon="mdi:flask"></ha-icon></div>
            <div class="n-item ${this._tab === 'sw' ? 'on' : ''}" @click=${() => this._tab = 'sw'}><ha-icon icon="mdi:apps"></ha-icon></div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderContent() {
    const c = this.config;
    if (this._tab === 'home') return html`<div class="circle"><div class="v">${this._get(c.entity_water_temp)}</div><div class="u">°C</div></div>`;
    if (this._tab === 'cam') return html`<div class="cam" style="height:${c.camera_height || '200px'}">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Pas de caméra'}</div>`;
    if (this._tab === 'chem') return html`<div class="grid-c"><div>pH: <b>${this._get(c.entity_ph)}</b></div><div>ORP: <b>${this._get(c.entity_orp)}</b></div></div>`;
    if (this._tab === 'sw') return html`<div class="grid-sw">${Array.from({length:10},(_,i)=>{const id=c[`switch_${i+1}`]; if(!id) return ''; return html`<div class="btn ${this._isActive(id)?'active':''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}><ha-icon icon="${this.hass.states[id]?.attributes.icon || 'mdi:power'}"></ha-icon></div>`})}</div>`;
  }

  static styles = css`
    ha-card { background-size: cover; border-radius: 15px; overflow: hidden; color: white; }
    .overlay { height: 100%; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; padding: 15px; }
    .header h1 { text-align: center; color: #00f9f9; font-size: 20px; }
    .content { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
    .circle { width: 120px; height: 120px; border: 2px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .v { font-size: 40px; color: #00f9f9; }
    .u { font-size: 10px; }
    .cam { width: 100%; border-radius: 10px; overflow: hidden; }
    .grid-c { width: 100%; display: grid; gap: 10px; }
    .grid-c div { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; }
    .grid-sw { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; width: 100%; }
    .btn { height: 45px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .btn.active { background: #00f9f9; color: black; }
    .nav { display: flex; justify-content: space-around; padding-top: 15px; }
    .n-item { opacity: 0.3; cursor: pointer; }
    .n-item.on { opacity: 1; color: #00f9f9; }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master TABS", preview: true });
