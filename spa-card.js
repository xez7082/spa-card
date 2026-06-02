import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
// 1. ÉDITEUR VISUEL (ha-form avec sections)
// ═══════════════════════════════════════════════════════════════════
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }

  _changed(ev) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true, composed: true
    }));
  }

  render() {
    if (!this.hass) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${[
          { name: "card_title", label: "Titre de la carte", selector: { text: {} } },
          { name: "sec1", label: "GÉNÉRAL", selector: { ui: { type: "section" } } },
          { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_target_temp", label: "Climate Spa", selector: { entity: { domain: "climate" } } },
          { name: "sec2", label: "CHIMIE", selector: { ui: { type: "section" } } },
          { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } }
        ]}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }
}
if (!customElements.get("spa-card-editor")) customElements.define("spa-card-editor", SpaCardEditor);

// ═══════════════════════════════════════════════════════════════════
// 2. CARTE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }
  static getConfigElement() { return document.createElement("spa-card-editor"); }

  _exists(e) { return e && this.hass.states[e]; }
  _state(e) { return this.hass.states[e]?.state; }

  render() {
    if (!this.hass || !this.config) return html``;
    
    return html`
      <ha-card .header="${this.config.card_title || 'Spa Control'}">
        <div class="card-content">
          <div class="main-info">
            <p><strong>Eau:</strong> ${this._state(this.config.entity_water_temp) || 'N/A'}°C</p>
            <p><strong>pH:</strong> ${this._state(this.config.entity_ph) || 'N/A'}</p>
          </div>
        </div>
        <div class="nav-bar">
          <button @click=${() => this._tab = 'home'}>Accueil</button>
          <button @click=${() => this._tab = 'chem'}>Chimie</button>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .card-content { padding: 16px; }
      .nav-bar { display: flex; justify-content: space-around; padding: 10px; border-top: 1px solid #ccc; }
      button { cursor: pointer; padding: 8px 16px; border-radius: 4px; border: none; background: #03a9f4; color: white; }
    `;
  }
}
if (!customElements.get("spa-card")) customElements.define("spa-card", SpaCard);

// 3. ENREGISTREMENT
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Control Card", preview: true });
