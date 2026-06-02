import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// 1. ÉDITEUR VISUEL COMPLET
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
    if (!this.hass) return html`<p>Veuillez patienter...</p>`;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${[
          { name: "card_title", label: "Titre de la carte", selector: { text: {} } },
          { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_target_temp", label: "Contrôle Temp (Climate)", selector: { entity: { domain: "climate" } } },
          { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_salt", label: "Capteur Salinité", selector: { entity: { domain: "sensor" } } },
          { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
          { name: "switch_1", label: "Switch Spa", selector: { entity: { domain: "switch" } } }
        ]}
        @value-changed=${this._val}
      ></ha-form>
    `;
  }
}
if (!customElements.get("spa-card-editor")) customElements.define("spa-card-editor", SpaCardEditor);

// 2. CARTE PRINCIPALE
class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }
  static getConfigElement() { return document.createElement("spa-card-editor"); }

  render() {
    return html`
      <ha-card .header="${this.config.card_title || 'Spa'}">
        <div style="padding:16px">
          <p>La carte est connectée. Utilisez l'éditeur visuel (trois points > Modifier) pour configurer les entités.</p>
        </div>
      </ha-card>`;
  }
}
if (!customElements.get("spa-card")) customElements.define("spa-card", SpaCard);

// 3. ENREGISTREMENT
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Control Card", preview: true });
