import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { sharedStyles } from "./spa-styles.js"; 
import "./spa-editor.js";

class SpaCard extends LitElement {
  // Cette méthode est cruciale pour que Home Assistant sache que cette carte peut être configurée
  static getConfigElement() { return document.createElement('spa-card-editor'); }
  
  static get properties() { return { hass: {}, config: {} }; }
  
  setConfig(config) { 
    if (!config.entity_water_temp) throw new Error("Vous devez définir l'entité de température");
    this.config = config; 
  }
  
  _state(e) { return this.hass.states[e]?.state || '---'; }
  
  _toggle(e) { 
    if (!e) return;
    this.hass.callService("homeassistant", "toggle", { entity_id: e }); 
  }

  render() {
    if (!this.config || !this.hass) return html``;

    return html`
      <ha-card .header="${this.config.card_title || 'Spa'}">
        <div class="card-content">
          <div style="font-size:2em; text-align:center;">
            ${this._state(this.config.entity_water_temp)}°C
          </div>
          
          <button class="prog-action-btn ${this._state(this.config.entity_filter) === 'on' ? 'pab-on' : ''}" 
                  @click=${() => this._toggle(this.config.entity_filter)}>
            Filtration
          </button>
        </div>
      </ha-card>`;
  }

  static get styles() {
    return [
      sharedStyles, 
      css`
        :host { display: block; }
        .card-content { padding: 16px; }
        .prog-action-btn { 
          width: 100%; 
          padding: 10px; 
          margin-top: 10px;
          cursor: pointer;
        }
      `
    ];
  }
}

// IMPORTANT : Cette ligne permet à Home Assistant d'enregistrer la carte
customElements.define('spa-card', SpaCard);

// Ajout pour forcer l'affichage dans le sélecteur de cartes
window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "Spa Control Card",
  description: "Carte de contrôle pour votre Spa LayZSpa"
});
