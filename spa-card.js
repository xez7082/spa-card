import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from "./spa-styles.js";
import "./spa-editor.js"; // Importe l'éditeur pour Home Assistant

class SpaCard extends LitElement {
  
  // Définit l'éditeur personnalisé pour cette carte
  static getConfigElement() {
    return document.createElement('spa-card-editor');
  }

  static get properties() {
    return { hass: {}, config: {} };
  }

  setConfig(config) {
    if (!config.entity_water_temp) {
      throw new Error("Vous devez définir au moins une entité de température d'eau.");
    }
    this.config = config;
  }

  _state(entity) {
    return this.hass.states[entity]?.state || '---';
  }

  _exists(entity) {
    return entity && this.hass.states[entity] !== undefined;
  }

  // --- Message Chimie ---
  _renderChemAdvice() {
    const ph = parseFloat(this._state(this.config.entity_ph));
    let msg = "Eau équilibrée";
    let color = "#10b981";

    if (ph < 7.0) { msg = "pH bas : Ajouter du pH+"; color = "#f59e0b"; }
    else if (ph > 7.6) { msg = "pH haut : Ajouter du pH-"; color = "#ef4444"; }

    return html`
      <div class="chem-advice-box" style="background: ${color}20; border: 1px solid ${color}40; color: ${color};">
        <ha-icon icon="mdi:information-outline"></ha-icon> ${msg}
      </div>`;
  }

  render() {
    return html`
      <ha-card .header="${this.config.card_title || 'Spa Control'}">
        <div class="card-content">
          ${this._renderChemAdvice()}
          
          <div class="main-split-container">
            <div class="left-cam-panel">
              <p>Température eau : ${this._state(this.config.entity_water_temp)}°C</p>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  // Fusion des styles partagés et spécifiques à la carte
  static styles = [sharedStyles, css`
    :host { display: block; }
    .card-content { padding: 15px; }
  `];
}

customElements.define('spa-card', SpaCard);
