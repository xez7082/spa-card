import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR VISUEL ---
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }
  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const config = { ...this._config, ...ev.detail.value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  render() {
    if (!this.hass || !this._config) return html``;
    const schema = [
      { name: "card_title", label: "Nom du Spa", selector: { text: {} } },
      { name: "background_image", label: "Image (URL)", selector: { text: {} } },
      { name: "card_height", label: "Hauteur Carte (ex: 550px)", selector: { text: {} } },
      { name: "camera_height", label: "Hauteur Caméra (ex: 300px)", selector: { text: {} } },
      { name: "text_color", label: "Couleur (RGB)", selector: { color_rgb: {} } },
      { 
        name: "entities", label: "Capteurs", type: "grid",
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

// --- CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _val(id) {
    if (!this.hass || !id || !this.hass.states[id]) return { s: '--', a: false, i: 'mdi:help' };
    const stateObj = this.hass.states[id];
    return { 
      s: stateObj.state, 
      a: !['off','unavailable','unknown'].includes(stateObj.state.toLowerCase()),
      i: stateObj.attributes.icon || 'mdi:power'
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const color = c.text_color ? `rgb(${c.text_color.join(',')})` : '#00f9f9';

    return html`
      <ha-card style="height: ${c.card_height || '500px'}; background-image: url('${c.background_image}');">
        <div class="overlay" style="--spa-color: ${color};">
          <div class="header">
            <div class="badge">EXT: ${this._val(c.entity_ext_temp).s}°C</div>
            <h1 style="color: var(--spa-color)">${c.card_title || 'SPA'}</h1>
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
    if (this._tab === 'home') return html`<div class="circ"><div class="v">${this._val(c.entity_water_temp).s}</div><div class="u">°C EAU</div></div>`;
    if (this._tab === 'cam') return html`<div class="cam-box" style="height:${c.camera_height || '250px'}">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Pas de caméra'}</div>`;
    if (this._tab === 'chem') return html`<div class="chem-grid"><div class="c"><span>pH</span><b>${this._val(c.entity_ph).s}</b></div><div class="c"><span>ORP</span><b>${this._val(c.entity_orp).s}</b></div><div class="c"><span>TDS</span><b>${this._val(c.entity_tds).s}</b></div></div>`;
    if (this._tab === 'sw') return html`<div class="sw-grid">${Array.from({length:10}, (_,i)=>{const id=c[`switch_${i+1}`]; if(!id) return ''; const s=this._val(id); return html`<div class="btn ${s.a ? 'on' : ''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}><ha-icon icon="${s.i}"></ha-icon></div>`})}</div>`;
  }

  static styles = css`
    ha-card { background-size: cover; border-radius: 20px; overflow: hidden; color: white; }
    .overlay { height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; flex-direction: column; padding: 15px; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .badge { font-size: 10px; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 10px; }
    h1 { font-size: 18px; font-weight: 200; margin: 0; letter-spacing: 2px; }
    .content { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
    .circ { width: 140px; height: 140px; border: 2px solid var(--spa-color); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); }
    .v { font-size: 45px; color: var(--spa-color); }
    .u { font-size: 10px; opacity: 0.6; }
    .cam-box { width: 100%; background: #000; border-radius: 15px; overflow: hidden; }
    .chem-grid { width: 100%; display: grid; gap: 8px; }
    .c { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; display: flex; justify-content: space-between; }
    .c b { color: var(--spa-color); }
    .sw-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; width: 100%; }
    .btn { height: 45px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .btn.on { background: rgba(0,249,249,0.2); border: 1px solid var(--spa-color); color: var(--spa-color); }
    .tabs { display: flex; justify-content: space-around; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 15px; }
    .t { opacity: 0.3; cursor: pointer; transition: 0.3s; }
    .t.active { opacity: 1; color: var(--spa-color); transform: scale(1.1); }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master Ultimate", preview: true });
