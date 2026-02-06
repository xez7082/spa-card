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
    // On propage le changement immédiatement
    const event = new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
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
        name: "entities", label: "Entités", type: "grid", schema: [
          { name: "entity_water_temp", label: "Température", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_power", label: "Puissance", selector: { entity: { domain: "sensor" } } },
          { name: "entity_tds", label: "TDS / Sel", selector: { entity: { domain: "sensor" } } },
          { name: "entity_lsi", label: "LSI", selector: { entity: { domain: "sensor" } } },
        ]
      },
      {
        name: "switches", label: "Boutons", type: "grid", schema: [
          { name: "switch_bubbles", label: "Bulles", selector: { entity: {} } },
          { name: "switch_filter", label: "Filtre", selector: { entity: {} } },
          { name: "switch_light", label: "LED", selector: { entity: {} } },
        ]
      },
      { name: "pos_temp_x", label: "Temp X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_temp_y", label: "Temp Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_chem_x", label: "Chimie X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_chem_y", label: "Chimie Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_anal_x", label: "Analyse X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_anal_y", label: "Analyse Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_energy_x", label: "NRJ X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_energy_y", label: "NRJ Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_btn_x", label: "Boutons X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_btn_y", label: "Boutons Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
    ];

    return html`<ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form>`;
  }
}

class LuminaSpaCard extends LitElement {
  static getConfigElement() { return document.createElement("lumina-spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }

  setConfig(config) {
    // Création d'une copie propre de la config pour forcer le refresh
    this.config = JSON.parse(JSON.stringify(config));
  }

  _getState(ent) {
    if (!this.hass || !ent || !this.hass.states[ent]) return { s: '--', u: '', a: false, v: 0 };
    const o = this.hass.states[ent];
    return { s: o.state, u: o.attributes.unit_of_measurement || '', a: o.state === 'on', v: parseFloat(o.state) };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    const water = this._getState(c.entity_water_temp);
    const ph = this._getState(c.entity_ph);
    const orp = this._getState(c.entity_orp);
    const pwr = this._getState(c.entity_power);
    const tds = this._getState(c.entity_tds);
    const lsi = this._getState(c.entity_lsi);
    const bub = this._getState(c.switch_bubbles);
    const fil = this._getState(c.switch_filter);
    const led = this._getState(c.switch_light);

    return html`
      <ha-card style="background-image: url('${c.background_image || '/local/sparond.png'}');">
        <div class="header">${c.card_title || 'MON SPA'}</div>

        <div class="glass" style="left:${c.pos_temp_x || 10}%; top:${c.pos_temp_y || 15}%;">
          <div class="titre">TEMPÉRATURE</div>
          <div class="row"><ha-icon icon="mdi:thermometer"></ha-icon> ${water.s}${water.u}</div>
        </div>

        <div class="glass" style="left:${c.pos_chem_x || 10}%; top:${c.pos_chem_y || 35}%;">
          <div class="titre">CHIMIE</div>
          <div class="row"><ha-icon icon="mdi:ph"></ha-icon> ${ph.s}</div>
          <div class="row"><ha-icon icon="mdi:test-tube"></ha-icon> ${orp.s}</div>
        </div>

        <div class="glass" style="left:${c.pos_anal_x || 10}%; top:${c.pos_anal_y || 58}%;">
          <div class="titre">SANTÉ DE L'EAU</div>
          <div class="row"><ha-icon icon="mdi:waves"></ha-icon> LSI: ${lsi.s}</div>
          <div class="row"><ha-icon icon="mdi:opacity"></ha-icon> TDS: ${tds.s}</div>
        </div>

        <div class="glass" style="left:${c.pos_energy_x || 10}%; top:${c.pos_energy_y || 80}%;">
          <div class="titre">ÉNERGIE</div>
          <div class="row"><ha-icon icon="mdi:lightning-bolt"></ha-icon>${pwr.s}${pwr.u}</div>
        </div>

        <div class="btns" style="left:${c.pos_btn_x || 60}%; top:${c.pos_btn_y || 80}%;">
          <div class="btn ${bub.a ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_bubbles})}><ha-icon icon="mdi:airbubble"></ha-icon></div>
          <div class="btn ${fil.a ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_filter})}><ha-icon icon="mdi:hydro-power"></ha-icon></div>
          <div class="btn ${led.a ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c.switch_light})}><ha-icon icon="mdi:lightbulb"></ha-icon></div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { background-size: cover; background-position: center; height: 500px; position: relative; color: white; border-radius: 20px; overflow: hidden; border: none; }
    .header { position: absolute; top: 20px; left: 20px; font-weight: bold; font-size: 1.4em; text-shadow: 2px 2px 4px black; z-index: 10; }
    .glass { position: absolute; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); border-radius: 10px; padding: 8px; border: 1px solid rgba(255,255,255,0.1); min-width: 90px; }
    .titre { font-size: 0.55em; color: #00d4ff; font-weight: bold; letter-spacing: 1px; }
    .row { display: flex; align-items: center; gap: 5px; font-size: 0.85em; font-weight: bold; margin-top: 3px; }
    .btns { position: absolute; display: flex; gap: 8px; }
    .btn { background: rgba(0,0,0,0.6); width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.3); transition: 0.3s; }
    .btn.on { background: #00d4ff; box-shadow: 0 0 15px #00d4ff; border: none; }
    ha-icon { --mdc-icon-size: 18px; }
  `;
}

customElements.define("lumina-spa-card-editor", LuminaSpaEditor);
customElements.define("lumina-spa-card", LuminaSpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "lumina-spa-card", name: "Lumina SPA Pro", preview: true });
