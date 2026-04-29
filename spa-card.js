import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR ---
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {}, _selectedTab: { type: String } }; }
  constructor() { super(); this._selectedTab = 'gen'; }
  setConfig(config) { this._config = config; }
  _valueChanged(ev) {
    const config = { ...this._config, ...ev.detail.value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  render() {
    if (!this.hass || !this._config) return html``;
    const schemas = {
      gen: [
        { name: "card_title", label: "Titre", selector: { text: {} } },
        { name: "background_image", label: "Image (/local/sparond2.png)", selector: { text: {} } },
        { name: "card_height", label: "Hauteur", selector: { text: {} } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Temp Actuelle", selector: { entity: { domain: "sensor" } } },
        { name: "entity_target_temp", label: "Entité Consigne", selector: { entity: {} } },
        { name: "entity_ext_temp", label: "Temp Ext", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_air_temp", label: "Temp Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "main_cons_entity", label: "Sonde Conso", selector: { entity: {} } }
      ],
      chimie: [
        { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
        { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } }
      ],
      camera: [{ name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } }],
      switches: Array.from({ length: 10 }, (_, i) => ([
        { name: `switch_${i + 1}`, label: `Bouton ${i + 1}`, selector: { entity: {} } },
        { name: `name_switch_${i + 1}`, label: `Nom ${i + 1}`, selector: { text: {} } }
      ])).flat()
    };
    return html`
      <div class="editor-tabs">
        ${Object.keys(schemas).map(t => html`<button class="${this._selectedTab === t ? 'active' : ''}" @click=${() => this._selectedTab = t}>${t.toUpperCase()}</button>`)}
      </div>
      <ha-form .hass=${this.hass} .data=${this._config} .schema=${schemas[this._selectedTab]} @value-changed=${this._valueChanged}></ha-form>
    `;
  }
  static styles = css`.editor-tabs { display: flex; gap: 5px; margin-bottom: 15px; } button { padding: 8px; border-radius: 4px; border: none; background: #444; color: white; cursor: pointer; font-size: 10px;} button.active { background: #00f9f9; color: #000; }`;
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- CARTE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].state : '--'; }

  _changeTemp(offset) {
    const id = this.config.entity_target_temp;
    if (!id || this._get(id) === '--') return;
    const newVal = parseFloat(this._get(id)) + offset;
    const domain = id.split('.')[0];
    const service = domain === 'climate' ? 'set_temperature' : 'set_value';
    const data = domain === 'climate' ? { entity_id: id, temperature: newVal } : { entity_id: id, value: newVal };
    this.hass.callService(domain, service, data);
  }

  _renderTab() {
    const c = this.config;
    if (this._tab === 'home') {
      return html`
        <div class="home-view">
          <div class="top-row">
            <div class="mini-card"><span class="m-val">${this._get(c.entity_ext_temp)}°</span><span class="m-label">EXTÉRIEUR</span></div>
            <div class="mini-card"><span class="m-val">${this._get(c.entity_spa_air_temp)}°</span><span class="m-label">AIR SPA</span></div>
          </div>
          <div class="main-gauge-area">
            <div class="temp-btn" @click=${() => this._changeTemp(-0.5)}>-</div>
            <div class="center-gauge">
              <div class="outer-ring"></div>
              <div class="inner-circle">
                <span class="water-label">EAU</span>
                <span class="water-val">${this._get(c.entity_water_temp)}°</span>
                <span class="target-val">CIBLE: ${this._get(c.entity_target_temp)}°</span>
              </div>
            </div>
            <div class="temp-btn" @click=${() => this._changeTemp(0.5)}>+</div>
          </div>
          <div class="energy-pill"><ha-icon icon="mdi:lightning-bolt"></ha-icon><span>${this._get(c.main_cons_entity)} W</span></div>
        </div>`;
    }
    if (this._tab === 'cam') return html`<div class="cam-view">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Pas de caméra'}</div>`;
    if (this._tab === 'chem') return html`<div class="glass-grid">
        <div class="glass-card"><div class="g-label">pH</div><div class="g-val">${this._get(c.entity_ph)}</div></div>
        <div class="glass-card"><div class="g-label">ORP</div><div class="g-val">${this._get(c.entity_orp)} mV</div></div>
        <div class="glass-card"><div class="g-label">TDS</div><div class="g-val">${this._get(c.entity_tds)} ppm</div></div>
    </div>`;
    if (this._tab === 'sw') return html`<div class="sw-grid">${Array.from({length:10},(_,i)=>{
        const id = c[`switch_${i+1}`]; if(!id) return '';
        const on = this.hass.states[id]?.state === 'on';
        return html`<div class="sw-btn ${on?'on':''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}><ha-icon icon="mdi:power"></ha-icon><span>${c[`name_switch_${i+1}`]||'Bouton'}</span></div>`;
    })}</div>`;
  }

  render() {
    const c = this.config;
    return html`
      <ha-card style="height:${c.card_height || '580px'}">
        <div class="bg" style="background-image:url('${c.background_image || '/local/sparond2.png'}')">
          <div class="glass-overlay">
            <div class="card-header">${c.card_title || 'MY SPA'}</div>
            <div class="content">${this._renderTab()}</div>
            <div class="navbar">
              <ha-icon class="${this._tab==='home'?'active':''}" icon="mdi:home-variant" @click=${()=>this._tab='home'}></ha-icon>
              <ha-icon class="${this._tab==='cam'?'active':''}" icon="mdi:camera" @click=${()=>this._tab='cam'}></ha-icon>
              <ha-icon class="${this._tab==='chem'?'active':''}" icon="mdi:flask-round-bottom" @click=${()=>this._tab='chem'}></ha-icon>
              <ha-icon class="${this._tab==='sw'?'active':''}" icon="mdi:tune-vertical" @click=${()=>this._tab='sw'}></ha-icon>
            </div>
          </div>
        </div>
      </ha-card>`;
  }

  static styles = css`
    :host { --accent: #00f9f9; --glass: rgba(255, 255, 255, 0.08); }
    ha-card { border-radius: 30px; overflow: hidden; background: #000; color: #fff; border:none; }
    .bg { background-size: cover; background-position: center; height: 100%; }
    .glass-overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%); backdrop-filter: blur(15px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .content { flex: 1; display: flex; align-items: center; justify-content: center; }
    .home-view { width: 100%; display: flex; flex-direction: column; gap: 30px; align-items: center; }
    .top-row { display: flex; gap: 10px; width: 100%; }
    .mini-card { background: var(--glass); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 15px; text-align: center; flex: 1; }
    .m-val { display: block; font-size: 18px; }
    .m-label { font-size: 8px; opacity: 0.5; }
    .main-gauge-area { display: flex; align-items: center; gap: 15px; }
    .temp-btn { width: 45px; height: 45px; border-radius: 50%; background: var(--glass); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; }
    .temp-btn:active { background: var(--accent); color: #000; }
    .center-gauge { position: relative; width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid transparent; border-top: 2px solid var(--accent); border-bottom: 2px solid var(--accent); animation: rotate 6s linear infinite; opacity: 0.3; }
    .inner-circle { width: 125px; height: 125px; background: rgba(255,255,255,0.03); border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .water-val { font-size: 40px; color: var(--accent); }
    .target-val { font-size: 9px; opacity: 0.4; margin-top: 5px; }
    .navbar { display: flex; justify-content: space-around; width: 100%; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
    .navbar ha-icon { opacity: 0.3; cursor: pointer; }
    .navbar ha-icon.active { opacity: 1; color: var(--accent); }
    .glass-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }
    .glass-card { background: var(--glass); padding: 15px; border-radius: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
    .sw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
    .sw-btn { background: var(--glass); padding: 10px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 5px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; }
    .sw-btn.on { border-color: var(--accent); background: rgba(0,249,249,0.1); }
    .sw-btn.on ha-icon { color: var(--accent); }
    .cam-view { width: 100%; border-radius: 15px; overflow: hidden; }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;
}
customElements.define("spa-card", SpaCard);
