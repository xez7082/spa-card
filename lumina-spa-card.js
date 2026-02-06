import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

/**
 * ÉDITEUR DE LA CARTE (INTERFACE DE CONFIGURATION AVEC ACCORDÉONS)
 */
class LuminaSpaEditor extends LitElement {
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
    
    const schema = [
      { name: "card_title", label: "Nom du SPA", selector: { text: {} } },
      { name: "background_image", label: "Image (/local/sparond2.jpg)", selector: { text: {} } },
      {
        name: "", type: "grid", schema: [
          { name: "show_buttons", label: "Afficher Boutons", selector: { boolean: {} } },
          { name: "show_table", label: "Afficher Tableau", selector: { boolean: {} } },
        ]
      },
      // SECTION TEMPÉRATURES
      {
        title: "🌡️ Températures",
        type: "expandable",
        schema: [
          { name: "entity_water_temp", label: "Entité Temp Eau", selector: { entity: {} } },
          { name: "entity_ambient_temp", label: "Entité Temp Env", selector: { entity: {} } },
        ]
      },
      // SECTION CHIMIE
      {
        title: "🧪 Chimie de l'eau",
        type: "expandable",
        schema: [
          { name: "entity_ph", label: "Entité pH", selector: { entity: {} } },
          { name: "entity_orp", label: "Entité ORP", selector: { entity: {} } },
          { name: "entity_bromine", label: "Entité Brome", selector: { entity: {} } },
          { name: "entity_alkalinity", label: "Entité Alcalinité", selector: { entity: {} } },
        ]
      },
      // SECTION SYSTÈME
      {
        title: "⚡ Système & Énergie",
        type: "expandable",
        schema: [
          { name: "entity_power", label: "Entité Watts", selector: { entity: {} } },
          { name: "entity_amp", label: "Entité Amp SPA", selector: { entity: {} } },
          { name: "entity_vac_current", label: "Entité Amp Aspirateur", selector: { entity: {} } },
          { name: "entity_tv", label: "Entité TV", selector: { entity: {} } },
          { name: "entity_alexa", label: "Entité Alexa", selector: { entity: {} } },
        ]
      },
      // SECTION COMMANDES
      {
        title: "🔘 Commandes (Interrupteurs)",
        type: "expandable",
        schema: [
          { name: "switch_bubbles", label: "Switch Bulles", selector: { entity: {} } },
          { name: "switch_filter", label: "Switch Filtre", selector: { entity: {} } },
          { name: "switch_light", label: "Switch Lumière", selector: { entity: {} } },
        ]
      },
// SECTION POSITIONS AVEC TITRES DE LIGNES
      {
        title: "📍 Réglages Positions (X/Y %)",
        type: "expandable",
        schema: [
          {
            name: "", type: "grid", schema: [
              { name: "pos_temp_x", label: "🌡️ Temp X", selector: { number: { min: 0, max: 100, mode: "box" } } },
              { name: "pos_temp_y", label: "🌡️ Temp Y", selector: { number: { min: 0, max: 100, mode: "box" } } },
              
              { name: "pos_chem_x", label: "🧪 Chimie X", selector: { number: { min: 0, max: 100, mode: "box" } } },
              { name: "pos_chem_y", label: "🧪 Chimie Y", selector: { number: { min: 0, max: 100, mode: "box" } } },
              
              { name: "pos_elec_x", label: "⚡ Système X", selector: { number: { min: 0, max: 100, mode: "box" } } },
              { name: "pos_elec_y", label: "⚡ Système Y", selector: { number: { min: 0, max: 100, mode: "box" } } },
              
              { name: "pos_tab_x", label: "📊 Tableau X", selector: { number: { min: 0, max: 100, mode: "box" } } },
              { name: "pos_tab_y", label: "📊 Tableau Y", selector: { number: { min: 0, max: 100, mode: "box" } } },
              
              { name: "pos_btn_x", label: "🔘 Boutons X", selector: { number: { min: 0, max: 100, mode: "box" } } },
              { name: "pos_btn_y", label: "🔘 Boutons Y", selector: { number: { min: 0, max: 100, mode: "box" } } },
            ]
          }
        ]
      }
/**
 * LA CARTE PRINCIPALE
 */
class LuminaSpaCard extends LitElement {
  static getConfigElement() { return document.createElement("lumina-spa-card-editor"); }
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

    return html`
      <ha-card style="background-image: url('${c.background_image || '/local/sparond2.jpg'}');">
        <div class="header">${c.card_title || 'LUMINA SPA'}</div>

        <div class="glass" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 10}%;">
          <div class="titre">TEMPÉRATURES</div>
          <div class="row"><ha-icon icon="mdi:thermometer-water"></ha-icon> Eau: ${water.val}${water.unit}</div>
          <div class="row"><ha-icon icon="mdi:thermometer"></ha-icon> Env: ${ambient.val}${ambient.unit}</div>
        </div>

        <div class="glass" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 25}%;">
          <div class="titre">CHIMIE</div>
          <div class="row"><ha-icon icon="mdi:ph"></ha-icon> pH: ${ph.val} | ORP: ${orp.val}</div>
          <div class="row"><ha-icon icon="mdi:opacity"></ha-icon> Br: ${br.val} | TAC: ${alk.val}</div>
        </div>

        <div class="glass" style="left:${c.pos_elec_x || 5}%; top:${c.pos_elec_y || 42}%;">
          <div class="titre">SYSTÈME</div>
          <div class="row"><ha-icon icon="mdi:lightning-bolt"></ha-icon> ${pwr.val}W | ${amp.val}A</div>
          <div class="row"><ha-icon icon="mdi:vacuum"></ha-icon> Aspirateur: ${vac.val}A</div>
          <div class="row">
            <ha-icon icon="mdi:television" style="color:${tv.active ? '#00d4ff' : 'white'}"></ha-icon> TV | 
            <ha-icon icon="mdi:google-assistant" style="color:${alexa.active ? '#00d4ff' : 'white'}"></ha-icon> Alexa
          </div>
        </div>

        ${c.show_table !== false ? html`
        <div class="glass table-glass" style="left:${c.pos_tab_x || 55}%; top:${c.pos_tab_y || 42}%;">
          <div class="titre">IDÉAL (PPM)</div>
          <table>
            <tr><td>pH</td><td class="ideal">7.2-7.8</td></tr>
            <tr><td>Brome</td><td class="ideal">3.0-5.0</td></tr>
            <tr><td>TAC</td><td class="ideal">80-120</td></tr>
          </table>
        </div>` : ''}

        ${c.show_buttons !== false ? html`
        <div class="btns" style="left:${c.pos_btn_x || 80}%; top:${c.pos_btn_y || 10}%;">
          <div class="btn ${bub.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_bubbles})}><ha-icon icon="mdi:airbubble"></ha-icon></div>
          <div class="btn ${fil.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_filter})}><ha-icon icon="mdi:hydro-power"></ha-icon></div>
          <div class="btn ${led.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_light})}><ha-icon icon="mdi:lightbulb"></ha-icon></div>
        </div>` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { background-size: cover; background-position: center; height: 550px; position: relative; color: white; border-radius: 20px; overflow: hidden; border:none; }
    .header { position: absolute; top: 15px; left: 20px; font-weight: 900; font-size: 1.1em; text-shadow: 2px 2px 4px black; color: #00d4ff; text-transform: uppercase; }
    .glass { position: absolute; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 12px; padding: 10px; border: 1px solid rgba(255,255,255,0.1); min-width: 175px; }
    .titre { font-size: 0.55em; color: #00d4ff; font-weight: 900; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 5px; border-bottom: 1px solid rgba(0,212,255,0.2); }
    .row { display: flex; align-items: center; gap: 6px; font-size: 0.8em; font-weight: bold; margin-top: 4px; }
    .btns { position: absolute; display: flex; flex-direction: column; gap: 12px; }
    .btn { background: rgba(0,0,0,0.7); width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); transition: 0.3s; }
    .btn.on { background: #00d4ff; box-shadow: 0 0 15px #00d4ff; border: none; transform: scale(1.05); }
    .table-glass { min-width: 145px; padding: 8px; }
    table { width: 100%; font-size: 0.75em; border-collapse: collapse; }
    td { padding: 2px 0; font-weight: bold; }
    .ideal { text-align: right; color: #00ff88; }
    ha-icon { --mdc-icon-size: 18px; }
  `;
}

customElements.define("lumina-spa-card-editor", LuminaSpaEditor);
customElements.define("lumina-spa-card", LuminaSpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "lumina-spa-card", name: "Lumina SPA Final", preview: true });
