import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- 1. ÉDITEUR (Mis à jour pour inclure les nouveaux capteurs) ---
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
        { name: "entity_ext_temp", label: "Temp Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_air_temp", label: "Temp Air Intérieur Spa", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ext_hum", label: "Humidité Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_hum", label: "Humidité Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "main_cons_entity", label: "Sonde Conso Élec", selector: { entity: {} } }
      ],
      chimie: [
        { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
        { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } },
        { name: "entity_salt", label: "Salinité", selector: { entity: { domain: "sensor" } } }
      ],
      switches: Array.from({ length: 8 }, (_, i) => ([
        { name: `switch_${i + 1}`, label: `Bouton ${i + 1}`, selector: { entity: {} } },
        { name: `name_switch_${i + 1}`, label: `Nom ${i + 1}`, selector: { text: {} } }
      ])).flat()
    };

    return html`
      <div class="editor-tabs">
        <button class="${this._selectedTab === 'gen' ? 'active' : ''}" @click=${() => this._selectedTab = 'gen'}>Général</button>
        <button class="${this._selectedTab === 'sensors' ? 'active' : ''}" @click=${() => this._selectedTab = 'sensors'}>Accueil</button>
        <button class="${this._selectedTab === 'chimie' ? 'active' : ''}" @click=${() => this._selectedTab = 'chimie'}>Chimie</button>
        <button class="${this._selectedTab === 'switches' ? 'active' : ''}" @click=${() => this._selectedTab = 'switches'}>Boutons</button>
      </div>
      <ha-form .hass=${this.hass} .data=${this._config} .schema=${schemas[this._selectedTab]} @value-changed=${this._valueChanged}></ha-form>
    `;
  }

  static styles = css`
    .editor-tabs { display: flex; gap: 5px; margin-bottom: 20px; background: #222; padding: 10px; border-radius: 8px; }
    button { padding: 8px; cursor: pointer; border-radius: 4px; border: none; background: #444; color: white; }
    button.active { background: #00f9f9; color: black; font-weight: bold; }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- 2. CARTE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].state : '--'; }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const h = c.card_height || '550px';

    return html`
      <ha-card style="height: ${h};">
        <div class="main-container" style="background-image: url('${c.background_image || '/local/sparond2.png'}');">
          <div class="overlay">
            <div class="header">
               <div class="ext-tag"><ha-icon icon="mdi:thermometer"></ha-icon> EXT: ${this._get(c.entity_ext_temp)}°C</div>
               <h1>${c.card_title || 'SPA'}</h1>
            </div>
            
            <div class="view-port">${this._renderTab()}</div>

            <div class="bottom-nav">
              <div class="nav-i ${this._tab === 'home' ? 'on' : ''}" @click=${() => this._tab = 'home'}><ha-icon icon="mdi:hot-tub"></ha-icon></div>
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
        return html`
          <div class="home-view">
            <div class="circle"><div class="v">${this._get(c.entity_water_temp)}</div><div class="u">°C EAU</div></div>
            
            <div class="info-grid">
                <div class="badge">
                    <ha-icon icon="mdi:home-thermometer"></ha-icon>
                    <span>SPA: ${this._get(c.entity_spa_air_temp)}°C</span>
                </div>
                <div class="badge">
                    <ha-icon icon="mdi:flash"></ha-icon>
                    <span>${this._get(c.main_cons_entity)} W</span>
                </div>
            </div>

            <div class="hum-row">
                <div class="hum-box">
                    <div class="hum-val">${this._get(c.entity_spa_hum)}%</div>
                    <div class="hum-lab">HUM SPA</div>
                </div>
                <div class="hum-box">
                    <div class="hum-val">${this._get(c.entity_ext_hum)}%</div>
                    <div class="hum-lab">HUM EXT</div>
                </div>
            </div>
          </div>`;
    }
    
    if (this._tab === 'chem') {
        const sensors = [
            { n: 'pH', v: this._get(c.entity_ph) },
            { n: 'ORP', v: this._get(c.entity_orp), u: 'mV' },
            { n: 'TDS', v: this._get(c.entity_tds), u: 'ppm' },
            { n: 'SEL', v: this._get(c.entity_salt), u: 'ppm' }
        ];
        return html`<div class="chem-list">${sensors.map(s => html`<div class="row"><span>${s.n}</span><b>${s.v} ${s.u||''}</b></div>`)}</div>`;
    }

    if (this._tab === 'sw') {
        return html`<div class="sw-grid">${Array.from({length:8},(_,i)=>{
            const id = c[`switch_${i+1}`]; if(!id) return '';
            const on = this.hass.states[id]?.state === 'on';
            return html`<div class="sw-box" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}>
                <div class="btn ${on?'on':''}"><ha-icon icon="${on?'mdi:power-on':'mdi:power-off'}"></ha-icon></div>
                <div class="label">${c[`name_switch_${i+1}`] || 'Bouton'}</div>
            </div>`;
        })}</div>`;
    }
  }

  static styles = css`
    ha-card { border-radius: 24px; overflow: hidden; color: white; }
    .main-container { background-size: cover; background-position: center; height: 100%; }
    .overlay { height: 100%; background: rgba(0,0,0,0.65); backdrop-filter: blur(5px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 18px; color: #00f9f9; margin: 0; }
    .ext-tag { font-size: 11px; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 10px; }
    .view-port { flex: 1; display: flex; align-items: center; justify-content: center; }
    
    /* Home View */
    .home-view { display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%; }
    .circle { width: 130px; height: 130px; border: 3px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0,249,249,0.2); }
    .v { font-size: 40px; font-weight: 200; color: #00f9f9; }
    .u { font-size: 10px; opacity: 0.6; }
    
    .info-grid { display: flex; gap: 10px; }
    .badge { background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 5px; border: 1px solid rgba(255,255,255,0.1); }
    
    .hum-row { display: flex; gap: 40px; margin-top: 10px; }
    .hum-box { text-align: center; }
    .hum-val { font-size: 22px; color: #00f9f9; font-weight: 300; }
    .hum-lab { font-size: 9px; opacity: 0.5; letter-spacing: 1px; }

    /* Chem & Switches */
    .chem-list { width: 100%; display: flex; flex-direction: column; gap: 8px; }
    .row { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; display: flex; justify-content: space-between; }
    .sw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .sw-box { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
    .btn { width: 45px; height: 45px; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
    .btn.on { background: #00f9f9; color: #000; box-shadow: 0 0 10px #00f9f9; }
    .label { font-size: 9px; margin-top: 5px; opacity: 0.8; }

    .bottom-nav { display: flex; justify-content: space-around; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
    .nav-i { opacity: 0.3; cursor: pointer; }
    .nav-i.on { opacity: 1; color: #00f9f9; }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards.push({ type: "spa-card", name: "Spa Master V16", preview: true });
