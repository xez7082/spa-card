import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

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
      { name: "background_image", label: "Image (/local/sparond.png)", selector: { text: {} } },
      { name: "show_buttons", label: "Afficher les boutons de commande", selector: { boolean: {} } },
      {
        name: "entities", label: "Capteurs & Appareils", type: "grid", schema: [
          { name: "entity_water_temp", label: "Temp Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ambient_temp", label: "Temp Env", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_bromine", label: "Brome", selector: { entity: { domain: "sensor" } } },
          { name: "entity_alkalinity", label: "Alcalinité", selector: { entity: { domain: "sensor" } } },
          { name: "entity_hardness", label: "Dureté", selector: { entity: { domain: "sensor" } } },
          { name: "entity_power", label: "Puissance (W)", selector: { entity: { domain: "sensor" } } },
          { name: "entity_amp", label: "Amp SPA", selector: { entity: { domain: "sensor" } } },
          { name: "entity_vac_current", label: "Amp Aspirateur", selector: { entity: { domain: "sensor" } } },
          { name: "entity_tv", label: "Télévision", selector: { entity: {} } },
          { name: "entity_alexa", label: "Alexa", selector: { entity: {} } },
          { name: "switch_bubbles", label: "Switch Bulles", selector: { entity: {} } },
          { name: "switch_filter", label: "Switch Filtre", selector: { entity: {} } },
          { name: "switch_light", label: "Switch LED / Lumière", selector: { entity: {} } },
        ]
      },
      { name: "pos_temp_x", label: "Temp X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_temp_y", label: "Temp Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_chem_x", label: "Chimie X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_chem_y", label: "Chimie Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_elec_x", label: "Élec X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_elec_y", label: "Élec Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_tab_x", label: "Tableau X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_tab_y", label: "Tableau Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_btn_x", label: "Boutons X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_btn_y", label: "Boutons Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
    ];
    return html`<ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form>`;
  }
}

class LuminaSpaCard extends LitElement {
  static getConfigElement() { return document.createElement("lumina-spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }

  _get(ent) {
    if (!this.hass || !ent || !this.hass.states[ent]) return { s: '?', u: '', a: false };
    const o = this.hass.states[ent];
    const val = o.state;
    const display = (!isNaN(parseFloat(val))) ? parseFloat(val).toFixed(1) : val;
    return { s: display, u: o.attributes.unit_of_measurement || '', a: (val !== 'off' && val !== 'unavailable' && val !== 'standby') };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    const water = this._get(c.entity_water_temp);
    const ambient = this._get(c.entity_ambient_temp);
    const ph = this._get(c.entity_ph);
    const orp = this._get(c.entity_orp);
    const br = this._get(c.entity_bromine);
    const alk = this._get(c.entity_alkalinity);
    const hard = this._get(c.entity_hardness);
    const pwr = this._get(c.entity_power);
    const amp = this._get(c.entity_amp);
    const vac = this._get(c.entity_vac_current);
    const tv = this._get(c.entity_tv);
    const alexa = this._get(c.entity_alexa);
    const bub = this._get(c.switch_bubbles);
    const fil = this._get(c.switch_filter);
    const led = this._get(c.switch_light);

    return html`
      <ha-card style="background-image: url('${c.background_image || '/local/sparond.png'}');">
        <div class="header">${c.card_title || 'SPA HYPERION FULL'}</div>

        <div class="glass" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 10}%;">
          <div class="titre">TEMPÉRATURES</div>
          <div class="row"><ha-icon icon="mdi:thermometer-water"></ha-icon> Eau: ${water.s}°</div>
          <div class="row"><ha-icon icon="mdi:thermometer"></ha-icon> Env: ${ambient.s}°</div>
        </div>

        <div class="glass" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 25}%;">
          <div class="titre">CHIMIE</div>
          <div class="row"><ha-icon icon="mdi:ph"></ha-icon> pH: ${ph.s} | ORP: ${orp.s}</div>
          <div class="row"><ha-icon icon="mdi:opacity"></ha-icon> Br: ${br.s} | TAC: ${alk.s}</div>
        </div>

        <div class="glass" style="left:${c.pos_elec_x || 5}%; top:${c.pos_elec_y || 42}%;">
          <div class="titre">ÉLECTRIQUE & MULTIMÉDIA</div>
          <div class="row"><ha-icon icon="mdi:lightning-bolt"></ha-icon> ${pwr.s}W | ${amp.s}A</div>
          <div class="row"><ha-icon icon="mdi:vacuum"></ha-icon> Aspirateur: ${vac.s}A</div>
          <div class="row"><ha-icon icon="mdi:television" style="color:${tv.a ? '#00d4ff' : 'white'}"></ha-icon> TV | <ha-icon icon="mdi:google-assistant" style="color:${alexa.a ? '#00d4ff' : 'white'}"></ha-icon> Alexa</div>
        </div>

        <div class="glass table-glass" style="left:${c.pos_tab_x || 55}%; top:${c.pos_tab_y || 42}%;">
          <div class="titre">AQUACHEK (PPM)</div>
          <table>
            <tr><td>pH</td><td class="ideal">7.2 - 7.8</td></tr>
            <tr><td>Brome</td><td class="ideal">3.0 - 5.0</td></tr>
            <tr><td>TAC</td><td class="ideal">80 - 120</td></tr>
            <tr><td>TH</td><td class="ideal">250 - 500</td></tr>
          </table>
        </div>

        ${c.show_buttons !== false ? html`
          <div class="btns" style="left:${c.pos_btn_x || 80}%; top:${c.pos_btn_y || 10}%;">
            <div class="btn ${bub.a ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_bubbles})}><ha-icon icon="mdi:airbubble"></ha-icon></div>
            <div class="btn ${fil.a ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_filter})}><ha-icon icon="mdi:hydro-power"></ha-icon></div>
            <div class="btn ${led.a ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_light})}><ha-icon icon="mdi:lightbulb"></ha-icon></div>
          </div>
        ` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { background-size: cover; background-position: center; height: 550px; position: relative; color: white; border-radius: 20px; overflow: hidden; }
    .header { position: absolute; top: 15px; left: 20px; font-weight: 900; font-size: 1.1em; text-shadow: 2px 2px 4px black; color: #00d4ff; text-transform: uppercase; }
    .glass { position: absolute; background: rgba(0,0,0,0.65); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 12px; padding: 10px; border: 1px solid rgba(255,255,255,0.1); min-width: 160px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
    .titre { font-size: 0.5em; color: #00d4ff; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 5px; border-bottom: 1px solid rgba(0,212,255,0.2); }
    .row { display: flex; align-items: center; gap: 6px; font-size: 0.8em; font-weight: bold; margin-top: 3px; }
    .btns { position: absolute; display: flex; flex-direction: column; gap: 10px; }
    .btn { background: rgba(0,0,0,0.7); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); transition: 0.3s; }
    .btn.on { background: #00d4ff; box-shadow: 0 0 15px #00d4ff; border: none; transform: scale(1.1); }
    .table-glass { min-width: 140px; padding: 8px; }
    table { width: 100%; font-size: 0.7em; border-collapse: collapse; }
    td { padding: 2px 0; font-weight: bold; }
    .ideal { text-align: right; color: #00ff88; }
    ha-icon { --mdc-icon-size: 18px; }
  `;
}

customElements.define("lumina-spa-card-editor", LuminaSpaEditor);
customElements.define("lumina-spa-card", LuminaSpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "lumina-spa-card", name: "Lumina SPA Hyperion", preview: true });
