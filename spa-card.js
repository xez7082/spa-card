import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

/**
 * ÉDITEUR DE LA CARTE (AVEC LABELS DE COLONNES)
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
    
    const switchSchema = [];
    // Ajout d'un titre informatif pour les colonnes
    for (let i = 1; i <= 8; i++) {
      switchSchema.push({
        name: "", 
        type: "grid", 
        schema: [
          { name: `switch_${i}_entity`, label: `Bouton ${i} : Entité`, selector: { entity: { domain: ["switch", "light", "input_boolean"] } } },
          { name: `switch_${i}_label`, label: `Bouton ${i} : Nom affiché`, selector: { text: {} } }
        ]
      });
    }

    const schema = [
      { name: "card_title", label: "Titre de la carte", selector: { text: {} } },
      { name: "background_image", label: "Image de fond (URL)", selector: { text: {} } },
      {
        title: "🕹️ Barre de 8 Boutons (Haut)",
        type: "expandable",
        schema: [
          { name: "show_top_bar", label: "Activer la barre de contrôle", selector: { boolean: {} } },
          ...switchSchema
        ]
      },
      {
        title: "🌡️ Bloc Températures",
        type: "expandable",
        schema: [
          { name: "title_temp", label: "Titre du bloc", selector: { text: {} } },
          { name: "entity_water_temp", label: "Capteur Eau", selector: { entity: {} } },
          { name: "entity_ambient_temp", label: "Capteur Air", selector: { entity: {} } },
          { name: "", type: "grid", schema: [
            { name: "pos_temp_x", label: "Position X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_temp_y", label: "Position Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
          ]}
        ]
      },
      {
        title: "🧪 Bloc Chimie",
        type: "expandable",
        schema: [
          { name: "title_chem", label: "Titre du bloc", selector: { text: {} } },
          { name: "entity_ph", label: "pH", selector: { entity: {} } },
          { name: "entity_orp", label: "ORP", selector: { entity: {} } },
          { name: "entity_bromine", label: "Brome", selector: { entity: {} } },
          { name: "entity_alkalinity", label: "TAC", selector: { entity: {} } },
          { name: "", type: "grid", schema: [
            { name: "pos_chem_x", label: "Position X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_chem_y", label: "Position Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
          ]}
        ]
      },
      {
        title: "⚡ Bloc Système & Énergie",
        type: "expandable",
        schema: [
          { name: "title_elec", label: "Titre du bloc", selector: { text: {} } },
          { name: "entity_power", label: "Watts", selector: { entity: {} } },
          { name: "entity_amp", label: "Ampères SPA", selector: { entity: {} } },
          { name: "entity_vac_current", label: "Ampères Aspirateur", selector: { entity: {} } },
          { name: "entity_tv", label: "Entité TV", selector: { entity: {} } },
          { name: "entity_alexa", label: "Entité Alexa", selector: { entity: {} } },
          { name: "", type: "grid", schema: [
            { name: "pos_elec_x", label: "Position X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_elec_y", label: "Position Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
          ]}
        ]
      },
      {
        title: "📊 Tableau & Boutons Latéraux",
        type: "expandable",
        schema: [
          { name: "show_table", label: "Afficher Tableau AquaChek", selector: { boolean: {} } },
          { name: "show_buttons", label: "Afficher Bulles/Filtre/LED", selector: { boolean: {} } },
          { name: "switch_bubbles", label: "Switch Bulles", selector: { entity: {} } },
          { name: "switch_filter", label: "Switch Filtre", selector: { entity: {} } },
          { name: "switch_light", label: "Switch Lumière", selector: { entity: {} } },
          { name: "", type: "grid", schema: [
            { name: "pos_tab_x", label: "Tableau X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_tab_y", label: "Tableau Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_btn_x", label: "Boutons X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_btn_y", label: "Boutons Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
          ]}
        ]
      }
    ];

    return html`<ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form>`;
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
    const rawState = stateObj.state;
    const formatted = (!isNaN(parseFloat(rawState))) ? parseFloat(rawState).toFixed(1) : rawState;
    return {
      val: formatted,
      unit: stateObj.attributes.unit_of_measurement || '',
      active: !['off', 'unavailable', 'unknown', 'standby', 'none'].includes(rawState.toLowerCase())
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    const water = this._getState(c.entity_water_temp);
    const ambient = this._getState(c.entity_ambient_temp);
    const ph = this._getState(c.entity_ph);
    const orp = this._getState(c.entity_orp);
    const br = this._getState(c.entity_bromine);
    const alk = this._getState(c.entity_alkalinity);
    const pwr = this._getState(c.entity_power);
    const amp = this._getState(c.entity_amp);
    const vac = this._getState(c.entity_vac_current);
    const tv = this._getState(c.entity_tv);
    const alexa = this._getState(c.entity_alexa);
    const bub = this._getState(c.switch_bubbles);
    const fil = this._getState(c.switch_filter);
    const led = this._getState(c.switch_light);

    const topSwitches = [];
    for (let i = 1; i <= 8; i++) {
      const entity = c[`switch_${i}_entity`];
      const label = c[`switch_${i}_label`] || `S${i}`;
      if (entity) {
        const state = this._getState(entity);
        topSwitches.push(html`
          <div class="top-switch ${state.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: entity})}>
            <div class="sw-label">${label}</div>
            <ha-icon icon="mdi:power"></ha-icon>
          </div>
        `);
      }
    }

    return html`
      <ha-card style="background-image: url('${c.background_image || '/local/sparond2.jpg'}');">
        <div class="header">${c.card_title || 'SPA MONITORING'}</div>

        ${c.show_top_bar !== false ? html`
          <div class="top-bar">
            ${topSwitches}
          </div>
        ` : ''}

        <div class="glass" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 25}%;">
          <div class="titre">${c.title_temp || 'TEMPERATURES'}</div>
          <div class="row"><ha-icon icon="mdi:thermometer-water"></ha-icon> Eau: ${water.val}${water.unit}</div>
          <div class="row"><ha-icon icon="mdi:thermometer"></ha-icon> Air: ${ambient.val}${ambient.unit}</div>
        </div>

        <div class="glass" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 42}%;">
          <div class="titre">${c.title_chem || 'CHIMIE DE L\'EAU'}</div>
          <div class="row"><ha-icon icon="mdi:ph"></ha-icon> pH: ${ph.val} | ORP: ${orp.val}</div>
          <div class="row"><ha-icon icon="mdi:opacity"></ha-icon> Br: ${br.val} | TAC: ${alk.val}</div>
        </div>

        <div class="glass" style="left:${c.pos_elec_x || 5}%; top:${c.pos_elec_y || 60}%;">
          <div class="titre">${c.title_elec || 'SYSTEME & ENERGIE'}</div>
          <div class="row"><ha-icon icon="mdi:lightning-bolt"></ha-icon> ${pwr.val}W | ${amp.val}A</div>
          <div class="row"><ha-icon icon="mdi:vacuum"></ha-icon> Aspi: ${vac.val}A</div>
          <div class="row">
            <ha-icon icon="mdi:television" style="color:${tv.active ? '#00f9f9' : 'white'}"></ha-icon> | 
            <ha-icon icon="mdi:google-assistant" style="color:${alexa.active ? '#00f9f9' : 'white'}"></ha-icon>
          </div>
        </div>

        ${c.show_table !== false ? html`
        <div class="glass table-glass" style="left:${c.pos_tab_x || 55}%; top:${c.pos_tab_y || 60}%;">
          <div class="titre">IDEAL (PPM)</div>
          <table>
            <tr><td>pH</td><td class="ideal">7.2-7.8</td></tr>
            <tr><td>Brome</td><td class="ideal">3.0-5.0</td></tr>
            <tr><td>TAC</td><td class="ideal">80-120</td></tr>
          </table>
        </div>` : ''}

        ${c.show_buttons !== false ? html`
        <div class="btns" style="left:${c.pos_btn_x || 82}%; top:${c.pos_btn_y || 25}%;">
          <div class="btn ${bub.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_bubbles})}><ha-icon icon="mdi:airbubble"></ha-icon></div>
          <div class="btn ${fil.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_filter})}><ha-icon icon="mdi:hydro-power"></ha-icon></div>
          <div class="btn ${led.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_light})}><ha-icon icon="mdi:lightbulb"></ha-icon></div>
        </div>` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { 
      background-size: cover; 
      background-position: center; 
      height: 550px; 
      position: relative; 
      color: white; 
      border-radius: 20px; 
      overflow: hidden; 
      border: 2.5px solid #00f9f9; 
    }
    
    .header { position: absolute; top: 10px; left: 15px; font-weight: 900; font-size: 0.95em; color: #00f9f9; text-transform: uppercase; text-shadow: 2px 2px 4px black; letter-spacing: 1.5px; }
    
    .top-bar { position: absolute; top: 35px; left: 8px; right: 8px; display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
    
    .top-switch { 
      background: rgba(0,0,0,0.75); 
      backdrop-filter: blur(8px); 
      border-radius: 6px; 
      padding: 4px 1px; 
      text-align: center; 
      cursor: pointer; 
      border: 1px solid #00f9f9; 
      transition: all 0.2s ease-in-out; 
      min-width: 0; 
    }
    .top-switch.on { background: rgba(0, 249, 249, 0.4); box-shadow: 0 0 8px #00f9f9; }
    .sw-label { font-size: 0.45em; font-weight: 900; text-transform: uppercase; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-shadow: 1px 1px 1px black; }

    .glass { 
      position: absolute; 
      background: rgba(0,0,0,0.65); 
      backdrop-filter: blur(12px); 
      border-radius: 12px; 
      padding: 10px; 
      border: 1px solid #00f9f9; 
      min-width: 170px; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    
    .titre { font-size: 0.58em; color: #00f9f9; font-weight: 900; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 6px; border-bottom: 1.5px solid rgba(0, 249, 249, 0.3); padding-bottom: 2px; }
    .row { display: flex; align-items: center; gap: 8px; font-size: 0.85em; font-weight: bold; margin-top: 5px; }
    
    .btns { position: absolute; display: flex; flex-direction: column; gap: 12px; }
    .btn { 
      background: rgba(0,0,0,0.8); 
      width: 44px; 
      height: 44px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      cursor: pointer; 
      border: 2px solid #00f9f9; 
      transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
    }
    .btn.on { background: #00f9f9; color: black; box-shadow: 0 0 20px #00f9f9; border: none; transform: scale(1.1); }
    
    .table-glass { min-width: 140px; }
    table { width: 100%; font-size: 0.78em; border-collapse: collapse; }
    td { padding: 3px 0; font-weight: bold; }
    .ideal { text-align: right; color: #00ff88; text-shadow: 0 0 5px rgba(0,255,136,0.3); }
    ha-icon { --mdc-icon-size: 16px; }
  `;
}

customElements.define("spa-card-editor", SpaCardEditor);
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA Card Neon Pro", preview: true });
