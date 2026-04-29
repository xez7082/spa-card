import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR (Simplifié pour la lecture) ---
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
        { name: "background_image", label: "Image", selector: { text: {} } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Temp Actuelle", selector: { entity: { domain: "sensor" } } },
        { name: "entity_target_temp", label: "Entité Consigne (Réglage)", selector: { entity: {} } },
        { name: "entity_ext_temp", label: "Temp Ext", selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_air_temp", label: "Temp Air Spa", selector: { entity: { domain: "sensor" } } }
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
  static styles = css`.editor-tabs { display: flex; gap: 5px; margin-bottom: 15px; } button { padding: 8px; border-radius: 4px; border: none; background: #444; color: white; cursor: pointer; } button.active { background: #00f9f9; color: #000; }`;
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].state : '--'; }

  _changeTemp(offset) {
    const entityId = this.config.entity_target_temp;
    const current = parseFloat(this._get(entityId));
    const newVal = current + offset;
    const domain = entityId.split('.')[0];
    
    if (domain === 'input_number') {
      this.hass.callService("input_number", "set_value", { entity_id: entityId, value: newVal });
    } else if (domain === 'climate') {
      this.hass.callService("climate", "set_temperature", { entity_id: entityId, temperature: newVal });
    }
  }

  _renderTab() {
    const c = this.config;
    if (this._tab === 'home') {
        return html`
          <div class="home-view">
            <div class="top-row">
                <div class="mini-card">
                    <span class="m-val">${this._get(c.entity_ext_temp)}°</span>
                    <span class="m-label">EXTÉRIEUR</span>
                </div>
                <div class="mini-card">
                    <span class="m-val">${this._get(c.entity_spa_air_temp)}°</span>
                    <span class="m-label">AIR SPA</span>
                </div>
            </div>

            <div class="main-gauge-area">
                <div class="temp-btn down" @click=${() => this._changeTemp(-0.5)}>-</div>
                
                <div class="center-gauge">
                    <div class="outer-ring"></div>
                    <div class="inner-circle">
                        <span class="water-label">EAU</span>
                        <span class="water-val">${this._get(c.entity_water_temp)}°</span>
                        <span class="target-val">CIBLE: ${this._get(c.entity_target_temp)}°</span>
                    </div>
                </div>

                <div class="temp-btn up" @click=${() => this._changeTemp(0.5)}>+</div>
            </div>

            <div class="bottom-info">
                <div class="energy-pill">
                    <ha-icon icon="mdi:lightning-bolt"></ha-icon>
                    <span>${this._get(c.main_cons_entity)} W</span>
                </div>
            </div>
          </div>`;
    }
    // (Les autres onglets cam/chem/sw restent identiques)
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
                    <ha-icon icon="mdi:camera" @click=${()=>this._tab='cam'}></ha-icon>
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
    ha-card { border-radius: 30px; overflow: hidden; background: #000; color: #fff; border:none; }
    .bg { background-size: cover; background-position: center; height: 100%; }
    .glass-overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%); backdrop-filter: blur(15px); display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
    
    .content { flex: 1; display: flex; align-items: center; justify-content: center; }
    .home-view { width: 100%; display: flex; flex-direction: column; gap: 40px; align-items: center; }

    /* TOP ROW */
    .top-row { display: flex; gap: 15px; width: 100%; justify-content: center; }
    .mini-card { background: var(--glass); border: 1px solid rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 20px; text-align: center; flex: 1; max-width: 120px; }
    .m-val { display: block; font-size: 20px; font-weight: 200; }
    .m-label { font-size: 8px; opacity: 0.4; letter-spacing: 1px; }

    /* GAUGE & BOUTONS */
    .main-gauge-area { display: flex; align-items: center; gap: 20px; }
    .temp-btn { width: 50px; height: 50px; border-radius: 50%; background: var(--glass); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 200; cursor: pointer; transition: 0.2s; }
    .temp-btn:active { background: var(--accent); color: #000; }
    
    .center-gauge { position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid transparent; border-top: 2px solid var(--accent); border-bottom: 2px solid var(--accent); animation: rotate 6s linear infinite; opacity: 0.3; }
    .inner-circle { width: 135px; height: 135px; background: rgba(255,255,255,0.03); border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .water-val { font-size: 48px; font-weight: 100; color: var(--accent); text-shadow: 0 0 20px rgba(0,249,249,0.5); }
    .water-label { font-size: 10px; opacity: 0.5; letter-spacing: 3px; }
    .target-val { font-size: 9px; opacity: 0.4; margin-top: 5px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px; }

    /* BOTTOM */
    .energy-pill { background: var(--glass); padding: 8px 20px; border-radius: 30px; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(0,249,249,0.2); }
    .energy-pill ha-icon { color: var(--accent); --mdc-icon-size: 18px; }

    .navbar { display: flex; justify-content: space-around; width: 100%; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
    .navbar ha-icon { opacity: 0.3; cursor: pointer; }
    .navbar ha-icon.active { opacity: 1; color: var(--accent); }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;
}
customElements.define("spa-card", SpaCard);
