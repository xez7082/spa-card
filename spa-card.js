import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

/**
 * ÉDITEUR DE LA CARTE
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
    for (let i = 1; i <= 8; i++) {
      switchSchema.push({
        name: "", type: "grid", schema: [
          { name: `switch_${i}_entity`, label: `Entité Switch ${i}`, selector: { entity: { domain: "switch" } } },
          { name: `switch_${i}_label`, label: `Nom ${i}`, selector: { text: {} } }
        ]
      });
    }

    const schema = [
      { name: "card_title", label: "Nom du SPA", selector: { text: {} } },
      { name: "background_image", label: "Image (/local/sparond2.jpg)", selector: { text: {} } },
      {
        title: "🕹️ Barre de Contrôle (Haut)",
        type: "expandable",
        schema: [
          { name: "show_top_bar", label: "Afficher la barre", selector: { boolean: {} } },
          ...switchSchema
        ]
      },
      {
        title: "🌡️ Températures",
        type: "expandable",
        schema: [
          { name: "entity_water_temp", label: "Entité Temp Eau", selector: { entity: {} } },
          { name: "entity_ambient_temp", label: "Entité Temp Env", selector: { entity: {} } },
          { name: "", type: "grid", schema: [
            { name: "pos_temp_x", label: "X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_temp_y", label: "Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
          ]}
        ]
      },
      {
        title: "🧪 Chimie de l'eau",
        type: "expandable",
        schema: [
          { name: "entity_ph", label: "Entité pH", selector: { entity: {} } },
          { name: "entity_orp", label: "Entité ORP", selector: { entity: {} } },
          { name: "entity_bromine", label: "Entité Brome", selector: { entity: {} } },
          { name: "entity_alkalinity", label: "Entité Alcalinité", selector: { entity: {} } },
          { name: "", type: "grid", schema: [
            { name: "pos_chem_x", label: "X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_chem_y", label: "Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
          ]}
        ]
      },
      {
        title: "⚡ Système & Énergie",
        type: "expandable",
        schema: [
          { name: "entity_power", label: "Entité Watts", selector: { entity: {} } },
          { name: "entity_amp", label: "Entité Amp SPA", selector: { entity: {} } },
          { name: "entity_vac_current", label: "Entité Amp Aspirateur", selector: { entity: {} } },
          { name: "entity_tv", label: "Entité TV", selector: { entity: {} } },
          { name: "entity_alexa", label: "Entité Alexa", selector: { entity: {} } },
          { name: "", type: "grid", schema: [
            { name: "pos_elec_x", label: "X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_elec_y", label: "Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
          ]}
        ]
      },
      {
        title: "📊 Tableau & Boutons",
        type: "expandable",
        schema: [
          { name: "show_table", label: "Afficher Tableau AquaChek", selector: { boolean: {} } },
          { name: "show_buttons", label: "Afficher Boutons Latéraux", selector: { boolean: {} } },
          { name: "switch_bubbles", label: "Switch Bulles", selector: { entity: {} } },
          { name: "switch_filter", label: "Switch Filtre", selector: { entity: {} } },
          { name: "switch_light", label: "Switch Lumière", selector: { entity: {} } },
          { name: "", type: "grid", schema: [
            { name: "pos_tab_x", label: "Tab X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_tab_y", label: "Tab Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_btn_x", label: "Btn X (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
            { name: "pos_btn_y", label: "Btn Y (%)", selector: { number: { min: 0, max: 100, mode: "box" } } },
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
    if (!this.hass || !entityId || !this.hass.states[entityId]) {
      return { val: '?', unit: '', active: false };
    }
    const stateObj = this.hass.states[entityId];
    const rawState = stateObj.state;
    const formatted = (!isNaN(parseFloat(rawState))) ? parseFloat(rawState).toFixed(1) : rawState;
    return {
      val: formatted,
      unit: stateObj.attributes.unit_of_measurement || '',
      active: !['off', 'unavailable', 'unknown', 'standby'].includes(rawState.toLowerCase())
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    // Données
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

    // Rendu des 8 switchs du haut
    const topSwitches = [];
    for (let i = 1; i <= 8; i++) {
      const entity = c[`switch_${i}_entity`];
      const label = c[`switch_${i}_label`] || `S${i}`;
      if (entity) {
        const state = this._getState(entity);
        topSwitches.push(html`
          <div class="top-switch ${state.active ? 'on' : ''}" @click=${() => this.hass.callService("switch", "toggle", {entity_id: entity})}>
            <div class="sw-label">${label}</div>
            <ha-icon icon="mdi:power"></ha-icon>
          </div>
        `);
      }
    }

    return html`
      <ha-card style="background-image: url('${c.background_image || '/local/sparond2.jpg'}');">
        <div class="header">${c.card_title || 'SPA CARD'}</div>

        ${c.show_top_bar !== false && topSwitches.length > 0 ? html`
          <div class="top-bar">
            ${topSwitches}
          </div>
        ` : ''}

        <div class="glass" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 25}%;">
          <div class="titre">TEMPÉRATURES</div>
          <div class="row"><ha-icon icon="mdi:thermometer-water"></ha-icon> Eau: ${water.val}${water.unit}</div>
          <div class="row"><ha-icon icon="mdi:thermometer"></ha-icon> Env: ${ambient.val}${ambient.unit}</div>
        </div>

        <div class="glass" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 40}%;">
          <div class="titre">CHIMIE</div>
          <div class="row"><ha-icon icon="mdi:ph"></ha-icon> pH: ${ph.val} | ORP: ${orp.val}</div>
          <div class="row"><ha-icon icon="mdi:opacity"></ha-icon> Br: ${br.val} | TAC: ${alk.val}</div>
        </div>

        <div class="glass" style="left:${c.pos_elec_x || 5}%; top:${c.pos_elec_y || 55}%;">
          <div class="titre">SYSTÈME</div>
          <div class="row"><ha-icon icon="mdi:lightning-bolt"></ha-icon> ${pwr.val}W | ${amp.val}A</div>
          <div class="row"><ha-icon icon="mdi:vacuum"></ha-icon> Aspi: ${vac.val}A</div>
          <div class="row">
            <ha-icon icon="mdi:television" style="color:${tv.active ? '#00d4ff' : 'white'}"></ha-icon> | 
            <ha-icon icon="mdi:google-assistant" style="color:${alexa.active ? '#00d4ff' : 'white'}"></ha-icon>
          </div>
        </div>

        ${c.show_table !== false ? html`
        <div class="glass table-glass" style="left:${c.pos_tab_x || 55}%; top:${c.pos_tab_y || 55}%;">
          <div class="titre">IDÉAL (PPM)</div>
          <table>
            <tr><td>pH</td><td class="ideal">7.2-7.8</td></tr>
            <tr><td>Brome</td><td class="ideal">3.0-5.0</td></tr>
            <tr><td>TAC</td><td class="ideal">80-120</td></tr>
          </table>
        </div>` : ''}

        ${c.show_buttons !== false ? html`
        <div class="btns" style="left:${c.pos_btn_x || 85}%; top:${c.pos_btn_y || 25}%;">
          <div class="btn ${bub.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_bubbles})}><ha-icon icon="mdi:airbubble"></ha-icon></div>
          <div class="btn ${fil.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_filter})}><ha-icon icon="mdi:hydro-power"></ha-icon></div>
          <div class="btn ${led.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_light})}><ha-icon icon="mdi:lightbulb"></ha-icon></div>
        </div>` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { background-size: cover; background-position: center; height: 550px; position: relative; color: white; border-radius: 20px; overflow: hidden; border:none; }
    .header { position: absolute; top: 12px; left: 15px; font-weight: 900; font-size: 1em; color: #00d4ff; text-transform: uppercase; text-shadow: 2px 2px 4px black; }
    
    .top-bar { position: absolute; top: 40px; left: 10px; right: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
    .top-switch { background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); border-radius: 8px; padding: 4px; text-align: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); }
    .top-switch.on { background: rgba(0, 212, 255, 0.3); border-color: #00d4ff; box-shadow: 0 0 8px rgba(0,212,255,0.4); }
    .sw-label { font-size: 0.55em; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; white-space: nowrap; overflow: hidden; }

    .glass { position: absolute; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px; border: 1px solid rgba(255,255,255,0.1); min-width: 160px; }
    .titre { font-size: 0.55em; color: #00d4ff; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px; border-bottom: 1px solid rgba(0,212,255,0.2); }
    .row { display: flex; align-items: center; gap: 6px; font-size: 0.8em; font-weight: bold; margin-top: 3px; }
    
    .btns { position: absolute; display: flex; flex-direction: column; gap: 10px; }
    .btn { background: rgba(0,0,0,0.7); width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); }
    .btn.on { background: #00d4ff; box-shadow: 0 0 15px #00d4ff; border: none; }
    
    .table-glass { min-width: 130px; }
    table { width: 100%; font-size: 0.7em; border-collapse: collapse; }
    td { padding: 1px 0; font-weight: bold; }
    .ideal { text-align: right; color: #00ff88; }
    ha-icon { --mdc-icon-size: 16px; }
  `;
}

customElements.define("spa-card-editor", SpaCardEditor);
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA Card", preview: true });
