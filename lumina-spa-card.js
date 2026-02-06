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

  static getStubConfig() {
    return {
      card_title: "MON SPA",
      background_image: "/local/sparond.png",
      pos_temp_x: 15, pos_temp_y: 20,
      pos_chem_x: 15, pos_chem_y: 45,
      pos_energy_x: 15, pos_energy_y: 70,
      entity_water_temp: "",
      entity_ph: "",
      entity_orp: "",
      entity_power: ""
    };
  }

  setConfig(config) {
    this.config = {
      ...config,
      background_image: config.background_image || "/local/sparond.png"
    };
  }

  static getConfigElement() {
    return document.createElement("lumina-spa-card-editor");
  }

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
      <ha-card style="background-image: url('${this.config.background_image}');">
        <div class="header">${this.config.card_title}</div>

        <div class="glass-block" style="left: ${this.config.pos_temp_x}%; top: ${this.config.pos_temp_y}%;">
          <div class="block-title">TEMPÉRATURE</div>
          <div class="row">
            <ha-icon icon="mdi:thermometer"></ha-icon>
            <span class="val">${water.state}${water.unit}</span>
          </div>
        </div>

        <div class="glass-block" style="left: ${this.config.pos_chem_x}%; top: ${this.config.pos_chem_y}%;">
          <div class="block-title">CHIMIE SPA</div>
          <div class="row">
            <ha-icon icon="mdi:ph"></ha-icon><span class="val">${ph.state}</span>
            <ha-icon icon="mdi:test-tube" style="margin-left:8px"></ha-icon><span class="val">${orp.state}</span>
          </div>
        </div>

        <div class="glass-block" style="left: ${this.config.pos_energy_x}%; top: ${this.config.pos_energy_y}%;">
          <div class="block-title">ÉNERGIE</div>
          <div class="row">
            <ha-icon icon="mdi:lightning-bolt"></ha-icon>
            <span class="val">${power.state}${power.unit}</span>
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
        height: 550px;
        position: relative;
        color: white;
        border-radius: 20px;
        overflow: hidden;
        border: none;
      }
      .header {
        position: absolute;
        top: 25px;
        left: 25px;
        font-weight: 800;
        font-size: 1.3em;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-shadow: 2px 2px 10px rgba(0,0,0,0.9);
      }
      .glass-block {
        position: absolute;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 15px;
        padding: 12px 18px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
        transition: all 0.3s ease;
      }
      .block-title {
        font-size: 10px;
        font-weight: 900;
        color: #00d4ff;
        margin-bottom: 5px;
        letter-spacing: 1px;
      }
      .row { display: flex; align-items: center; gap: 8px; }
      .val { font-size: 16px; font-weight: bold; }
      ha-icon { --mdc-icon-size: 20px; color: white; }
    `;
  }
}

// --- ÉDITEUR VISUEL ---
class LuminaSpaEditor extends LitElement {
  static get properties() {
    return { hass: { type: Object }, _config: { type: Object } };
  }

  setConfig(config) { this._config = config; }

  render() {
    if (!this.hass || !this._config) return html``;

    const schema = [
      { name: "card_title", label: "Nom du SPA", selector: { text: {} } },
      { name: "background_image", label: "Chemin de l'image (/local/sparond.png)", selector: { text: {} } },
      {
        name: "entities",
        type: "grid",
        name: "",
        schema: [
          { name: "entity_water_temp", label: "Capteur Température", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_power: sensor.votre_puissance", label: "Capteur Puissance (W)", selector: { entity: { domain: "sensor" } } },
        ]
      },
      {
        name: "Positions",
        type: "expandable",
        title: "Ajustement des blocs sur l'image",
        schema: [
          { name: "pos_temp_x", label: "Température Horizontale (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
          { name: "pos_temp_y", label: "Température Verticale (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
          { name: "pos_chem_x", label: "Chimie Horizontale (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
          { name: "pos_chem_y", label: "Chimie Verticale (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
          { name: "pos_energy_x", label: "Énergie Horizontale (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
          { name: "pos_energy_y", label: "Énergie Verticale (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
        ]
      }
    ];

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${(s) => s.label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  _valueChanged(ev) {
    const event = new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define("lumina-spa-card-editor", LuminaSpaEditor);
customElements.define("lumina-spa-card", LuminaSpaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lumina-spa-card",
  name: "Lumina SPA Card Pro",
  preview: true,
  description: "Édition spéciale pour spa gonflable avec positionnement libre."
});
