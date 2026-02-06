import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

/**
 * ÉDITEUR AVEC ONGLETS ET 14 ENTITÉS
 */
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {}, _tab: {} }; }
  
  setConfig(config) { 
    this._config = config; 
    this._tab = 0; // Onglet par défaut
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true,
    }));
  }

  _selectTab(idx) { this._tab = idx; this.requestUpdate(); }

  render() {
    if (!this.hass || !this._config) return html``;

    // Définition des schémas par onglet
    const schemas = [
      // Onglet 0: Général
      [
        { name: "card_title", label: "Titre de la Carte", selector: { text: {} } },
        { name: "background_image", label: "Image de fond (URL)", selector: { text: {} } },
      ],
      // Onglet 1: Boutons du haut
      [
        { name: "show_top_bar", label: "Afficher la barre ?", selector: { boolean: {} } },
        ...Array.from({length: 8}, (_, i) => [
          { name: `switch_${i+1}_entity`, label: `Bouton ${i+1} : Entité`, selector: { entity: {} } },
          { name: `switch_${i+1}_label`, label: `Bouton ${i+1} : Nom`, selector: { text: {} } }
        ]).flat()
      ],
      // Onglet 2: Temp & Chimie
      [
        { name: "title_temp", label: "Titre Bloc Température", selector: { text: {} } },
        { name: "entity_water_temp", label: "Sonde Eau", selector: { entity: {} } },
        { name: "entity_ambient_temp", label: "Sonde Air", selector: { entity: {} } },
        { name: "pos_temp_x", label: "Positions X / Y", type: "grid", schema: [
            { name: "pos_temp_x", label: "X %", selector: { number: { min: 0, max: 100 } } },
            { name: "pos_temp_y", label: "Y %", selector: { number: { min: 0, max: 100 } } }
        ]},
        { name: "entity_ph", label: "pH", selector: { entity: {} } },
        { name: "entity_orp", label: "ORP", selector: { entity: {} } },
        { name: "entity_bromine", label: "Brome", selector: { entity: {} } },
        { name: "entity_alkalinity", label: "TAC", selector: { entity: {} } },
        { name: "pos_chem_x", label: "Positions X / Y", type: "grid", schema: [
            { name: "pos_chem_x", label: "X %", selector: { number: { min: 0, max: 100 } } },
            { name: "pos_chem_y", label: "Y %", selector: { number: { min: 0, max: 100 } } }
        ]}
      ],
      // Onglet 3: Système (Les 14)
      [
        { name: "title_sys", label: "Titre Bloc Système", selector: { text: {} } },
        ...Array.from({length: 14}, (_, i) => [
          { name: `sys_entity_${i+1}`, label: `Entité ${i+1}`, selector: { entity: {} } },
          { name: `sys_label_${i+1}`, label: `Nom court ${i+1}`, selector: { text: {} } }
        ]).flat(),
        { name: "pos_sys_x", type: "grid", schema: [
            { name: "pos_elec_x", label: "Pos X %", selector: { number: { min: 0, max: 100 } } },
            { name: "pos_elec_y", label: "Pos Y %", selector: { number: { min: 0, max: 100 } } }
        ]}
      ],
      // Onglet 4: Idéal
      [
        { name: "show_ideal_table", label: "Afficher Bloc Idéal", selector: { boolean: {} } },
        { name: "pos_ideal_x", label: "X %", selector: { number: { min: 0, max: 100 } } },
        { name: "pos_ideal_y", label: "Y %", selector: { number: { min: 0, max: 100 } } }
      ]
    ];

    const tabs = ["Général", "Boutons", "Temp/Chim", "Système", "Idéal"];

    return html`
      <div class="tabs">
        ${tabs.map((t, i) => html`
          <button class="${this._tab === i ? 'active' : ''}" @click=${() => this._selectTab(i)}>${t}</button>
        `)}
      </div>
      <div class="content">
        <ha-form .hass=${this.hass} .data=${this._config} .schema=${schemas[this._tab]} @value-changed=${this._valueChanged}></ha-form>
      </div>
    `;
  }

  static styles = css`
    .tabs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 10px; }
    button { background: #222; color: #fff; border: 1px solid #444; padding: 6px 10px; cursor: pointer; border-radius: 4px; font-size: 11px; }
    button.active { background: #00f9f9; color: #000; border-color: #00f9f9; font-weight: bold; }
    .content { padding: 5px; }
  `;
}

/**
 * CARTE SPA PRINCIPALE
 */
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }

  _getState(entityId) {
    if (!this.hass || !entityId || !this.hass.states[entityId]) return { val: '?', unit: '', active: false, icon: 'mdi:help-circle' };
    const s = this.hass.states[entityId];
    const raw = s.state;
    const isNumeric = !isNaN(parseFloat(raw)) && isFinite(raw);
    return {
      val: isNumeric ? parseFloat(raw).toFixed(1) : raw,
      unit: s.attributes.unit_of_measurement || '',
      icon: s.attributes.icon || 'mdi:checkbox-blank-circle-outline',
      active: !['off', 'unavailable', 'unknown', 'standby', 'none'].includes(raw.toLowerCase())
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    const sysItems = [];
    for (let i = 1; i <= 14; i++) {
      const ent = c[`sys_entity_${i}`];
      if (ent) {
        const s = this._getState(ent);
        sysItems.push(html`
          <div class="sys-item">
            <ha-icon icon="${s.icon}" class="${s.active ? 'neon-text' : ''}"></ha-icon>
            <span class="sys-label">${c[`sys_label_${i}`] || ''}:</span>
            <span class="sys-value">${s.val}${s.unit}</span>
          </div>
        `);
      }
    }

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
        <div class="glass-header">${c.card_title || 'SPA CONTROL'}</div>
        ${c.show_top_bar !== false ? html`<div class="top-grid">${topButtons}</div>` : ''}

        <div class="glass-box" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 20}%;">
          <div class="box-title">${c.title_temp || 'TEMPERATURES'}</div>
          <div class="box-row"><ha-icon icon="mdi:thermometer-water"></ha-icon> ${this._getState(c.entity_water_temp).val}° | <ha-icon icon="mdi:weather-windy"></ha-icon> ${this._getState(c.entity_ambient_temp).val}°</div>
        </div>

        <div class="glass-box" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 32}%;">
          <div class="box-title">CHIMIE</div>
          <div class="box-row">pH: ${this._getState(c.entity_ph).val} | ORP: ${this._getState(c.entity_orp).val}</div>
          <div class="box-row">Br: ${this._getState(c.entity_bromine).val} | TAC: ${this._getState(c.entity_alkalinity).val}</div>
        </div>

        <div class="glass-box sys-box" style="left:${c.pos_elec_x || 5}%; top:${c.pos_elec_y || 45}%;">
          <div class="box-title">${c.title_sys || 'SYSTÈME'}</div>
          <div class="sys-grid">${sysItems}</div>
        </div>

        ${c.show_ideal_table !== false ? html`
        <div class="glass-box" style="left:${c.pos_ideal_x || 62}%; top:${c.pos_ideal_y || 45}%;">
          <div class="box-title">IDÉAL</div>
          <div class="box-row-ideal"><span>pH</span> <span>7.2-7.6</span></div>
          <div class="box-row-ideal"><span>Brome</span> <span>3.0-5.0</span></div>
          <div class="box-row-ideal"><span>TAC</span> <span>80-120</span></div>
        </div>` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { height: 680px; background-size: cover; border: 3px solid #00f9f9; border-radius: 25px; position: relative; overflow: hidden; color: white; }
    .glass-header { position: absolute; top: 12px; left: 20px; font-weight: 900; color: #00f9f9; letter-spacing: 2px; text-transform: uppercase; }
    .top-grid { position: absolute; top: 45px; left: 10px; right: 10px; display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px; }
    .sw-item { background: rgba(0,0,0,0.7); border: 1px solid #00f9f9; border-radius: 8px; padding: 5px 2px; text-align: center; cursor: pointer; transition: 0.3s; }
    .sw-item.active { background: rgba(0,249,249,0.4); box-shadow: 0 0 10px #00f9f9; }
    .sw-text { font-size: 0.5em; font-weight: bold; margin-bottom: 2px; }
    .glass-box { position: absolute; background: rgba(0,0,0,0.65); backdrop-filter: blur(15px); border: 1px solid #00f9f9; border-radius: 15px; padding: 10px; min-width: 170px; }
    .box-title { color: #00f9f9; font-size: 0.6em; font-weight: bold; border-bottom: 1px solid rgba(0,249,249,0.3); margin-bottom: 5px; }
    .box-row { display: flex; align-items: center; gap: 8px; font-size: 0.8em; font-weight: bold; }
    .sys-box { min-width: 240px; }
    .sys-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; }
    .sys-item { display: flex; align-items: center; font-size: 0.65em; font-weight: bold; }
    .sys-label { color: #aaa; margin: 0 4px; }
    .box-row-ideal { display: flex; justify-content: space-between; font-size: 0.7em; font-weight: bold; color: #00ff88; margin-bottom: 2px; }
    .neon-text { color: #00f9f9; text-shadow: 0 0 5px #00f9f9; }
    ha-icon { --mdc-icon-size: 14px; }
  `;
}

customElements.define("spa-card-editor", SpaCardEditor);
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA Tabbed Professional", preview: true });
