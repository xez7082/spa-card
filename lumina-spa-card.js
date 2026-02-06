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
      // SECTION CAPTEURS
      { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
      { name: "entity_power", label: "Puissance Totale (W)", selector: { entity: { domain: "sensor" } } },
      { name: "entity_amp", label: "Ampérage SPA (A)", selector: { entity: { domain: "sensor" } } },
      { name: "entity_current", label: "Intensité Courante (A)", selector: { entity: { domain: "sensor" } } },
      { name: "entity_vac_current", label: "Aspirateur Current (A)", selector: { entity: { domain: "sensor" } } },
      // SECTION MULTIMEDIA / DOMOTIQUE
      { name: "entity_tv", label: "Télévision", selector: { entity: { domain: ["media_player", "switch"] } } },
      { name: "entity_alexa", label: "Alexa", selector: { entity: { domain: ["media_player", "switch"] } } },
      // SWITCHS SPA
      { name: "switch_bubbles", label: "Switch Bulles", selector: { entity: {} } },
      { name: "switch_filter", label: "Switch Filtration", selector: { entity: {} } },
      { name: "switch_light", label: "Switch Lumière", selector: { entity: {} } },
      // POSITIONS (Slider X/Y pour chaque bloc)
      { name: "pos_temp_x", label: "Temp X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_temp_y", label: "Temp Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_elec_x", label: "Élec X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_elec_y", label: "Élec Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_multi_x", label: "Multimedia X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_multi_y", label: "Multimedia Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
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
    const pwr = this._get(c.entity_power);
    const amp = this._get(c.entity_amp);
    const cur = this._get(c.entity_current);
    const vac = this._get(c.entity_vac_current);
    const tv = this._get(c.entity_tv);
    const alexa = this._get(c.entity_alexa);
    const bub = this._get(c.switch_bubbles);
    const fil = this._get(c.switch_filter);
    const led = this._get(c.switch_light);

    return html`
      <ha-card style="background-image: url('${c.background_image || '/local/sparond.png'}');">
        <div class="header">${c.card_title || 'ULTIMATE SPA CONTROL'}</div>

        <div class="glass" style="left:${c.pos_temp_x || 10}%; top:${c.pos_temp_y || 15}%;">
          <div class="titre">EAU</div>
          <div class="row"><ha-icon icon="mdi:thermometer"></ha-icon> ${water.s}${water.u}</div>
        </div>

        <div class="glass" style="left:${c.pos_elec_x || 10}%; top:${c.pos_elec_y || 35}%;">
          <div class="titre">ÉNERGIE & AMPÉRAGE</div>
          <div class="row"><ha-icon icon="mdi:lightning-bolt"></ha-icon> ${pwr.s}W</div>
          <div class="row"><ha-icon icon="mdi:current-ac"></ha-icon> Spa: ${amp.s}A</div>
          <div class="row"><ha-icon icon="mdi:sine-wave"></ha-icon> Courant: ${cur.s}A</div>
          <div class="row"><ha-icon icon="mdi:vacuum"></ha-icon> Aspi: ${vac.s}A</div>
        </div>

        <div class="glass" style="left:${c.pos_multi_x || 10}%; top:${c.pos_multi_y || 65}%;">
          <div class="titre">MULTIMEDIA</div>
          <div class="row"><ha-icon icon="mdi:television" style="color:${tv.a ? '#00d4ff' : 'white'}"></ha-icon> TV: ${tv.s}</div>
          <div class="row"><ha-icon icon="mdi:google-assistant" style="color:${alexa.a ? '#00d4ff' : 'white'}"></ha-icon> Alexa: ${alexa.s}</div>
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
    ha-card { background-size: cover; background-position: center; height: 550px; position: relative; color: white; border-radius: 20px; overflow: hidden; border: none; }
    .header { position: absolute; top: 20px; left: 20px; font-weight: bold; font-size: 1.2em; text-shadow: 2px 2px 4px black; z-index: 10; letter-spacing: 1px; }
    .glass { position: absolute; background: rgba(0,0,0,0.55); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 12px; padding: 10px; border: 1px solid rgba(255,255,255,0.1); min-width: 120px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    .titre { font-size: 0.5em; color: #00d4ff; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px; }
    .row { display: flex; align-items: center; gap: 7px; font-size: 0.85em; font-weight: bold; margin-top: 3px; }
    .btns { position: absolute; display: flex; gap: 10px; }
    .btn { background: rgba(0,0,0,0.6); width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); transition: 0.3s ease; }
    .btn.on { background: #00d4ff; box-shadow: 0 0 20px #00d4ff; border: none; color: white; }
    ha-icon { --mdc-icon-size: 19px; }
  `;
}

customElements.define("lumina-spa-card-editor", LuminaSpaEditor);
customElements.define("lumina-spa-card", LuminaSpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "lumina-spa-card", name: "Lumina SPA Ultimate", preview: true });
