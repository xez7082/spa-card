import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

/**
 * ÉDITEUR PROFESSIONNEL
 */
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;

    // Schéma simplifié mais ultra-complet pour forcer l'affichage des labels
    const schema = [
      { name: "card_title", label: "Titre de la Carte", selector: { text: {} } },
      { name: "background_image", label: "Image de fond (URL)", selector: { text: {} } },
      
      { name: "header_buttons", label: "--- CONFIGURATION DES 8 BOUTONS DU HAUT ---", type: "constant" },
      { name: "show_top_bar", label: "Afficher la barre de boutons", selector: { boolean: {} } },
      ...Array.from({length: 8}, (_, i) => [
        { name: `switch_${i+1}_entity`, label: `Bouton ${i+1} : Entité`, selector: { entity: {} } },
        { name: `switch_${i+1}_label`, label: `Bouton ${i+1} : Nom`, selector: { text: {} } }
      ]).flat(),

      { name: "header_temp", label: "--- BLOC TEMPÉRATURES ---", type: "constant" },
      { name: "title_temp", label: "Titre du bloc", selector: { text: {} } },
      { name: "entity_water_temp", label: "Capteur Eau", selector: { entity: {} } },
      { name: "entity_ambient_temp", label: "Capteur Air", selector: { entity: {} } },
      { name: "pos_temp_x", label: "Position X (%)", selector: { number: { min: 0, max: 100 } } },
      { name: "pos_temp_y", label: "Position Y (%)", selector: { number: { min: 0, max: 100 } } },

      { name: "header_chem", label: "--- BLOC CHIMIE ---", type: "constant" },
      { name: "entity_ph", label: "pH", selector: { entity: {} } },
      { name: "entity_orp", label: "ORP", selector: { entity: {} } },
      { name: "entity_bromine", label: "Brome", selector: { entity: {} } },
      { name: "entity_alkalinity", label: "TAC (Alcalinité)", selector: { entity: {} } },
      { name: "pos_chem_x", label: "Position X (%)", selector: { number: { min: 0, max: 100 } } },
      { name: "pos_chem_y", label: "Position Y (%)", selector: { number: { min: 0, max: 100 } } },

      { name: "header_elec", label: "--- BLOC ÉNERGIE & SYSTÈME ---", type: "constant" },
      { name: "entity_power", label: "Consommation (W)", selector: { entity: {} } },
      { name: "entity_amp", label: "Intensité SPA (A)", selector: { entity: {} } },
      { name: "entity_vac_current", label: "Intensité Aspirateur (A)", selector: { entity: {} } },
      { name: "entity_tv", label: "État TV", selector: { entity: {} } },
      { name: "entity_alexa", label: "État Alexa", selector: { entity: {} } },
      { name: "pos_elec_x", label: "Position X (%)", selector: { number: { min: 0, max: 100 } } },
      { name: "pos_elec_y", label: "Position Y (%)", selector: { number: { min: 0, max: 100 } } },

      { name: "header_side", label: "--- GROS BOUTONS LATÉRAUX ---", type: "constant" },
      { name: "switch_bubbles", label: "Entité Bulles", selector: { entity: {} } },
      { name: "switch_filter", label: "Entité Filtration", selector: { entity: {} } },
      { name: "switch_light", label: "Entité Lumière", selector: { entity: {} } },
      { name: "pos_btn_x", label: "Boutons X (%)", selector: { number: { min: 0, max: 100 } } },
      { name: "pos_btn_y", label: "Boutons Y (%)", selector: { number: { min: 0, max: 100 } } }
    ];

    return html`<ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form>`;
  }
}

/**
 * CARTE PRINCIPALE NÉON
 */
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }

  _getState(entityId) {
    if (!this.hass || !entityId || !this.hass.states[entityId]) return { val: '?', unit: '', active: false };
    const s = this.hass.states[entityId];
    return {
      val: !isNaN(s.state) ? parseFloat(s.state).toFixed(1) : s.state,
      unit: s.attributes.unit_of_measurement || '',
      active: !['off', 'unavailable', 'unknown', 'standby'].includes(s.state.toLowerCase())
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    // Récupération de tous les états
    const water = this._getState(c.entity_water_temp);
    const air = this._getState(c.entity_ambient_temp);
    const ph = this._getState(c.entity_ph);
    const orp = this._getState(c.entity_orp);
    const pwr = this._getState(c.entity_power);
    const tv = this._getState(c.entity_tv);
    const alexa = this._getState(c.entity_alexa);

    const topButtons = [];
    for (let i = 1; i <= 8; i++) {
      const ent = c[`switch_${i}_entity`];
      if (ent) {
        const s = this._getState(ent);
        topButtons.push(html`
          <div class="sw-item ${s.active ? 'active' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: ent})}>
            <div class="sw-text">${c[`switch_${i}_label`] || 'S'+i}</div>
            <ha-icon icon="mdi:power"></ha-icon>
          </div>
        `);
      }
    }

    return html`
      <ha-card style="background-image: url('${c.background_image || '/local/sparond2.jpg'}');">
        <div class="glass-header">${c.card_title || 'SPA DASHBOARD'}</div>

        ${c.show_top_bar !== false ? html`<div class="top-grid">${topButtons}</div>` : ''}

        <div class="glass-box" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 22}%;">
          <div class="box-title">TEMPÉRATURES</div>
          <div class="box-row"><ha-icon icon="mdi:thermometer-water"></ha-icon> Eau: ${water.val}${water.unit}</div>
          <div class="box-row"><ha-icon icon="mdi:weather-windy"></ha-icon> Air: ${air.val}${air.unit}</div>
        </div>

        <div class="glass-box" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 40}%;">
          <div class="box-title">CHIMIE</div>
          <div class="box-row">pH: ${ph.val} | ORP: ${orp.val}</div>
          <div class="box-row">Br: ${this._getState(c.entity_bromine).val} | TAC: ${this._getState(c.entity_alkalinity).val}</div>
        </div>

        <div class="glass-box" style="left:${c.pos_elec_x || 5}%; top:${c.pos_elec_y || 58}%;">
          <div class="box-title">SYSTÈME</div>
          <div class="box-row"><ha-icon icon="mdi:flash"></ha-icon> ${pwr.val}W | ${this._getState(c.entity_amp).val}A</div>
          <div class="box-row">
             <ha-icon icon="mdi:television" class="${tv.active ? 'neon-text' : ''}"></ha-icon>
             <ha-icon icon="mdi:google-assistant" class="${alexa.active ? 'neon-text' : ''}"></ha-icon>
             <span>Aspi: ${this._getState(c.entity_vac_current).val}A</span>
          </div>
        </div>

        <div class="side-btns" style="left:${c.pos_btn_x || 85}%; top:${c.pos_btn_y || 22}%;">
           <div class="circle-btn ${this._getState(c.switch_bubbles).active ? 'active' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_bubbles})}><ha-icon icon="mdi:airbubble"></ha-icon></div>
           <div class="circle-btn ${this._getState(c.switch_filter).active ? 'active' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_filter})}><ha-icon icon="mdi:hydro-power"></ha-icon></div>
           <div class="circle-btn ${this._getState(c.switch_light).active ? 'active' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_light})}><ha-icon icon="mdi:lightbulb"></ha-icon></div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { height: 580px; background-size: cover; border: 3px solid #00f9f9; border-radius: 25px; position: relative; overflow: hidden; color: white; box-shadow: 0 0 20px rgba(0,249,249,0.2); }
    
    .glass-header { position: absolute; top: 12px; left: 20px; font-weight: 900; color: #00f9f9; letter-spacing: 2px; text-shadow: 0 0 10px rgba(0,249,249,0.5); }
    
    .top-grid { position: absolute; top: 45px; left: 10px; right: 10px; display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px; }
    .sw-item { background: rgba(0,0,0,0.7); border: 1px solid #00f9f9; border-radius: 8px; padding: 5px 2px; text-align: center; cursor: pointer; transition: 0.3s; }
    .sw-item.active { background: rgba(0,249,249,0.4); box-shadow: 0 0 10px #00f9f9; }
    .sw-text { font-size: 0.5em; font-weight: 900; margin-bottom: 2px; overflow: hidden; }

    .glass-box { position: absolute; background: rgba(0,0,0,0.6); backdrop-filter: blur(15px); border: 1px solid #00f9f9; border-radius: 15px; padding: 12px; min-width: 180px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
    .box-title { color: #00f9f9; font-size: 0.65em; font-weight: 900; border-bottom: 1px solid rgba(0,249,249,0.3); margin-bottom: 8px; padding-bottom: 4px; }
    .box-row { display: flex; align-items: center; gap: 10px; font-size: 0.9em; font-weight: bold; margin-bottom: 6px; }

    .side-btns { position: absolute; display: flex; flex-direction: column; gap: 15px; }
    .circle-btn { width: 48px; height: 48px; border-radius: 50%; border: 2px solid #00f9f9; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.4s; }
    .circle-btn.active { background: #00f9f9; color: black; box-shadow: 0 0 25px #00f9f9; transform: scale(1.1); }
    
    .neon-text { color: #00f9f9; filter: drop-shadow(0 0 5px #00f9f9); }
    ha-icon { --mdc-icon-size: 18px; }
  `;
}

customElements.define("spa-card-editor", SpaCardEditor);
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA Neon Ultimate", preview: true });
