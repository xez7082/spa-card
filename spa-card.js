// Utilisation d'un import plus stable pour Home Assistant
const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class SpaCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration invalide");
    this.config = config;
  }

  _getState(entityId) {
    return this.hass.states[entityId] ? this.hass.states[entityId].state : '??';
  }

  render() {
    if (!this.hass || !this.config) return html``;

    return html`
      <ha-card>
        <div class="main-container" style="background-image: url('${this.config.background_image}');">
          <div class="overlay">
            <div class="header">
              <h1>${this.config.card_title || 'SPA CONTROL'}</h1>
            </div>

            <div class="temp-display">
              <div class="circle">
                <span class="val">${this._getState(this.config.entity_water_temp)}</span>
                <span class="unit">°C</span>
              </div>
            </div>

            <div class="grid-stats">
              <div class="stat">
                <div class="label">PH</div>
                <div class="value">${this._getState(this.config.entity_ph)}</div>
              </div>
              <div class="stat">
                <div class="label">ORP</div>
                <div class="value">${this._getState(this.config.entity_orp)}</div>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card { overflow: hidden; border-radius: 20px; }
      .main-container { height: 400px; background-size: cover; background-position: center; }
      .overlay { 
        height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
        display: flex; flex-direction: column; justify-content: space-between; padding: 20px;
      }
      .header h1 { color: #00f9f9; font-weight: 300; letter-spacing: 2px; text-align: center; margin: 0; }
      .temp-display { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
      .circle { 
        width: 150px; height: 150px; border-radius: 50%; border: 2px solid #00f9f9;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.5); box-shadow: 0 0 20px rgba(0,249,249,0.3);
      }
      .val { font-size: 50px; color: #00f9f9; }
      .unit { font-size: 15px; color: white; opacity: 0.7; }
      .grid-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .stat { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 10px; text-align: center; color: white; }
      .label { font-size: 10px; opacity: 0.6; }
      .value { font-size: 18px; font-weight: bold; color: #00f9f9; }
    `;
  }
}

// Enregistrement de la carte
if (!customElements.get("spa-card")) {
  customElements.define("spa-card", SpaCard);
  console.info("%c SPA-CARD %c Version 2.0 ", "color: white; background: #00f9f9; font-weight: bold;", "color: #00f9f9; background: white;");
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "SPA Master Ultimate",
  preview: true
});
