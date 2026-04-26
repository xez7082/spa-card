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

  _getHumColor(val) {
    const v = parseFloat(val);
    if (v > 70) return '#4db8ff'; // Humide (Bleu)
    if (v < 40) return '#ffcc00'; // Sec (Jaune)
    return '#00f9f9'; // Idéal (Cyan)
  }

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
        const valHumExt = this._get(c.entity_ext_hum);
        const valHumInt = this._get(c.entity_spa_hum);
        const isAlert = (c.max_temp && valWater > c.max_temp) || (c.min_temp && valWater < c.min_temp);
        
        return html`
          <div class="home-view">
            <div class="temp-main-row">
                <div class="side-block">
                    <div class="side-temp">
                        <div class="t-val">${this._get(c.entity_ext_temp)}°</div>
                        <div class="t-label">EXTÉRIEUR</div>
                    </div>
                    <div class="side-hum" style="color: ${this._getHumColor(valHumExt)}">
                        <ha-icon icon="mdi:water-percent" class="anim-float"></ha-icon>
                        <span>${valHumExt}%</span>
                    </div>
                </div>
                
                <div class="circle-container">
                    <div class="circle-glow"></div>
                    <div class="circle ${isAlert ? 'alert' : ''}">
                        <div class="v">${valWater || '--'}</div>
                        <div class="u">°C EAU</div>
                    </div>
                </div>

                <div class="side-block">
                    <div class="side-temp">
                        <div class="t-val">${this._get(c.entity_spa_air_temp)}°</div>
                        <div class="t-label">AIR SPA</div>
                    </div>
                    <div class="side-hum" style="color: ${this._getHumColor(valHumInt)}">
                        <ha-icon icon="mdi:water-percent" class="anim-float"></ha-icon>
                        <span>${valHumInt}%</span>
                    </div>
                </div>
            </div>

            <div class="conso-section">
                <div class="conso-badge-v2">
                    <ha-icon icon="mdi:flash" class="anim-pulse-flash"></ha-icon>
                    <div class="conso-text">
                        <span class="c-label">CONSOMMATION ACTUELLE</span>
                        <span class="c-val">${this._get(c.main_cons_entity)} ${this._getUnit(c.main_cons_entity)}</span>
                    </div>
                </div>
                <div class="conso-line"></div>
            </div>

            <div class="decoration-row">
                <ha-icon icon="mdi:waves"></ha-icon>
                <ha-icon icon="mdi:filter-variant"></ha-icon>
                <ha-icon icon="mdi:auto-fix"></ha-icon>
            </div>
          </div>`;
    }
    // ... reste des onglets (cam, chem, sw) identiques à V23
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
                <div class="chem-main-row"><div class="chem-limit">${s.min || ''}</div><div class="chem-value-v2">${s.v}<small>${s.u||''}</small></div><div class="chem-limit">${s.max || ''}</div></div>
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
    .overlay { height: 100%; background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%); backdrop-filter: blur(5px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .header h1 { font-size: 14px; color: #00f9f9; text-align: center; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 5px; opacity: 0.8; }
    .view-port { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; }
    
    /* Layout Home V24 */
    .home-view { width: 100%; display: flex; flex-direction: column; gap: 25px; align-items: center; }
    .temp-main-row { display: flex; align-items: center; justify-content: space-around; width: 100%; }
    
    .side-block { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
    .side-temp { text-align: center; }
    .t-val { font-size: 24px; color: #fff; font-weight: 300; }
    .t-label { font-size: 8px; opacity: 0.4; letter-spacing: 1px; }
    
    .side-hum { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: bold; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 10px; }
    .side-hum ha-icon { --mdc-icon-size: 14px; }

    /* Cercle Central Animé */
    .circle-container { position: relative; width: 130px; height: 130px; }
    .circle-glow { position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; border-radius: 50%; border: 1px solid rgba(0,249,249,0.3); animation: rotate 10s linear infinite; }
    .circle { position: relative; width: 100%; height: 100%; border: 3px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); box-shadow: 0 0 20px rgba(0,249,249,0.2); z-index: 2; }
    .v { font-size: 46px; color: #00f9f9; font-weight: 200; }
    .u { font-size: 9px; opacity: 0.6; margin-top: -5px; }

    /* Section Consommation */
    .conso-section { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .conso-badge-v2 { display: flex; align-items: center; gap: 12px; }
    .conso-badge-v2 ha-icon { --mdc-icon-size: 24px; color: #00f9f9; }
    .conso-text { display: flex; flex-direction: column; align-items: center; }
    .c-label { font-size: 8px; opacity: 0.5; letter-spacing: 1px; }
    .c-val { font-size: 18px; color: #00f9f9; font-weight: 500; }
    .conso-line { width: 60px; height: 2px; background: linear-gradient(90deg, transparent, #00f9f9, transparent); border-radius: 2px; }

    /* Décoration */
    .decoration-row { display: flex; gap: 20px; opacity: 0.2; }
    .decoration-row ha-icon { --mdc-icon-size: 18px; }

    /* Animations */
    .anim-float { animation: float 3s ease-in-out infinite; }
    .anim-pulse-flash { animation: pulse-flash 2s ease-in-out infinite; }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes pulse-flash { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 0px #00f9f9); } 50% { opacity: 0.7; filter: drop-shadow(0 0 5px #00f9f9); } }
    
    /* Autres Styles (Chimie/Switches de V23) */
    .chem-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 100%; }
    .chem-card-v2 { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 12px 8px; text-align: center; }
    .chem-value-v2 { font-size: 24px; color: #00f9f9; flex: 1; }
    .sw-grid-compact { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
    .sw-tile-mini { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 5px; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
    .sw-tile-mini.on { border-color: #00f9f9; background: rgba(0,249,249,0.1); }
    .bottom-nav { display: flex; justify-content: space-around; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; }
    .nav-i { opacity: 0.3; cursor: pointer; }
    .nav-i.on { opacity: 1; color: #00f9f9; }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master V24", preview: true });
