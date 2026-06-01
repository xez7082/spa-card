import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V34  (LayZSpa intégré - Prog & Chimie Opti)
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
        { name:'target_temp_min',     label:'Consigne min (°C)',      selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'target_temp_max',     label:'Consigne max (°C)',      selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'entity_ext_temp',     label:'Temp. extérieure',       selector:{ entity:{ domain:'sensor' } } },
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
//  CARTE  —  V34  (LayZSpa intégré)
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
      entity_lz_ttr:     'sensor.layzspa_time_to_ready',
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
      switch_1:'switch.layzspa_pump',         name_switch_1:'Pompe',
      switch_2:'switch.layzspa_jets',          name_switch_2:'Jets',
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

  // ─── Programmation horaire (Grand cadre optimisé) ──────────────
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
      <div class="big-sched-box">
        <div class="bs-header">
          <ha-icon icon="mdi:clock-check-outline"></ha-icon>
          <div class="bs-title-grid">
            <span class="bs-title">PROGRAMMATION CHAUFFE</span>
            ${startStr ? html`<span class="bs-subtitle">Démarrage estimé à <b>${startStr}</b></span>` : ''}
          </div>
        </div>
        
        <div class="bs-controls">
          <button class="bs-btn-large bg-hour" @click=${()=>changeTime(-1,0)}>
            <ha-icon icon="mdi:minus"></ha-icon>1h
          </button>
          <button class="bs-btn-large bg-min" @click=${()=>changeTime(0,-15)}>
            <ha-icon icon="mdi:minus"></ha-icon>15m
          </button>
          
          <div class="bs-display-val">${readyStr}</div>
          
          <button class="bs-btn-large bg-min" @click=${()=>changeTime(0,15)}>
            +15m<ha-icon icon="mdi:plus"></ha-icon>
          </button>
          <button class="bs-btn-large bg-hour" @click=${()=>changeTime(1,0)}>
            +1h<ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
        
        <button class="bs-confirm-action" @click=${activate}>
          <ha-icon icon="mdi:check-circle-outline"></ha-icon>
          VALIDER L'HEURE DE PRÉPARATION
        </button>
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
    const ready     = this._state(c.entity_lz_ready) === 'on';
    const heating   = this._state(c.entity_lz_heater) === 'on';

    const calc = this._calcHeatingTime();

    let icon, label, cls, timeStr = '';
    if (!connected) {
      icon='mdi:wifi-off';    label='Déconnecté';  cls='lz-disconnected';
    } else if (ready || (calc !== null && calc === 0)) {
      icon='mdi:hot-tub';     label='Prêt !';       cls='lz-ready';
    } else if (heating) {
      if (calc !== null && calc !== 0) {
        const h   = Math.floor(calc.timeH);
        const min = Math.round((calc.timeH - h) * 60);
        timeStr   = h > 0
          ? `${h}h${min > 0 ? min.toString().padStart(2,'0') : ''}  restantes`
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
    const filterAge = this._exists(c.entity_lz_filter) ? parseFloat(this._state(c.entity_lz_filter)) : null;
    const chloreAge = this._exists(c.entity_lz_chlorine) ? parseFloat(this._state(c.entity_lz_chlorine)) : null;
    const filterMax = Number(c.lz_filter_max ?? 60);
    const chloreMax = Number(c.lz_chlorine_max ?? 14);
    const hasResetF = !!c.entity_lz_reset_filter;
    const hasResetC = !!c.entity_lz_reset_chlore;

    if (filterAge === null && chloreAge === null) return html``;

    const filterWarn = filterAge !== null && filterAge > filterMax;
    const chloreWarn = chloreAge !== null && chloreAge > chloreMax;
    const filterPct = filterAge !== null ? Math.min(100, filterAge / filterMax * 100) : 0;
    const chlorePct = chloreAge !== null ? Math.min(100, chloreAge / chloreMax * 100) : 0;

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
                <button class="maint-reset-btn" title="Filtre changé" @click=${() => pressReset(c.entity_lz_reset_filter)}>✓</button>` : ''}
            </div>
            <div class="maint-bar"><div class="maint-fill ${filterWarn?'maint-fill-warn':''}" style="width:${filterPct}%"></div></div>
            <div class="maint-val">${Math.round(filterAge)} j / ${filterMax} j</div>
          </div>` : ''}
        ${chloreAge !== null ? html`
          <div class="maint-item ${chloreWarn ? 'maint-warn' : ''}">
            <div class="maint-head">
              <ha-icon icon="mdi:flask-outline"></ha-icon>
              <span>Chlore</span>
              ${chloreWarn ? html`<span class="maint-badge">À renouveler</span>` : ''}
              ${hasResetC ? html`
                <button class="maint-reset-btn" title="Chlore renouvelé" @click=${() => pressReset(c.entity_lz_reset_chlore)}>✓</button>` : ''}
            </div>
            <div class="maint-bar"><div class="maint-fill ${chloreWarn?'maint-fill-warn':''}" style="width:${chlorePct}%"></div></div>
            <div class="maint-val">${Math.round(chloreAge)} j / ${chloreMax} j</div>
          </div>` : ''}
      </div>`;
  }

  _renderFlood() {
    const c = this.config;
    const hasAny = this._exists(c.entity_water_leak)||this._exists(c.entity_tamper)||this._exists(c.entity_flood_bat);
    if (!hasAny) return html``;

    const leak = this._state(c.entity_water_leak) === 'on';
    const tamper = this._state(c.entity_tamper) === 'on';
    const bat = this._exists(c.entity_flood_bat) ? parseFloat(this._state(c.entity_flood_bat)) : null;
    const alerting = leak || tamper;
    const batLow = bat !== null && bat < 20;

    const batIcon = bat===null ? 'mdi:battery-unknown' : bat>=90 ? 'mdi:battery' : bat>=70 ? 'mdi:battery-80' : bat>=50 ? 'mdi:battery-60' : bat>=30 ? 'mdi:battery-40' : bat>=15 ? 'mdi:battery-20' : 'mdi:battery-alert';

    return html`
      <div class="flood-bar ${alerting?'flood-alert':'flood-ok'}">
        <div class="flood-left">
          <ha-icon icon="${leak?'mdi:water-alert':'mdi:water-check'}" class="flood-icon ${leak?'flood-icon-alert':''}"></ha-icon>
          <span class="flood-label">${leak?'FUITE DÉTECTÉE !':'Pas de fuite'}</span>
        </div>
        <div class="flood-right">
          ${this._exists(c.entity_tamper) ? html`<ha-icon icon="${tamper?'mdi:shield-alert':'mdi:shield-check'}" class="flood-pill ${tamper?'pill-warn':'pill-ok'}"></ha-icon>` : ''}
          ${bat !== null ? html`<div class="flood-pill ${batLow?'pill-warn':'pill-ok'}"><ha-icon icon="${batIcon}"></ha-icon><span>${Math.round(bat)}%</span></div>` : ''}
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  CHIMIE & DIAGNOSTICS DE DOSAGE CLAIRS
  // ═══════════════════════════════════════════════
  _renderChem() {
    const c = this.config;
    const n = v => (v!==undefined&&v!==null&&v!=='') ? Number(v) : undefined;
    const DISPLAY = { ph: {lo:6.0, hi:9.0, dec:1}, orp: {lo:-200,hi:1000, dec:0}, tds: {lo:0, hi:3000, dec:0}, salt: {lo:0, hi:6000, dec:0} };

    const sensors = [
      {id:c.entity_ph, key:'ph', label:'pH', icon:'mdi:flask', min:n(c.ph_min), max:n(c.ph_max), u:'' },
      {id:c.entity_orp, key:'orp', label:'ORP', icon:'mdi:lightning-bolt', min:n(c.orp_min), max:n(c.orp_max), u:'mV' },
      {id:c.entity_tds, key:'tds', label:'TDS', icon:'mdi:water-percent', min:n(c.tds_min), max:n(c.tds_max), u:'ppm'},
      {id:c.entity_salt, key:'salt', label:'SEL', icon:'mdi:shaker-outline', min:n(c.salt_min), max:n(c.salt_max), u:'ppm'}
    ].filter(s => this._exists(s.id));

    return html`
      <div class="chem-list">
        ${sensors.map(s => this._chemGauge(s, DISPLAY[s.key]))}
      </div>`;
  }

  _getChemActionMessage(key, val, min, max) {
    if (min === undefined || max === undefined || isNaN(val)) return null;
    const vol = Number(this.config.lz_volume ?? 500); // Récupère le litrage (Défaut 500L)

    if (key === 'ph') {
      if (val < min) {
        // Règle usuelle : ~10g de pH Plus pour monter de 0.1 pour 1000L. Pour 500L -> 5g pour 0.1
        const diff = min - val;
        const qte = Math.round((diff / 0.1) * 10 * (vol / 1000));
        return { cls: 'chem-msg-plus', txt: `TROP BAS : Ajouter ${qte}g de pH PLUS` };
      }
      if (val > max) {
        // Règle usuelle : ~10g de pH Moins pour baisser de 0.1 pour 1000L.
        const diff = val - max;
        const qte = Math.round((diff / 0.1) * 10 * (vol / 1000));
        return { cls: 'chem-msg-moins', txt: `TROP HAUT : Ajouter ${qte}g de pH MOINS` };
      }
    }

    if (key === 'orp') {
      if (val < min) {
        // ORP Bas = Manque de désinfectant actif
        return { cls: 'chem-msg-plus', txt: `DÉSINFECTANT BAS : Ajouter 1 pastille de Chlore ou faire un choc` };
      }
      if (val > max) {
        return { cls: 'chem-msg-moins', txt: `TROP ÉLEVÉ : Ouvrir le spa pour aérer ou réduire les galets` };
      }
    }

    if (key === 'salt') {
      if (val < min) {
        // Manque de sel (Ex: 3g/L requis). Différence g/L * volume
        const diffPpm = min - val; // ppm <=> mg/L
        const qteKg = ((diffPpm * vol) / 1000000).toFixed(1);
        return { cls: 'chem-msg-plus', txt: `MANQUE DE SEL : Ajouter ${qteKg} kg de Sel` };
      }
      if (val > max) {
        return { cls: 'chem-msg-moins', txt: `SURDOSAGE SEL : Renouveler une partie de l'eau` };
      }
    }

    if (key === 'tds' && val > max) {
      return { cls: 'chem-msg-moins', txt: `EAU SATURÉE (TDS Haut) : Vidanger et renouveler l'eau` };
    }

    return { cls: 'chem-msg-ok', txt: `Valeur optimale — Statut OK` };
  }

  _chemGauge(s, d) {
    const val = parseFloat(this._state(s.id));
    const hasR = s.min!==undefined && s.max!==undefined && !isNaN(s.min) && !isNaN(s.max);
    const tooLow = hasR && val < s.min;
    const tooHigh= hasR && val > s.max;
    const oor = tooLow||tooHigh;

    const toPos = v => Math.min(100,Math.max(0,(v-d.lo)/(d.hi-d.lo)*100));
    const cp = toPos(val);
    const mnP = hasR ? toPos(s.min) : 20;
    const mxP = hasR ? toPos(s.max) : 80;

    const action = this._getChemActionMessage(s.key, val, s.min, s.max);

    return html`
      <div class="cg-row ${oor?'cg-oor':''}">
        <div class="cg-top">
          <div class="cg-left">
            <ha-icon class="cg-icon ${oor?'cg-icon-warn':''}" icon="${s.icon}"></ha-icon>
            <span class="cg-label">${s.label}</span>
          </div>
          <div class="cg-val-box">
            <span class="cg-cur">${val.toFixed(d.dec)}</span><span class="cg-unit">${s.u}</span>
          </div>
        </div>

        <div class="cg-track-wrap">
          <div class="cg-track">
            ${hasR ? html`<div class="cg-zone" style="left:${mnP}%; width:${mxP-mnP}%"></div>` : ''}
            <div class="cg-dot ${oor?'cg-dot-oor':''}" style="left:${cp}%"></div>
          </div>
          ${hasR ? html`
            <div class="cg-lim" style="left:${mnP}%"><span>${s.min}</span></div>
            <div class="cg-lim" style="left:${mxP}%"><span>${s.max}</span></div>` : ''}
        </div>

        ${action ? html`<div class="chem-action-msg ${action.cls}">${action.txt}</div>` : ''}
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  ONGLET CAMÉRA (Avec Programmation Incluse À Côté)
  // ═══════════════════════════════════════════════
  _renderCamTab() {
    const c = this.config;
    return html`
      <div class="cam-view-layout">
        <div class="cam-frame-container">
          ${this._exists(c.entity_camera) ? html`
            <div class="cam-wrapper">
              <hc-camera class="embedded-cam" .hass=${this.hass} .entityId=${c.entity_camera} controls></hc-camera>
            </div>
          ` : html`
            <div class="cam-placeholder">
              <ha-icon icon="mdi:camera-off"></ha-icon>
              <span>Aucune caméra configurée</span>
            </div>
          `}
        </div>

        <div class="cam-sidebar-schedule">
          ${this._renderSchedule()}
        </div>
      </div>`;
  }

  _renderSwitches() {
    const c = this.config;
    const items = [];
    for (let i=1; i<=10; i++) {
      const swId = c[`switch_${i}`];
      if (this._exists(swId)) {
        items.push({ id:swId, name:c[`name_switch_${i}`] || `Switch ${i}` });
      }
    }
    if (!items.length) return html`<div style="padding:40px;text-align:center;opacity:.5;">Aucun interrupteur configuré</div>`;

    return html`
      <div class="sw-grid">
        ${items.map(item => {
          const state = this._state(item.id);
          const active = state === 'on';
          return html`
            <button class="sw-btn ${active?'sw-active':''}" @click=${() => this.hass.callService('switch','toggle',{entity_id:item.id})}>
              <ha-icon icon="${active?'mdi:power-plug':'mdi:power-plug-off'}"></ha-icon>
              <span>${item.name}</span>
            </button>`;
        })}
      </div>`;
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const title = this.config.card_title || 'SPA';
    const bg    = this.config.background_image ? `url(${this.config.background_image})` : 'none';
    const h     = this.config.card_height || '640px';
    const bl    = this.config.blur_amount ?? 15;

    return html`
      <ha-card style="height:${h};">
        <div class="bg-img" style="background-image:${bg}; filter: blur(${bl}px);"></div>
        <div class="glass-overlay"></div>
        <div class="main-container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content-body">
            ${this._tab === 'home' ? this._renderHome() : ''}
            ${this._tab === 'chem' ? this._renderChem() : ''}
            ${this._tab === 'cam'  ? this._renderCamTab() : ''}
            ${this._tab === 'sw'   ? this._renderSwitches() : ''}
          </div>
          <div class="nav">
            <ha-icon icon="mdi:home-outline" class="${this._tab==='home'?'active':''}" @click=${()=>this._tab='home'}></ha-icon>
            <ha-icon icon="mdi:flask-outline" class="${this._tab==='chem'?'active':''}" @click=${()=>this._tab='chem'}></ha-icon>
            <ha-icon icon="mdi:video-outline" class="${this._tab==='cam'?'active':''}" @click=${()=>this._tab='cam'}></ha-icon>
            <ha-icon icon="mdi:toggle-switch-outline" class="${this._tab==='sw'?'active':''}" @click=${()=>this._tab='sw'}></ha-icon>
          </div>
        </div>
      </ha-card>`;
  }

  static styles = css`
    :host { display:block; position:relative; overflow:hidden; font-family:var(--paper-font-body1_-_font-family,sans-serif); }
    ha-card { position:relative; width:100%; height:100%; background:transparent; border-radius:24px; overflow:hidden; border:1px solid rgba(255,255,255,.12); box-shadow:0 8px 32px rgba(0,0,0,.3); }
    .bg-img { position:absolute; top:-10px; left:-10px; right:-10px; bottom:-10px; background-size:cover; background-position:center; z-index:0; }
    .glass-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(15,22,42,0.45); z-index:1; }
    .main-container { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box; padding:18px; }
    .header h1 { margin:0; font-size:18px; font-weight:700; color:#fff; text-shadow:0 2px 4px rgba(0,0,0,.4); text-transform:uppercase; letter-spacing:1px; }
    .content-body { flex:1; margin-top:12px; overflow-y:auto; overflow-x:hidden; padding-right:4px; }
    
    /* ── Nouveau Layout Onglet Caméra ── */
    .cam-view-layout { display: flex; flex-direction: column; gap: 14px; width:100%; }
    .cam-frame-container { width:100%; background:rgba(0,0,0,.3); border-radius:16px; border:1px solid rgba(255,255,255,.1); overflow:hidden; }
    .cam-wrapper { width:100%; display:block; line-height:0; }
    .embedded-cam { width:100%; height:auto; display:block; }
    .cam-placeholder { height:200px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:rgba(255,255,255,0.4); gap:10px; }
    
    /* ── Grand Cadre de Programmation Déplacé ── */
    .big-sched-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(107, 142, 255, 0.3);
      box-shadow: 0 4px 16px rgba(107, 142, 255, 0.15);
      border-radius: 16px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .bs-header { display: flex; align-items: center; gap: 10px; color: #6b8eff; }
    .bs-header ha-icon { --mdc-icon-size: 26px; }
    .bs-title-grid { display: flex; flex-direction: column; }
    .bs-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
    .bs-subtitle { font-size: 11px; color: rgba(255, 255, 255, 0.7); }
    .bs-subtitle b { color: #6b8eff; }
    
    .bs-controls { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin: 4px 0; }
    .bs-btn-large {
      flex: 1; height: 46px; border-radius: 10px; border: 1px solid rgba(255,255,255,.15);
      background: rgba(255,255,255,.08); color: #fff; font-size: 12px; font-weight: bold;
      display: flex; align-items: center; justify-content: center; gap: 2px; cursor: pointer;
      transition: all 0.2s;
    }
    .bs-btn-large ha-icon { --mdc-icon-size: 14px; }
    .bs-btn-large:hover { background: rgba(255,255,255,.15); border-color: rgba(255,255,255,.25); }
    .bs-btn-large:active { transform: scale(0.96); }
    .bs-display-val {
      padding: 0 10px; font-size: 24px; font-weight: 800; color: #6b8eff;
      text-shadow: 0 0 10px rgba(107,142,255,0.4); font-family: monospace; letter-spacing: 1px;
    }
    
    .bs-confirm-action {
      width: 100%; height: 44px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, #4f46e5, #3b82f6); color: #fff;
      font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(59,130,246,0.3);
    }
    .bs-confirm-action ha-icon { --mdc-icon-size: 18px; }
    .bs-confirm-action:hover { filter: brightness(1.15); box-shadow: 0 4px 16px rgba(59,130,246,0.45); }
    .bs-confirm-action:active { transform: scale(0.98); }

    /* ── Chimie & Messages d'actions clairs ── */
    .chem-list { display:flex; flex-direction:column; gap:14px; padding:4px 2px; }
    .cg-row { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:12px; }
    .cg-oor { border-color:rgba(239,68,68,.3); background:rgba(239,68,68,.02); }
    .cg-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    .cg-left { display:flex; align-items:center; gap:8px; }
    .cg-icon { color:#00f9f9; --mdc-icon-size:20px; }
    .cg-icon-warn { color:#ef4444; }
    .cg-label { font-size:13px; font-weight:600; color:#fff; letter-spacing:.3px; }
    .cg-val-box { display:flex; align-items:baseline; gap:1px; }
    .cg-cur { font-size:18px; font-weight:800; color:#fff; }
    .cg-unit { font-size:11px; opacity:.6; color:#fff; margin-left:2px; }
    
    .cg-track-wrap { position:relative; padding-bottom:14px; margin-bottom:4px; }
    .cg-track { height:5px; background:rgba(255,255,255,.12); border-radius:3px; position:relative; }
    .cg-zone { position:absolute; height:100%; background:rgba(0,249,249,0.22); border-radius:2px; }
    .cg-dot { width:11px; height:11px; background:#fff; border-radius:50%; position:absolute; top:-3px; transform:translateX(-50%); box-shadow:0 0 6px #fff; }
    .cg-dot-oor { background:#ef4444; box-shadow:0 0 6px #ef4444; }
    .cg-lim { position:absolute; top:9px; transform:translateX(-50%); font-size:9px; opacity:.4; color:#fff; }
    
    .chem-action-msg {
      margin-top: 10px; padding: 8px 12px; border-radius: 8px; font-size: 11px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; text-align: center;
    }
    .chem-msg-plus { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; }
    .chem-msg-moins { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; }
    .chem-msg-ok { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); color: #34d399; opacity: 0.8; }

    /* ── Styles Accueil d'origine préservés ── */
    .home-view { display:flex; flex-direction:column; gap:12px; }
    .flex-row-center { display:flex; align-items:center; justify-content:space-between; margin:6px 0; }
    .side-col { width:22%; display:flex; flex-direction:column; align-items:center; gap:10px; }
    .side-info { text-align:center; }
    .val-big { font-size:18px; font-weight:700; color:#fff; }
    .label-tiny { font-size:9px; opacity:.5; color:#fff; letter-spacing:.5px; margin-top:2px; }
    .hum-pill { padding:3px 6px; background:rgba(255,255,255,.06); border-radius:20px; font-size:9px; color:rgba(255,255,255,.7); border:1px solid rgba(255,255,255,.1); }
    
    .gauge-container { display:flex; flex-direction:column; align-items:center; gap:6px; }
    .temp-btn { width:32px; height:32px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; cursor:pointer; transition:.15s; }
    .temp-btn:hover { background:rgba(255,255,255,.16); }
    .center-gauge { width:100px; height:100px; position:relative; display:flex; align-items:center; justify-content:center; }
    .outer-ring { position:absolute; width:100%; height:100%; border:3px dashed rgba(255,255,255,.15); border-radius:50%; }
    .inner-circle { width:84px; height:84px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.15); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .water-label { font-size:9px; opacity:.5; color:#fff; }
    .water-val { font-size:24px; font-weight:800; color:#fff; line-height:26px; }
    .target-box { font-size:8px; background:rgba(255,255,255,.12); padding:2px 5px; border-radius:4px; margin-top:2px; color:#fff; font-weight:600; }
    
    .heat-ctrl { display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:8px 12px; }
    .heat-btn { border:none; border-radius:10px; height:36px; padding:0 12px; display:flex; align-items:center; gap:8px; font-weight:600; font-size:12px; cursor:pointer; transition:.2s; }
    .heat-on { background:rgba(251,146,60,.18); border:1px solid rgba(251,146,60,.4); color:#fb923c; box-shadow:0 0 10px rgba(251,146,60,.15); }
    .heat-off { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.15); color:rgba(255,255,255,.6); }
    .heat-temps { display:flex; align-items:center; gap:10px; }
    .heat-t-btn { cursor:pointer; width:26px; height:26px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.05); border-radius:6px; color:#fff; }
    .heat-target { font-size:15px; font-weight:700; color:#fff; min-width:28px; text-align:center; }
    
    .lz-status { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px; font-size:11px; font-weight:600; }
    .lz-icon { --mdc-icon-size:16px; }
    .lz-label { flex:1; text-transform:uppercase; letter-spacing:.2px; }
    .lz-wifi { --mdc-icon-size:14px; opacity:.6; }
    .lz-heating { background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.25); color:#f87171; }
    .lz-ready { background:rgba(16,185,129,.12); border:1px solid rgba(16,185,129,.25); color:#34d399; }
    .lz-standby { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.6); }
    .lz-disconnected { background:rgba(156,163,175,.15); border:1px solid rgba(156,163,175,.3); color:#9ca3af; }
    
    .footer-row { display:flex; gap:8px; justify-content:center; }
    .footer-pill { display:flex; align-items:center; gap:5px; padding:4px 10px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:20px; font-size:10px; color:rgba(255,255,255,.7); }
    .footer-pill ha-icon { --mdc-icon-size:12px; }
    
    .maint-row { display:flex; gap:8px; }
    .maint-item { flex:1; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:8px 10px; }
    .maint-warn { border-color:rgba(245,158,11,.3); background:rgba(245,158,11,.02); }
    .maint-head { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:#fff; position:relative; }
    .maint-head ha-icon { --mdc-icon-size:14px; opacity:.6; }
    .maint-badge { font-size:8px; background:#f59e0b; color:#000; padding:1px 4px; border-radius:3px; font-weight:700; margin-left:auto; }
    .maint-reset-btn { margin-left:auto; border:none; background:rgba(255,255,255,.1); color:#fff; border-radius:4px; width:16px; height:16px; font-size:9px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .maint-reset-btn:hover { background:rgba(255,255,255,0.2); }
    .maint-bar { height:4px; background:rgba(255,255,255,.1); border-radius:2px; margin:6px 0 4px; overflow:hidden; }
    .maint-fill { height:100%; background:#00f9f9; border-radius:2px; }
    .maint-fill-warn { background:#f59e0b; }
    .maint-val { font-size:9px; opacity:.5; color:#fff; text-align:right; }
    
    .flood-bar { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-radius:12px; font-size:11px; font-weight:600; }
    .flood-ok { background:rgba(16,185,129,.05); border:1px solid rgba(16,185,129,.15); color:rgba(255,255,255,.7); }
    .flood-alert { background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.3); color:#f87171; animation:pulse-border 2s infinite; }
    .flood-left { display:flex; align-items:center; gap:8px; }
    .flood-icon { --mdc-icon-size:16px; color:#34d399; }
    .flood-icon-alert { color:#f87171; }
    .flood-right { display:flex; align-items:center; gap:6px; }
    .flood-pill { display:flex; align-items:center; gap:4px; padding:2px 6px; border-radius:6px; font-size:9px; }
    .pill-ok { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.6); }
    .pill-warn { background:rgba(239,68,68,.2); border:1px solid rgba(239,68,68,.4); color:#f87171; }
    
    .sw-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
    .sw-btn { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:14px; height:46px; display:flex; align-items:center; gap:10px; padding:0 12px; color:#fff; font-size:12px; font-weight:600; cursor:pointer; transition:.2s; }
    .sw-btn ha-icon { --mdc-icon-size:18px; opacity:.5; }
    .sw-active { background:rgba(251,146,60,.15); border-color:rgba(251,146,60,.4); color:#fb923c; }
    .sw-active ha-icon { opacity:1; }
    
    .nav { display:flex; justify-content:space-around; padding-top:12px; border-top:1px solid rgba(255,255,255,.1); }
    .nav ha-icon { opacity:.3; cursor:pointer; --mdc-icon-size:22px; transition:all .2s; color:#fff; }
    .nav ha-icon:hover { opacity:.6; }
    .nav ha-icon.active { opacity:1; color:#00f9f9; filter:drop-shadow(0 0 4px rgba(0,249,249,0.4)); }
    
    @keyframes pulse-border { 0% { border-color:rgba(239,68,68,.3); } 50% { border-color:rgba(239,68,68,.7); } 100% { border-color:rgba(239,68,68,.3); } }
  `;
}
customElements.define('spa-card', SpaCard);
