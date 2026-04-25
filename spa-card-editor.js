import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- 1. L'ÉDITEUR DE CONFIGURATION ---
class SpaCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object }
    };
  }

  setConfig(config) {
    this._config = config;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) return;
    
    const event = new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const schema = [
      { name: "card_title", label: "Nom du Spa", selector: { text: {} } },
      { name: "background_image", label: "Lien Image de fond", selector: { text: {} } },
      {
        name: "",
        type: "grid",
        column_min_width: "200px",
        schema: [
          { name: "entity_water_temp", label: "Sonde Température", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ph", label: "Sonde pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "Sonde ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_tds", label: "Sonde TDS", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ec", label: "Sonde EC", selector: { entity: { domain: "sensor" } } },
        ],
      },
    ];

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

customElements.define("spa-card-editor", SpaCardEditor);

// --- 2. LA CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration invalide");
    this.config = config;
  }

  _getState(entityId) {
    if (!this.hass || !entityId || !this.hass.states[entityId]) {
      return { state: '?', unit: '' };
    }
    const stateObj = this.hass.states[entityId];
    return {
      state: stateObj.state,
      unit: stateObj.attributes.unit_of_measurement || ''
    };
  }

  // Couleurs adaptées au Brome et à ton Intex 4 places
  _getChemColor(type, value) {
    const v = parseFloat(value);
    if (isNaN(v)) return '#00f9f9';
    switch (type) {
      case 'ph': return (v >= 7.2 && v <= 7.6) ? '#00ff88' : '#ff4d4d'; // Vert si OK
      case 'orp': return (v >= 650) ? '#00ff88' : '#ffcc00'; // Jaune si bas
      case 'tds': return (v < 2000) ? '#00ff88' : '#ff4d4d'; // Rouge si saturation
      default: return '#00f9f9';
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const waterTemp = this._getState(this.config.entity_water_temp);
    const ph = this._getState(this.config.entity_ph);
    const orp = this._getState(this.config.entity_orp);
    const tds = this._getState(this.config.entity_tds);
    const ec = this._getState(this.config.entity_ec);

    return html`
      <ha-card style="background-image: url('${this.config.background_image}');">
        <div class="glass-overlay">
          
          <div class="header">
            <h1>${this.config.card_title || 'SPA INTEX'}</h1>
            <div class="badge">SYSTÈME TUYA CONNECTÉ</div>
          </div>

          <div class="main-display">
            <div class="temp-circle">
              <span class="val">${waterTemp.state}</span>
              <span class="unit">°C</span>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <span class="label">pH</span>
              <span class="value" style="color: ${this._getChemColor('ph', ph.state)}">${ph.state}</span>
            </div>
            <div class="stat-box">
              <span class="label">ORP</span>
              <span class="value" style="color: ${this._getChemColor('orp', orp.state)}">${orp.state} <small>mV</small></span>
            </div>
            <div class="stat-box">
              <span class="label">TDS</span>
              <span class="value" style="color: ${this._getChemColor('tds', tds.state)}">${tds.state}</span>
            </div>
            <div class="stat-box">
              <span class="label">CONDUCTIVITÉ</span>
              <span class="value">${ec.state} <small>µS</small></span>
            </div>
          </div>

          <div class="ideal-targets">
            <span>CIBLES BROME: <b>pH 7.4</b> | <b>ORP 700mV</b> | <b>TDS < 2000</b></span>
          </div>

        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      height: 500px;
      background-size: cover;
      background-position: center;
      border-radius: 24px;
      position: relative;
      overflow: hidden;
      color: white;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .glass-overlay {
      height: 100%;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%);
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px;
      box-sizing: border-box;
    }
    .header { text-align: center; }
    h1 { margin: 0; font-weight: 300; letter-spacing: 4px; font-size: 20px; color: #00f9f9; }
    .badge { font-size: 8px; letter-spacing: 1px; opacity: 0.6; margin-top: 5px; }
    
    .main-display { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
    .temp-circle {
      width: 170px; height: 170px; border-radius: 50%;
      border: 1px solid rgba(0, 249, 249, 0.4);
      background: rgba(0, 0, 0, 0.3);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      box-shadow: 0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,249,249,0.1);
    }
    .temp-circle .val { font-size: 60px; font-weight: 100; color: #00f9f9; }
    .temp-circle .unit { font-size: 14px; margin-top: -10px; opacity: 0.5; }

    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .stat-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px; padding: 12px; text-align: center;
    }
    .label { display: block; font-size: 9px; opacity: 0.5; letter-spacing: 1px; margin-bottom: 4px; }
    .value { font-size: 18px; font-weight: 600; }
    small { font-size: 10px; opacity: 0.7; }

    .ideal-targets {
      text-align: center; font-size: 10px; color: #00ff88;
      background: rgba(0, 255, 136, 0.05);
      padding: 8px; border-radius: 10px; border: 1px dashed rgba(0, 255, 136, 0.2);
    }
  `;
}

customElements.define("spa-card", SpaCard);

// Ajout pour HACS
window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "Spa Master Ultimate",
  description: "Carte premium pour Spa Intex avec moniteur Tuya 7-en-1",
  preview: true
});
