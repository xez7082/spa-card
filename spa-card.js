import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V33  (LayZSpa intégré)
// ═══════════════════════════════════════════════════════════════════
class SpaCardEditor extends LitElement {

  static get properties() {
    return { hass: {}, _config: {}, _tab: { type: String }, _open: {} };
  }

  constructor() {
    super();
    this._tab  = 'gen';
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
    return html`
      ${this._acc('a-disp','background:rgba(107,142,255,.18);color:#6b8eff;','GEN','Apparence générale',[
        { name:'card_title',       label:'Titre du spa',                selector:{ text:{} } },
        { name:'background_image', label:'Image de fond (URL)',          selector:{ text:{} } },
        { name:'card_height',      label:'Hauteur totale (max 550px)',  selector:{ text:{} } },
        { name:'blur_amount',      label:'Intensité du flou (0–25 px)', selector:{ number:{ mode:'slider', min:0, max:25 } } }
      ])}`;
  }

  _renderSens() {
    return html`
      ${this._acc('a-temps','background:rgba(52,211,153,.15);color:#10b981;','T°','Températures',[
        { name:'entity_water_temp',   label:'Temp. eau (actuelle)',  selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_target_temp',  label:'Entité consigne',       selector:{ entity:{} } },
        { name:'target_temp_min',     label:'Consigne min (°C)',      selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'target_temp_max',     label:'Consigne max (°C)',      selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'entity_ext_temp',     label:'Temp. extérieure',       selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_spa_air_temp', label:'Temp. air spa',          selector:{ entity:{ domain:'sensor' } } }
      ])}
      ${this._acc('a-layzspa','background:rgba(251,191,36,.15);color:#f59e0b;','SPA','LayZSpa — états & maintenance',[
        { name:'entity_lz_ready',     label:'Prêt (binary_sensor.layzspa_ready)',        selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_heater',    label:'Chauffage actif (binary_sensor…heater)',   selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_ttr',       label:'Temps restant avant prêt (sensor…time_to_ready)', selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_lz_conn',      label:'Connexion WiFi (binary_sensor…connection)',selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_filter',    label:'Âge filtre — jours (sensor…filter_age)',   selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_filter_max',       label:'Alerter filtre après (jours)',             selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_chlorine',  label:'Âge chlore — jours (sensor…chlorine_age)',selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_chlorine_max',     label:'Alerter chlore après (jours)',             selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_energy',    label:'Énergie totale kWh (sensor…energy)',       selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_lz_rssi',      label:'Signal WiFi RSSI (sensor…rssi)',           selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_volume',           label:'Volume eau (litres, défaut 500)',           selector:{ number:{ mode:'box', min:100, max:5000 } } },
        { name:'lz_power_w',          label:'Puissance chauffe (W, défaut 1942)',        selector:{ number:{ mode:'box', min:500, max:5000 } } },
        { name:'lz_heat_loss',        label:'Pertes thermiques (%, défaut 30)',          selector:{ number:{ mode:'slider', min:0, max:60 } } },
        { name:'entity_lz_reset_filter',  label:'Bouton reset filtre (button.layzspa_reset_filter_change_timer)',  selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_reset_chlore',  label:'Bouton reset chlore (button.layzspa_reset_chlorine_timer)',       selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_schedule',      label:'Programmation — helper heure (input_datetime.spa_ready_at)',    selector:{ entity:{ domain:'input_datetime' } } }
      ])}
      ${this._acc('a-hum','background:rgba(52,211,153,.15);color:#10b981;','~','Humidité & Énergie',[
        { name:'entity_ext_hum',   label:'Humidité extérieure',    selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_spa_hum',   label:'Humidité spa',            selector:{ entity:{ domain:'sensor' } } },
        { name:'main_cons_entity', label:'Sonde conso (W ou kWh)', selector:{ entity:{} } }
      ])}
      ${this._acc('a-flood','background:rgba(56,189,248,.15);color:#0ea5e9;','💧',"Capteur d'inondation",[
        { name:'entity_water_leak', label:'Détecteur fuite eau',   selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_tamper',     label:'Alerte sabotage',       selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_flood_bat',  label:'Batterie capteur (%)',  selector:{ entity:{ domain:'sensor' } } }
      ])}`;
  }

  _renderChem() {
    return html`
      ${this._acc('a-ph',  'background:rgba(167,139,250,.15);color:#8b5cf6;','pH', 'pH',[
        { name:'entity_ph', label:'Entité pH',  selector:{ entity:{ domain:'sensor' } } },
        { name:'ph_min',    label:'pH Minimum', selector:{ number:{ step:0.1, mode:'box' } } },
        { name:'ph_max',    label:'pH Maximum', selector:{ number:{ step:0.1, mode:'box' } } }
      ])}
      ${this._acc('a-orp', 'background:rgba(167,139,250,.15);color:#8b5cf6;','ORP','ORP (mV)',[
        { name:'entity_orp', label:'Entité ORP',  selector:{ entity:{ domain:'sensor' } } },
        { name:'orp_min',    label:'ORP Minimum', selector:{ number:{ mode:'box' } } },
        { name:'orp_max',    label:'ORP Maximum', selector:{ number:{ mode:'box' } } }
      ])}
      ${this._acc('a-tds', 'background:rgba(167,139,250,.15);color:#8b5cf6;','TDS','TDS (ppm)',[
        { name:'entity_tds', label:'Entité TDS',  selector:{ entity:{ domain:'sensor' } } },
        { name:'tds_min',    label:'TDS Minimum', selector:{ number:{ mode:'box' } } },
        { name:'tds_max',    label:'TDS Maximum', selector:{ number:{ mode:'box' } } }
      ])}
      ${this._acc('a-salt','background:rgba(167,139,250,.15);color:#8b5cf6;','SEL','Sel (ppm)',[
        { name:'entity_salt', label:'Entité sel',  selector:{ entity:{ domain:'sensor' } } },
        { name:'salt_min',    label:'Sel Minimum', selector:{ number:{ mode:'box' } } },
        { name:'salt_max',    label:'Sel Maximum', selector:{ number:{ mode:'box' } } }
      ])}`;
  }

  _renderCam() {
    return html`
      ${this._acc('a-cdim','background:rgba(56,189,248,.15);color:#0ea5e9;','CAM','Caméra & dimensions',[
        { name:'entity_camera', label:'Entité caméra',         selector:{ entity:{ domain:'camera' } } },
        { name:'cam_w_px',      label:'Largeur caméra (px)', selector:{ number:{ mode:'box', min:40, max:800 } } },
        { name:'cam_h_px',      label:'Hauteur caméra (px)', selector:{ number:{ mode:'box', min:40, max:800 } } },
        { name:'cam_radius',    label:'Arrondi des coins (px)', selector:{ number:{ mode:'slider', min:0, max:50 } } }
      ])}
      ${this._acc('a-cpos','background:rgba(56,189,248,.15);color:#0ea5e9;','XY','Position',[
        { name:'cam_x', label:'Décalage horizontal X (px)', selector:{ number:{ mode:'box', min:-500, max:500 } } },
        { name:'cam_y', label:'Décalage vertical Y (px)',   selector:{ number:{ mode:'box', min:-500, max:500 } } }
      ])}`;
  }

  _renderSw() {
    const schema = Array.from({ length:10 }, (_,i) => [
      { name:`switch_${i+1}`,      label:`Entité bouton ${i+1}`, selector:{ entity:{} } },
      { name:`name_switch_${i+1}`, label:`Nom bouton ${i+1}`,    selector:{ text:{} } }
    ]).flat();
    return html`
      ${this._acc('a-sw','background:rgba(251,146,60,.15);color:#f97316;','SW','10 interrupteurs configurables',schema)}`;
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const TABS = [
      { id:'gen',  s:'background:rgba(107,142,255,.18);color:#6b8eff;', i:'GEN', l:'Général'  },
      { id:'sens', s:'background:rgba(52,211,153,.15);color:#10b981;',  i:'T°',  l:'Capteurs' },
      { id:'chem', s:'background:rgba(167,139,250,.15);color:#8b5cf6;', i:'pH',  l:'Chimie'   },
      { id:'cam',  s:'background:rgba(56,189,248,.15);color:#0ea5e9;',  i:'CAM', l:'Caméra'   },
      { id:'sw',   s:'background:rgba(251,146,60,.15);color:#f97316;',  i:'SW',  l:'Switches' }
    ];
    const content = {
      gen:  this._renderGen(),
      sens: this._renderSens(),
      chem: this._renderChem(),
      cam:  this._renderCam(),
      sw:   this._renderSw()
    };
    return html`
      <div class="editor-wrap">
        <div class="tabs">
          ${TABS.map(t => html`
            <button class="tab ${this._tab===t.id?'on':''}" @click=${()=>{ this._tab=t.id; }}>
              <div class="tbox" style="${t.s}">${t.i}</div>
              <span class="tlbl">${t.l}</span>
            </button>`)}
        </div>
        <div class="sections">${content[this._tab]}</div>
      </div>`;
  }

  static styles = css`
    :host { display: block; }
    .tabs {
      display:flex; gap:3px;
      background:var(--secondary-background-color,rgba(0,0,0,.05));
      border-radius:14px; padding:5px; margin-bottom:12px;
    }
    .tab {
      flex:1; display:flex; flex-direction:column; align-items:center;
      gap:4px; padding:5px 2px 7px; cursor:pointer;
      border:none; background:transparent; border-radius:9px; transition:background .18s;
      font-family:var(--paper-font-body1_-_font-family,sans-serif);
    }
    .tab:hover { background:rgba(0,0,0,.04); }
    .tab.on    { background:var(--card-background-color,#fff); box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .tbox {
      width:32px; height:32px; border-radius:9px;
      display:flex; align-items:center; justify-content:center;
      font-size:11px; font-weight:700; letter-spacing:-.3px;
      transition:.18s;
    }
    .tlbl {
      font-size:10px; color:var(--secondary-text-color,#888);
      letter-spacing:.2px; transition:color .18s; white-space:nowrap;
    }
    .tab.on .tlbl { color:var(--primary-text-color,#212121); font-weight:500; }
    .sections { display:flex; flex-direction:column; }
    .acc { border:1px solid var(--divider-color,rgba(0,0,0,.12)); border-radius:12px; margin-bottom:8px; overflow:hidden; }
    .ach {
      display:flex; align-items:center; gap:10px; padding:11px 13px;
      cursor:pointer; background:var(--secondary-background-color,rgba(0,0,0,.03));
      transition:background .15s; user-select:none;
    }
    .ach:hover { background:rgba(0,0,0,.06); }
    .aibox {
      width:32px; height:32px; border-radius:9px;
      display:flex; align-items:center; justify-content:center;
      font-size:11px; font-weight:700; flex-shrink:0; letter-spacing:-.3px;
    }
    .ach-title { flex:1; font-size:13px; font-weight:500; color:var(--primary-text-color,#212121); }
    .arr { --mdc-icon-size:20px; color:var(--secondary-text-color,#aaa); transition:transform .28s cubic-bezier(.4,0,.2,1); }
    .acc.open .arr { transform:rotate(180deg); }
    .acb { display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s cubic-bezier(.4,0,.2,1); }
    .acc.open .acb { grid-template-rows:1fr; }
    .acb > div { overflow:hidden; }
    .acbi { padding:6px 6px 14px; }
  `;
}
customElements.define('spa-card-editor', SpaCardEditor);


// ═══════════════════════════════════════════════════════════════════
//  CARTE  —  V33  (LayZSpa intégré)
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {

  static getConfigElement() { return document.createElement('spa-card-editor'); }

  static getStubConfig() {
    return {
      card_title:'MY LAYZSPA', blur_amount:15, card_height:'550px',
      entity_water_temp:  'sensor.layzspa_temp_c',
      entity_target_temp: 'climate.layzspa_temperature_control',
      target_temp_min: 20, target_temp_max: 40,
      entity_lz_ready:   'binary_sensor.layzspa_ready',
      entity_lz_heater:  'binary_sensor.layzspa_heater',
      entity_lz_ttr:     'sensor.layzspa_time_to_ready',
      entity_lz_conn:    'binary_sensor.layzspa_connection',
      entity_lz_filter:  'sensor.layzspa_filter_age',
      lz_volume:      500, lz_power_w: 1942, lz_heat_loss: 30,
      entity_lz_reset_filter: 'button.layzspa_reset_filter_change_timer',
      entity_lz_schedule:     'input_datetime.spa_ready_at',
      entity_lz_reset_chlore: 'button.layzspa_reset_chlorine_timer',
      lz_filter_max:     60, entity_lz_chlorine:'sensor.layzspa_chlorine_age', lz_chlorine_max: 14,
      entity_lz_energy:  'sensor.layzspa_energy', entity_lz_rssi: 'sensor.layzspa_rssi',
      main_cons_entity:  'sensor.layzspa_power',
      entity_water_leak: 'binary_sensor.innondation_spa_water_leak',
      entity_tamper:     'binary_sensor.innondation_spa_tamper',
      entity_flood_bat:  'sensor.innondation_spa_battery',
      ph_min:7.2, ph_max:7.6, orp_min:650, orp_max:800, tds_min:500, tds_max:1500, salt_min:2500, salt_max:3500,
      switch_1:'switch.layzspa_pump',           name_switch_1:'Pompe',
      switch_2:'switch.layzspa_jets',           name_switch_2:'Jets',
      switch_3:'switch.layzspa_airbubbles',     name_switch_3:'Bulles',
      switch_4:'switch.layzspa_heat_regulation',name_switch_4:'Chauffe',
      switch_5:'switch.layzspa_power_switch',   name_switch_5:'Alim',
      switch_6:'switch.layzspa_lock',           name_switch_6:'Verrou'
    };
  }

  static get properties() {
    return { hass:{}, config:{}, _tab:{ type:String }, _camExpanded:{ type:Boolean } };
  }

  constructor() { super(); this._tab = 'home'; this._camExpanded = false; }
  setConfig(config) { this.config = config; }
  getCardSize() { return Math.ceil((parseInt(this.config?.card_height)||550)/50); }

  _exists(id) {
    if (!id || !this.hass?.states[id]) return false;
    return !['unavailable','unknown','none','--',''].includes(
      String(this.hass.states[id].state).toLowerCase()
    );
  }

  _state(id) { return this._exists(id) ? this.hass.states[id].state : null; }
  _attr(id, a) { return this.hass?.states[id]?.attributes?.[a] ?? null; }

  _changeTemp(offset) {
    const id = this.config.entity_target_temp;
    if (!this._exists(id)) return;
    const cur = this.config.entity_target_temp.startsWith('climate.')
      ? parseFloat(this._attr(id, 'temperature') ?? this._state(id))
      : parseFloat(this._state(id));
    if (isNaN(cur)) return;
    const mn = Number(this.config.target_temp_min ?? this._attr(id,'min') ?? 10);
    const mx = Number(this.config.target_temp_max ?? this._attr(id,'max') ?? 45);
    const val = Math.min(mx, Math.max(mn, Math.round((cur+offset)*2)/2));
    const domain = id.split('.')[0];
    if (domain==='climate') {
      this.hass.callService('climate','set_temperature',{ entity_id:id, temperature:val });
    } else {
      this.hass.callService('input_number','set_value',{ entity_id:id, value:val });
    }
  }

  _waterTemp() {
    const wid = this.config.entity_water_temp;
    const cid = this.config.entity_target_temp;
    if (this._exists(wid)) return this._state(wid);
    if (cid && this.hass?.states[cid]) {
      const cur = this._attr(cid,'current_temperature');
      if (cur !== null) return String(cur);
    }
    return null;
  }

  _targetTemp() {
    const id = this.config.entity_target_temp;
    if (!id || !this.hass?.states[id]) return null;
    const domain = id.split('.')[0];
    if (domain==='climate') {
      return String(this._attr(id,'temperature') ?? this._state(id));
    }
    return this._state(id);
  }

  _calcHeatingTime() {
    const c = this.config;
    const volume = Number(c.lz_volume ?? 500);
    const lossRatio = Number(c.lz_heat_loss ?? 30) / 100;
    const efficiency = 1 - lossRatio;
    let powerW = Number(c.lz_power_w ?? 0);
    if (!powerW && this._exists(c.main_cons_entity)) {
      const unit = this._attr(c.main_cons_entity, 'unit_of_measurement') ?? '';
      const raw = parseFloat(this._state(c.main_cons_entity));
      powerW = unit.toLowerCase().includes('kw') ? raw * 1000 : raw;
    }
    if (!powerW || isNaN(powerW)) powerW = 1942;
    const curTemp = parseFloat(this._waterTemp() ?? NaN);
    const tgtTemp = parseFloat(this._targetTemp() ?? NaN);
    if (isNaN(curTemp) || isNaN(tgtTemp)) return null;
    const deltaT = tgtTemp - curTemp;
    if (deltaT <= 0.5) return 0;
    const whNeeded = volume * 1.163 * deltaT;
    const effectivePower = powerW * efficiency;
    const timeH = whNeeded / effectivePower;
    return { timeH, deltaT, curTemp, tgtTemp, powerW, efficiency };
  }

  _renderHome() {
    const c = this.config;
    const wTemp  = this._waterTemp();
    const tTemp  = this._targetTemp();
    return html`
      <div class="home-view">
        ${this._renderHeatingControl()}
        ${this._renderLayzspaStatus()}
        <div class="flex-row-center">
          <div class="side-col">
            ${this._exists(c.entity_ext_temp) ? html`
              <div class="side-info">
                <div class="val-big">${this._state(c.entity_ext_temp)}°</div>
                <div class="label-tiny">EXTÉRIEUR</div>
              </div>` : ''}
            ${this._exists(c.entity_ext_hum) ? html`
              <div class="hum-pill">${this._state(c.entity_ext_hum)}% HR</div>` : ''}
          </div>
          <div class="gauge-container">
            ${this._exists(c.entity_target_temp) ? html`
              <div class="temp-btn" role="button" @click=${()=>this._changeTemp(0.5)}>
                <ha-icon icon="mdi:chevron-up"></ha-icon>
              </div>` : ''}
            <div class="center-gauge">
              <div class="outer-ring"></div>
              <div class="inner-circle">
                ${wTemp ? html`<span class="water-label">EAU</span><span class="water-val">${wTemp}°</span>` : ''}
                ${tTemp ? html`<div class="target-box">CIBLE ${tTemp}°</div>` : ''}
              </div>
            </div>
            ${this._exists(c.entity_target_temp) ? html`
              <div class="temp-btn" role="button" @click=${()=>this._changeTemp(-0.5)}>
                <ha-icon icon="mdi:chevron-down"></ha-icon>
              </div>` : ''}
          </div>
          <div class="side-col">
            ${this._exists(c.entity_spa_air_temp) ? html`
              <div class="side-info">
                <div class="val-big">${this._state(c.entity_spa_air_temp)}°</div>
                <div class="label-tiny">AIR SPA</div>
              </div>` : ''}
            ${this._exists(c.entity_spa_hum) ? html`
              <div class="hum-pill">${this._state(c.entity_spa_hum)}% HR</div>` : ''}
          </div>
        </div>
        ${this._renderFooterRow()}
        ${this._renderMaintenance()}
        ${this._renderFlood()}
      </div>`;
  }

  _renderHeatingControl() {
    const id = this.config.entity_target_temp;
    if (!id || !id.startsWith('climate.') || !this.hass?.states[id]) return html``;
    const hvac = this.hass.states[id].state;
    const isOn = hvac === 'heat';
    const curTemp = parseFloat(this._waterTemp() ?? 0);
    const tgtTemp = parseFloat(this._targetTemp() ?? 34);
    const atTemp  = curTemp >= tgtTemp - 0.5;
    return html`
      <div class="heat-ctrl">
        <button class="heat-btn ${isOn ? 'heat-on' : 'heat-off'}" @click=${() => this.hass.callService('climate', 'set_hvac_mode', { entity_id: id, hvac_mode: isOn ? 'off' : 'heat' })}>
          <ha-icon icon="${isOn ? 'mdi:radiator' : 'mdi:radiator-off'}"></ha-icon>
          <span>${isOn ? (atTemp ? 'Maintien' : 'Chauffe ON') : 'Chauffe OFF'}</span>
        </button>
        <div class="heat-temps">
          <div class="heat-t-btn" @click=${()=>this._changeTemp(-1)}><ha-icon icon="mdi:minus"></ha-icon></div>
          <div class="heat-target">${tgtTemp}°</div>
          <div class="heat-t-btn" @click=${()=>this._changeTemp(1)}><ha-icon icon="mdi:plus"></ha-icon></div>
        </div>
      </div>`;
  }

  _renderLayzspaStatus() {
    const c = this.config;
    if (!this._exists(c.entity_lz_ready) && !this._exists(c.entity_lz_conn)) return html``;
    const connected = !this._exists(c.entity_lz_conn) || this._state(c.entity_lz_conn) === 'on';
    const ready     = this._state(c.entity_lz_ready) === 'on';
    const heating   = this._state(c.entity_lz_heater) === 'on';
    const calc = this._calcHeatingTime();
    let icon, label, cls, timeStr = '';
    if (!connected) {
      icon='mdi:wifi-off'; label='Déconnecté'; cls='lz-disconnected';
    } else if (ready || (calc !== null && calc === 0)) {
      icon='mdi:hot-tub'; label='Prêt !'; cls='lz-ready';
    } else if (heating) {
      if (calc !== null && calc !== 0) {
        const h = Math.floor(calc.timeH), min = Math.round((calc.timeH - h) * 60);
        timeStr = h > 0 ? `${h}h${min > 0 ? min.toString().padStart(2,'0') : ''} rest.` : `${min} min rest.`;
        label = `Chauffe — ${timeStr}`;
      } else { label = 'En chauffe…'; }
      icon='mdi:radiator'; cls='lz-heating';
    } else {
      if (calc !== null && calc !== 0) {
        const h = Math.floor(calc.timeH), min = Math.round((calc.timeH - h) * 60);
        timeStr = h > 0 ? `${h}h${min > 0 ? min.toString().padStart(2,'0') : ''} pour ${calc.tgtTemp}°` : `${min} min pour ${calc.tgtTemp}°`;
        label = `Veille — ${timeStr}`;
      } else { label = 'En veille'; }
      icon='mdi:power-sleep'; cls='lz-standby';
    }
    const rssi = this._exists(c.entity_lz_rssi) ? parseInt(this._state(c.entity_lz_rssi)) : null;
    const rssiIcon = rssi===null ? '' : rssi>=-60 ? 'mdi:wifi-strength-4' : rssi>=-70 ? 'mdi:wifi-strength-3' : rssi>=-80 ? 'mdi:wifi-strength-2' : 'mdi:wifi-strength-1';
    return html`
      <div class="lz-status ${cls}">
        <ha-icon class="lz-icon" icon="${icon}"></ha-icon>
        <span class="lz-label">${label}</span>
        ${rssiIcon ? html`<ha-icon class="lz-wifi" icon="${rssiIcon}"></ha-icon>` : ''}
      </div>`;
  }

  _renderFooterRow() {
    const c = this.config;
    const hasCons = this._exists(c.main_cons_entity);
    const hasEnergy = this._exists(c.entity_lz_energy);
    if (!hasCons && !hasEnergy) return html``;
    return html`
      <div class="footer-row">
        ${hasCons ? html`<div class="footer-pill"><ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon><span>${this._state(c.main_cons_entity)} ${this._attr(c.main_cons_entity,'unit_of_measurement')??''}</span></div>` : ''}
        ${hasEnergy ? html`<div class="footer-pill"><ha-icon icon="mdi:flash"></ha-icon><span>${parseFloat(this._state(c.entity_lz_energy)).toFixed(1)} kWh</span></div>` : ''}
      </div>`;
  }

  _renderMaintenance() {
    const c = this.config;
    const filterAge = this._exists(c.entity_lz_filter) ? parseFloat(this._state(c.entity_lz_filter)) : null;
    const chloreAge = this._exists(c.entity_lz_chlorine) ? parseFloat(this._state(c.entity_lz_chlorine)) : null;
    if (filterAge === null && chloreAge === null) return html``;
    return html`
      <div class="maint-row">
        ${filterAge !== null ? html`<div class="maint-item"><div class="maint-head"><ha-icon icon="mdi:air-filter"></ha-icon><span>Filtre: ${Math.round(filterAge)}j</span></div></div>` : ''}
        ${chloreAge !== null ? html`<div class="maint-item"><div class="maint-head"><ha-icon icon="mdi:flask-outline"></ha-icon><span>Chlore: ${Math.round(chloreAge)}j</span></div></div>` : ''}
      </div>`;
  }

  _renderFlood() {
    const c = this.config;
    if (!this._exists(c.entity_water_leak)) return html``;
    const leak = this._state(c.entity_water_leak) === 'on';
    return html`
      <div class="flood-bar ${leak?'flood-alert':'flood-ok'}">
        <ha-icon icon="${leak?'mdi:water-alert':'mdi:water-check'}"></ha-icon>
        <span>${leak?'FUITE DÉTECTÉE !':'Pas de fuite'}</span>
      </div>`;
  }

  // ─── CHIMIE OPTIMISÉE (CONCENTRÉE & COMPACTE) ───
  _renderChem() {
    const c = this.config;
    const n = v => (v!==undefined&&v!==null&&v!=='') ? Number(v) : undefined;
    const DISPLAY = { ph: {lo:6.5, hi:8.5, dec:1}, orp: {lo:200,hi:900, dec:0}, tds: {lo:0, hi:2000, dec:0}, salt: {lo:1000, hi:4500, dec:0} };
    
    const sensors = [
      { key:'ph',   id:c.entity_ph,   name:'pH',   icon:'mdi:ph',        min:n(c.ph_min)||7.2,   max:n(c.ph_max)||7.6 },
      { key:'orp',  id:c.entity_orp,  name:'ORP',  icon:'mdi:bolt',      min:n(c.orp_min)||650,  max:n(c.orp_max)||800 },
      { key:'tds',  id:c.entity_tds,  name:'TDS',  icon:'mdi:opacity',   min:n(c.tds_min)||500,  max:n(c.tds_max)||1500 },
      { key:'salt', id:c.entity_salt, name:'SEL',  icon:'mdi:shaker',    min:n(c.salt_min)||2500,max:n(c.salt_max)||3500 }
    ];

    return html`
      <div class="chem-view">
        ${sensors.map(s => {
          if (!this._exists(s.id)) return '';
          const val = Number(this._state(s.id));
          const disp = DISPLAY[s.key];
          const pct = Math.min(100, Math.max(0, ((val - disp.lo) / (disp.hi - disp.lo)) * 100));
          const minPct = ((s.min - disp.lo) / (disp.hi - disp.lo)) * 100;
          const maxPct = ((s.max - disp.lo) / (disp.hi - disp.lo)) * 100;
          const isOk = val >= s.min && val <= s.max;

          return html`
            <div class="chem-card ${isOk?'ok':'warn'}">
              <div class="chem-header">
                <div class="chem-title-box">
                  <ha-icon icon="${s.icon}"></ha-icon>
                  <span class="chem-name">${s.name}</span>
                </div>
                <span class="chem-value">${val.toFixed(disp.dec)}</span>
              </div>
              <div class="chem-gauge-bg">
                <div class="chem-zone-target" style="left:${minPct}%; width:${maxPct - minPct}%"></div>
                <div class="chem-cursor" style="left:${pct}%"></div>
              </div>
            </div>`;
        })}
      </div>`;
  }

  // ─── CAMÉRA CORRIGÉE (CORRECTION CLIC & TAILLE FLUIDE) ───
  _renderCam() {
    const c = this.config;
    if (!this._exists(c.entity_camera)) return html`<div class="cam-view"><div class="no-cam">Aucune caméra configurée</div></div>`;
    
    const w = c.cam_w_px ? `${c.cam_w_px}px` : '100%';
    const h = c.cam_h_px ? `${c.cam_h_px}px` : '200px';
    const r = c.cam_radius ? `${c.cam_radius}px` : '12px';
    const x = c.cam_x ? `${c.cam_x}px` : '0px';
    const y = c.cam_y ? `${c.cam_y}px` : '0px';

    return html`
      <div class="cam-view">
        <div class="cam-container ${this._camExpanded ? 'expanded' : ''}" 
             style="width:${this._camExpanded?'100%':w}; height:${this._camExpanded?'100%':h}; border-radius:${r}; transform: translate(${x}, ${y});"
             @click=${() => this._camExpanded = !this._camExpanded}>
          <ha-camera-stream
            .hass=${this.hass}
            .stateObj=${this.hass.states[c.entity_camera]}
            allow-zoom
            controls>
          </ha-camera-stream>
        </div>
      </div>`;
  }

  _renderSwitches() {
    const c = this.config;
    const switches = [];
    for(let i=1; i<=10; i++) {
      const eid = c[`switch_${i}`];
      if (this._exists(eid)) {
        switches.push({ id:eid, name:c[`name_switch_${i}`]||`Bouton ${i}` });
      }
    }
    if(switches.length===0) return html`<div class="sw-view"><div class="no-cam">Aucun bouton actif</div></div>`;
    return html`
      <div class="sw-view">
        <div class="sw-grid">
          ${switches.map(s => {
            const active = this._state(s.id) === 'on';
            return html`
              <button class="sw-btn ${active?'on':'off'}" @click=${() => this.hass.callService('switch','toggle',{ entity_id:s.id })}>
                <ha-icon icon="${active?'mdi:power-plug':'mdi:power-plug-off'}"></ha-icon>
                <span>${s.name}</span>
              </button>`;
          })}
        </div>
      </div>`;
  }

  render() {
    if (!this.config || !this.hass) return html``;
    const title = this.config.card_title || 'SPA';
    const blur  = this.config.blur_amount ?? 15;
    const bg    = this.config.background_image ? `url(${this.config.background_image})` : 'rgba(255,255,255,0.03)';

    return html`
      <ha-card style="--blur-amt:${blur}px; --bg-img:${bg};">
        <div class="glass-container">
          <div class="header">
            <h1 class="title">${title}</h1>
            <div class="nav-tabs">
              <button class="nav-btn ${this._tab==='home'?'active':''}" @click=${()=>this._tab='home'}><ha-icon icon="mdi:home-analytics"></ha-icon></button>
              <button class="nav-btn ${this._tab==='chem'?'active':''}" @click=${()=>this._tab='chem'}><ha-icon icon="mdi:beaker-check"></ha-icon></button>
              <button class="nav-btn ${this._tab==='cam'?'active':''}"  @click=${()=>this._tab='cam'}><ha-icon icon="mdi:camera"></ha-icon></button>
              <button class="nav-btn ${this._tab==='sw'?'active':''}"   @click=${()=>this._tab='sw'}><ha-icon icon="mdi:toggle-switch"></ha-icon></button>
            </div>
          </div>
          <div class="main-content">
            ${this._tab==='home' ? this._renderHome() : ''}
            ${this._tab==='chem' ? this._renderChem() : ''}
            ${this._tab==='cam'  ? this._renderCam() : ''}
            ${this._tab==='sw'   ? this._renderSwitches() : ''}
          </div>
        </div>
      </ha-card>`;
  }

  static styles = css`
    :host {
      display: block;
      max-height: 550px !important;
      overflow: hidden;
    }
    ha-card {
      background: var(--bg-img) center/cover no-repeat;
      position: relative;
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.12);
      overflow: hidden;
      height: 550px;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .glass-container {
      width: 100%; height: 100%;
      box-sizing: border-radius;
      backdrop-filter: blur(var(--blur-amt));
      background: rgba(15, 22, 42, 0.45);
      display: flex; flex-direction: column;
    }
    .header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .title { font-size: 16px; font-weight: 700; margin: 0; letter-spacing: 0.5px; opacity: 0.9; }
    .nav-tabs { display: flex; gap: 4px; background: rgba(0,0,0,0.2); padding: 3px; border-radius: 10px; }
    .nav-btn {
      background: transparent; border: none; color: rgba(255,255,255,0.4);
      padding: 6px 10px; border-radius: 8px; cursor: pointer; transition: 0.2s;
    }
    .nav-btn.active { background: rgba(255,255,255,0.15); color: #fff; }
    .main-content { flex: 1; overflow-y: auto; padding: 12px; }

    /* ACCUEIL COMPACT */
    .home-view { display: flex; flex-direction: column; gap: 10px; }
    .flex-row-center { display: flex; align-items: center; justify-content: space-around; margin: 5px 0; }
    .side-col { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 80px; }
    .side-info { text-align: center; }
    .val-big { font-size: 20px; font-weight: 700; color: #fff; }
    .label-tiny { font-size: 9px; opacity: 0.5; font-weight: 600; margin-top: 2px; }
    .hum-pill { font-size: 10px; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 20px; }
    
    .gauge-container { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .center-gauge {
      position: relative; width: 110px; height: 110px;
      display: flex; align-items: center; justify-content: center;
    }
    .outer-ring {
      position: absolute; width: 100%; height: 100%;
      border-radius: 50%; border: 4px solid rgba(255,255,255,0.06);
      border-top-color: #0ea5e9; transform: rotate(45deg);
    }
    .inner-circle { text-align: center; display: flex; flex-direction: column; align-items: center; }
    .water-label { font-size: 9px; opacity: 0.6; font-weight: bold; }
    .water-val { font-size: 26px; font-weight: 800; color: #fff; line-height: 1; margin: 2px 0; }
    .target-box { font-size: 9px; background: rgba(14,165,233,0.2); padding: 1px 5px; border-radius: 4px; color: #38bdf8; }
    .temp-btn { background: rgba(255,255,255,0.1); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; }

    .heat-ctrl { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 6px 12px; border-radius: 12px; }
    .heat-btn { display: flex; align-items: center; gap: 8px; border: none; padding: 6px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .heat-on { background: rgba(239,68,68,0.2); color: #f87171; }
    .heat-off { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }
    .heat-temps { display: flex; align-items: center; gap: 10px; }
    .heat-target { font-size: 16px; font-weight: bold; }
    .heat-t-btn { cursor: pointer; opacity: 0.7; }

    .lz-status { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 500; }
    .lz-heating { background: rgba(245,158,11,0.15); color: #fbbf24; }
    .lz-ready { background: rgba(16,185,129,0.15); color: #34d399; }
    .lz-standby { background: rgba(255,255,255,0.05); color: #9ca3af; }
    .lz-disconnected { background: rgba(239,68,68,0.15); color: #f87171; }
    .lz-icon { --mdc-icon-size: 16px; }

    .footer-row { display: flex; gap: 6px; }
    .footer-pill { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(255,255,255,0.05); padding: 6px; border-radius: 10px; font-size: 11px; }

    .maint-row { display: flex; gap: 6px; }
    .maint-item { flex: 1; background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 10px; font-size: 11px; }
    .maint-head { display: flex; align-items: center; gap: 6px; }

    .flood-bar { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: bold; }
    .flood-ok { background: rgba(16,185,129,0.1); color: #34d399; }
    .flood-alert { background: rgba(239,68,68,0.2); color: #f87171; }

    /* CHIMIE COMPACTE MODIFIÉE */
    .chem-view { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 2px; }
    .chem-card { background: rgba(255,255,255,0.04); padding: 8px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .chem-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .chem-title-box { display: flex; align-items: center; gap: 4px; opacity: 0.7; }
    .chem-title-box ha-icon { --mdc-icon-size: 14px; }
    .chem-name { font-size: 11px; font-weight: bold; }
    .chem-value { font-size: 14px; font-weight: 800; }
    .chem-gauge-bg { position: relative; height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: visible; margin-top: 4px; }
    .chem-zone-target { position: absolute; height: 100%; background: rgba(52,211,153,0.3); border-radius: 2px; }
    .chem-cursor { position: absolute; width: 7px; height: 7px; background: #fff; border-radius: 50%; top: -1px; transform: translateX(-50%); box-shadow: 0 0 4px rgba(0,0,0,0.5); }
    .chem-card.warn .chem-value { color: #f87171; }
    .chem-card.ok .chem-value { color: #34d399; }

    /* CAMÉRA NETTOYÉE */
    .cam-view { display: flex; justify-content: center; align-items: center; height: 100%; min-height: 250px; }
    .cam-container { position: relative; background: #000; overflow: hidden; display: block; cursor: pointer; max-height: 100%; max-width: 100%; transition: all 0.3s ease; }
    .cam-container ha-camera-stream { width: 100%; height: 100%; display: block; }
    .cam-container.expanded { position: fixed; top: 0; left: 0; width: 100% !important; height: 100% !important; z-index: 999; border-radius: 0 !important; transform: none !important; }
    .no-cam { opacity: 0.5; font-size: 12px; }

    /* INTERRUPTEURS */
    .sw-view { padding: 4px; }
    .sw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .sw-btn {
      display: flex; align-items: center; gap: 8px; padding: 10px; border: none;
      border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.2s;
    }
    .sw-btn.on { background: rgba(251,146,60,0.2); color: #fb923c; }
    .sw-btn.off { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); }
  `;
}
customElements.define('spa-card', SpaCard);
