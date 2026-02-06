import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

/**
 * ÉDITEUR DE LA CARTE - VERSION FORCEE SANS GROUPES
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
    
    // On crée une liste simple de champs, sans fioritures pour forcer l'affichage
    const schema = [
      { name: "card_title", label: "--- TITRE DE LA CARTE ---", selector: { text: {} } },
      { name: "background_image", label: "--- IMAGE DE FOND (URL) ---", selector: { text: {} } },
      
      // BOUTONS DU HAUT
      { name: "show_top_bar", label: "AFFICHER LES 8 BOUTONS (OUI/NON)", selector: { boolean: {} } },
      { name: "switch_1_entity", label: "Bouton 1 : Entité", selector: { entity: {} } },
      { name: "switch_1_label", label: "Bouton 1 : Nom (ex: P1)", selector: { text: {} } },
      { name: "switch_2_entity", label: "Bouton 2 : Entité", selector: { entity: {} } },
      { name: "switch_2_label", label: "Bouton 2 : Nom (ex: P2)", selector: { text: {} } },
      { name: "switch_3_entity", label: "Bouton 3 : Entité", selector: { entity: {} } },
      { name: "switch_3_label", label: "Bouton 3 : Nom", selector: { text: {} } },
      { name: "switch_4_entity", label: "Bouton 4 : Entité", selector: { entity: {} } },
      { name: "switch_4_label", label: "Bouton 4 : Nom", selector: { text: {} } },

      // TEMPERATURES
      { name: "title_temp", label: "--- TITRE BLOC TEMPERATURE ---", selector: { text: {} } },
      { name: "entity_water_temp", label: "Capteur Température EAU", selector: { entity: {} } },
      { name: "entity_ambient_temp", label: "Capteur Température AIR", selector: { entity: {} } },
      { name: "pos_temp_x", label: "Position Bloc Temp (X %)", selector: { number: { min: 0, max: 100 } } },
      { name: "pos_temp_y", label: "Position Bloc Temp (Y %)", selector: { number: { min: 0, max: 100 } } },

      // CHIMIE
      { name: "title_chem", label: "--- TITRE BLOC CHIMIE ---", selector: { text: {} } },
      { name: "entity_ph", label: "Capteur pH", selector: { entity: {} } },
      { name: "entity_orp", label: "Capteur ORP", selector: { entity: {} } },
      { name: "entity_bromine", label: "Capteur Brome", selector: { entity: {} } },
      { name: "entity_alkalinity", label: "Capteur TAC", selector: { entity: {} } },
      { name: "pos_chem_x", label: "Position Bloc Chimie (X %)", selector: { number: { min: 0, max: 100 } } },
      { name: "pos_chem_y", label: "Position Bloc Chimie (Y %)", selector: { number: { min: 0, max: 100 } } },

      // ENERGIE
      { name: "title_elec", label: "--- TITRE BLOC ENERGIE ---", selector: { text: {} } },
      { name: "entity_power", label: "Consommation (Watts)", selector: { entity: {} } },
      { name: "entity_amp", label: "Intensité (Ampères)", selector: { entity: {} } },
      { name: "pos_elec_x", label: "Position Bloc Energie (X %)", selector: { number: { min: 0, max: 100 } } },
      { name: "pos_elec_y", label: "Position Bloc Energie (Y %)", selector: { number: { min: 0, max: 100 } } }
    ];

    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${schema}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }
}

/**
 * CARTE PRINCIPALE
 */
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }

  _getState(entityId) {
    if (!this.hass || !entityId || !this.hass.states[entityId]) return { val: '?', unit: '', active: false };
    const stateObj = this.hass.states[entityId];
    return {
      val: stateObj.state,
      unit: stateObj.attributes.unit_of_measurement || '',
      active: stateObj.state === 'on'
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    const topSwitches = [];
    for (let i = 1; i <= 8; i++) {
      const entity = c[`switch_${i}_entity`];
      if (entity) {
        const state = this._getState(entity);
        topSwitches.push(html`
          <div class="top-switch ${state.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: entity})}>
            <div class="sw-label">${c[`switch_${i}_label`] || 'S'+i}</div>
            <ha-icon icon="mdi:power"></ha-icon>
          </div>
        `);
      }
    }

    return html`
      <ha-card style="background-image: url('${c.background_image || '/local/sparond2.jpg'}');">
        <div class="header">${c.card_title || 'SPA CONTROL'}</div>
        ${c.show_top_bar !== false ? html`<div class="top-bar">${topSwitches}</div>` : ''}
        
        <div class="glass" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 25}%;">
          <div class="titre">${c.title_temp || 'TEMPERATURES'}</div>
          <div class="row">Eau: ${this._getState(c.entity_water_temp).val}°</div>
        </div>

        <div class="glass" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 45}%;">
          <div class="titre">${c.title_chem || 'CHIMIE'}</div>
          <div class="row">pH: ${this._getState(c.entity_ph).val}</div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { height: 550px; background-size: cover; position: relative; border-radius: 20px; border: 2.5px solid #00f9f9; color: white; overflow: hidden; }
    .header { position: absolute; top: 10px; left: 15px; font-weight: 900; color: #00f9f9; text-shadow: 2px 2px 4px black; }
    .top-bar { position: absolute; top: 40px; left: 8px; right: 8px; display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
    .top-switch { background: rgba(0,0,0,0.7); border-radius: 6px; padding: 4px 1px; text-align: center; border: 1px solid #00f9f9; cursor: pointer; }
    .top-switch.on { background: rgba(0, 249, 249, 0.4); box-shadow: 0 0 8px #00f9f9; }
    .sw-label { font-size: 0.45em; font-weight: bold; text-transform: uppercase; }
    .glass { position: absolute; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px; border: 1px solid #00f9f9; min-width: 150px; }
    .titre { font-size: 0.6em; color: #00f9f9; border-bottom: 1px solid #00f9f9; margin-bottom: 5px; }
    .row { font-size: 0.85em; font-weight: bold; }
    ha-icon { --mdc-icon-size: 16px; }
  `;
}

customElements.define("spa-card-editor", SpaCardEditor);
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA Card Text Labels", preview: true });
