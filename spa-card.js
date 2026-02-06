import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {}, _tab: { type: Number } }; }
  constructor() { super(); this._tab = 0; }
  setConfig(config) { this._config = config; }
  _selectTab(idx) { this._tab = idx; this.requestUpdate(); }
  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true, composed: true,
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const schemas = [
      [{ name: "card_title", label: "Titre", selector: { text: {} } }, { name: "background_image", label: "Fond (URL)", selector: { text: {} } }],
      [{ name: "show_top_bar", label: "Boutons?", selector: { boolean: {} } },
        ...Array.from({length: 8}, (_, i) => [{ name: `switch_${i+1}_entity`, label: `B${i+1} Entité`, selector: { entity: {} } }, { name: `switch_${i+1}_label`, label: `Nom`, selector: { text: {} } }]).flat()],
      [{ name: "entity_water_temp", label: "Eau", selector: { entity: {} } }, { name: "entity_ambient_temp", label: "Air", selector: { entity: {} } },
       { name: "pos_temp_x", label: "Temp X%", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_temp_y", label: "Temp Y%", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "entity_ph", label: "pH", selector: { entity: {} } }, { name: "entity_orp", label: "ORP", selector: { entity: {} } }, { name: "entity_bromine", label: "Brome", selector: { entity: {} } }, { name: "entity_alkalinity", label: "TAC", selector: { entity: {} } },
       { name: "pos_chem_x", label: "Chimie X%", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_chem_y", label: "Chimie Y%", selector: { number: { min: 0, max: 100, mode: "slider" } } }],
      [...Array.from({length: 14}, (_, i) => [{ name: `sys_entity_${i+1}`, label: `Entité ${i+1}`, selector: { entity: {} } }, { name: `sys_label_${i+1}`, label: `Nom`, selector: { text: {} } }]).flat(),
       { name: "pos_elec_x", label: "Système X%", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_elec_y", label: "Système Y%", selector: { number: { min: 0, max: 100, mode: "slider" } } }],
      [{ name: "camera_entity", label: "Caméra", selector: { entity: { domain: "camera" } } }, { name: "camera_width", label: "Largeur px", selector: { number: { min: 100, max: 500 } } },
       { name: "pos_cam_x", label: "Cam X%", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_cam_y", label: "Cam Y%", selector: { number: { min: 0, max: 100, mode: "slider" } } }],
      [{ name: "show_ideal_table", label: "Idéal?", selector: { boolean: {} } }, { name: "pos_ideal_x", label: "X%", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_ideal_y", label: "Y%", selector: { number: { min: 0, max: 100, mode: "slider" } } }]
    ];
    const tabs = ["Général", "Boutons", "Sondes", "Système", "Caméra", "Idéal"];
    return html`
      <div class="tabs">${tabs.map((n, i) => html`<div class="tab ${this._tab === i ? 'active' : ''}" @click=${() => this._selectTab(i)}>${n}</div>`)}</div>
      <ha-form .hass=${this.hass} .data=${this._config} .schema=${schemas[this._tab]} @value-changed=${this._valueChanged}></ha-form>
    `;
  }
  static styles = css`.tabs{display:flex;flex-wrap:wrap;gap:2px;margin-bottom:8px}.tab{padding:4px 8px;background:#444;color:#fff;border-radius:4px;cursor:pointer;font-size:9px}.tab.active{background:#00f9f9;color:#000;font-weight:700}`;
}

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }
  _getState(id) {
    if (!this.hass || !id || !this.hass.states[id]) return { val: '?', unit: '', active: false, icon: 'mdi:circle-outline' };
    const s = this.hass.states[id];
    return { val: !isNaN(s.state) ? parseFloat(s.state).toFixed(1) : s.state, unit: s.attributes.unit_of_measurement || '', icon: s.attributes.icon || 'mdi:circle-outline', active: !['off', 'unavailable', 'unknown', 'standby'].includes(s.state.toLowerCase()) };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const sys = [];
    for (let i = 1; i <= 14; i++) {
      if (c[`sys_entity_${i}`]) {
        const s = this._getState(c[`sys_entity_${i}`]);
        sys.push(html`<div class="sys-i"><ha-icon icon="${s.icon}" class="${s.active ? 'n' : ''}"></ha-icon><span>${c[`sys_label_${i}`]}: ${s.val}</span></div>`);
      }
    }
    const btns = [];
    for (let i = 1; i <= 8; i++) {
      if (c[`switch_${i}_entity`]) {
        const s = this._getState(c[`switch_${i}_entity`]);
        btns.push(html`<div class="sw ${s.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c[`switch_${i}_entity`]})}>${c[`switch_${i}_label`] || 'S'+i}</div>`);
      }
    }

    return html`
      <ha-card style="background-image: url('${c.background_image || ''}');">
        <div class="t">${c.card_title || 'SPA'}</div>
        <div class="btns-g">${btns}</div>

        <div class="gb" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 12}%;">
          <div class="bh">TEMP</div>
          <div class="bb"><ha-icon icon="mdi:thermometer"></ha-icon> ${this._getState(c.entity_water_temp).val}° | <ha-icon icon="mdi:air-filter"></ha-icon> ${this._getState(c.entity_ambient_temp).val}°</div>
        </div>

        <div class="gb" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 22}%;">
          <div class="bh">CHIMIE</div>
          <div class="bb">pH:${this._getState(c.entity_ph).val} ORP:${this._getState(c.entity_orp).val}</div>
          <div class="bb">Br:${this._getState(c.entity_bromine).val} TAC:${this._getState(c.entity_alkalinity).val}</div>
        </div>

        <div class="gb" style="left:${c.pos_elec_x || 5}%; top:${c.pos_elec_y || 34}%; min-width:210px;">
          <div class="bh">SYSTÈME</div>
          <div class="sys-g">${sys}</div>
        </div>

        ${c.camera_entity ? html`<div class="gb" style="left:${c.pos_cam_x || 5}%; top:${c.pos_cam_y || 68}%; width:${c.camera_width || 180}px; padding:2px;"><hui-image .hass=${this.hass} .cameraImage=${c.camera_entity} cameraView="live"></hui-image></div>` : ''}

        ${c.show_ideal_table !== false ? html`<div class="gb" style="left:${c.pos_ideal_x || 70}%; top:${c.pos_ideal_y || 34}%;">
          <div class="bh">CIBLES</div>
          <div class="id"><span>pH</span><span>7.4</span></div>
          <div class="id"><span>Br</span><span>4.0</span></div>
        </div>` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { height: 550px; background-size: cover; border: 2px solid #00f9f9; border-radius: 15px; overflow: hidden; position: relative; color: #fff; font-size: 10px; }
    .t { position: absolute; top: 5px; left: 10px; font-weight: 900; color: #00f9f9; font-size: 10px; }
    .btns-g { position: absolute; top: 22px; left: 5px; right: 5px; display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; }
    .sw { background: rgba(0,0,0,0.8); border: 1px solid #00f9f9; border-radius: 4px; padding: 2px; text-align: center; cursor: pointer; font-size: 7px; text-transform: uppercase; }
    .sw.on { background: rgba(0,249,249,0.4); box-shadow: 0 0 5px #00f9f9; }
    .gb { position: absolute; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); border: 1px solid #00f9f9; border-radius: 10px; padding: 5px; min-width: 130px; }
    .bh { color: #00f9f9; font-size: 8px; font-weight: 700; border-bottom: 1px solid rgba(0,249,249,0.2); margin-bottom: 3px; }
    .bb { display: flex; align-items: center; gap: 4px; font-weight: 700; margin-bottom: 1px; }
    .sys-g { display: grid; grid-template-columns: 1fr 1fr; gap: 1px 5px; }
    .sys-i { display: flex; align-items: center; font-size: 9px; }
    .id { display: flex; justify-content: space-between; color: #00ff88; font-size: 9px; }
    .n { color: #00f9f9; filter: drop-shadow(0 0 2px #00f9f9); }
    ha-icon { --mdc-icon-size: 12px; margin-right: 2px; }
  `;
}

customElements.define("spa-card-editor", SpaCardEditor);
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA ULTRA COMPACT 550", preview: true });
