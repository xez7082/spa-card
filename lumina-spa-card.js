import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR (Simplifié au maximum) ---
class LuminaSpaEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }
  
  setConfig(config) {
    this._config = config;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    // On renvoie la config brute sans fioritures
    const event = new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this._config) return html``;

    // Schéma ultra-linéaire (plus robuste)
    const schema = [
      { name: "card_title", label: "Titre", selector: { text: {} } },
      { name: "background_image", label: "Image (/local/sparond.png)", selector: { text: {} } },
      { name: "entity_water_temp", label: "Capteur Température", selector: { entity: { domain: "sensor" } } },
      { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
      { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } },
      { name: "entity_power", label: "Capteur Puissance", selector: { entity: { domain: "sensor" } } },
      { name: "pos_temp_x", label: "Temp Horiz (X)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_temp_y", label: "Temp Verti (Y)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_chem_x", label: "Chimie Horiz (X)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_chem_y", label: "Chimie Verti (Y)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_energy_x", label: "Energie Horiz (X)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_energy_y", label: "Energie Verti (Y)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
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
    return { hass: {}, config: {} };
  }

  setConfig(config) {
    this.config = config;
  }

  // On récupère les états avec une sécurité si l'entité est vide
  _getState(entityId) {
    if (!this.hass || !entityId || !this.hass.states[entityId]) return { s: '0', u: '' };
    const obj = this.hass.states[entityId];
    return { s: obj.state, u: obj.attributes.unit_of_measurement || '' };
  }

  render() {
    if (!this.hass || !this.config) return html`Carte en attente...`;

    const water = this._getState(this.config.entity_water_temp);
    const ph = this._getState(this.config.entity_ph);
    const orp = this._getState(this.config.entity_orp);
    const power = this._getState(this.config.entity_power);

    return html`
      <ha-card style="background-image: url('${this.config.background_image || '/local/sparond.png'}');">
        <div class="header">${this.config.card_title || 'MON SPA'}</div>

        <div class="glass-block" style="left: ${this.config.pos_temp_x || 10}%; top: ${this.config.pos_temp_y || 15}%;">
          <div class="block-title">TEMPÉRATURE</div>
          <div class="row"><ha-icon icon="mdi:thermometer"></ha-icon><span class="val">${water.s}${water.u}</span></div>
        </div>

        <div class="glass-block" style="left: ${this.config.pos_chem_x || 10}%; top: ${this.config.pos_chem_y || 40}%;">
          <div class="block-title">CHIMIE SPA</div>
          <div class="row">
            <ha-icon icon="mdi:ph"></ha-icon><span class="val">${ph.s}</span>
            <ha-icon icon="mdi:test-tube" style="margin-left:5px"></ha-icon><span class="val">${orp.s}</span>
          </div>
        </div>

        <div class="glass-block" style="left: ${this.config.pos_energy_x || 10}%; top: ${this.config.pos_energy_y || 65}%;">
          <div class="block-title">ÉNERGIE</div>
          <div class="row"><ha-icon icon="mdi:lightning-bolt"></ha-icon><span class="val">${power.s}${power.u}</span></div>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card { background-size: cover; background-position: center; height: 500px; position: relative; color: white; border-radius: 20px; overflow: hidden; }
      .header { position: absolute; top: 20px; left: 20px; font-weight: 800; font-size: 1.2em; text-transform: uppercase; text-shadow: 2px 2px 4px black; }
      .glass-block { position: absolute; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 10px; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.1); }
      .block-title { font-size: 9px; font-weight: 900; color: #00d4ff; margin-bottom: 2px; }
      .row { display: flex; align-items: center; gap: 5px; }
      .val { font-size: 14px; font-weight: bold; }
      ha-icon { --mdc-icon-size: 18px; }
    `;
  }
}

customElements.define("lumina-spa-card-editor", LuminaSpaEditor);
customElements.define("lumina-spa-card", LuminaSpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "lumina-spa-card", name: "Lumina SPA Card Pro", preview: true });
