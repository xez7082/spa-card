import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  // Liaison avec l'éditeur
  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  static getStubConfig() {
    return {
      card_title: "Mon Spa",
      background_image: "https://images.unsplash.com/photo-1540331547168-8b63109225b7?q=80&w=1000",
      card_height_v: 80,
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration invalide");
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) return html``;

    return html`
      <ha-card style="height: ${this.config.card_height_v || 80}vh; background-image: url('${this.config.background_image}');">
        <div class="overlay">
          <div class="header">
            <h2>${this.config.card_title || "Spa"}</h2>
          </div>

          <div class="sensors">
            ${this._renderSensor(this.config.entity_water_temp, "Eau")}
            ${this._renderSensor(this.config.entity_ambient_temp, "Air")}
          </div>

          <div class="button-grid">
            ${Array.from({ length: 8 }).map((_, i) => {
              const entityId = this.config[`switch_${i + 1}_entity`];
              if (!entityId) return "";
              return this._renderButton(
                entityId,
                this.config[`switch_${i + 1}_label`] || `B${i + 1}`,
                this.config[`switch_${i + 1}_icon`] || "mdi:toggle-switch"
              );
            })}
          </div>

          ${this.config.camera_entity ? html`
            <div class="camera-container">
               <hui-image
                .hass=${this.hass}
                .cameraImage=${this.config.camera_entity}
                .cameraView=${"live"}
                style="width: ${this.config.camera_width || 300}px; height: ${this.config.camera_height || 200}px;"
              ></hui-image>
            </div>
          ` : ""}
        </div>
      </ha-card>
    `;
  }

  _renderSensor(entityId, label) {
    if (!entityId || !this.hass.states[entityId]) return "";
    const state = this.hass.states[entityId];
    return html`
      <div class="sensor-item">
        <span class="label">${label}</span>
        <span class="value">${state.state}${state.attributes.unit_of_measurement || ""}</span>
      </div>
    `;
  }

  _renderButton(entityId, label, icon) {
    const stateObj = this.hass.states[entityId];
    const isActive = stateObj && stateObj.state === "on";

    return html`
      <div class="btn-item ${isActive ? "active" : ""}" @click=${() => this._toggle(entityId)}>
        <ha-icon icon="${icon}"></ha-icon>
        <span>${label}</span>
      </div>
    `;
  }

  _toggle(entityId) {
    this.hass.callService("homeassistant", "toggle", { entity_id: entityId });
  }

  static get styles() {
    return css`
      ha-card {
        overflow: hidden;
        background-size: cover;
        background-position: center;
        position: relative;
        border-radius: 12px;
        color: white;
      }
      .overlay {
        background: rgba(0, 0, 0, 0.4);
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: 16px;
        box-sizing: border-box;
      }
      .header h2 { margin: 0; font-weight: 300; text-align: center; }
      .sensors { display: flex; justify-content: space-around; margin: 20px 0; }
      .sensor-item { text-align: center; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; min-width: 80px; }
      .label { display: block; font-size: 0.8em; opacity: 0.8; }
      .value { font-size: 1.2em; font-weight: bold; }
      
      .button-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 10px;
        margin-top: auto;
      }
      .btn-item {
        background: rgba(255,255,255,0.2);
        padding: 12px;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        transition: 0.3s;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.9em;
      }
      .btn-item.active {
        background: var(--accent-color, #00f9f9);
        color: black;
      }
      .camera-container {
        margin-top: 15px;
        display: flex;
        justify-content: center;
      }
    `;
  }
}

customElements.define("spa-card", SpaCard);
