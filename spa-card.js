import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V34
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
        { name:'cam_radius',    label:'Arrondi des coins (px)', selector:{ number:{ mode:'slider', min:0, max:50 } } }
      ])}
      ${this._acc('a-cpos','background:rgba(56,189,248,.15);color:#0ea5e9;','XY','Position X/Y Flux',[
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
      { id:'sw',   s:'background:rgba(251,146,60,.15);color:#f97316;',  i:$('SW'),  l:'Switches' }
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
//  CARTE  —  V34
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
      lz_volume:      500, lz_power_w: 1942, lz_heat_loss: 30,
      entity_lz_reset_filter: 'button.layzspa_reset_filter_change_timer',
      entity_lz_schedule:     'input_datetime.spa_ready_at',
      entity_lz_reset_chlore: 'button.layzspa_reset_chlorine_timer',
      lz_filter_max: 60, entity_lz_chlorine:'sensor.layzspa_chlorine_age', lz_chlorine_max: 14,
      entity_lz_energy: 'sensor.layzspa_energy', entity_lz_rssi: 'sensor.layzspa_rssi',
      main_cons_entity: 'sensor.layzspa_power',
      entity_water_leak: 'binary_sensor.innondation_spa_water_leak',
      entity_tamper:     'binary_sensor.innondation_spa_tamper',
      entity_flood_bat:  'sensor.innondation_spa_battery',
      ph_min:7.2, ph_max:7.6, orp_min:650, orp_max:800, tds_min:500, tds_max:1500, salt_min:2500, salt_max:3500,
      switch_1:'switch.layzspa_pump', name_switch_1:'Pompe',
      switch_2:'switch.layzspa_jets', name_switch_2:'Jets'
    };
  }

  static get properties() {
    return { hass:{}, config:{}, _tab:{ type:String }, _camExpanded:{ type:Boolean }, _camTime:{ type: Number } };
  }

  constructor() { 
    super(); 
    this._tab = 'home'; 
    this._camExpanded = false; 
    this._camTime = Date.now();
  }

  firstUpdated() {
    // Rafraîchissement régulier pour forcer l'image caméra si le stream natif échoue
    this._camInterval = setInterval(() => {
      if (this._tab === 'cam') { this._camTime = Date.now(); }
    }, 4000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._camInterval) clearInterval(this._camInterval);
  }

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
    return id.split('.')[0] === 'climate' ? String(this._attr(id,'temperature') ?? this._state(id)) : this._state(id);
  }

  _calcHeatingTime() {
    const c = this.config;
    const volume = Number(c.lz_volume ?? 500);
    const efficiency = 1 - (Number(c.lz_heat_loss ?? 30) / 100);
    let powerW = Number(c.lz_power_w ?? 0);
    if (!powerW && this._exists(c.main_cons_entity)) {
      const raw = parseFloat(this._state(c.main_cons_entity));
      powerW = (this._attr(c.main_cons_entity, 'unit_of_measurement')??'').toLowerCase().includes('kw') ? raw * 1000 : raw;
    }
    if (!powerW || isNaN(powerW)) powerW = 1942;
    const curTemp = parseFloat(this._waterTemp() ?? NaN);
    const tgtTemp = parseFloat(this._targetTemp() ?? NaN);
    if (isNaN(curTemp) || isNaN(tgtTemp)) return null;
    const deltaT = tgtTemp - curTemp;
    if (deltaT <= 0.5) return 0;
    return { timeH: (volume * 1.163 * deltaT) / (powerW * efficiency), deltaT, tgtTemp };
  }

  // ═══════════════════════════════════════════════
  //  ACCUEIL — BANDEAUX UNIFIÉS ET FUSIONNÉS
  // ═══════════════════════════════════════════════
  _renderHome() {
    const c = this.config;
    return html`
      <div class="home-view">
        ${this._renderUnifiedHeaderPill()}
        ${this._renderHeatingControl()}

        <div class="flex-row-center">
          <div class="side-col">
            ${this._exists(c.entity_ext_temp) ? html`
              <div class="side-info"><div class="val-big">${this._state(c.entity_ext_temp)}°</div><div class="label-tiny">EXTÉRIEUR</div></div>` : ''}
            ${this._exists(c.entity_ext_hum) ? html`<div class="hum-pill">${this._state(c.entity_ext_hum)}% HR</div>` : ''}
          </div>

          <div class="gauge-container">
            ${this._exists(c.entity_target_temp) ? html`<div class="temp-btn" @click=${()=>this._changeTemp(0.5)}><ha-icon icon="mdi:chevron-up"></ha-icon></div>` : ''}
            <div class="center-gauge">
              <div class="outer-ring"></div>
              <div class="inner-circle">
                ${this._waterTemp() ? html`<span class="water-label">EAU</span><span class="water-val">${this._waterTemp()}°</span>` : ''}
                ${this._targetTemp() ? html`<div class="target-box">CIBLE ${this._targetTemp()}°</div>` : ''}
              </div>
            </div>
            ${this._exists(c.entity_target_temp) ? html`<div class="temp-btn" @click=${()=>this._changeTemp(-0.5)}><ha-icon icon="mdi:chevron-down"></ha-icon></div>` : ''}
          </div>

          <div class="side-col">
            ${this._exists(c.entity_spa_air_temp) ? html`
              <div class="side-info"><div class="val-big">${this._state(c.entity_spa_air_temp)}°</div><div class="label-tiny">AIR SPA</div></div>` : ''}
            ${this._exists(c.entity_spa_hum) ? html`<div class="hum-pill">${this._state(c.entity_spa_hum)}% HR</div>` : ''}
          </div>
        </div>

        ${this._renderFooterRow()}
        ${this._renderMaintenance()}
      </div>`;
  }

  // Fusion complète du statut LayZSpa et de la sécurité inondation en 1 seul bandeau intelligent
  _renderUnifiedHeaderPill() {
    const c = this.config;
    
    // États Inondation / Sabotage
    const leak = this._exists(c.entity_water_leak) && this._state(c.entity_water_leak) === 'on';
    const tamper = this._exists(c.entity_tamper) && this._state(c.entity_tamper) === 'on';
    const bat = this._exists(c.entity_flood_bat) ? parseFloat(this._state(c.entity_flood_bat)) : null;

    // États Machine
    const connected = !this._exists(c.entity_lz_conn) || this._state(c.entity_lz_conn) === 'on';
    const ready = this._state(c.entity_lz_ready) === 'on';
    const heating = this._state(c.entity_lz_heater) === 'on';
    const calc = this._calcHeatingTime();

    let icon = 'mdi:hot-tub', label = 'Système Prêt', cls = 'uni-ready';

    // Algorithme de priorité d'affichage (Urgence Sécurité > États techniques)
    if (leak) {
      icon = 'mdi:water-alert'; label = 'FUITE D\'EAU DÉTECTÉE !'; cls = 'uni-alert';
    } else if (tamper) {
      icon = 'mdi:shield-alert'; label = 'SABOTAGE DÉTECTÉ !'; cls = 'uni-alert';
    } else if (!connected) {
      icon = 'mdi:wifi-off'; label = 'Spa hors ligne (WiFi)'; cls = 'uni-offline';
    } else if (heating) {
      icon = 'mdi:radiator';
      if (calc && calc !== 0) {
        const h = Math.floor(calc.timeH), m = Math.round((calc.timeH - h) * 60);
        label = `Chauffe — reste ${h > 0 ? h+'h' : ''}${m.toString().padStart(2,'0')}m`;
      } else { label = 'Chauffe active…'; }
      cls = 'uni-heating';
    } else if (!ready && calc && calc !== 0) {
      const h = Math.floor(calc.timeH), m = Math.round((calc.timeH - h) * 60);
      icon = 'mdi:power-sleep';
      label = `En veille — ${h > 0 ? h+'h' : ''}${m.toString().padStart(2,'0')}m pour cible`;
      cls = 'uni-standby';
    }

    const rssi = this._exists(c.entity_lz_rssi) ? parseInt(this._state(c.entity_lz_rssi)) : null;

    return html`
      <div class="unified-header-pill ${cls}">
        <ha-icon class="uni-main-icon" icon="${icon}"></ha-icon>
        <div class="uni-text-content">
          <span class="uni-main-label">${label}</span>
        </div>
        
        <div class="uni-right-badges">
          ${bat !== null ? html`
            <span class="uni-bat ${bat <= 15 ? 'bat-low' : ''}">
              <ha-icon icon="${bat <= 15 ? 'mdi:battery-alert' : 'mdi:battery-80'}"></ha-icon>${Math.round(bat)}%
            </span>` : ''}
          ${rssi !== null ? html`<ha-icon class="uni-wifi" icon="mdi:wifi" title="${rssi} dBm"></ha-icon>` : ''}
        </div>
      </div>
    `;
  }

  _renderHeatingControl() {
    const c = this.config; const id = c.entity_target_temp;
    if (!id || !this.hass?.states[id]) return html``;
    const isOn = this.hass.states[id].state === 'heat' || this.hass.states[id].state === 'on';
    const tgtTemp = parseFloat(this._targetTemp() ?? 34);

    return html`
      <div class="heat-ctrl">
        <button class="heat-btn ${isOn ? 'heat-on' : 'heat-off'}" @click=${() => {
          const m = id.startsWith('climate.') ? (isOn ? 'off' : 'heat') : (isOn ? 'off' : 'on');
          this.hass.callService(id.startsWith('climate.')?'climate':'switch', id.startsWith('climate.')?'set_hvac_mode':'toggle', { entity_id: id, hvac_mode: m });
        }}>
          <ha-icon icon="${isOn ? 'mdi:radiator' : 'mdi:radiator-off'}"></ha-icon>
          <span>${isOn ? 'Chauffe active' : 'Chauffe éteinte'}</span>
        </button>
        <div class="heat-temps">
          <div class="heat-t-btn" @click=${()=>this._changeTemp(-1)}><ha-icon icon="mdi:minus"></ha-icon></div>
          <div class="heat-target">${tgtTemp}°</div>
          <div class="heat-t-btn" @click=${()=>this._changeTemp(1)}><ha-icon icon="mdi:plus"></ha-icon></div>
        </div>
      </div>`;
  }

  _renderFooterRow() {
    const c = this.config;
    return html`
      <div class="footer-row">
        ${this._exists(c.main_cons_entity) ? html`<div class="footer-pill"><ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon><span>${this._state(c.main_cons_entity)} W</span></div>` : ''}
        ${this._exists(c.entity_lz_energy) ? html`<div class="footer-pill"><ha-icon icon="mdi:flash"></ha-icon><span>${parseFloat(this._state(c.entity_lz_energy)).toFixed(1)} kWh</span></div>` : ''}
      </div>`;
  }

  _renderMaintenance() {
    const c = this.config;
    const fAge = this._exists(c.entity_lz_filter) ? parseFloat(this._state(c.entity_lz_filter)) : null;
    const cAge = this._exists(c.entity_lz_chlorine) ? parseFloat(this._state(c.entity_lz_chlorine)) : null;
    if (fAge === null && cAge === null) return html``;

    return html`
      <div class="maint-row">
        ${fAge !== null ? html`
          <div class="maint-item ${fAge > Number(c.lz_filter_max??60) ? 'maint-warn' : ''}">
            <div class="maint-head"><ha-icon icon="mdi:air-filter"></ha-icon><span>Filtre</span></div>
            <div class="maint-bar"><div class="maint-fill" style="width:${Math.min(100, fAge/(c.lz_filter_max??60)*100)}%"></div></div>
            <div class="maint-val">${Math.round(fAge)}j / ${c.lz_filter_max??60}j</div>
          </div>` : ''}
        ${cAge !== null ? html`
          <div class="maint-item ${cAge > Number(c.lz_chlorine_max??14) ? 'maint-warn' : ''}">
            <div class="maint-head"><ha-icon icon="mdi:flask-outline"></ha-icon><span>Chlore</span></div>
            <div class="maint-bar"><div class="maint-fill" style="width:${Math.min(100, cAge/(c.lz_chlorine_max??14)*100)}%"></div></div>
            <div class="maint-val">${Math.round(cAge)}j / ${c.lz_chlorine_max??14}j</div>
          </div>` : ''}
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  CHIMIE — TEXTES DE CORRECTION ET EXPLICATIONS
  // ═══════════════════════════════════════════════
  _renderChem() {
    const c = this.config;
    const items = [
      { id: c.entity_ph,   name: 'pH',  icon: 'mdi:ph',         min: c.ph_min??7.2,   max: c.ph_max??7.6,   dec: 1, u: '', type:'ph' },
      { id: c.entity_orp,  name: 'ORP', icon: 'mdi:test-tube',   min: c.orp_min??650,  max: c.orp_max??800,  dec: 0, u: ' mV', type:'orp' },
      { id: c.entity_tds,  name: 'TDS', icon: 'mdi:shaker',      min: c.tds_min??500,  max: c.tds_max??1500, dec: 0, u: ' ppm', type:'tds' },
      { id: c.entity_salt, name: 'Sel', icon: 'mdi:snowflake',   min: c.salt_min??2500, max: c.salt_max??3500, dec: 0, u: ' ppm', type:'salt' }
    ];

    return html`
      <div class="chem-view">
        ${items.map(item => {
          if (!this._exists(item.id)) return '';
          const val = parseFloat(this._state(item.id));
          const isLow = val < item.min;
          const isHigh = val > item.max;
          const ok = !isLow && !isHigh;
          
          const pct = Math.min(100, Math.max(0, ((val - (item.min * 0.7)) / ((item.max * 1.3) - (item.min * 0.7))) * 100));

          // Générateur de consignes d'ajustement pratiques en cas de mauvaise valeur
          let diagnosticMsg = "";
          if (isLow) {
            if (item.type === 'ph') diagnosticMsg = "pH trop bas : Ajouter du Rehausseur pH+";
            if (item.type === 'orp') diagnosticMsg = "Désinfectant faible : Ajouter du Chlore/Brôme";
            if (item.type === 'tds') diagnosticMsg = "Minéraux faibles : Eau trop douce ou neuve";
            if (item.type === 'salt') diagnosticMsg = "Manque de sel : Ajouter du sel spécial spa";
          } else if (isHigh) {
            if (item.type === 'ph') diagnosticMsg = "pH trop élevé : Ajouter du Réducteur pH-";
            if (item.type === 'orp') diagnosticMsg = "Surchloration : Stopper les galets / aérer le spa";
            if (item.type === 'tds') diagnosticMsg = "Eau saturée : Vider partiellement et renouveler l'eau";
            if (item.type === 'salt') diagnosticMsg = "Excès de sel : Diluer en remplaçant un volume d'eau";
          }

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
              </div>
              <div class="chem-range">Cible : ${item.min} – ${item.max}</div>
              ${!ok ? html`<div class="chem-diagnostic-text">${diagnosticMsg}</div>` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  // ═══════════════════════════════════════════════
  //  ONGLET CAMÉRA — CORRIGÉ POUR STREAMING FIABLE
  // ═══════════════════════════════════════════════
  _renderCam() {
    const c = this.config;
    if (!this._exists(c.entity_camera)) {
      return html`<div class="empty-msg"><ha-icon icon="mdi:camera-off"></ha-icon><p>Aucune caméra active</p></div>`;
    }

    const r = c.cam_radius !== undefined ? `${c.cam_radius}px` : '16px';
    const x = c.cam_x || 0;
    const y = c.cam_y || 0;

    // Utilisation d'un paramètre de temps dynamique pour forcer la mise à jour de l'image
    const streamUrl = `/api/camera_proxy/${c.entity_camera}?time=${this._camTime}`;

    return html`
      <div class="cam-split-view">
        <div class="cam-block-left">
          <div class="cam-container-split ${this._camExpanded ? 'cam-expanded' : ''}"
               style="border-radius: ${r};"
               @click=${() => this._camExpanded = !this._camExpanded}>
            <img src="${streamUrl}" 
                 style="transform: translate(${x}px, ${y}px);" 
                 alt="Flux Vidéo Spa" 
                 @error=${(e) => { e.target.src = `/api/camera_proxy_stream/${c.entity_camera}`; }}/>
            <div class="cam-overlay">
              <ha-icon icon="${this._camExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}"></ha-icon>
            </div>
          </div>
        </div>

        <div class="sched-block-right">
          ${this._renderPracticalSchedule()}
        </div>
      </div>
    `;
  }

  _renderPracticalSchedule() {
    const c = this.config; const schedId = c.entity_lz_schedule;
    if (!schedId || !this.hass?.states[schedId]) return html`<div class="sched-empty"><p>Planification non configurée</p></div>`;

    const raw = this.hass.states[schedId].state;
    const parts = raw.split(':');
    const h = parseInt(parts[0]??0), m = parseInt(parts[1]??0);
    const calc = this._calcHeatingTime();
    let startStr = '', readyStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

    if (calc && calc !== 0) {
      const targetDate = new Date(); targetDate.setHours(h, m, 0, 0);
      if (targetDate < new Date()) targetDate.setDate(targetDate.getDate() + 1);
      const startDate = new Date(targetDate.getTime() - calc.timeH * 3600000);
      startStr = `${String(startDate.getHours()).padStart(2,'0')}:${String(startDate.getMinutes()).padStart(2,'0')}`;
    }

    const changeTime = (dh, dm) => {
      let nh = h + dh, nm = m + dm;
      if (nm >= 60) { nm -= 60; nh += 1; } if (nm < 0) { nm += 60; nh -= 1; }
      nh = ((nh % 24) + 24) % 24;
      this.hass.callService('input_datetime', 'set_datetime', { entity_id: schedId, time: `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}:00` });
    };

    return html`
      <div class="practical-sched-box">
        <div class="sched-headline"><ha-icon icon="mdi:clock-check-outline"></ha-icon><span>PLANIFICATION CHAUFFE</span></div>
        <div class="sched-display-main">
          <div class="sched-lbl-top">HEURE DE BAIGNADE SOUHAITÉE</div>
          <div class="sched-time-big">${readyStr}</div>
        </div>
        <div class="sched-keypad">
          <button class="keypad-btn" @click=${() => changeTime(-1, 0)}>-1h</button>
          <button class="keypad-btn" @click=${() => changeTime(0, -15)}>-15m</button>
          <button class="keypad-btn" @click=${() => changeTime(0, 15)}>+15m</button>
          <button class="keypad-btn" @click=${() => changeTime(1, 0)}>+1h</button>
        </div>
        <div class="sched-info-feedback">
          ${startStr ? html`
            <div class="feedback-row"><ha-icon icon="mdi:play-circle-outline" class="clr-green"></ha-icon><div>Démarrer à : <strong class="clr-green">${startStr}</strong></div></div>
            <div class="feedback-row"><ha-icon icon="mdi:timer-sand" class="clr-blue"></ha-icon><div>Temps de chauffe : <strong>${Math.floor(calc.timeH)}h${Math.round((calc.timeH - Math.floor(calc.timeH)) * 60).toString().padStart(2,'0')}</strong></div></div>`
          : html`<div class="feedback-row"><ha-icon icon="mdi:information-outline" class="clr-amber"></ha-icon><div>Eau à température cible ou calcul indisponible.</div></div>`}
        </div>
      </div>`;
  }

  _renderSwitches() {
    const c = this.config; let found = false;
    const btns = Array.from({ length: 10 }, (_, i) => {
      const ep = c[`switch_${i + 1}`]; const lbl = c[`name_switch_${i + 1}`] || `Bouton ${i + 1}`;
      if (!this._exists(ep)) return null; found = true;
      const active = this._state(ep) === 'on';
      return html`
        <div class="sw-item ${active ? 'sw-active' : ''}" @click=${() => this.hass.callService('switch', 'toggle', { entity_id: ep })}>
          <div class="sw-icon-box"><ha-icon icon="mdi:power"></ha-icon></div>
          <div class="sw-name">${lbl}</div>
        </div>`;
    });
    return found ? html`<div class="sw-view">${btns}</div>` : html`<div class="empty-msg"><p>Aucun bouton</p></div>`;
  }

  render() {
    if (!this.config || !this.hass) return html``;
    return html`
      <ha-card style="height: ${this.config.card_height || '640px'};">
        <div class="glass-bg" style="background-image: ${this.config.background_image ? `url(${this.config.background_image})` : 'none'};"></div>
        <div class="glass-overlay" style="backdrop-filter: blur(${this.config.blur_amount??15}px); -webkit-backdrop-filter: blur(${this.config.blur_amount??15}px);"></div>
        <div class="card-header-main">
          <h1>${this.config.card_title || 'SPA'}</h1>
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
      --txt-p: #ffffff;
      --txt-s: rgba(255, 255, 255, 0.65);
      --accent-blue: #38bdf8;
      --accent-green: #4ade80;
      --accent-amber: #fbbf24;
      --accent-red: #f87171;
    }

    ha-card {
      position: relative; overflow: hidden; border-radius: 24px;
      border: 1px solid var(--glass-border) !important;
      background: rgba(10, 15, 25, 0.5) !important;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
      display: flex; flex-direction: column; color: var(--txt-p);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .glass-bg, .glass-overlay { position: absolute; top:0; left:0; width:100%; height:100%; z-index: 0; pointer-events: none; }
    .glass-bg { background-size: cover; background-position: center; filter: brightness(0.5); }

    .card-header-main { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 8px; flex-shrink: 0; }
    .card-header-main h1 { margin: 0; font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #fff, var(--accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .nav-pills { display: flex; gap: 6px; padding: 4px; background: rgba(255, 255, 255, 0.05); border-radius: 14px; }
    .pill { background: transparent; border: none; width: 34px; height: 34px; border-radius: 10px; color: var(--txt-s); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .pill.on { background: #fff; color: #111827; }

    .card-content-scroller { position: relative; z-index: 1; flex: 1; overflow-y: auto; padding: 8px 16px 20px; }
    .card-content-scroller::-webkit-scrollbar { width: 4px; }
    .card-content-scroller::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

    /* UNIFIED SUPER-BAND DROP-IN PILL */
    .unified-header-pill {
      display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 16px;
      border: 1px solid var(--glass-border); font-size: 13px; font-weight: 600; margin-bottom: 4px;
    }
    .uni-main-icon { --mdc-icon-size: 20px; }
    .uni-text-content { display: flex; flex-direction: column; flex: 1; }
    .uni-main-label { letter-spacing: 0.2px; }
    .uni-right-badges { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .uni-bat { font-size: 10px; display: inline-flex; align-items: center; gap: 3px; opacity: 0.8; }
    .uni-bat ha-icon { --mdc-icon-size: 14px; }
    .bat-low { color: var(--accent-red); font-weight: 700; animation: pulse-glow 1s infinite alternate; }
    .uni-wifi { --mdc-icon-size: 14px; opacity: 0.6; }

    .uni-ready { background: rgba(74, 222, 128, 0.12); color: #4ade80; border-color: rgba(74, 222, 128, 0.25); }
    .uni-heating { background: rgba(248, 113, 113, 0.14); color: #f87171; border-color: rgba(248, 113, 113, 0.3); }
    .uni-standby { background: rgba(251, 191, 36, 0.08); color: #fbbf24; border-color: rgba(251, 191, 36, 0.2); }
    .uni-offline { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
    .uni-alert { background: rgba(239, 68, 68, 0.25); color: #fff; border-color: #ef4444; animation: pill-flash 1.2s infinite alternate; }

    @keyframes pill-flash { 0% { opacity: 0.8; } 100% { opacity: 1; box-shadow: 0 0 10px rgba(239,68,68,0.3); } }

    /* CORE COMPONENTS */
    .home-view { display: flex; flex-direction: column; gap: 14px; }
    .heat-ctrl { display: flex; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 16px; padding: 6px; gap: 8px; }
    .heat-btn { flex: 1; border: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; cursor: pointer; padding: 10px; }
    .heat-on { background: linear-gradient(135deg, #ef4444, #f87171); color: #fff; }
    .heat-off { background: rgba(255,255,255,0.06); color: var(--txt-s); }
    .heat-temps { display: flex; align-items: center; background: rgba(0,0,0,0.3); border-radius: 12px; }
    .heat-target { min-width: 44px; text-align: center; font-weight: 700; }
    .heat-t-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; }

    .flex-row-center { display: flex; align-items: center; justify-content: space-between; margin: 4px 0; }
    .side-col { width: 75px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .val-big { font-size: 22px; font-weight: 800; }
    .label-tiny { font-size: 9px; color: var(--txt-s); font-weight: 600; }
    .hum-pill { background: rgba(255,255,255,0.04); padding: 3px 6px; border-radius: 12px; font-size: 9px; color: var(--accent-blue); }

    .gauge-container { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .temp-btn { width: 34px; height: 34px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .center-gauge { width: 125px; height: 125px; position: relative; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px dashed rgba(56, 189, 248, 0.3); animation: rot 30s linear infinite; }
    @keyframes rot { to { transform: rotate(360deg); } }
    .inner-circle { width: 108px; height: 108px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .water-val { font-size: 28px; font-weight: 900; line-height: 30px; }
    .water-label { font-size: 9px; color: var(--accent-blue); font-weight: 700; }
    .target-box { font-size: 9px; color: var(--txt-s); background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 6px; }

    .footer-row { display: flex; justify-content: center; gap: 8px; }
    .footer-pill { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 20px; display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--txt-s); }
    .footer-pill ha-icon { --mdc-icon-size: 13px; color: var(--accent-blue); }

    .maint-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .maint-item { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 8px 10px; }
    .maint-head { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--txt-s); }
    .maint-head ha-icon { --mdc-icon-size: 14px; color: var(--accent-blue); }
    .maint-bar { height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; margin: 5px 0; overflow: hidden; }
    .maint-fill { height: 100%; background: var(--accent-blue); }
    .maint-val { font-size: 9px; text-align: right; color: var(--txt-s); }
    .maint-warn { border-color: rgba(251,191,36,0.3); }

    /* CHIMIE DIAGNOSTICS CONFIGURÉS */
    .chem-view { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .chem-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 14px; padding: 10px; display: flex; flex-direction: column; }
    .chem-header { display: flex; align-items: center; gap: 5px; font-size: 12px; }
    .chem-title { color: var(--txt-s); font-weight: 500; }
    .chem-status-tag { font-size: 8px; padding: 1px 4px; border-radius: 4px; margin-left: auto; }
    .chem-value { font-size: 20px; font-weight: 800; margin: 2px 0; }
    .chem-gauge-bg { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; margin: 4px 0; }
    .chem-gauge-fill { height: 100%; background: var(--accent-green); border-radius: 2px; }
    .chem-fill-warn { background: var(--accent-red); }
    .chem-range { font-size: 9px; color: var(--txt-s); }
    
    /* Style du nouveau texte explicatif */
    .chem-diagnostic-text {
      font-size: 9px; font-weight: 600; color: #ff9800; margin-top: 6px;
      background: rgba(255, 152, 0, 0.08); padding: 4px; border-radius: 4px;
      border-left: 2px solid #ff9800;
    }

    .chem-ok { border-color: rgba(74,222,128,0.15); }
    .chem-ok .chem-status-tag { background: rgba(74,222,128,0.1); color: #4ade80; }
    .chem-warn { border-color: rgba(248,113,113,0.25); background: rgba(248,113,113,0.01); }
    .chem-warn .chem-status-tag { background: rgba(248,113,113,0.15); color: #f87171; }

    /* CAM-SPLIT GRID RESPONSIVE */
    .cam-split-view { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 500px) { .cam-split-view { grid-template-columns: 1.1fr 0.9fr; } }

    .cam-container-split { position: relative; overflow: hidden; background: #000; border: 1px solid var(--glass-border); cursor: pointer; aspect-ratio: 16/10; display: flex; align-items: center; justify-content: center; }
    .cam-container-split img { width: 100%; height: 100%; object-fit: cover; }
    .cam-overlay { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.5); border-radius: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; color: #fff; }
    .cam-container-split:hover .cam-overlay { opacity: 1; }
    .cam-expanded { position: fixed; top: 12%; left: 6%; width: 88% !important; height: auto !important; z-index: 999; box-shadow: 0 15px 40px rgba(0,0,0,0.8); }

    .practical-sched-box { background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 10px; }
    .sched-headline { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; color: var(--accent-blue); letter-spacing: 0.5px; }
    .sched-display-main { background: rgba(0,0,0,0.2); border-radius: 10px; padding: 8px; text-align: center; }
    .sched-lbl-top { font-size: 9px; color: var(--txt-s); }
    .sched-time-big { font-size: 28px; font-weight: 900; color: #fff; }
    .sched-keypad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
    .keypad-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 0; font-size: 11px; color: #fff; cursor: pointer; }
    .sched-info-feedback { background: rgba(0,0,0,0.15); border-radius: 8px; padding: 6px 8px; display: flex; flex-direction: column; gap: 4px; font-size: 11px; }
    .feedback-row { display: flex; align-items: center; gap: 6px; color: var(--txt-s); }
    .feedback-row ha-icon { --mdc-icon-size: 13px; }
    .clr-green { color: var(--accent-green) !important; }
    .clr-blue { color: var(--accent-blue) !important; }

    /* GENERAL SWITCHES */
    .sw-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; }
    .sw-item { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; }
    .sw-icon-box { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; color: var(--txt-s); }
    .sw-icon-box ha-icon { --mdc-icon-size: 15px; }
    .sw-name { font-size: 11px; font-weight: 500; }
    .sw-active { background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.2); }
    .sw-active .sw-icon-box { background: var(--accent-blue); color: #0a0f19; }

    .empty-msg { text-align: center; padding: 20px; color: var(--txt-s); font-size: 12px; }
  `;
}
customElements.define('spa-card', SpaCard);
