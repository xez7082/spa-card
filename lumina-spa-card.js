class LuminaSpaCard extends LitElement {
  static properties = {
    hass: {},
    config: {}
  }

  static getStubConfig() {
    return {
      card_title: "MON SPA",
      background_image: "/local/community/lumina-spa-card/preview.png",
      entity_water_temp: "sensor.spa_water_temp",
      entity_air_temp: "sensor.spa_air_temp",
      entity_ph: "sensor.spa_ph",
      entity_orp: "sensor.spa_orp",
      entity_power: "sensor.spa_power",
      entity_amps: "sensor.spa_current"
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration invalide");

    this.config = {
      card_title: "MON SPA",
      background_image: "/local/community/lumina-spa-card/preview.png",
      entity_water_temp: "sensor.spa_water_temp",
      entity_air_temp: "sensor.spa_air_temp",
      entity_ph: "sensor.spa_ph",
      entity_orp: "sensor.spa_orp",
      entity_power: "sensor.spa_power",
      entity_amps: "sensor.spa_current"
    };
  }

  _getDisplayState(entityId) {
    if (!entityId || !this.hass?.states?.[entityId]) {
      return { state: "N/A", unit: "" };
    }

    const stateObj = this.hass.states[entityId];

    return {
      state: stateObj.state,
      unit: stateObj.attributes?.unit_of_measurement
        ? ` ${stateObj.attributes.unit_of_measurement}`
        : ""
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const water = this._getDisplayState(this.config.entity_water_temp);
    const air = this._getDisplayState(this.config.entity_air_temp);
    const ph = this._displayState(entity_ph);
    const orp = this._displayState(entity_orp);
    const power = this._displayState(entity_power);
    const amps = this._displayState(entity_amps);

    return html`
      <ha-card style="background-image:url('${this.config.background_image}')">
        <div class="overlay">
          <div class="header">${this.config.card_title}</div>

          <div class="main-container">
            <div class="data-column">

              <div class="glass-block">
                <div class="block-title">TEMPÉRATURE</div>
                <div class="row">
                  <div class="item">
                    <ha-icon icon="mdi:thermometer"></ha-icon>
                    <div class="info">
                      <span class="label">Eau</span>
                      <span class="val">${water.state}${water.unit}</span>
                    </div>
                  <div class="item">
                    <ha-icon icon="mdi:cloud-outline"></ha-icon>
                    <div class="info">
                      <span class="label">Air</span>
                      <span class="val">${air.state}${air.unit}</span>
                    </div>
                </div>

              </div>

              <div class="glass-block">
                <div class="block-title">QUALITÉ DE L'EAU</div>
                <div class="row">
                  <div class="item">
                    <ha-icon icon="mdi:ph"></ha-icon>
                    <div class="info">
                      <span class="label">pH</span>
                      <span class="val">${ph.state}</span>
                    </div>
                  <div class="item">
                    <ha-icon icon="mdi:test-tube"></ha-icon>
                    <div class="info">
                      <span class="label">ORP</span>
                      <span class="val">${orp.state} mV</span>
                    </div>
                </div>

              <div class="glass-block">
                <div class="block-title">ÉLECTRICITÉ</div>
                <div class="row">
                  <div class="item">
                    <ha-icon icon="mdi:lightning-bolt"></ha-icon>
                    <div class="info">
                      <span class="label">Conso</span>
                      <span class="val">${power.state}${power.unit}</span>
                    </div>
                  <div class="item">
                    <ha-icon icon="mdi:current-ac"></ha-icon>
                    <div class="info">
                      <span class="label">Amps</span>
                      <span class="val">${amps.state}${amps.unit}</span>
                    </div>
                </div>
              </div>

            </div>

            <div class="spa-column"></div>
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      background-size: cover;
      background-position: center;
      border-radius: 24px;
      color: white;
      overflow: hidden;
      min-height: 320px;
      border: none;
    }
    .overlay {
      background: rgba(0,0,0,0.35);
      padding: 20px;
      height: 100%;
      box-sizing: border-box;
    }
    .header {
      font-weight: 800;
      font-size: 1.1em;
      margin-bottom: 15px;
      letter-spacing: 2px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .main-container { display: flex; gap: 15px; }
    .data-column {
      flex: 1.3;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .spa-column { flex: 0.7; }

    .glass-block {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(12px);
      border-radius: 15px;
      padding: 10px 14px;
      border: 1px solid rgba(255,255,255,255,255,0.15);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .block-title {
      font-size: 9px;
      font-weight: 900;
      color: #00d4ff;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }

    .row { display: flex; justify-content: space-between; gap: 10px; }
    .item { display: flex; align-items: center; gap: 10px; }
    .info { display: flex; flex-direction: column; }
    .label { font-size: 9px; opacity: .8; text-transform: uppercase; }
    .val { font-size: 13px; font-weight: bold; }

    ha-icon {
      --mdc-icon-size: 20px;
      color: #00d4ff;
      filter: drop-shadow(0 0 5px rgba(0,212,255,255,.4));
    }
  }
  `
}

// Define and register the card with LuminaSpaCard
if (!customElements.get('lumina-spa-card')) {
  customElements.define("lumina-spa-card", LuminaSpaCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lumina-spa-card",
  name: "Lumina Spa Card",
  description: "Carte premium pour le suivi du Spa avec image de fond.",
  preview: true
});
