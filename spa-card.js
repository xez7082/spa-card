import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR ---
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  
  setConfig(config) { this._config = config; }

  // Cette fonction est CRUCIALE pour que l'éditeur enregistre les sensors
  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const config = { ...this._config, ...ev.detail.value };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true, composed: true
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;

    // Schéma qui permet de sélectionner les entités Tuya
    const schema = [
      { name: "card_title", label: "Nom du Spa", selector: { text: {} } },
      { name: "background_image", label: "URL Image de fond", selector: { text: {} } },
      { name: "entity_water_temp", label: "Sonde Température Eau", selector: { entity: { domain: "sensor" } } },
      { name: "entity_ph", label: "Sonde pH", selector: { entity: { domain: "sensor" } } },
      { name: "entity_orp", label: "Sonde ORP", selector: { entity: { domain: "sensor" } } },
      { name: "entity_tds", label: "Sonde TDS", selector: { entity: { domain: "sensor" } } },
      { name: "entity_ec", label: "Sonde EC", selector: { entity: { domain: "sensor" } } }
    ];

    return html`
      <div style="padding: 20px;">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${schema}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- CARTE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }

  setConfig(config) { this.config = config; }

  _getState(entityId) {
    if (!this.hass || !entityId || !this.hass.states[entityId]) return { state: '--', unit: '' };
    const s = this.hass.states[entityId];
    return { state: s.state, unit: s.attributes.unit_of_measurement || '' };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="background-image: url('${c.background_image}');">
        <div class="overlay">
          <div class="header">
            <h1>${c.card_title || 'SPA INTEX'}</h1>
          </div>

          <div class="main">
            <div class="circle">
              <span class="val">${this._getState(c.entity_water_temp).state}</span>
              <span class="unit">°C</span>
            </div>
          </div>

          <div class="grid">
            <div class="item">
              <span class="lbl">pH</span>
              <span class="v">${this._getState(c.entity_ph).state}</span>
            </div>
            <div class="item">
              <span class="lbl">ORP</span>
              <span class="v">${this._getState(c.entity_orp).state} <small>mV</small></span>
            </div>
            <div class="item">
              <span class="lbl">TDS</span>
              <span class="v">${this._getState(c.entity_tds).state}</span>
            </div>
            <div class="item">
              <span class="lbl">EC</span>
              <span class="v">${this._getState(c.entity_ec).state}</span>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { height: 480px; background-size: cover; border-radius: 20px; overflow: hidden; position: relative; color: white; }
    .overlay { height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); display: flex; flex-direction: column; padding: 20px; }
    .header h1 { text-align: center; color: #00f9f9; font-weight: 200; letter-spacing: 3px; }
    .main { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
    .circle { width: 150px; height: 150px; border-radius: 50%; border: 2px solid #00f9f9; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); }
    .val { font-size: 50px; color: #00f9f9; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .item { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 15px; text-align: center; }
    .lbl { display: block; font-size: 10px; opacity: 0.6; }
    .v { font-size: 20px; font-weight: bold; color: #00f9f9; }
  `;
}
customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master", preview: true });
