import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from "./spa-styles.js";
import "./spa-editor.js"; 

class SpaCard extends LitElement {
  
  static getConfigElement() {
    return document.createElement('spa-card-editor');
  }

  static get properties() {
    return { hass: { type: Object }, config: { type: Object } };
  }

  setConfig(config) {
    if (!config.entity_water_temp) {
      throw new Error("Vous devez définir au moins une entité de température d'eau.");
    }
    this.config = config;
  }

  // Sécurise l'accès à l'état
  _state(entity) {
    if (!this.hass || !entity) return '---';
    return this.hass.states[entity]?.state || '---';
  }

  // --- Message Chimie ---
  _renderChemAdvice() {
    const phValue = this._state(this.config.entity_ph);
    // On vérifie que le pH est un nombre valide
    const ph = parseFloat(phValue);
    
    if (isNaN(ph)) return html``; // N'affiche rien si pas de donnée valide

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
    if (!this.hass) return html``;

    return html`
      <ha-card .header="${this.config.card_title || 'Spa Control'}">
        <div class="card-content">
          ${this.config.entity_ph ? this._renderChemAdvice() : ''}
          
          <div class="main-split-container">
            <div class="left-cam-panel">
              <p>Température eau : ${this._state(this.config.entity_water_temp)}°C</p>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = [sharedStyles, css`
    :host { display: block; }
    .card-content { padding: 15px; }
  `];
}

customElements.define('spa-card', SpaCard);
