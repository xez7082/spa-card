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
        { name: "min_temp", label: "Alerte Temp Eau Mini", selector: { number: { mode: "box" } } },
        { name: "max_temp", label: "Alerte Temp Eau Maxi", selector: { number: { mode: "box" } } },
        { name: "entity_ext_temp", label: "Temp Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_air_temp", label: "Temp Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ext_hum", label: "Humidité Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_hum", label: "Humidité Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "main_cons_entity", label: "Sonde Conso (Badge)", selector: { entity: {} } }
      ],
      chimie: [
        { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
        { name: "min_ph", label: "pH Mini", selector: { number: { mode: "box", step: 0.1 } } },
        { name: "max_ph", label: "pH Maxi", selector: { number: { mode: "box", step: 0.1 } } },
        { name: "entity_orp", label: "ORP (Redox)", selector: { entity: { domain: "sensor" } } },
        { name: "min_orp", label: "ORP Mini", selector: { number: { mode: "box" } } },
        { name: "max_orp", label: "ORP Maxi", selector: { number: { mode: "box" } } },
        { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } },
        { name: "entity_salt", label: "Salinité", selector: { entity: { domain: "sensor" } } },
        { name: "entity_cond", label: "Conductivité", selector: { entity: { domain: "sensor" } } },
        { name: "entity_sg", label: "Densité (S.G)", selector: { entity: { domain: "sensor" } } },
        { name: "entity_probe_hum", label: "Humidité Analyseur (Fuite)", selector: { entity: { domain: "sensor" } } }
      ],
      divers: Array.from({ length: 4 }, (_, i) => ([
        { name: `misc_entity_${i + 1}`, label: `Sonde Divers ${i + 1}`, selector: { entity: {} } },
        { name: `misc_name_${i + 1}`, label: `Nom ${i + 1}`, selector: { text: {} } }
      ])).flat(),
      camera: [
        { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
        { name: "camera_height", label: "Hauteur Vidéo", selector: { text: {} } }
      ],
      switches: Array.from({ length: 10 }, (_, i) => ([
        { name: `switch_${i + 1}`, label: `Bouton ${i + 1}`, selector: { entity: {} } },
        { name: `name_switch_${i + 1}`, label: `Nom ${i + 1}`, selector: { text: {} } }
      ])).flat()
    };

    return html`
      <div class="editor-tabs">
        <button class="${this._selectedTab === 'gen' ? 'active' : ''}" @click=${() => this._selectedTab = 'gen'}>Général</button>
        <button class="${this._selectedTab === 'sensors' ? 'active' : ''}" @click=${() => this._selectedTab = 'sensors'}>Accueil</button>
        <button class="${this._selectedTab === 'chimie' ? 'active' : ''}" @click=${() => this._selectedTab = 'chimie'}>Chimie</button>
        <button class="${this._selectedTab === 'divers' ? 'active' : ''}" @click=${() => this._selectedTab = 'divers'}>Divers</button>
        <button class="${this._selectedTab === 'camera' ? 'active' : ''}" @click=${() => this._selectedTab = 'camera'}>Caméra</button>
        <button class="${this._selectedTab === 'switches' ? 'active' : ''}" @click=${() => this._selectedTab = 'switches'}>Boutons</button>
      </div>
      <ha-form .hass=${this.hass} .data=${this._config} .schema=${schemas[this._selectedTab]} @value-changed=${this._valueChanged}></ha-form>
    `;
  }

  static styles = css`
    .editor-tabs { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 20px; background: #222; padding: 10px; border-radius: 8px; }
    button { padding: 8px 10px; cursor: pointer; border-radius: 4px; border: none; background: #444; color: white; font-size: 11px;}
    button.active { background: #00f9f9; color: black; font-weight: bold; }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].state : '--'; }
  _getUnit(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].attributes.unit_of_measurement || '' : ''; }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    return html`
      <ha-card style="height: ${c.card_height || '580px'};">
        <div class="main-container" style="background-image: url('${c.background_image || '/local/sparond2.png'}');">
          <div class="overlay">
            <div class="header">
               <div class="ext-tag"><ha-icon icon="mdi:thermometer"></ha-icon> EXT: ${this._get(c.entity_ext_temp)}°C</div>
               <h1>${c.card_title || 'SPA'}</h1>
            </div>
            <div class="view-port">${this._renderTab()}</div>
            <div class="bottom-nav">
              <div class="nav-i ${this._tab === 'home' ? 'on' : ''}" @click=${() => this._tab = 'home'}><ha-icon icon="mdi:hot-tub"></ha-icon></div>
              <div class="nav-i ${this._tab === 'cam' ? 'on' : ''}" @click=${() => this._tab = 'cam'}><ha-icon icon="mdi:camera"></ha-icon></div>
              <div class="nav-i ${this._tab === 'chem' ? 'on' : ''}" @click=${() => this._tab = 'chem'}><ha-icon icon="mdi:flask-round-bottom"></ha-icon></div>
              <div class="nav-i ${this._tab === 'misc' ? 'on' : ''}" @click=${() => this._tab = 'misc'}><ha-icon icon="mdi:chart-timeline-variant"></ha-icon></div>
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
        const val = parseFloat(this._get(c.entity_water_temp));
        const isAlert = (c.max_temp && val > c.max_temp) || (c.min_temp && val < c.min_temp);
        return html`
          <div class="home-view">
            <div class="circle ${isAlert ? 'alert' : ''}"><div class="v">${val || '--'}</div><div class="u">°C EAU</div></div>
            <div class="info-grid">
                <div class="badge"><ha-icon icon="mdi:home-thermometer"></ha-icon> SPA: ${this._get(c.entity_spa_air_temp)}°C</div>
                <div class="badge"><ha-icon icon="mdi:flash"></ha-icon> ${this._get(c.main_cons_entity)}${this._getUnit(c.main_cons_entity)}</div>
            </div>
            <div class="hum-row">
                <div class="hum-box"><div class="hum-val">${this._get(c.entity_spa_hum)}%</div><div class="hum-lab">HUM AIR SPA</div></div>
                <div class="hum-box"><div class="hum-val">${this._get(c.entity_ext_hum)}%</div><div class="hum-lab">HUM EXT</div></div>
            </div>
          </div>`;
    }
    if (this._tab === 'cam') return html`<div class="center">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Pas de caméra'}</div>`;
    if (this._tab === 'chem') {
        const sArr = [
            { n: 'pH', v: this._get(c.entity_ph), min: c.min_ph, max: c.max_ph },
            { n: 'ORP', v: this._get(c.entity_orp), u: 'mV', min: c.min_orp, max: c.max_orp },
            { n: 'TDS', v: this._get(c.entity_tds), u: 'ppm' },
            { n: 'SEL', v: this._get(c.entity_salt), u: 'ppm' },
            { n: 'COND', v: this._get(c.entity_cond), u: 'µS/cm' },
            { n: 'S.G', v: this._get(c.entity_sg) },
            { n: 'HUM PROBE', v: this._get(c.entity_probe_hum), u: '%' }
        ];
        return html`<div class="chem-list">${sArr.map(s => {
            const isAlert = (s.max && parseFloat(s.v) > s.max) || (s.min && parseFloat(s.v) < s.min);
            return html`<div class="row ${isAlert ? 'alert-row' : ''}"><span>${s.n}</span><div class="val-box"><b>${s.v} ${s.u||''}</b><small>${s.min||''}${s.min?' - ':''}${s.max||''}</small></div></div>`;
        })}</div>`;
    }
    if (this._tab === 'misc') {
        return html`<div class="chem-list">${Array.from({length:4},(_,i)=>{
            const id = c[`misc_entity_${i+1}`]; if(!id) return '';
            return html`<div class="row"><span>${c[`misc_name_${i+1}`]}</span><b>${this._get(id)} ${this._getUnit(id)}</b></div>`;
        })}</div>`;
    }
    if (this._tab === 'sw') {
        return html`<div class="sw-grid">${Array.from({length:10},(_,i)=>{
            const id = c[`switch_${i+1}`]; if(!id) return '';
            const on = this.hass.states[id]?.state === 'on';
            return html`<div class="sw-box" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}>
                <div class="btn ${on?'on':''}"><ha-icon icon="${this.hass.states[id]?.attributes.icon || 'mdi:power'}"></ha-icon></div>
                <div class="label">${c[`name_switch_${i+1}`] || '...'}</div>
            </div>`;
        })}</div>`;
    }
  }

  static styles = css`
    ha-card { border-radius: 24px; overflow: hidden; color: white; border: 1px solid rgba(255,255,255,0.1); }
    .main-container { background-size: cover; background-position: center; height: 100%; width: 100%; }
    .overlay { height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .header h1 { font-size: 16px; color: #00f9f9; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
    .ext-tag { font-size: 10px; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 12px; display: flex; align-items: center; gap: 5px; }
    .view-port { flex: 1; display: flex; align-items: center; justify-content: center; overflow-y: auto; }
    .home-view { display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; }
    .circle { width: 140px; height: 140px; border: 3px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: 0.3s; }
    .circle.alert { border-color: #ff4d4d; box-shadow: 0 0 20px #ff4d4d; animation: pulse 2s infinite; }
    .v { font-size: 48px; color: #00f9f9; font-weight: 200; }
    .alert .v { color: #ff4d4d; }
    .u { font-size: 10px; opacity: 0.6; }
    .info-grid { display: flex; gap: 10px; }
    .badge { background: rgba(255,255,255,0.08); padding: 6px 14px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.1); }
    .hum-row { display: flex; gap: 40px; text-align: center; }
    .hum-val { font-size: 24px; color: #00f9f9; font-weight: 300; }
    .hum-lab { font-size: 9px; opacity: 0.5; }
    .chem-list { width: 100%; display: flex; flex-direction: column; gap: 8px; }
    .row { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
    .alert-row { border: 1px solid #ff4d4d; background: rgba(255,77,77,0.1); animation: blink 2s infinite; }
    .val-box { text-align: right; display: flex; flex-direction: column; }
    .val-box b { color: #00f9f9; }
    .val-box small { font-size: 9px; opacity: 0.5; }
    .sw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 100%; }
    .sw-box { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
    .btn { width: 50px; height: 50px; background: rgba(255,255,255,0.1); border-radius: 15px; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
    .btn.on { background: rgba(0,249,249,0.3); border: 1px solid #00f9f9; color: #00f9f9; box-shadow: 0 0 10px rgba(0,249,249,0.2); }
    .label { font-size: 9px; margin-top: 6px; text-align: center; }
    .bottom-nav { display: flex; justify-content: space-around; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; }
    .nav-i { opacity: 0.3; cursor: pointer; transition: 0.3s; }
    .nav-i.on { opacity: 1; color: #00f9f9; transform: scale(1.1); }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,77,77,0.7); } 70% { box-shadow: 0 0 0 15px rgba(255,77,77,0); } 100% { box-shadow: 0 0 0 0 rgba(255,77,77,0); } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master V17", preview: true });
