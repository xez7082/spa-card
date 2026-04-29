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
      camera: [
        { name: "entity_camera", label: "Entité Caméra", selector: { entity: { domain: "camera" } } },
        { name: "camera_size", label: "Taille de la caméra (%)", selector: { number: { mode: "slider", min: 50, max: 100 } } }
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
}
customElements.define("spa-card-editor", SpaCardEditor);

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _exists(id) {
    if (!id || !this.hass.states[id]) return false;
    return !['unavailable', 'unknown', 'none'].includes(this.hass.states[id].state.toLowerCase());
  }

  _renderTab() {
    const c = this.config;
    if (this._tab === 'home') {
      return html`
        <div class="home-view">
          <div class="side-info left">
            ${this._exists(c.entity_ext_temp) ? html`<div class="val-big">${this.hass.states[c.entity_ext_temp].state}°</div><div class="label-tiny">EXTÉRIEUR</div>` : ''}
            ${this._exists(c.entity_ext_hum) ? html`<div class="hum-pill">${this.hass.states[c.entity_ext_hum].state}% HR</div>` : ''}
          </div>

          <div class="gauge-fixed-center">
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

          <div class="side-info right">
            ${this._exists(c.entity_spa_air_temp) ? html`<div class="val-big">${this.hass.states[c.entity_spa_air_temp].state}°</div><div class="label-tiny">AIR SPA</div>` : ''}
            ${this._exists(c.entity_spa_hum) ? html`<div class="hum-pill">${this.hass.states[c.entity_spa_hum].state}% HR</div>` : ''}
          </div>

          ${this._exists(c.main_cons_entity) ? html`
            <div class="energy-footer">
                <ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon>
                <span>${this.hass.states[c.main_cons_entity].state} ${this.hass.states[c.main_cons_entity].attributes.unit_of_measurement || ''}</span>
            </div>` : ''}
        </div>`;
    }

    if (this._tab === 'cam') {
        const camScale = (c.camera_size || 100) / 100;
        return html`<div class="cam-container" style="transform: scale(${camScale});">${this._exists(c.entity_camera) ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : ''}</div>`;
    }

    if (this._tab === 'sw') {
        const sws = Array.from({length:10},(_,i)=>({id:c[`switch_${i+1}`], n:c[`name_switch_${i+1}`]})).filter(s => this._exists(s.id));
        return html`<div class="sw-grid">${sws.map(s => html`<div class="sw-card ${this.hass.states[s.id].state==='on'?'active':''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:s.id})}><ha-icon icon="mdi:power"></ha-icon><span>${s.n||'Bouton'}</span></div>`)}</div>`;
    }
  }

  _changeTemp(offset) {
    const id = this.config.entity_target_temp;
    const val = Math.round((parseFloat(this.hass.states[id].state) + offset) * 2) / 2;
    const domain = id.split('.')[0];
    this.hass.callService(domain === 'climate' ? "climate" : "input_number", domain === 'climate' ? "set_temperature" : "set_value", domain === 'climate' ? { entity_id: id, temperature: val } : { entity_id: id, value: val });
  }

  render() {
    const c = this.config;
    const blur = c.blur_amount !== undefined ? c.blur_amount : 15;
    const nav = [{id:'home', i:'mdi:home-variant'}];
    if(this._exists(c.entity_camera)) nav.push({id:'cam', i:'mdi:camera'});
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
    .bg { background-size: cover; background-position: center; height: 100%; }
    .overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    .header { text-align: center; opacity: 0.4; font-size: 10px; letter-spacing: 3px; margin-bottom: 10px; }
    .main-content { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; width: 100%; }
    
    /* POSITIONNEMENT FIXE DU CERCLE */
    .home-view { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
    .gauge-fixed-center { z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 15px; }
    .center-gauge { position: relative; width: 180px; height: 180px; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 1px solid rgba(0,249,249,0.1); border-top: 2px solid var(--accent); animation: rotate 8s linear infinite; }
    .inner-circle { width: 150px; height: 150px; background: rgba(255,255,255,0.03); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05); }
    .water-val { font-size: 50px; font-weight: 100; color: var(--accent); line-height: 1; }
    .water-label { font-size: 8px; opacity: 0.3; letter-spacing: 2px; }
    .target-box { margin-top: 5px; background: var(--glass); padding: 2px 8px; border-radius: 10px; font-size: 10px; opacity: 0.7; }
    .temp-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--glass); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); }

    /* INFOS LATERALES ABSOLUES (NE POUSSENT PAS LE CENTRE) */
    .side-info { position: absolute; top: 50%; transform: translateY(-50%); text-align: center; width: 60px; }
    .side-info.left { left: 0; }
    .side-info.right { right: 0; }
    .val-big { font-size: 24px; font-weight: 200; }
    .label-tiny { font-size: 7px; opacity: 0.3; }
    .hum-pill { font-size: 8px; color: var(--accent); background: var(--glass); padding: 2px 5px; border-radius: 5px; margin-top: 4px; display: inline-block; }

    .energy-footer { position: absolute; bottom: 0; background: var(--glass); padding: 5px 15px; border-radius: 20px; display: flex; align-items: center; gap: 8px; font-size: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .sw-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 12px; width: 100%; }
    .sw-card { background: var(--glass); padding: 20px 10px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: 0.3s; }
    .sw-card.active { background: rgba(0,249,249,0.15); border-color: var(--accent); }
    .sw-card ha-icon { display: block; margin-bottom: 8px; }
    .nav { display: flex; justify-content: space-around; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
    .nav ha-icon { opacity: 0.3; cursor: pointer; --mdc-icon-size: 24px; }
    .nav ha-icon.active { opacity: 1; color: var(--accent); }
    .cam-container { width: 100%; transition: 0.3s; }
    .cam-container hui-image { width: 100%; border-radius: 15px; }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .anim-pulse { animation: pulse 2s infinite; color: var(--accent); }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master V28.8", preview: true });
