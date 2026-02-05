import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class LuminaSpaCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }

  render() {
    const hass = this.hass;
    const config = this.config;

    const getStat = (entity) => hass.states[entity] ? hass.states[entity].state : 'N/A';
    const getUnit = (entity) => hass.states[entity] ? hass.states[entity].attributes.unit_of_measurement || '' : '';

    return html`
      <ha-card>
        <div class="main-container">
          <div class="data-column">
            
            <div class="glass-block">
              <div class="block-title">TEMPÉRATURE</div>
              <div class="row">
                <div class="item">
                   <ha-icon icon="mdi:thermometer"></ha-icon>
                   <div><span class="label">Eau:</span> <span class="val">${getStat(config.entity_water_temp)}${getUnit(config.entity_water_temp)}</span></div>
                </div>
                <div class="item">
                   <ha-icon icon="mdi:cloud-outline"></ha-icon>
                   <div><span class="label">Air:</span> <span class="val">${getStat(config.entity_air_temp)}${getUnit(config.entity_air_temp)}</span></div>
                </div>
              </div>
            </div>

            <div class="glass-block">
              <div class="block-title">CHIMIE SPA</div>
              <div class="row">
                <div class="item">
                   <ha-icon icon="mdi:ph"></ha-icon>
                   <div><span class="label">pH:</span> <span class="val">${getStat(config.entity_ph)}</span></div>
                </div>
                <div class="item">
                   <ha-icon icon="mdi:flash"></ha-icon>
                   <div><span class="label">ORP:</span> <span class="val">${getStat(config.entity_orp)} mV</span></div>
                </div>
              </div>
            </div>

            <div class="glass-block energy">
              <div class="block-title">ÉNERGIE SPA</div>
              <div class="row">
                <div class="item">
                   <ha-icon icon="mdi:lightning-bolt"></ha-icon>
                   <div><span class="label">Puissance:</span> <span class="val">${getStat(config.entity_power)} W</span></div>
                </div>
                <div class="item">
                   <ha-icon icon="mdi:current-ac"></ha-icon>
                   <div><span class="label">Intensité:</span> <span class="val">${getStat(config.entity_amps)} A</span></div>
                </div>
              </div>
            </div>

          </div>

          <div class="spa-column">
            <div class="spa-image-container">
               <img src="${config.spa_image || '/local/community/lumina-spa-card/preview.png'}" class="spa-img">
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  setConfig(config) {
    this.config = config;
  }

  static get styles() {
    return css`
      ha-card {
        background: linear-gradient(135deg, #2d71a1 0%, #1a3a5a 100%);
        border-radius: 28px;
        padding: 20px;
        color: white;
        overflow: hidden;
      }
      .main-container {
        display: flex;
        gap: 15px;
      }
      .data-column {
        flex: 1.5;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .spa-column {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .glass-block {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 18px;
        padding: 12px;
      }
      .block-title {
        font-size: 0.75em;
        font-weight: bold;
        text-align: center;
        margin-bottom: 8px;
        letter-spacing: 1px;
        opacity: 0.9;
      }
      .row {
        display: flex;
        justify-content: space-around;
        gap: 10px;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .label { font-size: 0.8em; opacity: 0.7; }
      .val { font-weight: bold; font-size: 0.95em; }
      .spa-img {
        width: 100%;
        filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.5));
      }
      ha-icon {
        --mdc-icon-size: 20px;
        color: #00d4ff;
      }
    `;
  }
}

customElements.define("lumina-spa-card", LuminaSpaCard);
