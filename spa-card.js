import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V37
// ═══════════════════════════════════════════════════════════════════
class SpaCardEditor extends LitElement {

  static get properties() {
    return { hass: {}, _config: {}, _tab: { type: String }, _open: {} };
  }

  constructor() {
    super();
    this._tab = 'gen';
    this._open = new Set(['a-disp', 'a-temps', 'a-layzspa', 'a-ph', 'a-cdim']);
  }

  setConfig(config) { this._config = { ...config }; }

  _val(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: ev.detail.value },
      bubbles: true, composed: true
    }));
  }

  _tog(id) {
    const o = new Set(this._open);
    o.has(id) ? o.delete(id) : o.add(id);
    this._open = o;
  }

  _acc(id, color, icon, title, schema) {
    const open = this._open.has(id);
    return html`
      <div class="acc ${open ? 'open' : ''}">
        <div class="ach" @click=${() => this._tog(id)}>
          <div class="aibox" style="background:${color}22; color:${color};">${icon}</div>
          <span class="ach-title">${title}</span>
          <ha-icon class="arr" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="acb"><div class="acbi">
          <ha-form .hass=${this.hass} .data=${this._config}
            .schema=${schema} @value-changed=${this._val}>
          </ha-form>
        </div></div>
      </div>`;
  }

  _renderGen() {
    return html`${this._acc('a-disp','#6b8eff','🎨','Apparence générale',[
      { name:'card_title',       label:'Titre du spa',               selector:{ text:{} } },
      { name:'background_image', label:'Image de fond (URL)',         selector:{ text:{} } },
      { name:'card_height',      label:'Hauteur totale (ex: 640px)', selector:{ text:{} } },
      { name:'blur_amount',      label:'Intensité du flou (0–25)',   selector:{ number:{ mode:'slider', min:0, max:25 } } }
    ])}`;
  }

  _renderSens() {
    return html`
      ${this._acc('a-temps','#10b981','🌡️','Températures',[
        { name:'entity_water_temp',  label:'Temp. eau actuelle',  selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_target_temp', label:'Entité consigne',     selector:{ entity:{} } },
        { name:'target_temp_min',    label:'Consigne min (°C)',   selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'target_temp_max',    label:'Consigne max (°C)',   selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'entity_ext_temp',    label:'Temp. extérieure',    selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_spa_air_temp',label:'Temp. air spa',       selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_ext_hum',     label:'Humidité extérieure', selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_spa_hum',     label:'Humidité spa',        selector:{ entity:{ domain:'sensor' } } }
      ])}
      ${this._acc('a-layzspa','#f59e0b','🛁','LayZSpa — états & maintenance',[
        { name:'entity_lz_ready',        label:'Prêt (binary_sensor)',           selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_heater',       label:'Chauffage actif (binary_sensor)',selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_conn',         label:'Connexion WiFi (binary_sensor)', selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_filter',       label:'Âge filtre — jours',            selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_filter_max',          label:'Alerter filtre après (jours)',   selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_reset_filter', label:'Bouton reset filtre',            selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_chlorine',     label:'Âge chlore — jours',            selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_chlorine_max',        label:'Alerter chlore après (jours)',   selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_reset_chlore', label:'Bouton reset chlore',            selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_energy',       label:'Énergie totale kWh',             selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_lz_rssi',         label:'Signal WiFi RSSI',               selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_volume',              label:'Volume eau (litres)',             selector:{ number:{ mode:'box', min:100, max:5000 } } },
        { name:'lz_power_w',             label:'Puissance chauffe (W)',           selector:{ number:{ mode:'box', min:500, max:5000 } } },
        { name:'lz_heat_loss',           label:'Pertes thermiques (%)',           selector:{ number:{ mode:'slider', min:0, max:60 } } },
        { name:'entity_lz_schedule',     label:'Programmation (input_datetime)', selector:{ entity:{ domain:'input_datetime' } } },
        { name:'main_cons_entity',       label:'Sonde conso (W ou kWh)',          selector:{ entity:{} } }
      ])}
      ${this._acc('a-flood','#0ea5e9','💧',"Capteur d'inondation",[
        { name:'entity_water_leak', label:'Détecteur fuite eau', selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_tamper',     label:'Alerte sabotage',     selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_flood_bat',  label:'Batterie capteur (%)',selector:{ entity:{ domain:'sensor' } } }
      ])}`;
  }

  _renderChem() {
    return html`
      ${this._acc('a-ph','#8b5cf6','pH','pH',[
        { name:'entity_ph', label:'Entité pH',  selector:{ entity:{ domain:'sensor' } } },
        { name:'ph_min',    label:'pH Minimum', selector:{ number:{ step:0.1, mode:'box' } } },
        { name:'ph_max',    label:'pH Maximum', selector:{ number:{ step:0.1, mode:'box' } } }
      ])}
      ${this._acc('a-orp','#8b5cf6','ORP','ORP (mV)',[
        { name:'entity_orp', label:'Entité ORP',  selector:{ entity:{ domain:'sensor' } } },
        { name:'orp_min',    label:'ORP Minimum', selector:{ number:{ mode:'box' } } },
        { name:'orp_max',    label:'ORP Maximum', selector:{ number:{ mode:'box' } } }
      ])}
      ${this._acc('a-tds','#8b5cf6','TDS','TDS (ppm)',[
        { name:'entity_tds', label:'Entité TDS',  selector:{ entity:{ domain:'sensor' } } },
        { name:'tds_min',    label:'TDS Minimum', selector:{ number:{ mode:'box' } } },
        { name:'tds_max',    label:'TDS Maximum', selector:{ number:{ mode:'box' } } }
      ])}
      ${this._acc('a-salt','#8b5cf6','SEL','Sel (ppm)',[
        { name:'entity_salt', label:'Entité sel',  selector:{ entity:{ domain:'sensor' } } },
        { name:'salt_min',    label:'Sel Minimum', selector:{ number:{ mode:'box' } } },
        { name:'salt_max',    label:'Sel Maximum', selector:{ number:{ mode:'box' } } }
      ])}`;
  }

  _renderCamEditor() {
    return html`${this._acc('a-cdim','#0ea5e9','📷','Caméra & dimensions',[
      { name:'entity_camera', label:'Entité caméra',              selector:{ entity:{ domain:'camera' } } },
      { name:'cam_w_px',      label:'Largeur (px) — vide = 100%', selector:{ number:{ mode:'box', min:40, max:800 } } },
      { name:'cam_h_px',      label:'Hauteur (px)',               selector:{ number:{ mode:'box', min:40, max:800 } } },
      { name:'cam_radius',    label:'Arrondi coins (px)',          selector:{ number:{ mode:'slider', min:0, max:50 } } },
      { name:'cam_x',         label:'Décalage X (px)',             selector:{ number:{ mode:'box', min:-500, max:500 } } },
      { name:'cam_y',         label:'Décalage Y (px)',             selector:{ number:{ mode:'box', min:-500, max:500 } } }
    ])}`;
  }

  _renderSwEditor() {
    const schema = Array.from({ length:10 }, (_,i) => [
      { name:`switch_${i+1}`,      label:`Entité bouton ${i+1}`, selector:{ entity:{} } },
      { name:`name_switch_${i+1}`, label:`Nom bouton ${i+1}`,    selector:{ text:{} } }
    ]).flat();
    return html`${this._acc('a-sw','#f97316','⚙️','10 interrupteurs configurables', schema)}`;
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const TABS = [
      { id:'gen',  color:'#6b8eff', icon:'🎨', label:'Général'  },
      { id:'sens', color:'#10b981', icon:'🌡️', label:'Capteurs' },
      { id:'chem', color:'#8b5cf6', icon:'⚗️', label:'Chimie'   },
      { id:'cam',  color:'#0ea5e9', icon:'📷', label:'Caméra'   },
      { id:'sw',   color:'#f97316', icon:'⚙️', label:'Switches' }
    ];
    const content = {
      gen:  this._renderGen(),
      sens: this._renderSens(),
      chem: this._renderChem(),
      cam:  this._renderCamEditor(),
      sw:   this._renderSwEditor()
    };
    return html`
      <div class="editor-wrap">
        <div class="status-indicator">
            ${this.hass.states['automation.spa_demarrage_programme_intelligent']?.state === 'on' 
            ? html`<div class="status-ok"><ha-icon icon="mdi:check-circle"></ha-icon> Programmation active</div>` 
            : html`<div class="status-off"><ha-icon icon="mdi:alert-circle"></ha-icon> Programmation inactive</div>` }
        </div>
        <div class="tabs">
          ${TABS.map(t => html`
            <button class="tab ${this._tab===t.id?'on':''}"
                    style="${this._tab===t.id ? `background:${t.color}22; border-color:${t.color}55;` : ''}"
                    @click=${()=>{ this._tab=t.id; }}>
              <span class="ticon">${t.icon}</span>
              <span class="tlbl">${t.label}</span>
            </button>`)}
        </div>
        <div class="sections">${content[this._tab]}</div>
      </div>`;
  }

  static styles = css`
    :host { display: block; }
    .status-indicator { margin-bottom:10px; font-size:12px; font-weight:600; }
    .status-ok { color: #10b981; }
    .status-off { color: #ef4444; }
    .tabs { display: flex; gap: 4px; flex-wrap: wrap; background: var(--secondary-background-color, rgba(0,0,0,.05)); border-radius: 14px; padding: 5px; margin-bottom: 12px; }
    .tab { flex: 1; min-width: 52px; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 4px 8px; cursor: pointer; border: 1px solid transparent; background: transparent; border-radius: 9px; transition: all .18s; font-family: inherit; }
    .tab.on { box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .ticon { font-size: 16px; }
    .tlbl { font-size: 10px; color: var(--secondary-text-color); font-weight: 600; }
    .acc { border: 1px solid var(--divider-color); border-radius: 12px; margin-bottom: 8px; overflow: hidden; }
    .ach { display: flex; align-items: center; gap: 10px; padding: 11px 13px; cursor: pointer; background: var(--secondary-background-color); }
    .aibox { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
  `;
}
customElements.define('spa-card-editor', SpaCardEditor);

// ═══════════════════════════════════════════════════════════════════
//  CARTE  —  V37
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement('spa-card-editor'); }
  
  static get properties() {
    return { hass:{}, config:{}, _tab:{ type:String }, _camExpanded:{ type:Boolean } };
  }

  constructor() { super(); this._tab = 'gen'; this._camExpanded = false; }
  setConfig(config) { this.config = config; }
  
  _exists(id) { return id && this.hass?.states[id] && !['unavailable','unknown','none','--',''].includes(String(this.hass.states[id].state).toLowerCase()); }
  _state(id) { return this._exists(id) ? this.hass.states[id].state : null; }
  _attr(id, a) { return this.hass?.states[id]?.attributes?.[a] ?? null; }

  // --- Logique Chauffage ---
  _changeTemp(offset) {
    const id = this.config.entity_target_temp;
    if (!this._exists(id)) return;
    const cur = parseFloat(this._attr(id,'temperature') ?? this._state(id));
    if (isNaN(cur)) return;
    const val = Math.round((cur + offset) * 2) / 2;
    this.hass.callService(id.startsWith('climate.') ? 'climate' : 'input_number', 
      id.startsWith('climate.') ? 'set_temperature' : 'set_value', 
      { entity_id: id, [id.startsWith('climate.') ? 'temperature' : 'value']: val });
  }

  _renderHome() {
    const c = this.config;
    return html`
      <div class="home-view">
        <div class="temp-display">Eau : ${this._state(c.entity_water_temp)}°C</div>
        <button @click=${()=>this._changeTemp(0.5)}>+ Temp</button>
      </div>`;
  }

  _renderSchedule() {
    const activate = () => {
      this.hass.callService('automation', 'trigger', { entity_id: 'automation.spa_demarrage_programme_intelligent' });
      this.hass.callService('persistent_notification', 'create', { title: 'Spa', message: 'Programmation lancée.' });
    };
    return html`
      <div class="sched-panel">
        <button @click=${activate}>Activer la programmation intelligente</button>
      </div>`;
  }

  // --- Rendu final ---
  render() {
    if (!this.hass || !this.config) return html``;
    return html`
      <ha-card .header="${this.config.card_title || 'Mon Spa'}">
        <div class="tabs-menu">
            <button @click=${()=>this._tab='gen'}>Accueil</button>
            <button @click=${()=>this._tab='prog'}>Programme</button>
        </div>
        <div class="content-area">
            ${this._tab === 'gen' ? this._renderHome() : this._renderSchedule()}
        </div>
      </ha-card>`;
  }

  static styles = css`
    :host { display: block; }
    ha-card { padding: 16px; }
    .tabs-menu { display: flex; gap: 10px; margin-bottom: 10px; }
  `;
}
customElements.define('spa-card', SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: 'spa-card', name: 'Spa Card', preview: true });
