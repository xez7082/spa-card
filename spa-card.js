import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }
  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const config = { ...this._config, ...ev.detail.value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  render() {
    if (!this.hass || !this._config) return html``;
    const schema = [
      { name: "card_title", label: "Titre", selector: { text: {} } },
      { name: "entity_water_temp", label: "Sensor Temp Eau", selector: { entity: { domain: "sensor" } } },
      { name: "entity_ph", label: "Sensor pH", selector: { entity: { domain: "sensor" } } },
      { name: "entity_orp", label: "Sensor ORP", selector: { entity: { domain: "sensor" } } },
      { name: "entity_tds", label: "Sensor TDS", selector: { entity: { domain: "sensor" } } },
      { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
      { name: "switch_1", label: "Interrupteur 1", selector: { entity: {} } }
    ];
    return html`<div style="padding:20px;"><ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form></div>`;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);

class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {}, activeTab: { type: String } }; }
  constructor() { super(); this.activeTab = 'spa'; }
  setConfig(config) { this.config = config; }

  // MÉTHODE DE RÉCUPÉRATION ULTRA-SÉCURISÉE
  getValue(entityId) {
    if (!this.hass || !entityId) return "Config?"; 
    if (!this.hass.states[entityId]) return "Inconnu";
    return this.hass.states[entityId].state;
  }

  render() {
    if (!this.hass || !this.config) return html`Chargement...`;
    const c = this.config;

    return html`
      <ha-card>
        <div class="header">
          <h1>${c.card_title || 'MON SPA'}</h1>
        </div>

        <div class="content">
          ${this.activeTab === 'spa' ? html`
            <div class="main-val">
              <div class="circle">
                <div class="n">${this.getValue(c.entity_water_temp)}</div>
                <div class="u">°C EAU</div>
              </div>
            </div>
          ` : ''}

          ${this.activeTab === 'chem' ? html`
            <div class="chem-list">
              <div class="item">PH: <b>${this.getValue(c.entity_ph)}</b></div>
              <div class="item">ORP: <b>${this.getValue(c.entity_orp)}</b> mV</div>
              <div class="item">TDS: <b>${this.getValue(c.entity_tds)}</b></div>
            </div>
          ` : ''}
        </div>

        <div class="tabs">
          <div @click=${() => this.activeTab = 'spa'}>SPA</div>
          <div @click=${() => this.activeTab = 'chem'}>CHIMIE</div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { background: #1c1c1c; color: white; padding: 20px; border-radius: 15px; min-height: 300px; display: flex; flex-direction: column; }
    .header h1 { text-align: center; color: #00f9f9; margin: 0 0 20px 0; font-weight: 300; }
    .content { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
    .circle { width: 120px; height: 120px; border: 2px solid #00f9f9; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .n { font-size: 35px; color: #00f9f9; }
    .u { font-size: 10px; }
    .chem-list { width: 100%; }
    .item { background: rgba(255,255,255,0.05); margin: 5px 0; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; }
    .tabs { display: flex; justify-content: space-around; margin-top: 20px; border-top: 1px solid #333; padding-top: 10px; }
    .tabs div { cursor: pointer; color: #00f9f9; font-weight: bold; }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master Test", preview: true });
