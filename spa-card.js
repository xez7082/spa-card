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
        { name: "card_height", label: "Hauteur Carte", selector: { text: {} } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Temp Eau (Actuelle)", selector: { entity: { domain: "sensor" } } },
        { name: "entity_target_temp", label: "Entité Consigne (Réglage)", selector: { entity: {} } },
        { name: "min_temp", label: "Consigne Mini", selector: { number: { mode: "box" } } },
        { name: "max_temp", label: "Consigne Maxi", selector: { number: { mode: "box" } } },
        { name: "entity_ext_temp", label: "Temp Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_air_temp", label: "Temp Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ext_hum", label: "Humidité Extérieure", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_hum", label: "Humidité Air Spa", selector: { entity: { domain: "sensor" } } },
        { name: "main_cons_entity", label: "Sonde Conso", selector: { entity: {} } }
      ],
      chimie: [
        { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
        { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } }
        // Ajoutez les autres si besoin...
      ],
      camera: [
        { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
        { name: "camera_height", label: "Hauteur Caméra", selector: { text: {} } }
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


// --- CARTE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].state : '--'; }
  
  _setTemp(ev) {
    const val = ev.target.value;
    const entityId = this.config.entity_target_temp;
    const domain = entityId.split('.')[0];
    
    if (domain === 'input_number') {
      this.hass.callService("input_number", "set_value", { entity_id: entityId, value: val });
    } else if (domain === 'climate') {
      this.hass.callService("climate", "set_temperature", { entity_id: entityId, temperature: val });
    }
  }

  _renderTab() {
    const c = this.config;
    if (this._tab === 'home') {
        const currentW = parseFloat(this._get(c.entity_water_temp));
        const targetW = parseFloat(this._get(c.entity_target_temp));
        
        return html`
          <div class="home-view">
            <div class="main-display">
                <div class="side-info">
                    <div class="val-big">${this._get(c.entity_ext_temp)}°</div>
                    <div class="label-tiny">EXTÉRIEUR</div>
                    <div class="hum-pill">${this._get(c.entity_ext_hum)}% HR</div>
                </div>
                <div class="center-gauge">
                    <div class="outer-ring"></div>
                    <div class="inner-circle">
                        <span class="water-label">ACTUELLE</span>
                        <span class="water-val">${currentW || '--'}</span>
                        <span class="water-unit">°C EAU</span>
                    </div>
                </div>
                <div class="side-info">
                    <div class="val-big">${this._get(c.entity_spa_air_temp)}°</div>
                    <div class="label-tiny">AIR SPA</div>
                    <div class="hum-pill">${this._get(c.entity_spa_hum)}% HR</div>
                </div>
            </div>

            <div class="target-control">
                <div class="target-header">
                    <span>CONSIGNE: <strong>${targetW}°C</strong></span>
                </div>
                <input type="range" 
                    min="${c.min_temp || 10}" 
                    max="${c.max_temp || 40}" 
                    step="0.5" 
                    .value="${targetW}"
                    @change="${this._setTemp}"
                    class="spa-slider">
            </div>

            <div class="energy-card">
                <ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon>
                <div class="energy-details">
                    <div class="energy-val">${this._get(c.main_cons_entity)} W</div>
                    <div class="energy-label">PUISSANCE</div>
                </div>
            </div>
          </div>`;
    }
    // ... (les autres onglets restent identiques à la V27)
    if (this._tab === 'cam') return html`<div class="cam-view" style="height:${c.camera_height || '300px'}">${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : 'Caméra...'}</div>`;
    if (this._tab === 'chem') return html`<div class="glass-grid"><div class="glass-card">pH: ${this._get(c.entity_ph)}</div></div>`;
    if (this._tab === 'sw') return html`<div class="sw-grid-elegant">Boutons...</div>`;
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
                    <ha-icon icon="mdi:flask-round-bottom" @click=${()=>this._tab='chem'}></ha-icon>
                    <ha-icon icon="mdi:tune-vertical" @click=${()=>this._tab='sw'}></ha-icon>
                </div>
            </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host { --accent: #00f9f9; --glass: rgba(255, 255, 255, 0.08); }
    ha-card { border-radius: 30px; overflow: hidden; background: #000; color: #fff; }
    .bg { background-size: cover; background-position: center; height: 100%; }
    .glass-overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%); backdrop-filter: blur(12px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .content { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .home-view { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 25px; }
    .main-display { display: flex; align-items: center; justify-content: space-around; width: 100%; }
    .val-big { font-size: 26px; font-weight: 200; }
    .label-tiny { font-size: 8px; letter-spacing: 2px; opacity: 0.4; }
    .hum-pill { font-size: 9px; background: var(--glass); padding: 3px 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
    
    .center-gauge { position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid transparent; border-top: 2px solid var(--accent); border-bottom: 2px solid var(--accent); animation: rotate 5s linear infinite; opacity: 0.4; }
    .inner-circle { width: 115px; height: 115px; background: rgba(255,255,255,0.03); border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .water-val { font-size: 44px; font-weight: 100; color: var(--accent); text-shadow: 0 0 15px rgba(0,249,249,0.4); }
    .water-label { font-size: 8px; opacity: 0.5; }

    /* STYLE SLIDER */
    .target-control { width: 85%; background: var(--glass); padding: 15px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); }
    .target-header { text-align: center; font-size: 11px; margin-bottom: 10px; letter-spacing: 1px; }
    .target-header strong { color: var(--accent); font-size: 14px; }
    .spa-slider { width: 100%; -webkit-appearance: none; background: rgba(255,255,255,0.1); height: 4px; border-radius: 5px; outline: none; }
    .spa-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--accent); cursor: pointer; box-shadow: 0 0 10px var(--accent); }

    .energy-card { display: flex; align-items: center; gap: 15px; opacity: 0.6; }
    .navbar { display: flex; justify-content: space-around; width: 100%; margin-top: 20px; }
    .navbar ha-icon { cursor: pointer; opacity: 0.3; }
    .navbar ha-icon.active { opacity: 1; color: var(--accent); }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;
}
customElements.define("spa-card", SpaCard);
