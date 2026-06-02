import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// 1. ÉDITEUR VISUEL
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
          { name: "card_title", label: "Titre", selector: { text: {} } },
          { name: "s1", label: "GÉNÉRAL", selector: { ui: { type: "section" } } },
          { name: "entity_water_temp", label: "Temp. Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } }
        ]}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);

// 2. CARTE PRINCIPALE
class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }
  static getConfigElement() { return document.createElement("spa-card-editor"); }

  _exists(e) { return e && this.hass.states[e]; }
  _state(e) { return this.hass.states[e]?.state; }

  // Méthodes de rendu
  _renderHome() { return html`<div class="p-4">Bienvenue sur votre Spa. Utilisez le menu en bas.</div>`; }
  _renderChem() { return html`<div class="p-4">pH: ${this._state(this.config.entity_ph)}</div>`; }
  _renderSwitches() { return html`<div class="p-4">Contrôle des équipements ici.</div>`; }
  _renderCamera() { return html`<div class="p-4">Flux Caméra: ${this.config.entity_camera}</div>`; }

  render() {
    return html`
      <ha-card .header="${this.config.card_title || 'Spa Control'}">
        <div class="content">
          ${this._tab === 'home' ? this._renderHome() : ''}
          ${this._tab === 'chem' ? this._renderChem() : ''}
          ${this._tab === 'sw' ? this._renderSwitches() : ''}
          ${this._tab === 'cam' ? this._renderCamera() : ''}
        </div>
        <div class="nav">
          <button @click=${() => this._tab = 'home'}>🏠</button>
          <button @click=${() => this._tab = 'chem'}>🧪</button>
          <button @click=${() => this._tab = 'sw'}>⚙️</button>
          <button @click=${() => this._tab = 'cam'}>📷</button>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .content { min-height: 200px; }
      .nav { display: flex; justify-content: space-around; padding: 10px; border-top: 1px solid #ccc; }
      button { cursor: pointer; border: none; background: transparent; font-size: 20px; }
      .p-4 { padding: 16px; }
    `;
  }
}
customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Control", preview: true });
