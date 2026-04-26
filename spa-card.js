import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR DE CONFIGURATION ---
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
        { name: "background_image", label: "Image (/local/sparond2.png)", selector: { text: {} } },
        { name: "card_height", label: "Hauteur Carte (ex: 600px)", selector: { text: {} } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Temp Eau (Cercle)", selector: { entity: { domain: "sensor" } } },
        { name: "min_temp", label: "Eau Mini", selector: { number: { mode: "box" } } },
        { name: "max_temp", label: "Eau Maxi", selector: { number: { mode: "box" } } },
        { name: "entity_ext_temp", label: "Temp Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_air_temp", label: "Temp Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ext_hum", label: "Humidité Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_hum", label: "Humidité Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "main_cons_entity", label: "Sonde Conso", selector: { entity: {} } }
      ],
      chimie: [
        { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
        { name: "min_ph", label: "pH Min", selector: { number: { mode: "box", step: 0.1 } } }, 
        { name: "max_ph", label: "pH Max", selector: { number: { mode: "box", step: 0.1 } } },
        { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
        { name: "min_orp", label: "ORP Min", selector: { number: { mode: "box" } } },
        { name: "max_orp", label: "ORP Max", selector: { number: { mode: "box" } } },
        { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } },
        { name: "min_tds", label: "TDS Min", selector: { number: { mode: "box" } } }, 
        { name: "max_tds", label: "TDS Max", selector: { number: { mode: "box" } } },
        { name: "entity_salt", label: "Salinité", selector: { entity: { domain: "sensor" } } },
        { name: "min_salt", label: "Sel Min", selector: { number: { mode: "box" } } }, 
        { name: "max_salt", label: "Sel Max", selector: { number: { mode: "box" } } },
        { name: "entity_cond", label: "Conductivité", selector: { entity: { domain: "sensor" } } },
        { name: "min_cond", label: "Cond Min", selector: { number: { mode: "box" } } }, 
        { name: "max_cond", label: "Cond Max", selector: { number: { mode: "box" } } },
        { name: "entity_probe_hum", label: "Humidité Sonde", selector: { entity: { domain: "sensor" } } },
        { name: "max_probe_hum", label: "Alerte Hum Sonde Max", selector: { number: { mode: "box" } } }
      ],
      camera: [
        { name: "entity_camera", label: "Entité Caméra", selector: { entity: { domain: "camera" } } }
      ],
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
  static styles = css`.editor-tabs { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px; } button { padding: 8px; cursor: pointer; border-radius: 4px; border: none; background: #444; color: white; font-size: 10px;} button.active { background: #00f9f9; color: black; font-weight: bold; }`;
}
customElements.define("spa-card-editor", SpaCardEditor);


// --- CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].state : '--'; }
  _getUnit(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].attributes.unit_of_measurement || '' : ''; }

  _renderTab() {
    const c = this.config;
    
    // TAB HOME
    if (this._tab === 'home') {
        const valW = parseFloat(this._get(c.entity_water_temp));
        const isAlert = (c.max_temp && valW > c.max_temp) || (c.min_temp && valW < c.min_temp);
        return html`
          <div class="home-view">
            <div class="main-display">
                <div class="side-info">
                    <div class="val-big">${this._get(c.entity_ext_temp)}°</div>
                    <div class="label-tiny">EXTÉRIEUR</div>
                    <div class="hum-pill">${this._get(c.entity_ext_hum)}% HR</div>
                </div>
                <div class="center-gauge">
                    <div class="outer-ring ${isAlert ? 'alert' : ''}"></div>
                    <div class="inner-circle">
                        <span class="water-label">TEMP EAU</span>
                        <span class="water-val">${valW || '--'}</span>
                        <span class="water-unit">°CELSIUS</span>
                    </div>
                </div>
                <div class="side-info">
                    <div class="val-big">${this._get(c.entity_spa_air_temp)}°</div>
                    <div class="label-tiny">AIR SPA</div>
                    <div class="hum-pill">${this._get(c.entity_spa_hum)}% HR</div>
                </div>
            </div>
            <div class="energy-card">
                <ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon>
                <div class="energy-details">
                    <div class="energy-val">${this._get(c.main_cons_entity)} <small>${this._getUnit(c.main_cons_entity)}</small></div>
                    <div class="energy-label">CONSOMMATION ACTUELLE</div>
                </div>
            </div>
          </div>`;
    }

    // TAB CAMERA
    if (this._tab === 'cam') {
        return html`<div class="cam-view">
            ${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Caméra non configurée'}
        </div>`;
    }
    
    // TAB CHIMIE
    if (this._tab === 'chem') {
        const sensors = [
            { n: 'pH', v: this._get(c.entity_ph), min: c.min_ph, max: c.max_ph, i: 'mdi:flask-outline' },
            { n: 'ORP', v: this._get(c.entity_orp), u: 'mV', min: c.min_orp, max: c.max_orp, i: 'mdi:bolt' },
            { n: 'TDS', v: this._get(c.entity_tds), u: 'ppm', min: c.min_tds, max: c.max_tds, i: 'mdi:water-check' },
            { n: 'SEL', v: this._get(c.entity_salt), u: 'ppm', min: c.min_salt, max: c.max_salt, i: 'mdi:shaker-outline' },
            { n: 'COND', v: this._get(c.entity_cond), u: 'µS', min: c.min_cond, max: c.max_cond, i: 'mdi:waves' },
            { n: 'SONDE', v: this._get(c.entity_probe_hum), u: '%', max: c.max_probe_hum, i: 'mdi:leak' }
        ];
        return html`<div class="glass-grid">${sensors.map(s => {
            const val = parseFloat(s.v);
            const alert = (s.max && val > s.max) || (s.min && val < s.min);
            return html`
            <div class="glass-card ${alert ? 'alert' : ''}">
                <div class="g-header"><ha-icon icon="${s.i}"></ha-icon> <span>${s.n}</span></div>
                <div class="g-body">
                    <span class="g-lim">${s.min||''}</span>
                    <span class="g-main">${s.v}<small>${s.u||''}</small></span>
                    <span class="g-lim">${s.max||''}</span>
                </div>
            </div>`;
        })}</div>`;
    }

    // TAB SWITCHES
    if (this._tab === 'sw') {
        return html`<div class="sw-grid-elegant">${Array.from({length:10},(_,i)=>{
            const id = c[`switch_${i+1}`]; if(!id) return '';
            const on = this.hass.states[id]?.state === 'on';
            return html`
              <div class="sw-btn ${on?'on':''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}>
                <ha-icon icon="mdi:power"></ha-icon>
                <span>${c[`name_switch_${i+1}`] || 'Bouton'}</span>
              </div>`;
        })}</div>`;
    }
  }

  render() {
    const c = this.config;
    return html`
      <ha-card style="height: ${c.card_height || '580px'};">
        <div class="bg" style="background-image: url('${c.background_image || '/local/sparond2.png'}');">
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
      </ha-card>
    `;
  }

  static styles = css`
    :host { --accent: #00f9f9; --glass: rgba(255, 255, 255, 0.07); }
    ha-card { border-radius: 30px; overflow: hidden; border: none; background: #000; color: #fff; }
    .bg { background-size: cover; background-position: center; height: 100%; transition: 0.5s; }
    .glass-overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%); backdrop-filter: blur(10px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    
    .card-header { text-align: center; font-weight: 200; letter-spacing: 5px; font-size: 13px; margin-bottom: 15px; opacity: 0.6; }
    .content { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }

    /* HOME */
    .home-view { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .main-display { display: flex; align-items: center; justify-content: space-around; width: 100%; }
    .side-info { text-align: center; }
    .val-big { font-size: 26px; font-weight: 200; }
    .label-tiny { font-size: 8px; letter-spacing: 2px; opacity: 0.4; margin: 4px 0; }
    .hum-pill { font-size: 9px; background: var(--glass); padding: 3px 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }

    .center-gauge { position: relative; width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid transparent; border-top: 2px solid var(--accent); border-bottom: 2px solid var(--accent); animation: rotate 5s linear infinite; opacity: 0.4; }
    .inner-circle { width: 125px; height: 125px; background: rgba(255,255,255,0.03); border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .water-val { font-size: 48px; font-weight: 100; color: var(--accent); text-shadow: 0 0 15px rgba(0,249,249,0.4); }
    .water-label { font-size: 8px; opacity: 0.5; letter-spacing: 2px; }

    .energy-card { background: var(--glass); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 12px 20px; display: flex; align-items: center; gap: 15px; width: 90%; }
    .energy-card ha-icon { color: var(--accent); --mdc-icon-size: 24px; }
    .energy-val { font-size: 18px; font-weight: 300; }
    .energy-label { font-size: 8px; opacity: 0.4; letter-spacing: 1px; }

    /* CHIMIE */
    .glass-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; }
    .glass-card { background: var(--glass); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 15px; }
    .g-header { display: flex; align-items: center; justify-content: center; gap: 5px; opacity: 0.6; margin-bottom: 5px; }
    .g-header ha-icon { --mdc-icon-size: 14px; color: var(--accent); }
    .g-header span { font-size: 10px; font-weight: bold; }
    .g-body { display: flex; align-items: baseline; justify-content: space-between; }
    .g-main { font-size: 20px; color: var(--accent); font-weight: 200; flex: 1; text-align: center; }
    .g-lim { font-size: 10px; opacity: 0.2; width: 25px; font-weight: bold; }
    .glass-card.alert { border-color: #ff4b4b; background: rgba(255,75,75,0.1); }

    /* CAMERA */
    .cam-view { width: 100%; border-radius: 15px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }

    /* SWITCHES */
    .sw-grid-elegant { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
    .sw-btn { background: var(--glass); border: 1px solid rgba(255,255,255,0.1); padding: 12px 5px; border-radius: 15px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
    .sw-btn ha-icon { --mdc-icon-size: 20px; opacity: 0.3; }
    .sw-btn span { font-size: 8px; opacity: 0.6; text-transform: uppercase; text-align: center; }
    .sw-btn.on { background: rgba(0,249,249,0.15); border-color: var(--accent); }
    .sw-btn.on ha-icon { opacity: 1; color: var(--accent); }

    /* NAV */
    .navbar { display: flex; justify-content: space-around; margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); }
    .navbar ha-icon { cursor: pointer; opacity: 0.3; transition: 0.3s; --mdc-icon-size: 24px; }
    .navbar ha-icon.active { opacity: 1; color: var(--accent); filter: drop-shadow(0 0 5px var(--accent)); }

    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .anim-pulse { animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master V26", preview: true });
