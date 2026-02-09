import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR ---
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }
  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true, composed: true,
    }));
  }
  render() {
    if (!this.hass || !this._config) return html``;
    const schema = [
      { name: "card_title", label: "Titre", selector: { text: {} } },
      { name: "background_image", label: "Image (URL)", selector: { text: {} } },
      { name: "entity_water_temp", label: "Entité Temp Eau", selector: { entity: {} } },
      { name: "entity_ph", label: "Entité pH", selector: { entity: {} } }
    ];
    return html`<div style="padding:15px;"><ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form></div>`;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  
  setConfig(config) { this.config = config; }

  _getState(id) {
    if (!this.hass || !id || !this.hass.states[id]) return { val: '?', unit: '', active: false };
    const s = this.hass.states[id];
    return { 
      val: s.state, 
      unit: s.attributes.unit_of_measurement || '', 
      active: !['off', 'unavailable'].includes(s.state.toLowerCase()) 
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const temp = this._getState(c.entity_water_temp);
    const ph = this._getState(c.entity_ph);

    return html`
      <ha-card style="background-image: url('${c.background_image}');">
        <div class="glass-overlay">
          <div class="header">
            <h1>${c.card_title || 'SPA CONTROL'}</h1>
            <div class="status-badge ${temp.active ? 'active' : ''}">
              ${temp.active ? 'SYSTÈME ACTIF' : 'VEILLE'}
            </div>
          </div>

          <div class="main-display">
            <div class="temp-circle">
              <span class="temp-val">${temp.val}</span>
              <span class="temp-unit">${temp.unit}</span>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-item">
              <span class="label">PH</span>
              <span class="value" style="color: ${parseFloat(ph.val) > 7.6 ? '#ff4d4d' : '#00f9f9'}">${ph.val}</span>
            </div>
            <div class="stat-item">
              <span class="label">EAU</span>
              <span class="value">OPTIMALE</span>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      height: 450px;
      background-size: cover;
      background-position: center;
      border-radius: 28px;
      overflow: hidden;
      position: relative;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .glass-overlay {
      height: 100%;
      background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 25px;
      box-sizing: border-box;
      backdrop-filter: blur(2px);
    }
    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 300;
      letter-spacing: 3px;
      color: white;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      font-size: 10px;
      margin-top: 8px;
    }
    .status-badge.active { color: #00f9f9; box-shadow: 0 0 10px rgba(0,249,249,0.3); }
    
    .main-display {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .temp-circle {
      width: 180px;
      height: 180px;
      border: 2px solid rgba(0,249,249,0.3);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      box-shadow: 0 0 30px rgba(0,0,0,0.5);
    }
    .temp-val { font-size: 64px; font-weight: 200; color: #00f9f9; }
    .temp-unit { font-size: 18px; margin-top: -10px; opacity: 0.6; }

    .stats-row {
      display: flex;
      justify-content: space-around;
      background: rgba(255,255,255,0.05);
      padding: 15px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .stat-item { text-align: center; }
    .label { display: block; font-size: 10px; opacity: 0.5; margin-bottom: 4px; letter-spacing: 1px; }
    .value { font-size: 18px; font-weight: 600; }
  `;
}

customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA MASTER ULTIMATE", preview: true });
