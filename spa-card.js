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
      // GÉNÉRAL
      [{ name: "card_title", label: "Titre", selector: { text: {} } }, 
       { name: "title_align", label: "Alignement Titre", selector: { select: { options: [
         {value: "left", label: "Gauche"}, {value: "center", label: "Milieu"}, {value: "right", label: "Droite"}
       ] } } },
       { name: "title_size", label: "Taille Titre (px)", selector: { number: { min: 8, max: 50 } } },
       { name: "background_image", label: "Image fond (URL)", selector: { text: {} } }],
      // BOUTONS (8)
      [{ name: "btn_y", label: "Position Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "btn_w", label: "Largeur totale (%)", selector: { number: { min: 10, max: 100 } } }, 
       { name: "btn_h", label: "Hauteur Boutons (px)", selector: { number: { min: 20, max: 200 } } }, 
       { name: "btn_fs", label: "Taille texte boutons", selector: { number: { min: 6, max: 25 } } },
        ...Array.from({length: 8}, (_, i) => [
          { name: `switch_${i+1}_entity`, label: `B${i+1} Entité`, selector: { entity: {} } },
          { name: `switch_${i+1}_label`, label: `Nom`, selector: { text: {} } },
          { name: `switch_${i+1}_icon`, label: `Icone`, selector: { icon: {} } }
        ]).flat()],
      // SONDES (TEMP + CHIMIE COMPLÈTE)
      [{ name: "entity_water_temp", label: "Eau", selector: { entity: {} } }, { name: "entity_ambient_temp", label: "Air", selector: { entity: {} } },
       { name: "temp_fs", label: "Taille texte Temp (px)", selector: { number: { min: 8, max: 35 } } }, 
       { name: "pos_temp_x", label: "Temp X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, 
       { name: "pos_temp_y", label: "Temp Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "temp_w", label: "Largeur px", selector: { number: { min: 50, max: 400 } } }, { name: "temp_h", label: "Hauteur px", selector: { number: { min: 30, max: 300 } } },
       { name: "entity_ph", label: "pH", selector: { entity: {} } }, { name: "entity_orp", label: "ORP", selector: { entity: {} } }, 
       { name: "entity_bromine", label: "Brome", selector: { entity: {} } }, { name: "entity_alkalinity", label: "TAC", selector: { entity: {} } },
       { name: "chem_fs", label: "Taille texte Chimie (px)", selector: { number: { min: 8, max: 35 } } },
       { name: "pos_chem_x", label: "Chimie X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, 
       { name: "pos_chem_y", label: "Chimie Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "chem_w", label: "W px", selector: { number: { min: 100, max: 500 } } }, { name: "chem_h", label: "H px", selector: { number: { min: 50, max: 400 } } }],
      // SYSTÈME (14)
      [...Array.from({length: 14}, (_, i) => [
          { name: `sys_entity_${i+1}`, label: `Entité ${i+1}`, selector: { entity: {} } },
          { name: `sys_label_${i+1}`, label: `Nom`, selector: { text: {} } },
          { name: `sys_icon_${i+1}`, label: `Icone`, selector: { icon: {} } }
        ]).flat(),
       { name: "sys_fs", label: "Taille texte (px)", selector: { number: { min: 8, max: 30 } } }, 
       { name: "pos_elec_x", label: "X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, 
       { name: "pos_elec_y", label: "Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "sys_w", label: "W px", selector: { number: { min: 100, max: 600 } } }, { name: "sys_h", label: "H px", selector: { number: { min: 50, max: 500 } } }],
      // CAMÉRA
      [{ name: "camera_entity", label: "Caméra", selector: { entity: { domain: "camera" } } }, 
       { name: "pos_cam_x", label: "X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, 
       { name: "pos_cam_y", label: "Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, 
       { name: "camera_width", label: "W px", selector: { number: { min: 100, max: 600 } } }, { name: "camera_height", label: "H px", selector: { number: { min: 100, max: 600 } } }],
      // IDÉAL
      [{ name: "show_ideal_table", label: "Idéal?", selector: { boolean: {} } }, 
       { name: "ideal_fs", label: "Taille texte (px)", selector: { number: { min: 8, max: 30 } } }, 
       { name: "pos_ideal_x", label: "X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, 
       { name: "pos_ideal_y", label: "Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }]
    ];
    const tabs = ["Général", "Boutons", "Sondes", "Système", "Caméra", "Idéal"];
    return html`<div class="tabs">${tabs.map((n, i) => html`<div class="tab ${this._tab === i ? 'active' : ''}" @click=${() => this._selectTab(i)}>${n}</div>`)}</div><ha-form .hass=${this.hass} .data=${this._config} .schema=${schemas[this._tab]} @value-changed=${this._valueChanged}></ha-form>`;
  }
  static styles = css`.tabs{display:flex;flex-wrap:wrap;gap:2px;margin-bottom:8px}.tab{padding:4px 8px;background:#444;color:#fff;border-radius:4px;cursor:pointer;font-size:9px}.tab.active{background:#00f9f9;color:#000;font-weight:700}`;
}

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }
  
  _getState(id, customIcon) {
    if (!this.hass || !id || !this.hass.states[id]) return { val: '?', unit: '', active: false, icon: customIcon || 'mdi:circle-outline' };
    const s = this.hass.states[id];
    const val = !isNaN(s.state) ? parseFloat(s.state).toFixed(1) : s.state;
    const unit = s.attributes.unit_of_measurement || '';
    const icon = customIcon || s.attributes.icon || 'mdi:circle-outline';
    return { val, unit, icon, active: !['off', 'unavailable', 'unknown', 'standby'].includes(s.state.toLowerCase()) };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const sys = [];
    for (let i = 1; i <= 14; i++) {
      if (c[`sys_entity_${i}`]) {
        const s = this._getState(c[`sys_entity_${i}`], c[`sys_icon_${i}`]);
        sys.push(html`<div class="sys-i" style="font-size:${c.sys_fs || 10}px;"><ha-icon icon="${s.icon}" class="${s.active ? 'n' : ''}" style="--mdc-icon-size:${(c.sys_fs || 10) * 1.3}px"></ha-icon><span>${c[`sys_label_${i}`] || ''}: ${s.val}${s.unit}</span></div>`);
      }
    }
    const btns = [];
    for (let i = 1; i <= 8; i++) {
      if (c[`switch_${i}_entity`]) {
        const s = this._getState(c[`switch_${i}_entity`], c[`switch_${i}_icon`]);
        btns.push(html`<div class="sw ${s.active ? 'on' : ''}" style="font-size:${c.btn_fs || 8}px;" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c[`switch_${i}_entity`]})}>
          <ha-icon icon="${s.icon}" style="--mdc-icon-size:${(c.btn_fs || 8) * 1.8}px"></ha-icon><div>${c[`switch_${i}_label`] || 'S'+i}</div>
        </div>`);
      }
    }
    const titleAlign = c.title_align === 'center' ? 'left: 50%; transform: translateX(-50%);' : c.title_align === 'right' ? 'right: 15px;' : 'left: 15px;';

    return html`
      <ha-card style="background-image: url('${c.background_image || ''}');">
        <div class="t" style="font-size:${c.title_size || 15}px; ${titleAlign}">${c.card_title || 'SPA CONTROL'}</div>
        <div class="btns-g" style="width:${c.btn_w || 98}%; height:${c.btn_h || 50}px; top:${c.btn_y || 12}%;">${btns}</div>

        <div class="gb" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 25}%; width:${c.temp_w || 160}px; height:${c.temp_h || 70}px; font-size:${c.temp_fs || 12}px;">
          <div class="bh">TEMPERATURES</div>
          <div class="bb"><ha-icon icon="mdi:thermometer"></ha-icon> EAU: ${this._getState(c.entity_water_temp).val}${this._getState(c.entity_water_temp).unit}</div>
          <div class="bb"><ha-icon icon="mdi:weather-windy"></ha-icon> AIR: ${this._getState(c.entity_ambient_temp).val}${this._getState(c.entity_ambient_temp).unit}</div>
        </div>

        <div class="gb" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 40}%; width:${c.chem_w || 220}px; height:${c.chem_h || 110}px; font-size:${c.chem_fs || 12}px;">
          <div class="bh">CHIMIE</div>
          <div class="chem-grid">
             <div class="bb"><span>pH:</span><span class="n">${this._getState(c.entity_ph).val}</span></div>
             <div class="bb"><span>ORP:</span><span class="n">${this._getState(c.entity_orp).val}${this._getState(c.entity_orp).unit}</span></div>
             <div class="bb"><span>Br:</span><span class="n">${this._getState(c.entity_bromine).val}${this._getState(c.entity_bromine).unit}</span></div>
             <div class="bb"><span>TAC:</span><span class="n">${this._getState(c.entity_alkalinity).val}${this._getState(c.entity_alkalinity).unit}</span></div>
          </div>
        </div>

        <div class="gb" style="left:${c.pos_elec_x || 50}%; top:${c.pos_elec_y || 25}%; width:${c.sys_w || 260}px; height:${c.sys_h || 200}px;">
          <div class="bh">SYSTÈME</div>
          <div class="sys-g">${sys}</div>
        </div>

        ${c.camera_entity ? html`<div class="gb" style="left:${c.pos_cam_x || 50}%; top:${c.pos_cam_y || 65}%; width:${c.camera_width || 250}px; height:${c.camera_height || 150}px; padding:2px;"><hui-image .hass=${this.hass} .cameraImage=${c.camera_entity} cameraView="live"></hui-image></div>` : ''}

        ${c.show_ideal_table !== false ? html`<div class="gb" style="left:${c.pos_ideal_x || 5}%; top:${c.pos_ideal_y || 65}%; font-size:${c.ideal_fs || 11}px;">
          <div class="bh">CIBLES IDÉALES</div>
          <div class="id"><span>pH</span><span>7.2 - 7.6</span></div>
          <div class="id"><span>ORP</span><span>650 - 750 mV</span></div>
          <div class="id"><span>Brome</span><span>3 - 5 mg/L</span></div>
          <div class="id"><span>TAC</span><span>80 - 120</span></div>
        </div>` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { height: 600px; background-size: cover; background-position: center; border: 2px solid #00f9f9; border-radius: 15px; overflow: hidden; position: relative; color: #fff; font-family: 'Roboto', sans-serif; }
    .t { position: absolute; top: 10px; font-weight: 900; color: #00f9f9; text-transform: uppercase; white-space: nowrap; }
    .btns-g { position: absolute; left: 1%; display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px; }
    .sw { background: rgba(0,0,0,0.8); border: 1px solid #00f9f9; border-radius: 6px; text-align: center; cursor: pointer; font-weight: bold; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2px; }
    .sw.on { background: rgba(0,249,249,0.4); box-shadow: 0 0 8px #00f9f9; }
    .gb { position: absolute; background: rgba(0,0,0,0.75); border: 1px solid #00f9f9; border-radius: 10px; padding: 10px; overflow: hidden; }
    .bh { color: #00f9f9; font-size: 10px; font-weight: 900; border-bottom: 1px solid rgba(0,249,249,0.3); margin-bottom: 8px; text-transform: uppercase; }
    .bb { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-weight: 700; margin-bottom: 4px; }
    .chem-grid { display: grid; grid-template-columns: 1fr; }
    .sys-g { display: grid; grid-template-columns: 1fr; gap: 3px; overflow-y: auto; height: calc(100% - 25px); }
    .sys-i { display: flex; align-items: center; white-space: nowrap; }
    .id { display: flex; justify-content: space-between; gap: 20px; color: #00ff88; font-weight: bold; margin-bottom: 3px; }
    .n { color: #00f9f9; text-shadow: 0 0 3px #00f9f9; }
    ha-icon { --mdc-icon-size: 16px; margin-right: 5px; }
    hui-image { width: 100%; height: 100%; object-fit: cover; border-radius: 5px; }
  `;
}

customElements.define("spa-card-editor", SpaCardEditor);
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA FINAL UNLIMITED", preview: true });
