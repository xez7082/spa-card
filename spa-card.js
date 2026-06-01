import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from "./spa-styles.js";
import "./spa-editor.js";

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement('spa-card-editor'); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }
  
  _state(e) { return this.hass.states[e]?.state || '---'; }
  _toggle(e) { this.hass.callService("homeassistant", "toggle", { entity_id: e }); }

  render() {
    return html`
      <ha-card .header="${this.config.card_title || 'Spa'}">
        <div class="card-content">
          <div style="font-size:2em; text-align:center;">${this._state(this.config.entity_water_temp)}°C</div>
          
          <button class="prog-action-btn ${this._state(this.config.entity_filter) === 'on' ? 'pab-on' : ''}" 
                  @click=${() => this._toggle(this.config.entity_filter)}>
            Filtration
          </button>
        </div>
      </ha-card>`;
  }
  static styles = [sharedStyles, css`:host { display: block; }`];
}
customElements.define('spa-card', SpaCard);
