import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- 1. ÉDITEUR VISUEL AMÉLIORÉ ---
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
      { 
        name: "dimensions", label: "Tailles", type: "grid",
        schema: [
          { name: "card_height", label: "Hauteur Carte (ex: 550px)", selector: { text: {} } },
          { name: "camera_height", label: "Hauteur Caméra (ex: 300px)", selector: { text: {} } },
        ]
      },
      {
        name: "sensors_config", label: "Configuration des Capteurs", type: "grid",
        schema: [
          { name: "entity_water_temp", label: "Sensor Temp Eau", selector: { entity: { domain: "sensor" } } },
          { name: "name_water_temp", label: "Nom affiché Eau", selector: { text: {} } },
          { name: "entity_ph", label: "Sensor pH", selector: { entity: { domain: "sensor" } } },
          { name: "name_ph", label: "Nom affiché pH", selector: { text: {} } },
          { name: "entity_orp", label: "Sensor ORP", selector: { entity: { domain: "sensor" } } },
          { name: "name_orp", label: "Nom affiché ORP", selector: { text: {} } },
          { name: "entity_tds", label: "Sensor TDS", selector: { entity: { domain: "sensor" } } },
          { name: "name_tds", label: "Nom affiché TDS", selector: { text: {} } },
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

// --- 2. CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }

  constructor() {
    super();
    this._tab = 'home';
  }

  setConfig(config) { this.config = config; }

  _val(id) {
    if (!this.hass || !id || !this.hass.states[id]) return { s: '?', a: false, i: 'mdi:help' };
    const sObj = this.hass.states[id];
    return { 
      s: sObj.state, 
      a: !['off','unavailable','unknown'].includes(sObj.state.toLowerCase()),
      i: sObj.attributes.icon || 'mdi:power'
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="height: ${c.card_height || '550px'}; background-image: url('${c.background_image}');">
        <div class="overlay">
          <div class="header">
            <h1>${c.card_title || 'SPA MASTER'}</h1>
          </div>

          <div class="content">
            ${this._renderView()}
          </div>

          <div class="tabs">
            <div class="t ${this._tab === 'home' ? 'active' : ''}" @click=${() => this._tab = 'home'}><ha-icon icon="mdi:hot-tub"></ha-icon></div>
            <div class="t ${this._tab === 'cam' ? 'active' : ''}" @click=${() => this._tab = 'cam'}><ha-icon icon="mdi:camera"></ha-icon></div>
            <div class="t ${this._tab === 'chem' ? 'active' : ''}" @click=${() => this._tab = 'chem'}><ha-icon icon="mdi:flask-outline"></ha-icon></div>
            <div class="t ${this._tab === 'sw' ? 'active' : ''}" @click=${() => this._tab = 'sw'}><ha-icon icon="mdi:toggle-switch-outline"></ha-icon></div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderView() {
    const c = this.config;
    if (this._tab === 'home') {
      return html`<div class="circ"><div class="v">${this._val(c.entity_water_temp).s}</div><div class="u">${c.name_water_temp || 'TEMP EAU'}</div></div>`;
    }
    if (this._tab === 'cam') {
      return html`<div class="cam-box" style="height:${c.camera_height || '250px'}">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Pas de caméra'}</div>`;
    }
    if (this._tab === 'chem') {
      return html`
        <div class="chem-grid">
          <div class="c"><span>${c.name_ph || 'pH'}</span><b>${this._val(c.entity_ph).s}</b></div>
          <div class="c"><span>${c.name_orp || 'ORP'}</span><b>${this._val(c.entity_orp).s}</b></div>
          <div class="c"><span>${c.name_tds || 'TDS'}</span><b>${this._val(c.entity_tds).s}</b></div>
        </div>`;
    }
    if (this._tab === 'sw') {
      return html`<div class="sw-grid">${Array.from({length:10}, (_,i)=>{const id=c[`switch_${i+1}`]; if(!id) return ''; const s=this._val(id); return html`<div class="btn ${s.a ? 'on' : ''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}><ha-icon icon="${s.i}"></ha-icon></div>`})}</div>`;
    }
  }

  static styles = css`
    ha-card { background-size: cover; border-radius: 20px; overflow: hidden; color: white; }
    .overlay { height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; flex-direction: column; padding: 15px; box-sizing: border-box; }
    .header h1 { font-size: 18px; text-align: center; color: #00f9f9; margin: 0; }
    .content { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
    .circ { width: 140px; height: 140px; border: 2px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); }
    .v { font-size: 45px; color: #00f9f9; }
    .u { font-size: 10px; opacity: 0.6; }
    .cam-box { width: 100%; background: #000; border-radius: 15px; overflow: hidden; }
    .chem-grid { width: 100%; display: grid; gap: 8px; }
    .c { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
    .c span { font-size: 12px; opacity: 0.7; }
    .c b { color: #00f9f9; font-size: 18px; }
    .sw-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; width: 100%; }
    .btn { height: 45px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .btn.on { background: rgba(0,249,249,0.2); border: 1px solid #00f9f9; color: #00f9f9; }
    .tabs { display: flex; justify-content: space-around; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 15px; }
    .t { opacity: 0.3; cursor: pointer; transition: 0.3s; }
    .t.active { opacity: 1; color: #00f9f9; }
  `;
}
customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master Final", preview: true });
