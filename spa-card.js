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
        { name:'card_height',      label:'Hauteur totale (ex : 580px)', selector:{ text:{} } },
        { name:'blur_amount',      label:'Intensité du flou (0–25 px)', selector:{ number:{ mode:'slider', min:0, max:25 } } }
      ])}`;
  }

  _renderSens() {
    return html`
      ${this._acc('a-temps','background:rgba(52,211,153,.15);color:#10b981;','T°','Températures',[
        { name:'entity_water_temp',   label:'Temp. eau (actuelle)',  selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_target_temp',  label:'Entité consigne',       selector:{ entity:{} } },
        { name:'target_temp_min',      label:'Consigne min (°C)',      selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'target_temp_max',      label:'Consigne max (°C)',      selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'entity_ext_temp',      label:'Temp. extérieure',       selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_spa_air_temp', label:'Temp. air spa',          selector:{ entity:{ domain:'sensor' } } }
      ])}
      ${this._acc('a-layzspa','background:rgba(251,191,36,.15);color:#f59e0b;','SPA','LayZSpa — états & maintenance',[
        { name:'entity_lz_ready',     label:'Prêt (binary_sensor.layzspa_ready)',       selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_heater',    label:'Chauffage actif (binary_sensor…heater)',   selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_ttr',       label:'Temps restant avant prêt (sensor…time_to_ready)', selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_lz_conn',      label:'Connexion WiFi (binary_sensor…connection)',selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_filter',    label:'Âge filtre — jours (sensor…filter_age)',  selector:{ entity:{ domain:'sensor' } } },
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
        { name:'entity_spa_hum',   label:'Humidité spa',             selector:{ entity:{ domain:'sensor' } } },
        { name:'main_cons_entity', label:'Sonde conso (W ou kWh)', selector:{ entity:{} } }
      ])}
      ${this._acc('a-flood','background:rgba(56,189,248,.15);color:#0ea5e9;','💧',"Capteur d'inondation",[
        { name:'entity_water_leak', label:'Détecteur fuite eau',   selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_tamper',      label:'Alerte sabotage',       selector:{ entity:{ domain:'binary_sensor' } } },
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
        { name:'cam_w_px',      label:'Largeur caméra (px) — vide = 50% auto', selector:{ number:{ mode:'box', min:40, max:800 } } },
        { name:'cam_h_px',      label:'Hauteur caméra (px) — vide = hauteur auto', selector:{ number:{ mode:'box', min:40, max:800 } } },
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
      gap:4px; padding:5px 2px 7px; cursor:pointer; border:none;
      background:transparent; border-radius:9px; transition:background .18s;
      font-family:var(--paper-font-body1_-_font-family,sans-serif);
    }
    .tab:hover { background:rgba(0,0,0,.04); }
    .tab.on    { background:var(--card-background-color,#fff); box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .tbox {
      width:32px; height:32px; border-radius:9px;
      display:flex; align-items:center; justify-content:center;
      font-size:11px; font-weight:700; letter-spacing:-.3px; transition:.18s;
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
      card_title:'MY LAYZSPA', blur_amount:15, card_height:'640px',
      entity_water_temp:  'sensor.layzspa_temp_c',
      entity_target_temp: 'climate.layzspa_temperature_control',
      target_temp_min: 20, target_temp_max: 40,
      entity_lz_ready:   'binary_sensor.layzspa_ready',
      entity_lz_heater:  'binary_sensor.layzspa_heater',
      entity_lz_ttr:      'sensor.layzspa_time_to_ready',
      entity_lz_conn:    'binary_sensor.layzspa_connection',
      entity_lz_filter:  'sensor.layzspa_filter_age',
      lz_volume:      500,
      lz_power_w:     1942,
      lz_heat_loss:   30,
      entity_lz_reset_filter: 'button.layzspa_reset_filter_change_timer',
      entity_lz_schedule:     'input_datetime.spa_ready_at',
      entity_lz_reset_chlore: 'button.layzspa_reset_chlorine_timer',
      lz_filter_max:     60,
      entity_lz_chlorine:'sensor.layzspa_chlorine_age',
      lz_chlorine_max:   14,
      entity_lz_energy:  'sensor.layzspa_energy',
      entity_lz_rssi:    'sensor.layzspa_rssi',
      main_cons_entity:  'sensor.layzspa_power',
      entity_water_leak: 'binary_sensor.innondation_spa_water_leak',
      entity_tamper:     'binary_sensor.innondation_spa_tamper',
      entity_flood_bat:  'sensor.innondation_spa_battery',
      ph_min:7.2, ph_max:7.6,
      orp_min:650, orp_max:800,
      tds_min:500, tds_max:1500,
      salt_min:2500, salt_max:3500,
      switch_1:'switch.layzspa_pump',          name_switch_1:'Pompe',
      switch_2:'switch.layzspa_jets',           name_switch_2:'Jets',
      switch_3:'switch.layzspa_airbubbles',    name_switch_3:'Bulles',
      switch_4:'switch.layzspa_heat_regulation',name_switch_4:'Chauffe',
      switch_5:'switch.layzspa_power_switch',  name_switch_5:'Alimentation',
      switch_6:'switch.layzspa_lock',          name_switch_6:'Verrouillage'
    };
  }

  static get properties() {
    return { hass:{}, config:{}, _tab:{ type:String }, _camExpanded:{ type:Boolean } };
  }

  constructor() { super(); this._tab = 'home'; this._camExpanded = false; }
  setConfig(config) { this.config = config; }
  getCardSize() { return Math.ceil((parseInt(this.config?.card_height)||640)/50); }

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

  // ═══════════════════════════════════════════════
  //  ACCUEIL
  // ═══════════════════════════════════════════════
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
              <div class="temp-btn" role="button" aria-label="Augmenter"
                   @click=${()=>this._changeTemp(0.5)}>
                <ha-icon icon="mdi:chevron-up"></ha-icon>
              </div>` : ''}
            <div class="center-gauge">
              <div class="outer-ring"></div>
              <div class="inner-circle">
                ${wTemp ? html`
                  <span class="water-label">EAU</span>
                  <span class="water-val">${wTemp}°</span>` : ''}
                ${tTemp ? html`
                  <div class="target-box">CIBLE ${tTemp}°</div>` : ''}
              </div>
            </div>
            ${this._exists(c.entity_target_temp) ? html`
              <div class="temp-btn" role="button" aria-label="Diminuer"
                   @click=${()=>this._changeTemp(-0.5)}>
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

  _renderSchedule() {
    const c = this.config;
    const schedId = c.entity_lz_schedule;
    if (!schedId || !this.hass?.states[schedId]) return html``;

    const raw    = this.hass.states[schedId].state;
    const parts  = raw.split(':');
    const h      = parseInt(parts[0] ?? 0);
    const m      = parseInt(parts[1] ?? 0);

    const calc   = this._calcHeatingTime();
    let startStr = '';
    let readyStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    if (calc && calc !== 0) {
      const nowD    = new Date();
      const readyD  = new Date(nowD);
      readyD.setHours(h, m, 0, 0);
      if (readyD < nowD) readyD.setDate(readyD.getDate() + 1);
      const startD  = new Date(readyD.getTime() - calc.timeH * 3600000);
      startStr = `${String(startD.getHours()).padStart(2,'0')}:${String(startD.getMinutes()).padStart(2,'0')}`;
    }

    const changeTime = (dh, dm) => {
      let nh = h + dh;
      let nm = m + dm;
      if (nm >= 60) { nm -= 60; nh += 1; }
      if (nm < 0)   { nm += 60; nh -= 1; }
      nh = ((nh % 24) + 24) % 24;
      const timeStr = `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}:00`;
      this.hass.callService('input_datetime', 'set_datetime', {
        entity_id: schedId,
        time: timeStr
      });
    };

    const activate = () => {
      this.hass.callService('persistent_notification', 'create', {
        title: '🛁 Spa programmé',
        message: `Prêt à ${readyStr} — chauffe démarrera à ${startStr || '…'}`,
        notification_id: 'spa_schedule'
      });
    };

    return html`
      <div class="sched-bar">
        <ha-icon class="sched-icon" icon="mdi:clock-outline"></ha-icon>
        <div class="sched-col">
          <div class="sched-title">Prêt à</div>
          ${startStr ? html`<div class="sched-start">Démarrage à ${startStr}</div>` : ''}
        </div>
        <div class="sched-time-ctrl">
          <div class="sched-btn" @click=${()=>changeTime(-1,0)}>◂ h</div>
          <div class="sched-btn" @click=${()=>changeTime(0,-15)}>◂ 15'</div>
          <div class="sched-val">${readyStr}</div>
          <div class="sched-btn" @click=${()=>changeTime(0,15)}>15' ▸</div>
          <div class="sched-btn" @click=${()=>changeTime(1,0)}>h ▸</div>
        </div>
        <button class="sched-set-btn" @click=${activate} title="Confirmer la programmation">✓</button>
      </div>`;
  }

  _renderHeatingControl() {
    const c   = this.config;
    const id  = c.entity_target_temp;
    if (!id || !id.startsWith('climate.')) return html``;
    if (!this.hass?.states[id]) return html``;

    const hvac    = this.hass.states[id].state;
    const isOn    = hvac === 'heat';
    const curTemp = parseFloat(this._waterTemp() ?? 0);
    const tgtTemp = parseFloat(this._targetTemp() ?? 34);
    const atTemp  = curTemp >= tgtTemp - 0.5;

    const toggle = () => {
      this.hass.callService('climate', 'set_hvac_mode', {
        entity_id: id,
        hvac_mode: isOn ? 'off' : 'heat'
      });
    };

    return html`
      <div class="heat-ctrl">
        <button class="heat-btn ${isOn ? 'heat-on' : 'heat-off'}" @click=${toggle}>
          <ha-icon icon="${isOn ? 'mdi:radiator' : 'mdi:radiator-off'}"></ha-icon>
          <span>${isOn ? (atTemp ? 'Maintien' : 'Chauffe ON') : 'Chauffe OFF'}</span>
        </button>
        <div class="heat-temps">
          <div class="heat-t-btn" @click=${()=>this._changeTemp(-1)}>
            <ha-icon icon="mdi:minus"></ha-icon>
          </div>
          <div class="heat-target">${tgtTemp}°</div>
          <div class="heat-t-btn" @click=${()=>this._changeTemp(1)}>
            <ha-icon icon="mdi:plus"></ha-icon>
          </div>
        </div>
      </div>`;
  }

  _calcHeatingTime() {
    const c = this.config;
    const volume     = Number(c.lz_volume   ?? 500);
    const lossRatio  = Number(c.lz_heat_loss ?? 30) / 100;
    const efficiency = 1 - lossRatio;

    let powerW = Number(c.lz_power_w ?? 0);
    if (!powerW && this._exists(c.main_cons_entity)) {
      const unit = this._attr(c.main_cons_entity, 'unit_of_measurement') ?? '';
      const raw  = parseFloat(this._state(c.main_cons_entity));
      powerW = unit.toLowerCase().includes('kw') ? raw * 1000 : raw;
    }
    if (!powerW || isNaN(powerW)) powerW = 1942;

    const curTemp = parseFloat(this._waterTemp() ?? NaN);
    const tgtTemp = parseFloat(this._targetTemp() ?? NaN);
    if (isNaN(curTemp) || isNaN(tgtTemp)) return null;

    const deltaT = tgtTemp - curTemp;
    if (deltaT <= 0.5) return 0;

    const whNeeded      = volume * 1.163 * deltaT;
    const effectivePower = powerW * efficiency;
    const timeH          = whNeeded / effectivePower;

    return { timeH, deltaT, curTemp, tgtTemp, powerW, efficiency };
  }

  _renderLayzspaStatus() {
    const c = this.config;
    const hasStatus = this._exists(c.entity_lz_ready) || this._exists(c.entity_lz_conn);
    if (!hasStatus) return html``;

    const connected = !this._exists(c.entity_lz_conn) || this._state(c.entity_lz_conn) === 'on';
    const ready      = this._state(c.entity_lz_ready) === 'on';
    const heating    = this._state(c.entity_lz_heater) === 'on';

    const calc = this._calcHeatingTime();

    let icon, label, cls, timeStr = '';
    if (!connected) {
      icon='mdi:wifi-off';    label='Déconnecté';  cls='lz-disconnected';
    } else if (ready || (calc !== null && calc === 0)) {
      icon='mdi:hot-tub';      label='Prêt !';       cls='lz-ready';
    } else if (heating) {
      if (calc !== null && calc !== 0) {
        const h   = Math.floor(calc.timeH);
        const min = Math.round((calc.timeH - h) * 60);
        timeStr   = h > 0
          ? `${h}h${min > 0 ? min.toString().padStart(2,'0') : ''} restantes`
          : `${min} min restantes`;
        label = `En chauffe — ${timeStr}`;
      } else {
        label = 'En chauffe…';
      }
      icon='mdi:radiator'; cls='lz-heating';
    } else {
      if (calc !== null && calc !== 0) {
        const h   = Math.floor(calc.timeH);
        const min = Math.round((calc.timeH - h) * 60);
        timeStr   = h > 0
          ? `${h}h${min > 0 ? min.toString().padStart(2,'0') : ''} pour ${calc.tgtTemp}°`
          : `${min} min pour ${calc.tgtTemp}°`;
        label = `En veille — ${timeStr}`;
      } else {
        label = 'En veille';
      }
      icon='mdi:power-sleep'; cls='lz-standby';
    }

    const rssi = this._exists(c.entity_lz_rssi) ? parseInt(this._state(c.entity_lz_rssi)) : null;
    const rssiIcon = rssi===null ? '' : rssi>=-60 ? 'mdi:wifi-strength-4'
      : rssi>=-70 ? 'mdi:wifi-strength-3'
      : rssi>=-80 ? 'mdi:wifi-strength-2'
      : 'mdi:wifi-strength-1';

    return html`
      <div class="lz-status ${cls}">
        <ha-icon class="lz-icon" icon="${icon}"></ha-icon>
        <span class="lz-label">${label}</span>
        ${rssiIcon ? html`<ha-icon class="lz-wifi" icon="${rssiIcon}" title="${rssi} dBm"></ha-icon>` : ''}
      </div>`;
  }

  _renderFooterRow() {
    const c = this.config;
    const hasCons = this._exists(c.main_cons_entity);
    const hasEnergy = this._exists(c.entity_lz_energy);
    if (!hasCons && !hasEnergy) return html``;

    return html`
      <div class="footer-row">
        ${hasCons ? html`
          <div class="footer-pill">
            <ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon>
            <span>${this._state(c.main_cons_entity)} ${this._attr(c.main_cons_entity,'unit_of_measurement')??''}</span>
          </div>` : ''}
        ${hasEnergy ? html`
          <div class="footer-pill">
            <ha-icon icon="mdi:flash"></ha-icon>
            <span>${parseFloat(this._state(c.entity_lz_energy)).toFixed(2)} kWh</span>
          </div>` : ''}
      </div>`;
  }

  _renderMaintenance() {
    const c = this.config;
    const filterAge  = this._exists(c.entity_lz_filter)   ? parseFloat(this._state(c.entity_lz_filter))   : null;
    const chloreAge  = this._exists(c.entity_lz_chlorine) ? parseFloat(this._state(c.entity_lz_chlorine)) : null;
    const filterMax  = Number(c.lz_filter_max  ?? 60);
    const chloreMax  = Number(c.lz_chlorine_max ?? 14);

    const hasResetF = !!c.entity_lz_reset_filter;
    const hasResetC = !!c.entity_lz_reset_chlore;

    if (filterAge === null && chloreAge === null) return html``;

    const filterWarn = filterAge !== null && filterAge > filterMax;
    const chloreWarn = chloreAge !== null && chloreAge > chloreMax;
    const filterPct  = filterAge !== null ? Math.min(100, filterAge / filterMax * 100) : 0;
    const chlorePct  = chloreAge !== null ? Math.min(100, chloreAge / chloreMax * 100) : 0;

    const pressReset = (entityId) => {
      this.hass.callService('button', 'press', { entity_id: entityId });
    };

    return html`
      <div class="maint-row">
        ${filterAge !== null ? html`
          <div class="maint-item ${filterWarn ? 'maint-warn' : ''}">
            <div class="maint-head">
              <ha-icon icon="mdi:air-filter"></ha-icon>
              <span>Filtre</span>
              ${filterWarn ? html`<span class="maint-badge">À changer</span>` : ''}
              ${hasResetF ? html`
                <button class="maint-reset-btn" title="Filtre changé — remettre à zéro"
                  @click=${() => pressReset(c.entity_lz_reset_filter)}>
                  ✓
                </button>` : ''}
            </div>
            <div class="maint-bar">
              <div class="maint-fill ${filterWarn?'maint-fill-warn':''}"
                   style="width:${filterPct}%"></div>
            </div>
            <div class="maint-val">${Math.round(filterAge)} j / ${filterMax} j</div>
          </div>` : ''}
        ${chloreAge !== null ? html`
          <div class="maint-item ${chloreWarn ? 'maint-warn' : ''}">
            <div class="maint-head">
              <ha-icon icon="mdi:flask-outline"></ha-icon>
              <span>Chlore</span>
              ${chloreWarn ? html`<span class="maint-badge">À renouveler</span>` : ''}
              ${hasResetC ? html`
                <button class="maint-reset-btn" title="Chlore renouvelé — remettre à zéro"
                  @click=${() => pressReset(c.entity_lz_reset_chlore)}>
                  ✓
                </button>` : ''}
            </div>
            <div class="maint-bar">
              <div class="maint-fill ${chloreWarn?'maint-fill-warn':''}"
                   style="width:${chlorePct}%"></div>
            </div>
            <div class="maint-val">${Math.round(chloreAge)} j / ${chloreMax} j</div>
          </div>` : ''}
      </div>`;
  }

  _renderFlood() {
    const c = this.config;
    const hasAny = this._exists(c.entity_water_leak)||this._exists(c.entity_tamper)||this._exists(c.entity_flood_bat);
    if (!hasAny) return html``;

    const leak   = this._state(c.entity_water_leak) === 'on';
    const tamper = this._state(c.entity_tamper)      === 'on';
    const bat    = this._exists(c.entity_flood_bat)  ? parseFloat(this._state(c.entity_flood_bat)) : null;
    const alerting = leak || tamper;
    const batLow = bat !== null && bat <= 15;

    return html`
      <div class="flood-bar ${alerting ? 'flood-alert' : 'flood-ok'}">
        <div class="flood-left">
          <ha-icon class="flood-icon ${alerting ? 'flood-icon-alert' : ''}" 
                   icon="${leak ? 'mdi:water-alert' : tamper ? 'mdi:shield-alert' : 'mdi:shield-check'}"></ha-icon>
          <span>${leak ? 'FUITE EAU DETECTÉE !' : tamper ? 'SABOTAGE DETECTÉ !' : 'Sécurité OK'}</span>
        </div>
        <div class="flood-right">
          ${bat !== null ? html`
            <div class="flood-pill ${batLow ? 'pill-warn' : 'pill-ok'}">
              <ha-icon icon="${batLow ? 'mdi:battery-alert' : 'mdi:battery'}"></ha-icon>
              <span>${Math.round(bat)}%</span>
            </div>` : ''}
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  ONGLET CHIMIE (Réintégré dans la classe)
  // ═══════════════════════════════════════════════
  _renderChem() {
    const c = this.config;
    
    const phMin = c.ph_min !== undefined ? c.ph_min : 7.2;
    const phMax = c.ph_max !== undefined ? c.ph_max : 7.6;
    const orpMin = c.orp_min !== undefined ? c.orp_min : 650;
    const orpMax = c.orp_max !== undefined ? c.orp_max : 800;
    const tdsMin = c.tds_min !== undefined ? c.tds_min : 500;
    const tdsMax = c.tds_max !== undefined ? c.tds_max : 1500;
    const saltMin = c.salt_min !== undefined ? c.salt_min : 2500;
    const saltMax = c.salt_max !== undefined ? c.salt_max : 3500;

    const items = [
      { id: c.entity_ph,   name: 'pH',  icon: 'mdi:ph',         min: phMin,   max: phMax,   dec: 1, u: '' },
      { id: c.entity_orp,  name: 'ORP', icon: 'mdi:test-tube',   min: orpMin,  max: orpMax,  dec: 0, u: ' mV' },
      { id: c.entity_tds,  name: 'TDS', icon: 'mdi:shaker',      min: tdsMin,  max: tdsMax,  dec: 0, u: ' ppm' },
      { id: c.entity_salt, name: 'Sel', icon: 'mdi:snowflake',   min: saltMin, max: saltMax, dec: 0, u: ' ppm' }
    ];

    return html`
      <div class="chem-view">
        ${items.map(item => {
          if (!this._exists(item.id)) return '';
          
          const val = parseFloat(this._state(item.id));
          const ok = (val >= item.min && val <= item.max);
          
          const span = (item.max * 1.2) - (item.min * 0.8);
          const pct = span > 0 ? Math.min(100, Math.max(0, ((val - (item.min * 0.8)) / span) * 100)) : 0;
          
          const markerMin = span > 0 ? ((item.min - (item.min * 0.8)) / span) * 100 : 0;
          const markerMax = span > 0 ? ((item.max - (item.min * 0.8)) / span) * 100 : 0;

          return html`
            <div class="chem-card ${ok ? 'chem-ok' : 'chem-warn'}">
              <div class="chem-header">
                <ha-icon icon="${item.icon}"></ha-icon>
                <span class="chem-title">${item.name}</span>
                <span class="chem-status-tag">${ok ? 'Idéal' : 'Ajuster'}</span>
              </div>
              <div class="chem-value">${val.toFixed(item.dec)}${item.u}</div>
              <div class="chem-gauge-bg">
                <div class="chem-gauge-fill ${!ok ? 'chem-fill-warn' : ''}" style="width:${pct}%"></div>
                <div class="chem-marker" style="left:${markerMin}%"></div>
                <div class="chem-marker" style="left:${markerMax}%"></div>
              </div>
              <div class="chem-range">Cible : ${item.min} – ${item.max}</div>
            </div>
          `;
        })}
      </div>
    `;
  }

  // ═══════════════════════════════════════════════
  //  ONGLET CAMÉRA (Réintégré dans la classe)
  // ═══════════════════════════════════════════════
  _renderCam() {
    const c = this.config;
    if (!this._exists(c.entity_camera)) {
      return html`<div class="empty-msg"><ha-icon icon="mdi:camera-off"></ha-icon><p>Aucune caméra configurée</p></div>`;
    }

    const w  = c.cam_w_px ? `${c.cam_w_px}px` : '100%';
    const h  = c.cam_h_px ? `${c.cam_h_px}px` : '210px';
    const r  = c.cam_radius !== undefined ? `${c.cam_radius}px` : '12px';
    const x  = c.cam_x || 0;
    const y  = c.cam_y || 0;

    return html`
      <div class="cam-view">
        <div class="cam-container ${this._camExpanded ? 'cam-expanded' : ''}"
             style="width:${this._camExpanded ? '100%' : w}; height:${this._camExpanded ? 'auto' : h}; border-radius:${r};"
             @click=${() => this._camExpanded = !this._camExpanded}>
          <img src="/api/camera_proxy/${c.entity_camera}" 
               style="transform: translate(${x}px, ${y}px);" 
               alt="Flux Spa" />
          <div class="cam-overlay">
            <ha-icon icon="${this._camExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}"></ha-icon>
          </div>
        </div>
        ${this._renderSchedule()}
      </div>
    `;
  }

  // ═══════════════════════════════════════════════
  //  ONGLET SWITCHES (Réintégré dans la classe)
  // ═══════════════════════════════════════════════
  _renderSwitches() {
    const c = this.config;
    let found = false;

    const btns = Array.from({ length: 10 }, (_, i) => {
      const ep = c[`switch_${i + 1}`];
      const lbl = c[`name_switch_${i + 1}`] || `Bouton ${i + 1}`;
      if (!this._exists(ep)) return null;
      found = true;

      const active = this._state(ep) === 'on';
      const toggle = () => this.hass.callService('switch', 'toggle', { entity_id: ep });

      let icon = 'mdi:power';
      const lowLbl = lbl.toLowerCase();
      if (lowLbl.includes('pompe'))   icon = 'mdi:pump';
      if (lowLbl.includes('bulle'))   icon = 'mdi:bubble';
      if (lowLbl.includes('jet'))     icon = 'mdi:hydro-power';
      if (lowLbl.includes('chauffe')) icon = 'mdi:radiator';
      if (lowLbl.includes('verrou'))  icon = active ? 'mdi:lock' : 'mdi:lock-open';
      if (lowLbl.includes('lumi'))    icon = 'mdi:lightbulb';

      return html`
        <div class="sw-item ${active ? 'sw-active' : ''}" @click=${toggle}>
          <div class="sw-icon-box"><ha-icon icon="${icon}"></ha-icon></div>
          <div class="sw-name">${lbl}</div>
        </div>
      `;
    });

    if (!found) {
      return html`<div class="empty-msg"><ha-icon icon="mdi:toggle-switch-off"></ha-icon><p>Aucun interrupteur configuré</p></div>`;
    }

    return html`<div class="sw-view">${btns}</div>`;
  }

  // ═══════════════════════════════════════════════
  //  RENDU PRINCIPAL (Réintégré dans la classe)
  // ═══════════════════════════════════════════════
  render() {
    if (!this.config || !this.hass) return html``;
    const title  = this.config.card_title || 'SPA';
    const bgImg  = this.config.background_image ? `url(${this.config.background_image})` : 'none';
    const h      = this.config.card_height || '640px';
    const blur   = this.config.blur_amount !== undefined ? `${this.config.blur_amount}px` : '15px';

    return html`
      <ha-card style="height: ${h};">
        <div class="glass-bg" style="background-image: ${bgImg};"></div>
        <div class="glass-overlay" style="backdrop-filter: blur(${blur}); -webkit-backdrop-filter: blur(${blur});"></div>

        <div class="card-header-main">
          <h1>${title}</h1>
          <div class="nav-pills">
            <button class="pill ${this._tab==='home'?'on':''}" @click=${()=>this._tab='home'}><ha-icon icon="mdi:home-heart"></ha-icon></button>
            <button class="pill ${this._tab==='chem'?'on':''}" @click=${()=>this._tab='chem'}><ha-icon icon="mdi:flask-round-bottom"></ha-icon></button>
            <button class="pill ${this._tab==='cam'?'on':''}"  @click=${()=>this._tab='cam'}><ha-icon icon="mdi:cctv"></ha-icon></button>
            <button class="pill ${this._tab==='sw'?'on':''}"   @click=${()=>this._tab='sw'}><ha-icon icon="mdi:tune"></ha-icon></button>
          </div>
        </div>

        <div class="card-content-scroller">
          ${this._tab === 'home' ? this._renderHome() : ''}
          ${this._tab === 'chem' ? this._renderChem() : ''}
          ${this._tab === 'cam'  ? this._renderCam()  : ''}
          ${this._tab === 'sw'   ? this._renderSwitches() : ''}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
      --glass-bg: rgba(255, 255, 255, 0.06);
      --glass-border: rgba(255, 255, 255, 0.12);
      --glass-glow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
      --txt-p: #ffffff;
      --txt-s: rgba(255, 255, 255, 0.65);
      --accent-blue: #38bdf8;
      --accent-green: #4ade80;
      --accent-amber: #fbbf24;
      --accent-red: #f87171;
    }

    ha-card {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      border: 1px solid var(--glass-border) !important;
      background: rgba(10, 15, 25, 0.4) !important;
      box-shadow: var(--glass-glow);
      display: flex;
      flex-direction: column;
      color: var(--txt-p);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .glass-bg, .glass-overlay {
      position: absolute; top:0; left:0; width:100%; height:100%; z-index: 0; pointer-events: none;
    }
    .glass-bg { background-size: cover; background-position: center; filter: brightness(0.55); }

    .card-header-main {
      position: relative; z-index: 1;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 8px; flex-shrink: 0;
    }
    .card-header-main h1 {
      margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;
      background: linear-gradient(135deg, #fff 30%, var(--accent-blue));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .nav-pills {
      display: flex; gap: 6px; padding: 4px;
      background: rgba(255, 255, 255, 0.05); border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .pill {
      background: transparent; border: none; width: 34px; height: 34px;
      border-radius: 10px; color: var(--txt-s); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .pill ha-icon { --mdc-icon-size: 18px; }
    .pill:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .pill.on { background: #fff; color: #111827; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

    .card-content-scroller {
      position: relative; z-index: 1; flex: 1;
      overflow-y: auto; overflow-x: hidden; padding: 8px 16px 20px;
    }
    .card-content-scroller::-webkit-scrollbar { width: 5px; }
    .card-content-scroller::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }

    .home-view { display: flex; flex-direction: column; gap: 14px; }

    .lz-status {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-radius: 14px;
      border: 1px solid var(--glass-border); font-size: 13px; font-weight: 500;
    }
    .lz-icon { --mdc-icon-size: 18px; }
    .lz-wifi { --mdc-icon-size: 14px; margin-left: auto; opacity: 0.7; }
    
    .lz-heating { background: rgba(248, 113, 113, 0.12); color: #f87171; border-color: rgba(248, 113, 113, 0.2); }
    .lz-ready { background: rgba(74, 222, 128, 0.12); color: #4ade80; border-color: rgba(74, 222, 128, 0.2); animation: pulse-border 2s infinite; }
    .lz-standby { background: rgba(251, 191, 36, 0.08); color: #fbbf24; border-color: rgba(251, 191, 36, 0.15); }
    .lz-disconnected { background: rgba(156, 163, 175, 0.12); color: #9ca3af; border-color: rgba(156, 163, 175, 0.2); }

    @keyframes pulse-border {
      0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.2); }
      70% { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
      100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
    }

    .heat-ctrl {
      display: flex; background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--glass-border); border-radius: 16px; padding: 6px; gap: 8px;
    }
    .heat-btn {
      flex: 1; border: none; border-radius: 12px; display: flex; align-items: center;
      justify-content: center; gap: 8px; font-weight: 600; font-size: 13px; cursor: pointer;
      transition: all 0.2s; padding: 10px;
    }
    .heat-btn ha-icon { --mdc-icon-size: 18px; }
    .heat-off { background: rgba(255,255,255,0.05); color: var(--txt-s); }
    .heat-off:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .heat-on { background: linear-gradient(135deg, #ef4444, #f87171); color: #fff; box-shadow: 0 4px 12px rgba(239,68,68,0.25); }

    .heat-temps { display: flex; align-items: center; background: rgba(0,0,0,0.2); border-radius: 12px; padding: 0 4px; }
    .heat-target { min-width: 46px; text-align: center; font-size: 15px; font-weight: 700; color: #fff; }
    .heat-t-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; opacity: 0.7; transition: opacity 0.15s;
    }
    .heat-t-btn:hover { opacity: 1; }
    .heat-t-btn ha-icon { --mdc-icon-size: 16px; }

    .flex-row-center { display: flex; align-items: center; justify-content: space-between; margin: 6px 0; gap: 8px; }
    .side-col { width: 75px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .side-info { text-align: center; }
    .val-big { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .label-tiny { font-size: 9px; font-weight: 600; color: var(--txt-s); letter-spacing: 0.5px; margin-top: 2px; }
    .hum-pill { background: rgba(255,255,255,0.05); padding: 3px 7px; border-radius: 20px; font-size: 9px; color: var(--accent-blue); font-weight: 600; border: 1px solid rgba(56,189,248,0.15); }

    .gauge-container { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .temp-btn {
      width: 36px; height: 36px; background: var(--glass-bg); border: 1px solid var(--glass-border);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; color: var(--txt-s);
    }
    .temp-btn:hover { background: rgba(255,255,255,0.15); color: #fff; transform: scale(1.05); }
    .temp-btn ha-icon { --mdc-icon-size: 20px; }

    .center-gauge {
      width: 130px; height: 130px; position: relative; display: flex; align-items: center; justify-content: center;
    }
    .outer-ring {
      position: absolute; width: 100%; height: 100%; border-radius: 50%;
      border: 3px dashed rgba(56, 189, 248, 0.25);
      animation: rotate-ring 25s linear infinite;
    }
    @keyframes rotate-ring { to { transform: rotate(360deg); } }

    .inner-circle {
      width: 112px; height: 112px; border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
      border: 1px solid rgba(255,255,255,0.15); box-shadow: inset 0 4px 12px rgba(0,0,0,0.2);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .water-label { font-size: 10px; font-weight: 700; color: var(--accent-blue); letter-spacing: 1px; }
    .water-val { font-size: 30px; font-weight: 900; color: #fff; line-height: 32px; letter-spacing: -0.5px; margin: 2px 0; }
    .target-box { font-size: 9px; font-weight: 600; color: var(--txt-s); background: rgba(0,0,0,0.25); padding: 2px 6px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }

    .footer-row { display: flex; justify-content: center; gap: 8px; margin-top: 2px; }
    .footer-pill {
      background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255,255,255,0.06);
      padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 600; color: var(--txt-s);
    }
    .footer-pill ha-icon { --mdc-icon-size: 13px; color: var(--accent-blue); }
    .anim-pulse { animation: pulse-glow 1.8s infinite ease-in-out; }
    @keyframes pulse-glow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; transform: scale(1.05); } }

    .maint-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .maint-item {
      background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border);
      border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;
    }
    .maint-head { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--txt-s); }
    .maint-head ha-icon { --mdc-icon-size: 15px; color: var(--accent-blue); }
    .maint-badge { font-size: 8px; background: var(--accent-amber); color: #000; padding: 1px 4px; border-radius: 6px; font-weight: 700; margin-left: auto; }
    .maint-warn { border-color: rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.02); }
    .maint-warn .maint-head ha-icon { color: var(--accent-amber); }
    
    .maint-reset-btn {
      margin-left: auto; background: rgba(255,255,255,0.08); border: none; border-radius: 6px;
      color: #fff; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
      font-size: 10px; cursor: pointer; transition: background 0.2s; padding: 0;
    }
    .maint-reset-btn:hover { background: var(--accent-green); color: #000; }

    .maint-bar { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
    .maint-fill { height: 100%; background: var(--accent-blue); border-radius: 2px; }
    .maint-fill-warn { background: linear-gradient(90deg, var(--accent-amber), var(--accent-red)); }
    .maint-val { font-size: 10px; color: var(--txt-s); text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }

    .flood-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px; border-radius: 14px; border: 1px solid var(--glass-border);
      font-size: 12px; font-weight: 600; transition: all 0.3s;
    }
    .flood-left { display: flex; align-items: center; gap: 8px; }
    .flood-icon { --mdc-icon-size: 16px; }
    .flood-ok { background: rgba(74, 222, 128, 0.04); color: rgba(255,255,255,0.7); border-color: rgba(74, 222, 128, 0.15); }
    .flood-ok .flood-icon { color: var(--accent-green); }
    
    .flood-alert { background: rgba(248, 113, 113, 0.15); color: #fff; border-color: #f87171; animation: flood-flash 1.5s infinite alternate; }
    .flood-icon-alert { color: #f87171; animation: pulse-glow 0.8s infinite alternate; }
    @keyframes flood-flash { 0% { background: rgba(248,113,113,0.1); } 100% { background: rgba(248,113,113,0.25); box-shadow: inset 0 0 10px rgba(248,113,113,0.2); } }

    .flood-right { display: flex; align-items: center; }
    .flood-pill { display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 500; }
    .flood-pill ha-icon { --mdc-icon-size: 13px; }
    .pill-ok { background: rgba(255,255,255,0.06); color: var(--txt-s); }
    .pill-warn { background: rgba(251,191,36,0.2); color: var(--accent-amber); font-weight: 700; }

    .sched-bar {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border);
      border-radius: 14px; margin-top: 10px;
    }
    .sched-icon { --mdc-icon-size: 18px; color: var(--accent-blue); }
    .sched-col { flex: 1; display: flex; flex-direction: column; }
    .sched-title { font-size: 12px; font-weight: 600; color: #fff; }
    .sched-start { font-size: 10px; color: var(--accent-green); font-weight: 500; margin-top: 1px; }
    .sched-time-ctrl { display: flex; align-items: center; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 2px; border: 1px solid rgba(255,255,255,0.05); }
    .sched-btn { padding: 4px 6px; font-size: 10px; font-weight: 600; color: var(--txt-s); cursor: pointer; user-select: none; }
    .sched-btn:hover { color: #fff; background: rgba(255,255,255,0.05); border-radius: 4px; }
    .sched-val { padding: 0 6px; font-size: 12px; font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1); }
    .sched-set-btn { background: var(--accent-blue); border: none; border-radius: 8px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 700; cursor: pointer; font-size: 11px; margin-left: 2px; }
    .sched-set-btn:hover { transform: scale(1.05); filter: brightness(1.1); }

    .chem-view { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .chem-card {
      background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border);
      border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 4px;
    }
    .chem-header { display: flex; align-items: center; gap: 6px; }
    .chem-header ha-icon { --mdc-icon-size: 16px; }
    .chem-title { font-size: 13px; font-weight: 600; color: var(--txt-s); }
    .chem-status-tag { font-size: 9px; padding: 2px 6px; border-radius: 8px; font-weight: 700; margin-left: auto; }
    .chem-value { font-size: 22px; font-weight: 800; color: #fff; margin: 2px 0; font-variant-numeric: tabular-nums; }
    
    .chem-gauge-bg { height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; position: relative; overflow: visible; margin: 4px 0; }
    .chem-gauge-fill { height: 100%; background: var(--accent-green); border-radius: 3px; }
    .chem-marker { position: absolute; top: -2px; width: 2px; height: 9px; background: rgba(255,255,255,0.5); }
    .chem-range { font-size: 9px; color: var(--txt-s); font-weight: 500; }

    .chem-ok { border-color: rgba(74, 222, 128, 0.12); }
    .chem-ok .chem-header ha-icon { color: var(--accent-green); }
    .chem-ok .chem-status-tag { background: rgba(74, 222, 128, 0.12); color: #4ade80; }
    
    .chem-warn { border-color: rgba(248, 113, 113, 0.25); background: rgba(248, 113, 113, 0.01); }
    .chem-warn .chem-header ha-icon { color: var(--accent-red); }
    .chem-warn .chem-status-tag { background: rgba(248, 113, 113, 0.15); color: #f87171; }
    .chem-warn .chem-gauge-fill { background: var(--accent-red); }

    .cam-view { display: flex; flex-direction: column; }
    .cam-container {
      position: relative; overflow: hidden; background: #000;
      border: 1px solid var(--glass-border); cursor: pointer;
    }
    .cam-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
    .cam-overlay {
      position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5);
      border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s; color: #fff;
    }
    .cam-container:hover .cam-overlay { opacity: 1; }
    .cam-container:hover img { filter: brightness(1.1); }
    .cam-expanded { width: 100% !important; height: auto !important; max-height: 80vh; z-index: 99; }

    .sw-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
    .sw-item {
      background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border);
      border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 10px;
      cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sw-icon-box {
      width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.05);
      display: flex; align-items: center; justify-content: center; color: var(--txt-s); transition: all 0.2s;
    }
    .sw-icon-box ha-icon { --mdc-icon-size: 16px; }
    .sw-name { font-size: 11px; font-weight: 600; color: var(--txt-p); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    .sw-item:hover { background: rgba(255,255,255,0.06); transform: translateY(-1px); }
    .sw-active { background: rgba(56, 189, 248, 0.08); border-color: rgba(56, 189, 248, 0.25); }
    .sw-active .sw-icon-box { background: var(--accent-blue); color: #0a0f19; box-shadow: 0 2px 8px rgba(56,189,248,0.3); }
    .sw-active .sw-name { color: #fff; font-weight: 700; }

    .empty-msg { text-align: center; padding: 40px 20px; color: var(--txt-s); }
    .empty-msg ha-icon { --mdc-icon-size: 32px; opacity: 0.5; margin-bottom: 8px; }
    .empty-msg p { margin: 0; font-size: 13px; }
  `;
}
customElements.define('spa-card', SpaCard);
