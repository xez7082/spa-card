import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class LuminaSpaCard extends LitElement {
  
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  setConfig(config) {
    if (!config.entity_water_temp) {
      throw new Error("Vous devez définir l'entité 'entity_water_temp' !");
    }
    this.config = {
      card_title: 'MON SPA',
      background_image: '/local/preview.png',
      ...config
    };
  }

  // Utilitaire pour récupérer l'état réel de HA
  _getDisplayState(entityId) {
    if (!this.hass || !this.hass.states[entityId]) return { state: '--', unit: '' };
    const stateObj = this.hass.states[entityId];
    return {
      state: stateObj.state,
      unit: stateObj.attributes.unit_of_measurement || ''
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const water = this._getDisplayState(this.config.entity_water_temp);
    const ph = this._getDisplayState(this.config.entity_ph);
    const orp = this._getDisplayState(this.config.entity_orp);
    const power = this._getDisplayState(this.config.entity_power);

    return html`
      <ha-card style="background-image: url('${this.config.background_image}')">
        <div class="overlay">
          <div class="header">${this.config.card_title}</div>
          
          <div class="main-container">
            <div class="data-column">
              
              <div class="glass-block">
                <div class="block-title">TEMPÉRATURE</div>
                <div class="row">
                  <div class="item">
                    <ha-icon icon="mdi:thermometer"></ha-icon>
                    <div class="info"><span class="val">${water.state}${water.unit}</span></div>
                  </div>
                </div>
              </div>

              <div class="glass-block">
                <div class="block-title">CHIMIE SPA</div>
                <div class="row">
                  <div class="item">
                    <ha-icon icon="mdi:ph"></ha-icon>
                    <div class="info"><span class="val">${ph.state}</span></div>
                  </div>
                  <div class="item">
                    <ha-icon icon="mdi:test-tube"></ha-icon>
                    <div class="info"><span class="val">${orp.state} ${orp.unit || 'mV'}</span></div>
                  </div>
                </div>
              </div>

              <div class="glass-block">
                <div class="block-title">ÉNERGIE</div>
                <div class="row">
                  <div class="item">
                    <ha-icon icon="mdi:lightning-bolt"></ha-icon>
                    <div class="info"><span class="val">${power.state}${power.unit}</span></div>
                  </div>
                </div>
              </div>

            </div>
            
            <div class="spa-column">
              </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 24px;
        color: white;
        overflow: hidden;
        position: relative;
        min-height: 300px;
        border: none;
        display: block;
      }
      .overlay {
        background: rgba(0, 0, 0, 0.3); /* Opacité ajustée pour mieux voir le fond */
        padding: 20px;
        min-height: 300px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }
      .header {
        font-weight: 800;
        font-size: 1.2em;
        margin-bottom: 20px;
        letter-spacing: 2px;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
      }
      .main-container {
        display: flex;
        flex: 1;
      }
      .data-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .spa-column { 
        flex: 1; 
      }
      .glass-block {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        width: fit-content;
        min-width: 140px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      .block-title {
        font-size: 10px;
        font-weight: 900;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .row { 
        display: flex; 
        align-items: center; 
        gap: 20px; 
      }
      .item { 
        display: flex; 
        align-items: center; 
        gap: 8px; 
      }
      .val { 
        font-size: 16px; 
        font-weight: bold; 
        font-family: 'Roboto', sans-serif;
      }
      ha-icon { 
        --mdc-icon-size: 22px; 
        color: #00d4ff; 
      }
    `;
  }
}

customElements.define("lumina-spa-card", LuminaSpaCard);
