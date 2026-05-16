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
        { name: "card_height", label: "Hauteur Totale (ex: 580px)", selector: { text: {} } },
        { name: "blur_amount", label: "Intensité du flou (px)", selector: { number: { mode: "slider", min: 0, max: 25 } } }
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
        { name: "entity_ph", label: "Entité pH", selector: { entity: { domain: "sensor" } } },
        { name: "ph_min", label: "pH Minimum", selector: { number: { step: 0.1, mode: "box" } } },
        { name: "ph_max", label: "pH Maximum", selector: { number: { step: 0.1, mode: "box" } } },
        { name: "entity_orp", label: "Entité ORP", selector: { entity: { domain: "sensor" } } },
        { name: "orp_min", label: "ORP Minimum", selector: { number: { mode: "box" } } },
        { name: "orp_max", label: "ORP Maximum", selector: { number: { mode: "box" } } },
        { name: "entity_tds", label: "Entité TDS", selector: { entity: { domain: "sensor" } } },
        { name: "tds_min", label: "TDS Minimum", selector: { number: { mode: "box" } } },
        { name: "tds_max", label: "TDS Maximum", selector: { number: { mode: "box" } } },
        { name: "entity_salt", label: "Entité Sel", selector: { entity: { domain: "sensor" } } },
        { name: "salt_min", label: "Sel Minimum", selector: { number: { mode: "box" } } },
        { name: "salt_max", label: "Sel Maximum", selector: { number: { mode: "box" } } }
      ],
      camera: [
        { name: "entity_camera", label: "Entité Caméra", selector: { entity: { domain: "camera" } } },
        { name: "cam_w_px", label: "Largeur Cadre (px)", selector: { number: { mode: "box", min: 10, max: 1000 } } },
        { name: "cam_h_px", label: "Hauteur Cadre (px)", selector: { number: { mode: "box", min: 10, max: 1000 } } },
        { name: "cam_radius", label: "Arrondi des coins (px)", selector: { number: { mode: "slider", min: 0, max: 50 } } },
        { name: "cam_x", label: "Position Horiz. X (px)", selector: { number: { mode: "box", min: -500, max: 500 } } },
        { name: "cam_y", label: "Position Vert. Y (px)", selector: { number: { mode: "box", min: -500, max: 500 } } }
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
      <style>
        .editor-tabs { display: flex; gap: 5px; margin-bottom: 10px; }
        .editor-tabs button { flex: 1; padding: 8px; cursor: pointer; background: #222; color: #fff; border: 1px solid #444; border-radius: 4px; }
        .editor-tabs button.active { background: #00f9f9; color: #000; }
      </style>
    `;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _exists(id) {
    if (!id || !this.hass.states[id]) return false;
    const s = this.hass.states[id].state;
    return !['unavailable', 'unknown', 'none', '--'].includes(s.toLowerCase());
  }

  _changeTemp(offset) {
    const id = this.config.entity_target_temp;
    const val = Math.round((parseFloat(this.hass.states[id].state) + offset) * 2) / 2;
    const domain = id.split('.')[0];
    this.hass.callService(domain === 'climate' ? "climate" : "input_number", domain === 'climate' ? "set_temperature" : "set_value", domain === 'climate' ? { entity_id: id, temperature: val } : { entity_id: id, value: val });
  }

  _renderTab() {
    const c = this.config;
    if (this._tab === 'home') {
      return html`
        <div class="home-view">
          <div class="flex-row-center">
            <div class="side-col">
              ${this._exists(c.entity_ext_temp) ? html`<div class="side-info"><div class="val-big">${this.hass.states[c.entity_ext_temp].state}°</div><div class="label-tiny">EXTÉRIEUR</div></div>` : ''}
              ${this._exists(c.entity_ext_hum) ? html`<div class="hum-pill">${this.hass.states[c.entity_ext_hum].state}% HR</div>` : ''}
            </div>
            <div class="gauge-container">
                ${this._exists(c.entity_target_temp) ? html`<div class="temp-btn" @click=${() => this._changeTemp(0.5)}><ha-icon icon="mdi:chevron-up"></ha-icon></div>` : ''}
                <div class="center-gauge">
                    <div class="outer-ring"></div>
                    <div class="inner-circle">
                        ${this._exists(c.entity_water_temp) ? html`<span class="water-label">EAU</span><span class="water-val">${this.hass.states[c.entity_water_temp].state}°</span>` : ''}
                        ${this._exists(c.entity_target_temp) ? html`<div class="target-box"><span class="target-val">CIBLE ${this.hass.states[c.entity_target_temp].state}°</span></div>` : ''}
                    </div>
                </div>
                ${this._exists(c.entity_target_temp) ? html`<div class="temp-btn" @click=${() => this._changeTemp(-0.5)}><ha-icon icon="mdi:chevron-down"></ha-icon></div>` : ''}
            </div>
            <div class="side-col">
              ${this._exists(c.entity_spa_air_temp) ? html`<div class="side-info"><div class="val-big">${this.hass.states[c.entity_spa_air_temp].state}°</div><div class="label-tiny">AIR SPA</div></div>` : ''}
              ${this._exists(c.entity_spa_hum) ? html`<div class="hum-pill">${this.hass.states[c.entity_spa_hum].state}% HR</div>` : ''}
            </div>
          </div>
          ${this._exists(c.main_cons_entity) ? html`
            <div class="energy-footer">
                <ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon>
                <span>${this.hass.states[c.main_cons_entity].state} ${this.hass.states[c.main_cons_entity].attributes.unit_of_measurement || ''}</span>
            </div>` : ''}
        </div>`;
    }

    if (this._tab === 'chem') {
        const sensors = [
            {id:c.entity_ph, n:'pH', u:'', i:'mdi:flask', min:c.ph_min??7.0, max:c.ph_max??7.4, dMin:6.0, dMax:8.0},
            {id:c.entity_orp, n:'ORP', u:'mV', i:'mdi:bolt', min:c.orp_min??650, max:c.orp_max??750, dMin:500, dMax:900},
            {id:c.entity_tds, n:'TDS', u:'ppm', i:'mdi:water', min:c.tds_min??0, max:c.tds_max??2000, dMin:0, dMax:4000},
            {id:c.entity_salt, n:'SEL', u:'ppm', i:'mdi:shaker', min:c.salt_min??2000, max:c.salt_max??3000, dMin:1000, dMax:4000}
        ].filter(s => this._exists(s.id));
        
        return html`
          <div class="pool-monitor-style">
            ${sensors.map(s => {
                const val = parseFloat(this.hass.states[s.id].state);
                const totalRange = s.dMax - s.dMin;
                let pct = ((val - s.dMin) / totalRange) * 100;
                pct = Math.max(0, Math.min(100, pct));
                
                let statusClass = 'ideal';
                let statusLabel = 'Idéal';
                if (val < s.min) { statusClass = 'low'; statusLabel = 'Trop Bas'; }
                else if (val > s.max) { statusClass = 'high'; statusLabel = 'Trop Haut'; }

                return html`
                    <div class="pool-row">
                        <div class="pool-row-header">
                            <span class="pool-name"><ha-icon icon="${s.i}"></ha-icon> ${s.n}</span>
                            <span class="pool-status-text ${statusClass}">${statusLabel}</span>
                            <span class="pool-value">${val}<small>${s.u}</small></span>
                        </div>
                        <div class="pool-gauge-container">
                            <div class="pool-gauge-bar">
                                <div class="pool-zone low-zone" style="width: ${((s.min - s.dMin)/totalRange)*100}%"></div>
                                <div class="pool-zone ideal-zone" style="width: ${((s.max - s.min)/totalRange)*100}%"></div>
                                <div class="pool-zone high-zone" style="width: ${((s.dMax - s.max)/totalRange)*100}%"></div>
                                <div class="pool-marker" style="left: ${pct}%;"></div>
                            </div>
                            <div class="pool-gauge-labels">
                                <span>${s.dMin}</span>
                                <span class="mid-label">${s.min}</span>
                                <span class="mid-label">${s.max}</span>
                                <span>${s.dMax}</span>
                            </div>
                        </div>
                    </div>`;
            })}
          </div>`;
    }

    if (this._tab === 'sw') {
        const sws = Array.from({length:10},(_,i)=>({id:c[`switch_${i+1}`], n:c[`name_switch_${i+1}`]})).filter(s => this._exists(s.id));
        return html`<div class="sw-grid">${sws.map(s => html`<div class="sw-card ${this.hass.states[s.id].state==='on'?'active':''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:s.id})}><ha-icon icon="mdi:power"></ha-icon><span>${s.n||'Bouton'}</span></div>`)}</div>`;
    }

    if (this._tab === 'cam') {
        const w = c.cam_w_px || 300;
        const h = c.cam_h_px || 200;
        const rad = c.cam_radius || 20;
        const posX = c.cam_x || 0;
        const posY = c.cam_y || 0;
        return html`
          <div class="cam-container" style="transform: translate(${posX}px, ${posY}px);">
            <div class="cam-crop" style="width: ${w}px; height: ${h}px; border-radius: ${rad}px;">
              ${this._exists(c.entity_camera) ? html`
                <hui-image 
                  .hass=${this.hass} 
                  .cameraImage=${c.entity_camera} 
                  cameraView="live">
                </hui-image>` : ''}
            </div>
          </div>`;
    }
  }

  render() {
    const c = this.config;
    const blur = c.blur_amount !== undefined ? c.blur_amount : 15;
    const nav = [{id:'home', i:'mdi:home-variant'}];
    if(this._exists(c.entity_camera)) nav.push({id:'cam', i:'mdi:camera'});
    if([c.entity_ph, c.entity_orp, c.entity_tds, c.entity_salt].some(id => this._exists(id))) nav.push({id:'chem', i:'mdi:flask-round-bottom'});
    if(Array.from({length:10},(_,i)=>c[`switch_${i+1}`]).some(id => this._exists(id))) nav.push({id:'sw', i:'mdi:tune-vertical'});

    return html`
      <ha-card style="height: ${c.card_height || '580px'};">
        <div class="bg" style="background-image: url('${c.background_image || '/local/sparond2.png'}');">
            <div class="overlay" style="backdrop-filter: blur(${blur}px); -webkit-backdrop-filter: blur(${blur}px);">
                <div class="header">${c.card_title || 'MY SPA'}</div>
                <div class="main-content">${this._renderTab()}</div>
                ${nav.length > 1 ? html`<div class="nav">${nav.map(n => html`<ha-icon class="${this._tab===n.id?'active':''}" icon="${n.i}" @click=${()=>this._tab=n.id}></ha-icon>`)}</div>` : ''}
            </div>
        </div>
      </ha-card>`;
  }

  static styles = css`
    :host { --accent: #00f9f9; --glass: rgba(255,255,255,0.08); }
    ha-card { border-radius: 30px; overflow: hidden; background: #000; color: #fff; border: none; }
    .bg { background-size: cover; background-position: center; height: 100%; width: 100%; }
    .overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .header { text-align: center; opacity: 0.4; font-size: 10px; letter-spacing: 3px; margin-bottom: 5px; }
    .main-content { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; width: 100%; }
    
    /* STYLE POOL MONITOR CARD */
    .pool-monitor-style { width: 100%; display: flex; flex-direction: column; gap: 16px; padding: 10px; box-sizing: border-box; }
    .pool-row { background: var(--glass); padding: 12px 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
    .pool-row-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .pool-name { font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 6px; }
    .pool-name ha-icon { --mdc-icon-size: 18px; opacity: 0.7; }
    .pool-status-text { font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px; }
    .pool-status-text.ideal { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
    .pool-status-text.low { background: rgba(33, 150, 243, 0.2); color: #2196f3; }
    .pool-status-text.high { background: rgba(255, 152, 0, 0.2); color: #ff9800; }
    .pool-value { font-size: 18px; font-weight: 300; color: #fff; }
    .pool-value small { font-size: 11px; margin-left: 2px; opacity: 0.6; }
    
    .pool-gauge-container { position: relative; width: 100%; margin-top: 4px; }
    .pool-gauge-bar { position: relative; height: 6px; width: 100%; border-radius: 3px; overflow: visible; display: flex; background: rgba(255,255,255,0.1); }
    .pool-zone { height: 100%; }
    .pool-zone.low-zone { background: #2196f3; border-top-left-radius: 3px; border-bottom-left-radius: 3px; opacity: 0.6; }
    .pool-zone.ideal-zone { background: #4caf50; }
    .pool-zone.high-zone { background: #ff9800; border-top-right-radius: 3px; border-bottom-right-radius: 3px; opacity: 0.6; }
    
    .pool-marker { position: absolute; width: 12px; height: 12px; background: #fff; border-radius: 50%; top: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 6px rgba(0,0,0,0.8); border: 2px solid #222; z-index: 2; transition: left 0.5s ease-in-out; }
    
    /* MODIFICATIONS TAILLE DES VALEURS DU BAS */
    .pool-gauge-labels { display: flex; justify-content: space-between; font-size: 11px; opacity: 0.7; margin-top: 5px; padding: 0 2px; font-weight: 400; }
    .mid-label { font-weight: 700; color: #fff; opacity: 0.9; }

    /* RESTE DU STYLE ORIGINAL */
    .home-view { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .flex-row-center { display: flex; align-items: center; justify-content: center; width: 100%; gap: 10px; }
    .side-col { flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 70px; }
    .gauge-container { flex: 0 0 180px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .center-gauge { position: relative; width: 180px; height: 180px; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 1px solid rgba(0,249,249,0.1); border-top: 2px solid var(--accent); animation: rotate 8s linear infinite; }
    .inner-circle { width: 150px; height: 150px; background: rgba(255,255,255,0.03); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05); }
    .water-val { font-size: 50px; font-weight: 100; color: var(--accent); line-height: 1; }
    .water-label { font-size: 8px; opacity: 0.3; letter-spacing: 2px; }
    .target-box { margin-top: 5px; background: var(--glass); padding: 2px 8px; border-radius: 10px; font-size: 10px; opacity: 0.7; }
    .temp-btn { width: 38px; height: 38px; border-radius: 50%; background: var(--glass); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); }
    .val-big { font-size: 24px; font-weight: 200; }
    .label-tiny { font-size: 7px; opacity: 0.3; text-align: center; }
    .hum-pill { font-size: 8px; color: var(--accent); background: var(--glass); padding: 2px 6px; border-radius: 5px; margin-top: 4px; }
    .energy-footer { margin-top: 25px; background: var(--glass); padding: 5px 15px; border-radius: 20px; display: flex; align-items: center; gap: 8px; font-size: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .sw-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 12px; width: 100%; }
    .sw-card { background: var(--glass); padding: 15px 10px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); transition: 0.3s; cursor: pointer; }
    .sw-card.active { border-color: var(--accent); background: rgba(0,249,249,0.1); }
    .nav { display: flex; justify-content: space-around; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); width: 100%; }
    .nav ha-icon { opacity: 0.3; cursor: pointer; --mdc-icon-size: 24px; }
    .nav ha-icon.active { opacity: 1; color: var(--accent); }

    .cam-container { display: flex; align-items: center; justify-content: center; }
    .cam-crop { overflow: hidden; border: 2px solid rgba(255,255,255,0.2); background: #000; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .cam-crop hui-image { width: 100%; height: 100%; --ha-camera-object-fit: fill; }

    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .anim-pulse { animation: pulse 2s infinite; color: var(--accent); }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master V32.0", preview: true });
