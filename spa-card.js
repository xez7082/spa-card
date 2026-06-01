import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from "./spa-styles.js";
import "./spa-editor.js";

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement('spa-card-editor'); }
  static get properties() { return { hass: {}, config: {} }; }
  
  setConfig(config) { this.config = config; }

  _state(entity) { return this.hass.states[entity]?.state || '---'; }

  // --- Rendu de la Jauge Chimie ---
  _renderChemAdvice() {
    const ph = parseFloat(this._state(this.config.entity_ph));
    if (isNaN(ph)) return html``;
    
    let msg = "Eau équilibrée", color = "#10b981";
    if (ph < 7.0) { msg = "pH bas : Ajouter du pH+"; color = "#f59e0b"; }
    else if (ph > 7.6) { msg = "pH haut : Ajouter du pH-"; color = "#ef4444"; }

    return html`
      <div class="chem-advice-box" style="background:${color}20; border:1px solid ${color}40; color:${color};">
        <ha-icon icon="mdi:information-outline"></ha-icon> ${msg}
      </div>`;
  }

  // --- Rendu de votre vue Spa (LayZSpa) ---
  render() {
    if (!this.hass) return html``;
    
    return html`
      <ha-card .header="${this.config.card_title || 'Spa Control'}">
        <div class="card-content">
          ${this._renderChemAdvice()}
          
          <div class="main-split-container">
            <div class="left-panel">
              <p>Eau : ${this._state(this.config.entity_water_temp)}°C</p>
              </div>
            <div class="right-panel">
              </div>
          </div>
          
          <div class="nav">
            <ha-icon icon="mdi:home" @click=${() => console.log('Home')}></ha-icon>
            <ha-icon icon="mdi:cog" @click=${() => console.log('Settings')}></ha-icon>
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = [sharedStyles, css`:host { display: block; }`];
}
customElements.define('spa-card', SpaCard);
