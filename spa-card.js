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
        { name: "background_image", label: "Image de fond", selector: { text: {} } },
        { name: "card_height", label: "Hauteur (ex: 580px)", selector: { text: {} } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Temp Eau (Actuelle)", selector: { entity: { domain: "sensor" } } },
        { name: "entity_target_temp", label: "Entité Consigne", selector: { entity: {} } },
        { name: "entity_ext_temp", label: "Temp Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ext_hum", label: "Humidité Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_air_temp", label: "Temp Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_hum", label: "Humidité Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "main_cons_entity", label: "Sonde Conso", selector: { entity: {} } }
      ],
      chimie: [
        { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
        { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } },
        { name: "entity_salt", label: "Salinité", selector: { entity: { domain: "sensor" } } },
        { name: "entity_cond", label: "Conductivité", selector: { entity: { domain: "sensor" } } },
        { name: "entity_probe_hum", label: "Humidité Sonde", selector: { entity: { domain: "sensor" } } }
      ],
      camera: [{ name: "entity_camera", label: "Entité Caméra", selector: { entity: { domain: "camera" } } }],
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
  static styles = css`.editor-tabs { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px; } button { padding: 8px; border-radius: 4px; border: none; background: #444; color: white; font-size: 10px; cursor: pointer;} button.active { background: #00f9f9; color: black; }`;
}
customElements.define("spa-card-editor", SpaCardEditor);

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  // FILTRE ABSOLU : Si pas de valeur réelle, on renvoie FALSE
  _isValide(id) {
    if (!id || !this.hass.states[id]) return false;
    const state = this.hass.states[id].state;
    const ignored = ['unavailable', 'unknown', 'null', 'undefined', '--', 'none', ''];
    return !ignored.includes(state.toLowerCase());
  }

  _get(id) { return this._isValide(id) ? this.hass.states[id].state : null; }
  _getUnit(id) { return this._isValide(id) ? this.hass.states[id].attributes.unit_of_measurement || '' : ''; }

  _renderTab() {
    const c = this.config;
    
    // PAGE ACCUEIL
    if (this._tab === 'home') {
        const valW = this._get(c.entity_water_temp);
        const valT = this._get(c.entity_target_temp);
        const hasExt = this._isValide(c.entity_ext_temp) || this._isValide(c.entity_ext_hum);
        const hasAir = this._isValide(c.entity_spa_air_temp) || this._isValide(c.entity_spa_hum);

        return html`
          <div class="home-view">
            <div class="main-display">
                ${hasExt ? html`<div class="side-info">
                    ${this._isValide(c.entity_ext_temp) ? html`<div class="val-big">${this._get(c.entity_ext_temp)}°</div><div class="label-tiny">EXTÉRIEUR</div>` : ''}
                    ${this._isValide(c.entity_ext_hum) ? html`<div class="hum-pill">${this._get(c.entity_ext_hum)}% HR</div>` : ''}
                </div>` : ''}
                
                <div class="gauge-container">
                    ${valT ? html`<div class="temp-btn-v" @click=${() => this._changeTemp(0.5)}><ha-icon icon="mdi:chevron-up"></ha-icon></div>` : ''}
                    <div class="center-gauge">
                        <div class="outer-ring"></div>
                        <div class="inner-circle">
                            ${valW ? html`<span class="water-label">EAU</span><span class="water-val">${valW}°</span>` : ''}
                            ${valT ? html`<div class="target-box"><span class="target-val">CIBLE ${valT}°</span></div>` : ''}
                        </div>
                    </div>
                    ${valT ? html`<div class="temp-btn-v" @click=${() => this._changeTemp(-0.5)}><ha-icon icon="mdi:chevron-down"></ha-icon></div>` : ''}
                </div>

                ${hasAir ? html`<div class="side-info">
                    ${this._isValide(c.entity_spa_air_temp) ? html`<div class="val-big">${this._get(c.entity_spa_air_temp)}°</div><div class="label-tiny">AIR SPA</div>` : ''}
                    ${this._isValide(c.entity_spa_hum) ? html`<div class="hum-pill">${this._get(c.entity_spa_hum)}% HR</div>` : ''}
                </div>` : ''}
            </div>
            ${this._isValide(c.main_cons_entity) ? html`
            <div class="energy-card">
                <ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon>
                <div class="energy-val">${this._get(c.main_cons_entity)} <small>${this._getUnit(c.main_cons_entity)}</small></div>
            </div>` : ''}
          </div>`;
    }

    // PAGE CHIMIE (FILTRAGE RADICAL)
    if (this._tab === 'chem') {
        const sensors = [
            { id: c.entity_ph, n: 'pH', i: 'mdi:flask-outline' },
            { id: c.entity_orp, n: 'ORP', u: 'mV', i: 'mdi:bolt' },
            { id: c.entity_tds, n: 'TDS', u: 'ppm', i: 'mdi:water-check' },
            { id: c.entity_salt, n: 'SEL', u: 'ppm', i: 'mdi:shaker-outline' },
            { id: c.entity_cond, n: 'COND', u: 'µS', i: 'mdi:waves' },
            { id: c.entity_probe_hum, n: 'SONDE', u: '%', i: 'mdi:leak' }
        ].filter(s => this._isValide(s.id));

        if (sensors.length === 0) return html`<div class="empty-msg">Aucun capteur actif</div>`;

        return html`<div class="chemistry-grid">${sensors.map(s => html`
            <div class="glass-card">
                <div class="g-header"><ha-icon icon="${s.i}"></ha-icon> <span>${s.n}</span></div>
                <div class="g-main">${this._get(s.id)}<small>${s.u||''}</small></div>
            </div>`)}</div>`;
    }

    // PAGE BOUTONS
    if (this._tab === 'sw') {
        const sws = Array.from({length:10},(_,i)=>({id:c[`switch_${i+1}`], n:c[`name_switch_${i+1}`]})).filter(s => this._isValide(s.id));
        if (sws.length === 0) return html`<div class="empty-msg">Aucun interrupteur</div>`;

        return html`<div class="sw-grid-elegant">${sws.map(s => {
            const on = this.hass.states[s.id]?.state === 'on';
            return html`
              <div class="sw-btn ${on?'on':''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:s.id})}>
                <ha-icon icon="mdi:power"></ha-icon>
                <span>${s.n || 'Bouton'}</span>
              </div>`;
        })}</div>`;
    }

    // PAGE CAMERA
    if (this._tab === 'cam') {
        return html`<div class="cam-view">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : ''}</div>`;
    }
  }

  _changeTemp(offset) {
    const id = this.config.entity_target_temp;
    if (!this._isValide(id)) return;
    const current = parseFloat(this._get(id));
    const newVal = Math.round((current + offset) * 2) / 2;
    const domain = id.split('.')[0];
    this.hass.callService(domain === 'climate' ? "climate" : "input_number", "set_" + (domain === 'climate' ? "temperature" : "value"), domain === 'climate' ? { entity_id: id, temperature: newVal } : { entity_id: id, value: newVal });
  }

  render() {
    const c = this.config;
    const hasCam = this._isValide(c.entity_camera);
    const hasChem = [c.entity_ph, c.entity_orp, c.entity_tds, c.entity_salt, c.entity_cond, c.entity_probe_hum].some(id => this._isValide(id));
    const hasSw = Array.from({length:10},(_,i)=>c[`switch_${i+1}`]).some(id => this._isValide(id));
    
    const navItems = [{id:'home', icon:'mdi:home-variant'}];
    if(hasCam) navItems.push({id:'cam', icon:'mdi:camera'});
    if(hasChem) navItems.push({id:'chem', icon:'mdi:flask-round-bottom'});
    if(hasSw) navItems.push({id:'sw', icon:'mdi:tune-vertical'});

    return html`
      <ha-card style="height: ${c.card_height || '580px'};">
        <div class="bg" style="background-image: url('${c.background_image || '/local/sparond2.png'}');">
            <div class="glass-overlay">
                <div class="card-header">${c.card_title || 'MY SPA'}</div>
                <div class="content">${this._renderTab()}</div>
                ${navItems.length > 1 ? html`
                <div class="navbar">
                    ${navItems.map(item => html`
                        <ha-icon class="${this._tab === item.id ? 'active' : ''}" icon="${item.icon}" @click=${() => this._tab = item.id}></ha-icon>
                    `)}
                </div>` : ''}
            </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host { --accent: #00f9f9; --glass: rgba(255, 255, 255, 0.07); }
    ha-card { border-radius: 30px; overflow: hidden; background: #000; color: #fff; border: none; }
    .bg { background-size: cover; background-position: center; height: 100%; border-radius: 30px; }
    .glass-overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%); backdrop-filter: blur(15px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .card-header { text-align: center; font-weight: 200; letter-spacing: 4px; font-size: 12px; margin-bottom: 10px; opacity: 0.5; }
    .content { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; }
    .empty-msg { font-size: 12px; opacity: 0.3; font-style: italic; }

    .home-view { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 30px; }
    .main-display { display: flex; align-items: center; justify-content: space-evenly; width: 100%; }
    .side-info { text-align: center; display: flex; flex-direction: column; align-items: center; min-width: 50px; }
    .val-big { font-size: 28px; font-weight: 200; color: #fff; }
    .label-tiny { font-size: 7px; opacity: 0.4; letter-spacing: 1px; margin-top: 2px; }
    .hum-pill { font-size: 9px; background: var(--glass); padding: 2px 8px; border-radius: 10px; margin-top: 8px; border: 1px solid rgba(255,255,255,0.1); color: var(--accent); }

    .gauge-container { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .center-gauge { position: relative; width: 170px; height: 170px; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 1px solid rgba(0,249,249,0.1); border-top: 2px solid var(--accent); animation: rotate 10s linear infinite; }
    .inner-circle { width: 140px; height: 140px; background: rgba(255,255,255,0.03); border-radius: 50%; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .water-val { font-size: 48px; font-weight: 100; color: var(--accent); line-height: 1; }
    .water-label { font-size: 9px; letter-spacing: 3px; opacity: 0.3; margin-bottom: 5px; }
    .target-box { margin-top: 8px; padding: 2px 10px; border-radius: 20px; background: rgba(255,255,255,0.05); }
    .target-val { font-size: 11px; font-weight: 400; opacity: 0.7; }
    .temp-btn-v { width: 32px; height: 32px; border-radius: 50%; background: var(--glass); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); }

    .energy-card { background: var(--glass); border-radius: 20px; padding: 8px 20px; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(255,255,255,0.1); }
    .energy-val { font-size: 16px; font-weight: 300; color: var(--accent); }

    .chemistry-grid { display: grid; gap: 12px; width: 100%; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); }
    .glass-card { background: var(--glass); padding: 18px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: center; }
    .g-header { font-size: 9px; opacity: 0.4; letter-spacing: 1px; margin-bottom: 6px; text-transform: uppercase; }
    .g-main { font-size: 24px; color: var(--accent); font-weight: 200; }

    .sw-grid-elegant { display: grid; grid-template-columns: repeat(auto-fit, minmax(85px, 1fr)); gap: 12px; width: 100%; }
    .sw-btn { background: var(--glass); padding: 18px 5px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); transition: 0.3s; }
    .sw-btn.on { border-color: var(--accent); background: rgba(0,249,249,0.1); box-shadow: 0 0 15px rgba(0,249,249,0.1); }
    .sw-btn ha-icon { --mdc-icon-size: 24px; opacity: 0.5; }
    .sw-btn.on ha-icon { color: var(--accent); opacity: 1; }
    .sw-btn span { font-size: 10px; font-weight: 300; }

    .navbar { display: flex; justify-content: space-around; width: 100%; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .navbar ha-icon { cursor: pointer; opacity: 0.2; transition: 0.3s; --mdc-icon-size: 24px; }
    .navbar ha-icon.active { opacity: 1; color: var(--accent); }
    
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .anim-pulse { animation: pulse 2s ease-in-out infinite; color: var(--accent); }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master V28.2", preview: true });
