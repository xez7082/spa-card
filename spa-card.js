import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { sharedStyles } from "./spa-styles.js";
import "./spa-editor.js";

class SpaCard extends LitElement {

  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }

  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  static getStubConfig() {
    return {
      card_title: "Spa",
      entity_water_temp: "",
      entity_filter: ""
    };
  }

  setConfig(config) {
    if (!config.entity_water_temp) {
      throw new Error("Vous devez définir entity_water_temp");
    }

    this.config = config;
  }

  _state(entity) {
    return this.hass?.states?.[entity]?.state ?? "---";
  }

  _toggle(entity) {
    if (!entity || !this.hass) return;

    this.hass.callService("homeassistant", "toggle", {
      entity_id: entity
    });
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const temp = this._state(this.config.entity_water_temp);
    const filterState = this._state(this.config.entity_filter);

    return html`
      <ha-card header="${this.config.card_title || "Spa"}">
        <div class="card-content">

          <div class="temperature">
            ${temp}°C
          </div>

          ${this.config.entity_filter
            ? html`
                <button
                  class="prog-action-btn ${filterState === "on"
                    ? "pab-on"
                    : ""}"
                  @click=${() =>
                    this._toggle(this.config.entity_filter)}
                >
                  Filtration
                </button>
              `
            : ""}

        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 2;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }

        .card-content {
          padding: 16px;
        }

        .temperature {
          font-size: 2em;
          font-weight: 700;
          text-align: center;
          margin-bottom: 16px;
        }

        .prog-action-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
        }

        .pab-on {
          font-weight: bold;
        }
      `
    ];
  }
}

if (!customElements.get("spa-card")) {
  customElements.define("spa-card", SpaCard);
}

window.customCards = window.customCards || [];

if (!window.customCards.find(c => c.type === "spa-card")) {
  window.customCards.push({
    type: "spa-card",
    name: "Spa Control Card",
    description: "Carte de contrôle pour spa gonflable",
    preview: true
  });
}

console.info(
  "%c SPA CARD %c v1.0.0 ",
  "background:#2196f3;color:white;font-weight:bold",
  "background:#333;color:white"
);
