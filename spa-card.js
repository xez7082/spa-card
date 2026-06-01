import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from "./spa-styles.js";

class SpaCard extends LitElement {
  static get properties() {
    return { hass: { type: Object }, config: { type: Object } };
  }

  // Cette méthode appelle votre éditeur spa-editor.js
  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  setConfig(config) {
    if (!config.entity_water_temp) {
      throw new Error("Vous devez définir entity_water_temp");
    }
    this.config = config;
  }

  _state(e) {
    return this.hass?.states?.[e]?.state ?? "---";
  }

  _toggle(e) {
    if (e) {
      this.hass.callService("homeassistant", "toggle", { entity_id: e });
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;

    return html`
      <ha-card .header="${this.config.card_title || "Spa"}">
        <div class="card-content">
          <div class="temperature">${this._state(this.config.entity_water_temp)}°C</div>

          ${this.config.entity_camera ? html`
            <div class="cam-box">
               <hui-image 
                 .hass=${this.hass} 
                 .cameraImage=${this.config.entity_camera} 
                 .cameraView="live">
               </hui-image>
            </div>
          ` : ""}

          ${this.config.switch_1 ? html`
            <button class="prog-action-btn ${this._state(this.config.switch_1)}" 
                    @click=${() => this._toggle(this.config.switch_1)}>
              ${this.config.name_switch_1 || "Spa"}
            </button>
          ` : ""}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host { display: block; }
        .card-content { padding: 16px; }
        .temperature { font-size: 2em; font-weight: 700; text-align: center; color: var(--primary-text-color); }
        .cam-box { margin: 10px 0; border-radius: 12px; overflow: hidden; }
        .prog-action-btn { 
            width: 100%; padding: 12px; margin-top: 8px; cursor: pointer; 
            background: var(--primary-color); color: white; border: none; border-radius: 8px;
        }
      `
    ];
  }
}

// Enregistrement de la carte
if (!customElements.get("spa-card")) {
  customElements.define("spa-card", SpaCard);
}

// Ajout au sélecteur de cartes HA
window.customCards = window.customCards || [];
window.customCards.push({ 
  type: "spa-card", 
  name: "Spa Control Card", 
  preview: true 
});
