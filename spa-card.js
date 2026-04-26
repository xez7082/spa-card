import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

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
        { name: "main_cons_entity", label: "Sonde Conso (Badge)", selector: { entity: {} } }
      ],
      chimie: [
        { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
        { name: "min_ph", label: "pH Min", selector: { number: { mode: "box", step: 0.1 } } }, { name: "max_ph", label: "pH Max", selector: { number: { mode: "box", step: 0.1 } } },
        { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
        { name: "min_orp", label: "ORP Min", selector: { number: { mode: "box" } } }, { name: "max_orp", label: "ORP Max", selector: { number: { mode: "box" } } },
        { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } },
        { name: "min_tds", label: "TDS Min", selector: { number: { mode: "box" } } }, { name: "max_tds", label: "TDS Max", selector: { number: { mode: "box" } } },
        { name: "entity_salt", label: "Salinité", selector: { entity: { domain: "sensor" } } },
        { name: "min_salt", label: "Sel Min", selector: { number: { mode: "box" } } }, { name: "max_salt", label: "Sel Max", selector: { number: { mode: "box" } } },
        { name: "entity_cond", label: "Conductivité", selector: { entity: { domain: "sensor" } } },
        { name: "min_cond", label: "Cond Min", selector: { number: { mode: "box" } } }, { name: "max_cond", label: "Cond Max", selector: { number: { mode: "box" } } },
        { name: "entity_probe_hum", label: "Humidité Sonde", selector: { entity: { domain: "sensor" } } },
        { name: "max_probe_hum", label: "Alerte Hum Sonde Max", selector: { number: { mode: "box" } } }
      ],
      camera: [
        { name: "entity_camera", label: "Entité Caméra", selector: { entity: { domain: "camera" } } },
        { name: "camera_width", label: "Largeur (ex: 100%)", selector: { text: {} } },
        { name: "camera_height", label: "Hauteur (ex: 250px)", selector: { text: {} } }
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
  static styles = css`.editor-tabs { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px; } button { padding: 6px; cursor: pointer; border-radius: 4px; border: none; background: #444; color: white; font-size: 10px;} button.active { background: #00f9f9; color: black; }`;
}
customElements.define("spa-card-editor", SpaCardEditor);

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].state : '--'; }
  _getUnit(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].attributes.unit_of_measurement || '' : ''; }

  _getIcon(id) {
    const slug = id.toLowerCase();
    if (slug.includes('television')) return 'mdi:television';
    if (slug.includes('aspirateur')) return 'mdi:robot-vacuum';
    if (slug.includes('alexa')) return 'mdi:speaker-wireless';
    if (slug.includes('camera')) return 'mdi:cctv';
    if (slug.includes('analyseur')) return 'mdi:test-tube';
    if (slug.includes('beem')) return 'mdi:solar-power';
    if (slug.includes('spa')) return 'mdi:hot-tub';
    return 'mdi:power';
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    return html`
      <ha-card style="height: ${c.card_height || '580px'};">
        <div class="main-container" style="background-image: url('${c.background_image || '/local/sparond2.png'}');">
          <div class="overlay">
            <div class="header">
               <h1>${c.card_title || 'SPA'}</h1>
            </div>
            <div class="view-port">${this._renderTab()}</div>
            <div class="bottom-nav">
              <div class="nav-i ${this._tab === 'home' ? 'on' : ''}" @click=${() => this._tab = 'home'}><ha-icon icon="mdi:hot-tub"></ha-icon></div>
              <div class="nav-i ${this._tab === 'cam' ? 'on' : ''}" @click=${() => this._tab = 'cam'}><ha-icon icon="mdi:camera"></ha-icon></div>
              <div class="nav-i ${this._tab === 'chem' ? 'on' : ''}" @click=${() => this._tab = 'chem'}><ha-icon icon="mdi:flask-round-bottom"></ha-icon></div>
              <div class="nav-i ${this._tab === 'sw' ? 'on' : ''}" @click=${() => this._tab = 'sw'}><ha-icon icon="mdi:dots-grid"></ha-icon></div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderTab() {
    const c = this.config;
    if (this._tab === 'home') {
        const valWater = parseFloat(this._get(c.entity_water_temp));
        const isAlert = (c.max_temp && valWater > c.max_temp) || (c.min_temp && valWater < c.min_temp);
        return html`
          <div class="home-view">
            <div class="temp-main-row">
                <div class="side-temp">
                    <div class="t-val">${this._get(c.entity_ext_temp)}°</div>
                    <div class="t-label">EXTÉRIEUR</div>
                </div>
                
                <div class="circle ${isAlert ? 'alert' : ''}">
                    <div class="v">${valWater || '--'}</div>
                    <div class="u">°C EAU</div>
                </div>

                <div class="side-temp">
                    <div class="t-val">${this._get(c.entity_spa_air_temp)}°</div>
                    <div class="t-label">INTÉRIEUR</div>
                </div>
            </div>

            <div class="conso-center">
                <div class="conso-badge">
                    <ha-icon icon="mdi:flash"></ha-icon>
                    <span>CONSO: ${this._get(c.main_cons_entity)} ${this._getUnit(c.main_cons_entity)}</span>
                </div>
            </div>

            <div class="hum-row-home">
                <div class="hum-item">
                    <ha-icon icon="mdi:water-percent"></ha-icon>
                    <span>${this._get(c.entity_ext_hum)}% EXT</span>
                </div>
                <div class="hum-item">
                    <ha-icon icon="mdi:water-percent"></ha-icon>
                    <span>${this._get(c.entity_spa_hum)}% SPA</span>
                </div>
            </div>
          </div>`;
    }
    
    if (this._tab === 'cam') return html`<div class="center" style="width:100%">${c.entity_camera ? html`<hui-image style="width:${c.camera_width || '100%'}; height:${c.camera_height || 'auto'};" .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Caméra non configurée'}</div>`;
    
    if (this._tab === 'chem') {
        const sArr = [
            { n: 'pH', v: this._get(c.entity_ph), min: c.min_ph, max: c.max_ph, i: 'mdi:ph' },
            { n: 'ORP', v: this._get(c.entity_orp), u: 'mV', min: c.min_orp, max: c.max_orp, i: 'mdi:lightning-bolt' },
            { n: 'TDS', v: this._get(c.entity_tds), u: 'ppm', min: c.min_tds, max: c.max_tds, i: 'mdi:water-opacity' },
            { n: 'SEL', v: this._get(c.entity_salt), u: 'ppm', min: c.min_salt, max: c.max_salt, i: 'mdi:shaker' },
            { n: 'COND', v: this._get(c.entity_cond), u: 'µS', min: c.min_cond, max: c.max_cond, i: 'mdi:waves' },
            { n: 'SONDE', v: this._get(c.entity_probe_hum), u: '%', max: c.max_probe_hum, i: 'mdi:leak' }
        ];
        return html`<div class="chem-grid">${sArr.map(s => {
            const val = parseFloat(s.v);
            const isAlert = (s.max && val > s.max) || (s.min && val < s.min);
            return html`<div class="chem-card-v2 ${isAlert ? 'alert' : ''}">
                <div class="chem-header-v2"><ha-icon icon="${s.i}"></ha-icon><span>${s.n}</span></div>
                <div class="chem-main-row">
                    <div class="chem-limit">${s.min || ''}</div>
                    <div class="chem-value-v2">${s.v}<small>${s.u||''}</small></div>
                    <div class="chem-limit">${s.max || ''}</div>
                </div>
            </div>`;
        })}</div>`;
    }

    if (this._tab === 'sw') {
        return html`<div class="sw-grid-compact">${Array.from({length:10},(_,i)=>{
            const id = c[`switch_${i+1}`]; if(!id) return '';
            const on = this.hass.states[id]?.state === 'on';
            const name = c[`name_switch_${i+1}`] || 'Bouton';
            return html`<div class="sw-tile-mini ${on?'on':''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}>
                <ha-icon icon="${this._getIcon(id)}"></ha-icon>
                <div class="sw-label-mini">${name}</div>
            </div>`;
        })}</div>`;
    }
  }

  static styles = css`
    ha-card { border-radius: 24px; overflow: hidden; color: white; }
    .main-container { background-size: cover; background-position: center; height: 100%; width: 100%; }
    .overlay { height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .header h1 { font-size: 16px; color: #00f9f9; text-align: center; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 3px; }
    .view-port { flex: 1; display: flex; align-items: center; justify-content: center; overflow-y: auto; width: 100%; }
    
    /* Layout Home V23 */
    .home-view { width: 100%; display: flex; flex-direction: column; gap: 20px; align-items: center; }
    .temp-main-row { display: flex; align-items: center; justify-content: center; width: 100%; gap: 15px; }
    
    .side-temp { text-align: center; flex: 1; }
    .t-val { font-size: 22px; color: rgba(255,255,255,0.9); font-weight: 300; }
    .t-label { font-size: 8px; opacity: 0.4; letter-spacing: 1px; margin-top: 2px; }
    
    .circle { width: 130px; height: 130px; border: 3px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0,249,249,0.2); }
    .circle.alert { border-color: #ff4d4d; box-shadow: 0 0 20px #ff4d4d; animation: pulse 2s infinite; }
    .v { font-size: 44px; color: #00f9f9; font-weight: 200; }
    .u { font-size: 9px; opacity: 0.6; }

    .conso-center { width: 100%; display: flex; justify-content: center; }
    .conso-badge { background: rgba(0,249,249,0.1); border: 1px solid rgba(0,249,249,0.3); padding: 8px 16px; border-radius: 20px; font-size: 11px; display: flex; align-items: center; gap: 8px; color: #00f9f9; }
    .conso-badge ha-icon { --mdc-icon-size: 16px; }

    .hum-row-home { display: flex; gap: 20px; opacity: 0.5; }
    .hum-item { display: flex; align-items: center; gap: 5px; font-size: 10px; }
    .hum-item ha-icon { --mdc-icon-size: 14px; }

    /* Grille Chimie V22 */
    .chem-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 100%; padding: 5px; }
    .chem-card-v2 { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 12px 8px; text-align: center; }
    .chem-header-v2 { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px; }
    .chem-header-v2 ha-icon { --mdc-icon-size: 16px; color: #00f9f9; }
    .chem-header-v2 span { font-size: 11px; font-weight: 600; text-transform: uppercase; opacity: 0.8; }
    .chem-main-row { display: flex; align-items: baseline; justify-content: space-between; gap: 5px; }
    .chem-value-v2 { font-size: 24px; color: #00f9f9; font-weight: 300; flex: 1; }
    .chem-value-v2 small { font-size: 10px; margin-left: 2px; opacity: 0.6; }
    .chem-limit { font-size: 11px; font-weight: bold; color: rgba(255,255,255,0.3); width: 30px; }
    .chem-card-v2.alert { border-color: #ff4d4d; background: rgba(255,77,77,0.15); animation: blink 2s infinite; }

    /* Boutons */
    .sw-grid-compact { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
    .sw-tile-mini { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 5px; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
    .sw-tile-mini ha-icon { --mdc-icon-size: 24px; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
    .sw-label-mini { font-size: 9px; color: rgba(255,255,255,0.8); text-align: center; }
    .sw-tile-mini.on { border-color: #00f9f9; background: rgba(0,249,249,0.1); }
    .sw-tile-mini.on ha-icon, .sw-tile-mini.on .sw-label-mini { color: #00f9f9; }

    .bottom-nav { display: flex; justify-content: space-around; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; }
    .nav-i { opacity: 0.3; cursor: pointer; transition: 0.3s; }
    .nav-i.on { opacity: 1; color: #00f9f9; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,77,77,0.7); } 70% { box-shadow: 0 0 0 15px rgba(255,77,77,0); } 100% { box-shadow: 0 0 0 0 rgba(255,77,77,0); } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master V23", preview: true });
