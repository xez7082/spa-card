import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════
// 1. ÉDITEUR (Ne contient que le formulaire)
// ═══════════════════════════════════════════════
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }

  render() {
    if (!this.hass) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${[
          { name: "card_title", label: "Titre", selector: { text: {} } },
          { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } },
          { name: "switch_1", label: "Switch 1", selector: { entity: { domain: "switch" } } }
        ]}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }
  _changed(ev) {
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: ev.detail.value }, bubbles: true, composed: true }));
  }
}
if (!customElements.get("spa-card-editor")) customElements.define("spa-card-editor", SpaCardEditor);

// ═══════════════════════════════════════════════
// 2. CARTE PRINCIPALE (Contient toute la logique de rendu)
// ═══════════════════════════════════════════════
class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  
  setConfig(config) { this.config = config; }
  static getConfigElement() { return document.createElement("spa-card-editor"); }

  _exists(e) { return e && this.hass.states[e]; }
  _state(e) { return this.hass.states[e]?.state; }

  // --- Vos méthodes de rendu (déplacées ici) ---
  _renderChem() {
     // Votre logique _renderChem ici...
     return html`<div>Contenu Chimie</div>`;
  }

  _renderSwitches() {
     // Votre logique _renderSwitches ici...
     return html`<div>Contenu Switches</div>`;
  }

  render() {
    if (!this.hass || !this.config) return html``;
    return html`
      <ha-card .header="${this.config.card_title || 'Spa'}">
        <div class="content">
           ${this._renderChem()}
           ${this._renderSwitches()}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .cg-row { margin-bottom: 10px; }
      .sw-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      /* Ajoutez ici vos styles CSS */
    `;
  }
}
if (!customElements.get("spa-card")) customElements.define("spa-card", SpaCard);

// 3. ENREGISTREMENT
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Control Card", preview: true });
