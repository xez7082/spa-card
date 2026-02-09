// On utilise une version spécifique de Lit pour éviter les conflits
import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR (Regroupé ici pour éviter le 404) ---
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
    return html`
      <div style="padding: 20px;">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[{ name: "card_title", label: "Titre", selector: { text: {} } }, { name: "background_image", label: "URL Image", selector: { text: {} } }]}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  
  setConfig(config) {
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) return html``;
    return html`
      <ha-card style="background-image: url('${this.config.background_image}'); background-size: cover; padding: 16px; min-height: 150px; position: relative;">
        <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 10px; color: #00f9f9; text-align: center;">
          <h2 style="margin: 0; font-weight: 300; letter-spacing: 2px;">${this.config.card_title || 'SPA CONTROL'}</h2>
          <p style="color: white;">Interface Connectée</p>
        </div>
      </ha-card>
    `;
  }
}
customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "SPA MASTER ULTIMATE",
  preview: true
});
