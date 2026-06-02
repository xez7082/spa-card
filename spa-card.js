import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
// 1. ÉDITEUR VISUEL (Avec structure accordéon)
// ═══════════════════════════════════════════════════════════════════
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  
  setConfig(config) { this._config = { ...config }; }

  _val(ev) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: ev.detail.value },
      bubbles: true, composed: true
    }));
  }

  render() {
    if (!this.hass) return html``;
    return html`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            { name: "card_title", label: "Titre", selector: { text: {} } },
            { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
            { name: "entity_target_temp", label: "Contrôle Temp", selector: { entity: { domain: "climate" } } }
          ]}
          @value-changed=${this._val}
        ></ha-form>
      </div>
    `;
  }
}
if (!customElements.get("spa-card-editor")) customElements.define("spa-card-editor", SpaCardEditor);

// ═══════════════════════════════════════════════════════════════════
// 2. CARTE PRINCIPALE (Logique de rendu)
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }

  setConfig(config) { this.config = config; }
  static getConfigElement() { return document.createElement("spa-card-editor"); }

  _getState(entity) { return this.hass.states[entity]?.state || 'N/A'; }

  render() {
    if (!this.hass || !this.config) return html``;
    
    return html`
      <ha-card .header="${this.config.card_title}">
        <div class="content">
          <div class="temp-display">Eau: ${this._getState(this.config.entity_water_temp)}°C</div>
        </div>
      </ha-card>
    `;
  }

  static get styles() { return css` .content { padding: 16px; } `; }
}
if (!customElements.get("spa-card")) customElements.define("spa-card", SpaCard);

// 3. ENREGISTREMENT
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Control", preview: true });
