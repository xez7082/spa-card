import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR
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

  _acc(id, boxStyle, icon, title, schema) {
    const open = this._open.has(id);
    return html`
      <div class="acc ${open ? 'open' : ''}">
        <div class="ach" @click=${() => this._tog(id)}>
          <div class="aibox" style="${boxStyle}">${icon}</div>
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
    return html`${this._acc('a-disp','background:rgba(107,142,255,.18);color:#6b8eff;','GEN','Apparence générale',[
      { name:'card_title', label:'Titre du spa', selector:{ text:{} } },
      { name:'background_image', label:'Image de fond (URL)', selector:{ text:{} } },
      { name:'card_height', label:'Hauteur totale (ex : 580px)', selector:{ text:{} } },
      { name:'blur_amount', label:'Intensité du flou (0–25 px)', selector:{ number:{ mode:'slider', min:0, max:25 } } }
    ])}`;
  }

  _renderSens() {
    return html`
      ${this._acc('a-temps','background:rgba(52,211,153,.15);color:#10b981;','T°','Températures',[
        { name:'entity_water_temp', label:'Temp. eau (actuelle)', selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_target_temp', label:'Entité consigne', selector:{ entity:{} } },
        { name:'target_temp_min', label:'Consigne min (°C)', selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'target_temp_max', label:'Consigne max (°C)', selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'entity_ext_temp', label:'Temp. extérieure', selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_spa_air_temp', label:'Temp. air spa', selector:{ entity:{ domain:'sensor' } } }
      ])}
      ${this._acc('a-layzspa','background:rgba(251,191,36,.15);color:#f59e0b;','SPA','LayZSpa — états & maintenance',[
        { name:'entity_lz_ready', label:'Prêt (binary_sensor.layzspa_ready)', selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_heater', label:'Chauffage actif', selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_filter', label:'Âge filtre (jours)', selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_filter_max', label:'Alerter filtre après (jours)', selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_chlorine', label:'Âge chlore (jours)', selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_chlorine_max', label:'Alerter chlore après (jours)', selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_energy', label:'Énergie totale (kWh)', selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_lz_rssi', label:'Signal WiFi RSSI', selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_volume', label:'Volume eau (litres)', selector:{ number:{ mode:'box', min:100, max:5000 } } },
        { name:'lz_power_w', label:'Puissance chauffe (W)', selector:{ number:{ mode:'box', min:500, max:5000 } } },
        { name:'lz_heat_loss', label:'Pertes thermiques (%)', selector:{ number:{ mode:'slider', min:0, max:60 } } },
        { name:'entity_lz_reset_filter', label:'Bouton reset filtre', selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_reset_chlore', label:'Bouton reset chlore', selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_schedule', label:'Helper programmation', selector:{ entity:{ domain:'input_datetime' } } }
      ])}
      ${this._acc('a-hum','background:rgba(52,211,153,.15);color:#10b981;','~','Humidité & Énergie',[
        { name:'entity_ext_hum', label:'Humidité extérieure', selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_spa_hum', label:'Humidité spa', selector:{ entity:{ domain:'sensor' } } },
        { name:'main_cons_entity', label:'Sonde conso (W ou kWh)', selector:{ entity:{} } }
      ])}
      ${this._acc('a-flood','background:rgba(56,189,248,.15);color:#0ea5e9;','💧',"Capteur d'inondation",[
        { name:'entity_water_leak', label:'Détecteur fuite eau', selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_tamper', label:'Alerte sabotage', selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_flood_bat', label:'Batterie capteur (%)', selector:{ entity:{ domain:'sensor' } } }
      ])}`;
  }

  _renderChem() {
    return html`
      ${this._acc('a-ph', 'background:rgba(167,139,250,.15);color:#8b5cf6;','pH', 'pH',[
        { name:'entity_ph', label:'Entité pH', selector:{ entity:{ domain:'sensor' } } },
        { name:'ph_min', label:'pH Minimum', selector:{ number:{ step:0.1, mode:'box' } } },
        { name:'ph_max', label:'pH Maximum', selector:{ number:{ step:0.1, mode:'box' } } }
      ])}
      ${this._acc('a-orp', 'background:rgba(167,139,250,.15);color:#8b5cf6;','ORP','ORP (mV)',[
        { name:'entity_orp', label:'Entité ORP', selector:{ entity:{ domain:'sensor' } } },
        { name:'orp_min', label:'ORP Minimum', selector:{ number:{ mode:'box' } } },
        { name:'orp_max', label:'ORP Maximum', selector:{ number:{ mode:'box' } } }
      ])}
      ${this._acc('a-tds', 'background:rgba(167,139,250,.15);color:#8b5cf6;','TDS','TDS (ppm)',[
        { name:'entity_tds', label:'Entité TDS', selector:{ entity:{ domain:'sensor' } } },
        { name:'tds_min', label:'TDS Minimum', selector:{ number:{ mode:'box' } } },
        { name:'tds_max', label:'TDS Maximum', selector:{ number:{ mode:'box' } } }
      ])}
      ${this._acc('a-salt','background:rgba(167,139,250,.15);color:#8b5cf6;','SEL','Sel (ppm)',[
        { name:'entity_salt', label:'Entité sel', selector:{ entity:{ domain:'sensor' } } },
        { name:'salt_min', label:'Sel Minimum', selector:{ number:{ mode:'box' } } },
        { name:'salt_max', label:'Sel Maximum', selector:{ number:{ mode:'box' } } }
      ])}`;
  }

  _renderCam() {
    return html`${this._acc('a-cdim','background:rgba(56,189,248,.15);color:#0ea5e9;','CAM','Caméra & dimensions',[
        { name:'entity_camera', label:'Entité caméra', selector:{ entity:{ domain:'camera' } } },
        { name:'cam_w_px', label:'Largeur caméra (px)', selector:{ number:{ mode:'box', min:40, max:800 } } },
        { name:'cam_h_px', label:'Hauteur caméra (px)', selector:{ number:{ mode:'box', min:40, max:800 } } },
        { name:'cam_radius', label:'Arrondi (px)', selector:{ number:{ mode:'slider', min:0, max:50 } } }
      ])}
      ${this._acc('a-cpos','background:rgba(56,189,248,.15);color:#0ea5e9;','XY','Position',[
        { name:'cam_x', label:'Décalage X (px)', selector:{ number:{ mode:'box', min:-500, max:500 } } },
        { name:'cam_y', label:'Décalage Y (px)', selector:{ number:{ mode:'box', min:-500, max:500 } } }
      ])}`;
  }

  _renderSw() {
    const schema = Array.from({ length:10 }, (_,i) => [
      { name:`switch_${i+1}`, label:`Entité bouton ${i+1}`, selector:{ entity:{} } },
      { name:`name_switch_${i+1}`, label:`Nom bouton ${i+1}`, selector:{ text:{} } }
    ]).flat();
    return html`${this._acc('a-sw','background:rgba(251,146,60,.15);color:#f97316;','SW','10 interrupteurs',schema)}`;
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const TABS = [
      { id:'gen', s:'background:rgba(107,142,255,.18);color:#6b8eff;', i:'🛁', l:'Général' },
      { id:'sens', s:'background:rgba(52,211,153,.15);color:#10b981;', i:'🌡️', l:'Capteurs' },
      { id:'chem', s:'background:rgba(167,139,250,.15);color:#8b5cf6;', i:'🧪', l:'Chimie' },
      { id:'cam', s:'background:rgba(56,189,248,.15);color:#0ea5e9;', i:'📷', l:'Caméra' },
      { id:'sw', s:'background:rgba(251,146,60,.15);color:#f97316;', i:'⚡', l:'Switches' }
    ];
    const content = { gen: this._renderGen(), sens: this._renderSens(), chem: this._renderChem(), cam: this._renderCam(), sw: this._renderSw() };
    return html`
      <div class="editor-wrap">
        <div class="tabs">${TABS.map(t => html`
          <button class="tab ${this._tab===t.id?'on':''}" @click=${()=>{ this._tab=t.id; }}>
            <div class="tab-inner"><div class="tbox" style="${t.s}">${t.i}</div><span class="tlbl">${t.l}</span></div>
          </button>`)}
        </div>
        <div class="sections">${content[this._tab]}</div>
      </div>`;
  }

  static styles = css`
    :host { display: block; }
    .tabs { display: flex; gap: 4px; background: var(--secondary-background-color, rgba(0,0,0,.05)); border-radius: 14px; padding: 5px; margin-bottom: 12px; }
    .tab { flex: 1; display: flex; align-items: center; justify-content: center; padding: 8px; cursor: pointer; border: none; background: transparent; border-radius: 9px; transition: background .18s; }
    .tab.on { background: var(--card-background-color,#fff); box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .tbox { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; }
    .tlbl { font-size: 11px; color: var(--secondary-text-color,#888); white-space: nowrap; }
    .tab.on .tlbl { color: var(--primary-text-color,#212121); font-weight: 500; }
    .sections { display:flex; flex-direction:column; }
    .acc { border:1px solid var(--divider-color,rgba(0,0,0,.12)); border-radius:12px; margin-bottom:8px; overflow:hidden; }
    .ach { display:flex; align-items:center; gap:10px; padding:11px 13px; cursor:pointer; background:var(--secondary-background-color,rgba(0,0,0,.03)); }
    .aibox { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
    .ach-title { flex:1; font-size:13px; font-weight:500; }
    .arr { --mdc-icon-size:20px; transition:transform .28s; }
    .acc.open .arr { transform:rotate(180deg); }
    .acb { display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s; }
    .acc.open .acb { grid-template-rows:1fr; }
    .acbi { padding:6px 6px 14px; }
  `;
}
customElements.define('spa-card-editor', SpaCardEditor);

// ═══════════════════════════════════════════════════════════════════
//  CARTE
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement('spa-card-editor'); }
  static get properties() { return { hass:{}, config:{}, _tab:{ type:String }, _camExpanded:{ type:Boolean } }; }

  constructor() { super(); this._tab = 'home'; this._camExpanded = false; }
  setConfig(config) { this.config = config; }

  _exists(id) { return id && this.hass?.states[id] && !['unavailable','unknown','none'].includes(String(this.hass.states[id].state).toLowerCase()); }
  _state(id) { return this._exists(id) ? this.hass.states[id].state : null; }
  _attr(id, a) { return this.hass?.states[id]?.attributes?.[a] ?? null; }

  _changeTemp(offset) {
    const id = this.config.entity_target_temp;
    if (!this._exists(id)) return;
    const cur = parseFloat(this._attr(id, 'temperature') ?? this._state(id));
    const mn = Number(this.config.target_temp_min ?? 10);
    const mx = Number(this.config.target_temp_max ?? 45);
    const val = Math.min(mx, Math.max(mn, Math.round((cur+offset)*2)/2));
    this.hass.callService(id.startsWith('climate.') ? 'climate' : 'input_number', id.startsWith('climate.') ? 'set_temperature' : 'set_value', { entity_id:id, [id.startsWith('climate.')?'temperature':'value']:val });
  }

  _waterTemp() { return this._exists(this.config.entity_water_temp) ? this._state(this.config.entity_water_temp) : this._attr(this.config.entity_target_temp, 'current_temperature'); }

  _renderMaintenance() {
    const c = this.config;
    const filterAge = this._exists(c.entity_lz_filter) ? parseFloat(this._state(c.entity_lz_filter)) : null;
    const chloreAge = this._exists(c.entity_lz_chlorine) ? parseFloat(this._state(c.entity_lz_chlorine)) : null;
    if (filterAge === null && chloreAge === null) return html``;

    const pressReset = (id) => this.hass.callService('button', 'press', { entity_id: id });

    return html`
      <div class="maint-row">
        ${filterAge !== null ? html`
          <div class="maint-item">
            <div class="maint-head">
              <ha-icon icon="mdi:air-filter"></ha-icon>
              <span>Filtre</span>
              ${c.entity_lz_reset_filter ? html`<button class="maint-reset-btn" @click=${() => pressReset(c.entity_lz_reset_filter)}>✓</button>` : ''}
            </div>
            <div class="maint-val">${Math.round(filterAge)} j / ${c.lz_filter_max || 60} j</div>
          </div>` : ''}
        ${chloreAge !== null ? html`
          <div class="maint-item">
            <div class="maint-head">
              <ha-icon icon="mdi:flask-outline"></ha-icon>
              <span>Chlore</span>
              ${c.entity_lz_reset_chlore ? html`<button class="maint-reset-btn" @click=${() => pressReset(c.entity_lz_reset_chlore)}>✓</button>` : ''}
            </div>
            <div class="maint-val">${Math.round(chloreAge)} j / ${c.lz_chlorine_max || 14} j</div>
          </div>` : ''}
      </div>`;
  }

  render() {
    if (!this.hass || !this.config) return html``;
    return html`
      <div class="card-content">
        <h3>${this.config.card_title || 'Spa'}</h3>
        <div class="main-temp">${this._waterTemp() || '--'}°C</div>
        ${this._renderMaintenance()}
      </div>`;
  }

  static styles = css`
    :host { display: block; padding: 16px; background: var(--card-background-color); border-radius: 12px; }
    .maint-row { display: flex; gap: 10px; margin-top: 15px; }
    .maint-item { flex: 1; background: var(--secondary-background-color); padding: 10px; border-radius: 8px; font-size: 12px; }
    .maint-head { display: flex; align-items: center; gap: 5px; font-weight: bold; }
    .maint-reset-btn { cursor: pointer; border: none; background: #10b981; color: white; border-radius: 4px; padding: 2px 6px; margin-left: auto; }
  `;
}
customElements.define('spa-card', SpaCard);
