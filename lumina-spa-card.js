import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- ÉDITEUR ---
class LuminaSpaEditor extends LitElement {
  static get properties() {
    return { hass: { type: Object }, _config: { type: Object } };
  }
  
  setConfig(config) {
    this._config = config;
  }

  // Cette fonction assure que la carte reçoit bien les nombres du slider
  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const config = ev.detail.value;
    
    // On force la mise à jour de la carte parente
    const event = new CustomEvent("config-changed", {
      detail: { config: config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const schema = [
      { name: "card_title", label: "Nom du SPA", selector: { text: {} } },
      { name: "background_image", label: "Image (/local/sparond.png)", selector: { text: {} } },
      {
        name: "entities",
        type: "grid",
        schema: [
          { name: "entity_water_temp", label: "Température", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_power", label: "Puissance", selector: { entity: { domain: "sensor" } } },
        ]
      },
      {
        name: "positions",
        type: "expandable",
        title: "Ajustement des positions (en %)",
        schema: [
          { name: "pos_temp_x", label: "Temp X", selector: { number: { min: 0, max: 100, mode: "slider", step: 1 } } },
          { name: "pos_temp_y", label: "Temp Y", selector: { number: { min: 0, max: 100, mode: "slider", step: 1 } } },
          { name: "pos_chem_x", label: "Chimie X", selector: { number: { min: 0, max: 100, mode: "slider", step: 1 } } },
          { name: "pos_chem_y", label: "Chimie Y", selector: { number: { min: 0, max: 100, mode: "slider", step: 1 } } },
          { name: "pos_energy_x", label: "Énergie X", selector: { number: { min: 0, max: 100, mode: "slider", step: 1 } } },
          { name: "pos_energy_y", label: "Énergie Y", selector: { number: { min: 0, max: 100, mode: "slider", step: 1 } } },
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
      ></ha-form>`;
  }
}

// --- CARTE ---
class LuminaSpaCard extends LitElement {
  static getConfigElement() { return document.createElement("lumina-spa-card-editor"); }
  
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  setConfig(config) {
    // On s'assure que config existe et on crée un nouvel objet pour forcer le refresh
    this.config = { ...config };
  }

  _getDisplayState(entityId) {
    if (!this.hass || !this.hass.states[entityId]) return { state: '--', unit: '' };
    const stateObj = this.hass.states[entityId];
    return { state: stateObj.state, unit: stateObj.attributes.unit_of_measurement || '' };
  }

  render() {
    if (!this.hass || !this.config) return html``;

    // Récupération des données
    const water = this._getDisplayState(this.config.entity_water_temp);
    const ph = this._getDisplayState(this.config.entity_ph);
    const orp = this._getDisplayState(this.config.entity_orp);
    const power = this._getDisplayState(this.config.entity_power);

    // Sécurité : on définit des valeurs par défaut si les sliders n'ont jamais été touchés
    const pTX = this.config.pos_temp_x ?? 10;
    const pTY = this.config.pos_temp_y ?? 20;
    const pCX = this.config.pos_chem_x ?? 10;
    const pCY = this.config.pos_chem_y ?? 45;
    const pEX = this.config.pos_energy_x ?? 10;
    const pEY = this.config.pos_energy_y ?? 70;

    return html`
      <ha-card style="background-image: url('${this.config.background_image || '/local/sparond.png'}');">
        <div class="header">${this.config.card_title || 'MON SPA'}</div>

        <div class="glass-block" style="left: ${pTX}%; top: ${pTY}%;">
          <div class="block-title">TEMPÉRATURE</div>
          <div class="row"><ha-icon icon="mdi:thermometer"></ha-icon><span class="val">${water.state}${water.unit}</span></div>
        </div>

        <div class="glass-block" style="left: ${pCX}%; top: ${pCY}%;">
          <div class="block-title">CHIMIE SPA</div>
          <div class="row">
            <ha-icon icon="mdi:ph"></ha-icon><span class="val">${ph.state}</span>
            <ha-icon icon="mdi:test-tube" style="margin-left:5px"></ha-icon><span class="val">${orp.state}</span>
          </div>
        </div>

        <div class="glass-block" style="left: ${pEX}%; top: ${pEY}%;">
          <div class="block-title">ÉNERGIE</div>
          <div class="row"><ha-icon icon="mdi:lightning-bolt"></ha-icon><span class="val">${power.state}${power.unit}</span></div>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card { background-size: cover; background-position: center; height: 550px; position: relative; color: white; border-radius: 20px; overflow: hidden; }
      .header { position: absolute; top: 25px; left: 25px; font-weight: 800; font-size: 1.3em; letter-spacing: 2px; text-transform: uppercase; text-shadow: 2px 2px 4px rgba(0,0,0,0.7); }
      .glass-block { 
        position: absolute; 
        background: rgba(255, 255, 255, 0.1); 
        backdrop-filter: blur(12px); 
        -webkit-backdrop-filter: blur(12px); 
        border-radius: 12px; 
        padding: 10px; 
        border: 1px solid rgba(255, 255, 255, 0.2); 
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transform: translate(0, 0); /* Aide au rendu GPU */
      }
      .block-title { font-size: 9px; font-weight: 900; color: #00d4ff; margin-bottom: 4px; }
      .row { display: flex; align-items: center; gap: 5px; }
      .val { font-size: 15px; font-weight: bold; }
      ha-icon { --mdc-icon-size: 18px; color: white; }
    `;
  }
}

customElements.define("lumina-spa-card-editor", LuminaSpaEditor);
customElements.define("lumina-spa-card", LuminaSpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "lumina-spa-card", name: "Lumina SPA Card Pro", preview: true });
