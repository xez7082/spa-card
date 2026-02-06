const LitElement = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html || window.html;
const css = LitElement.prototype.css || window.css;

class LuminaSpaCard extends LitElement {

  static properties = {
    hass: {},
    config: {}
  };

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Vous devez définir au moins l'entité de température pour Lumina SPA !");
    }
    this.config = config;
  }

  static styles = css`
    .spa-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: var(--ha-card-font-family, sans-serif);
    }
    .temp {
      font-size: 2em;
      margin: 8px 0;
    }
    .status {
      margin: 4px 0;
      font-weight: bold;
    }
    .controls {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .button {
      padding: 6px 12px;
      background-color: var(--primary-color, #03a9f4);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      min-width: 120px;
    }
    .button:disabled {
      background-color: #aaa;
      cursor: not-allowed;
    }
  `;

  render() {
    if (!this.hass || !this.config) return html``;

    const tempEntity = this.hass.states[this.config.entity];
    const heating = this.hass.states[this.config.heating_entity];
    const jets = this.hass.states[this.config.jets_entity];
    const bubbles = this.hass.states[this.config.bubbles_entity];

    const temperature = tempEntity ? tempEntity.state : "N/A";
    const isHeating = heating ? heating.state === "on" : false;
    const jetsOn = jets ? jets.state === "on" : false;
    const bubblesOn = bubbles ? bubbles.state === "on" : false;

    return html`
      <ha-card header="${this.config.card_title || "SPA"}">
        <div class="spa-card">
          <div class="temp">${temperature}°C</div>
          <div class="status">
            Chauffage: ${isHeating ? "ON" : "OFF"} | 
            Jets: ${jetsOn ? "ON" : "OFF"} | 
            Bulles: ${bubblesOn ? "ON" : "OFF"}
          </div>
          <div class="controls">
            ${heating ? html`
              <button class="button" @click="${() => this.toggleSwitch(this.config.heating_entity)}">
                ${isHeating ? "Éteindre Chauffage" : "Allumer Chauffage"}
              </button>
            ` : ""}
            ${jets ? html`
              <button class="button" @click="${() => this.toggleSwitch(this.config.jets_entity)}">
                ${jetsOn ? "Éteindre Jets" : "Allumer Jets"}
              </button>
            ` : ""}
            ${bubbles ? html`
              <button class="button" @click="${() => this.toggleSwitch(this.config.bubbles_entity)}">
                ${bubblesOn ? "Éteindre Bulles" : "Allumer Bulles"}
              </button>
            ` : ""}
          </div>
        </div>
      </ha-card>
    `;
  }

  toggleSwitch(entityId) {
    this.hass.callService("switch", "toggle", { entity_id: entityId });
  }
}

customElements.define("lumina-spa-card", LuminaSpaCard);
