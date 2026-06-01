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
//  CARTE  —  V33  (LayZSpa intégré)
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {

  static getConfigElement() { return document.createElement('spa-card-editor'); }

  static getStubConfig() {
    return {
      card_title:'MY LAYZSPA', blur_amount:15, card_height:'640px',
      // Températures LayZSpa
      entity_water_temp:  'sensor.layzspa_temp_c',
      entity_target_temp: 'climate.layzspa_temperature_control',
      target_temp_min: 20, target_temp_max: 40,
      // LayZSpa
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
      // Inondation
      entity_water_leak: 'binary_sensor.innondation_spa_water_leak',
      entity_tamper:     'binary_sensor.innondation_spa_tamper',
      entity_flood_bat:  'sensor.innondation_spa_battery',
      // Chimie
      ph_min:7.2, ph_max:7.6,
      orp_min:650, orp_max:800,
      tds_min:500, tds_max:1500,
      salt_min:2500, salt_max:3500,
      // Switches LayZSpa
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

  // ── Température affichée sur la jauge (climate → current_temperature) ──
  _waterTemp() {
    const wid = this.config.entity_water_temp;
    const cid = this.config.entity_target_temp;
    if (this._exists(wid)) return this._state(wid);
    // Fallback : current_temperature de l'entité climate
    if (cid && this.hass?.states[cid]) {
      const cur = this._attr(cid,'current_temperature');
      if (cur !== null) return String(cur);
    }
    return null;
  }

  // ── Consigne affichée ──
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

  // ─── Programmation horaire ───────────────────────────────────
  _renderSchedule() {
    const c = this.config;
    const schedId = c.entity_lz_schedule;
    if (!schedId || !this.hass?.states[schedId]) return html``;

    const raw    = this.hass.states[schedId].state; // "HH:MM:SS" ou "HH:MM"
    const parts  = raw.split(':');
    const h      = parseInt(parts[0] ?? 0);
    const m      = parseInt(parts[1] ?? 0);

    // Calcul heure de démarrage
    const calc   = this._calcHeatingTime();
    let startStr = '';
    let readyStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    if (calc && calc !== 0) {
      const nowD    = new Date();
      const readyD  = new Date(nowD);
      readyD.setHours(h, m, 0, 0);
      if (readyD < nowD) readyD.setDate(readyD.getDate() + 1); // demain
      const startD  = new Date(readyD.getTime() - calc.timeH * 3600000);
      startStr = `${String(startD.getHours()).padStart(2,'0')}:${String(startD.getMinutes()).padStart(2,'0')}`;
    }

    // Changer l'heure cible
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

    // Activer / désactiver la programmation via un switch dédié (optionnel)
    const activate = () => {
      // Notifie visuellement — l'automation HA se charge du déclenchement réel
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

  // ─── Contrôle chauffe : démarrer / arrêter / programmer ────────
  _renderHeatingControl() {
    const c   = this.config;
    const id  = c.entity_target_temp;
    if (!id || !id.startsWith('climate.')) return html``;
    if (!this.hass?.states[id]) return html``;

    const hvac    = this.hass.states[id].state;          // 'heat', 'off', 'fan_only'
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

  // ─── Calcul du temps de chauffe réel basé sur 500 L et puissance mesurée ───
  _calcHeatingTime() {
    const c = this.config;
    const volume     = Number(c.lz_volume   ?? 500);   // litres
    const lossRatio  = Number(c.lz_heat_loss ?? 30) / 100; // % → fraction
    const efficiency = 1 - lossRatio;                  // ex. 0.70

    // Puissance effective : config > sensor temps réel > défaut 1942 W
    let powerW = Number(c.lz_power_w ?? 0);
    if (!powerW && this._exists(c.main_cons_entity)) {
      const unit = this._attr(c.main_cons_entity, 'unit_of_measurement') ?? '';
      const raw  = parseFloat(this._state(c.main_cons_entity));
      // Convertir kW → W si besoin
      powerW = unit.toLowerCase().includes('kw') ? raw * 1000 : raw;
    }
    if (!powerW || isNaN(powerW)) powerW = 1942;

    // Températures
    const curTemp = parseFloat(this._waterTemp() ?? NaN);
    const tgtTemp = parseFloat(this._targetTemp() ?? NaN);
    if (isNaN(curTemp) || isNaN(tgtTemp)) return null;

    const deltaT = tgtTemp - curTemp;
    if (deltaT <= 0.5) return 0; // déjà à température

    // Q (Wh) = volume × 1.163 Wh/L/°C × ΔT
    const whNeeded      = volume * 1.163 * deltaT;
    const effectivePower = powerW * efficiency;
    const timeH          = whNeeded / effectivePower;

    return { timeH, deltaT, curTemp, tgtTemp, powerW, efficiency };
  }

  // ─── Bandeau statut LayZSpa (prêt / en chauffe / déconnecté) ───
  _renderLayzspaStatus() {
    const c = this.config;
    const hasStatus = this._exists(c.entity_lz_ready) || this._exists(c.entity_lz_conn);
    if (!hasStatus) return html``;

    const connected = !this._exists(c.entity_lz_conn) || this._state(c.entity_lz_conn) === 'on';
    const ready     = this._state(c.entity_lz_ready) === 'on';
    const heating   = this._state(c.entity_lz_heater) === 'on';

    // ── Calcul du temps réel basé sur physique ──
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
      // En veille mais on indique quand même le temps nécessaire
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

    // Signal WiFi
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

  // ─── Ligne du bas : conso + énergie ──────────────────────────
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

  // ─── Alertes maintenance filtre / chlore + boutons reset ────────
  _renderMaintenance() {
    const c = this.config;
    const filterAge  = this._exists(c.entity_lz_filter)   ? parseFloat(this._state(c.entity_lz_filter))   : null;
    const chloreAge  = this._exists(c.entity_lz_chlorine) ? parseFloat(this._state(c.entity_lz_chlorine)) : null;
    const filterMax  = Number(c.lz_filter_max ?? 60);
    const chloreMax  = Number(c.lz_chlorine_max ?? 14);
    const hasResetF  = !!c.entity_lz_reset_filter;
    const hasResetC  = !!c.entity_lz_reset_chlore;

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
                        @click=${() => pressReset(c.entity_lz_reset_filter)}> ✓ </button>` : ''}
            </div>
            <div class="maint-bar">
              <div class="maint-fill ${filterWarn?'maint-fill-warn':''}" style="width:${filterPct}%"></div>
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
                        @click=${() => pressReset(c.entity_lz_reset_chlore)}> ✓ </button>` : ''}
            </div>
            <div class="maint-bar">
              <div class="maint-fill ${chloreWarn?'maint-fill-warn':''}" style="width:${chlorePct}%"></div>
            </div>
            <div class="maint-val">${Math.round(chloreAge)} j / ${chloreMax} j</div>
          </div>` : ''}
      </div>`;
  }

  // ─── Capteur inondation ───────────────────────────────────────
  _renderFlood() {
    const c = this.config;
    const hasAny = this._exists(c.entity_water_leak)||this._exists(c.entity_tamper)||this._exists(c.entity_flood_bat);
    if (!hasAny) return html``;

    const leak   = this._state(c.entity_water_leak) === 'on';
    const tamper = this._state(c.entity_tamper) === 'on';
    const bat    = this._exists(c.entity_flood_bat) ? parseFloat(this._state(c.entity_flood_bat)) : null;

    const alerting = leak || tamper;
    const batLow   = bat !== null && bat < 20;

    const batIcon  = bat===null ? 'mdi:battery-unknown' : bat>=90 ? 'mdi:battery' : bat>=70 ? 'mdi:battery-80'
                   : bat>=50 ? 'mdi:battery-60' : bat>=30 ? 'mdi:battery-40' : bat>=15 ? 'mdi:battery-20' : 'mdi:battery-alert';

    return html`
      <div class="flood-bar ${alerting?'flood-alert':'flood-ok'}">
        <div class="flood-left">
          <ha-icon icon="${leak?'mdi:water-alert':'mdi:water-check'}" class="flood-icon ${leak?'flood-icon-alert':''}"></ha-icon>
          <span class="flood-label">${leak?'FUITE DÉTECTÉE !':'Pas de fuite'}</span>
        </div>
        <div class="flood-right">
          ${this._exists(c.entity_tamper) ? html`
            <ha-icon icon="${tamper?'mdi:shield-alert':'mdi:shield-check'}" class="flood-pill ${tamper?'pill-warn':'pill-ok'}"
                     title="${tamper?'Sabotage !':'Intégrité OK'}"></ha-icon>` : ''}
          ${bat !== null ? html`
            <div class="flood-pill ${batLow?'pill-warn':'pill-ok'}">
              <ha-icon icon="${batIcon}"></ha-icon>
              <span>${Math.round(bat)}%</span>
            </div>` : ''}
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  CHIMIE — jauges horizontales
  // ═══════════════════════════════════════════════
  _renderChem() {
    const c = this.config;
    const n = v => (v!==undefined&&v!==null&&v!=='') ? Number(v) : undefined;

    const DISPLAY = {
      ph:   {lo:6.0,  hi:9.0,  dec:1},
      orp:  {lo:-200, hi:1000, dec:0},
      tds:  {lo:0,    hi:3000, dec:0},
      salt: {lo:0,    hi:6000, dec:0}
    };

    const sensors = [
      {id:c.entity_ph,   key:'ph',   label:'pH',  icon:'mdi:flask',           min:n(c.ph_min),   max:n(c.ph_max),   u:''   },
      {id:c.entity_orp,  key:'orp',  label:'ORP', icon:'mdi:lightning-bolt',  min:n(c.orp_min),  max:n(c.orp_max),  u:'mV' },
      {id:c.entity_tds,  key:'tds',  label:'TDS', icon:'mdi:water-percent',   min:n(c.tds_min),  max:n(c.tds_max),  u:'ppm'},
      {id:c.entity_salt, key:'salt', label:'SEL', icon:'mdi:shaker-outline',  min:n(c.salt_min), max:n(c.salt_max), u:'ppm'}
    ].filter(s => this._exists(s.id));

    return html`
      <div class="chem-list">
        ${sensors.map(s => this._chemGauge(s, DISPLAY[s.key]))}
      </div>`;
  }

  _chemGauge(s, d) {
    const val = parseFloat(this._state(s.id));
    const hasR = s.min!==undefined && s.max!==undefined && !isNaN(s.min) && !isNaN(s.max);

    const tooLow  = hasR && val < s.min;
    const tooHigh = hasR && val > s.max;
    const oor     = tooLow||tooHigh;

    const toPos = v => Math.min(100,Math.max(0,(v-d.lo)/(d.hi-d.lo)*100));
    const cp  = toPos(val);
    const mnP = hasR ? toPos(s.min) : 20;
    const mxP = hasR ? toPos(s.max) : 80;

    const cc = oor ? '#ff9800' : '#00f9f9';
    const slabel = tooLow ? 'TROP BAS' : tooHigh ? 'TROP HAUT' : 'OK';

    return html`
      <div class="cg-row ${oor?'cg-oor':''}">
        <div class="cg-top">
          <div class="cg-left">
            <ha-icon class="cg-icon ${oor?'cg-icon-warn':''}" icon="${s.icon}"></ha-icon>
            <span class="cg-label">${s.label}</span>
          </div>
          <div class="cg-val">
            ${val.toFixed(d.dec)} <span class="cg-unit">${s.u}</span>
            ${hasR ? html`<span class="cg-status-lbl" style="color:${cc}">• ${slabel}</span>` : ''}
          </div>
        </div>
        <div class="cg-track-wrap">
          <div class="cg-track">
            ${hasR ? html`<div class="cg-range" style="left:${mnP}%; right:${100-mxP}%"></div>` : ''}
            <div class="cg-cursor" style="left:${cp}%; background:${cc}"></div>
          </div>
          ${hasR ? html`
            <div class="cg-ticks">
              <span style="left:${mnP}%">${s.min}</span>
              <span style="left:${mxP}%">${s.max}</span>
            </div>` : ''}
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  VUE CAMÉRA + PROGRAMMATION CÔTE À CÔTE
  // ═══════════════════════════════════════════════
  _renderCamView() {
    const c = this.config;
    if (!this._exists(c.entity_camera)) return html``;

    return html`
      <div class="cam-layout-container">
        <div class="cam-box" @click=${() => { this._camExpanded = !this._camExpanded; }}>
          <hui-image
            .hass=${this.hass}
            .cameraImage=${c.entity_camera}
            .cameraView=${this._camExpanded ? 'live' : 'auto'}
            style="width: 100%; height: auto; border-radius: ${c.cam_radius ?? 12}px;">
          </hui-image>
        </div>

        <div class="cam-schedule-side">
          ${this._renderSchedule()}
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  BOUTONS / ACTIONS (SWITCHES)
  // ═══════════════════════════════════════════════
  _renderSwitches() {
    const c = this.config;
    const items = [];
    for (let i=1; i<=10; i++) {
      const id = c[`switch_${i}`];
      if (this._exists(id)) {
        items.push({ id, name: c[`name_switch_${i}`] || id.split('.')[1] });
      }
    }
    if (!items.length) return html`<div class="no-data">Aucun bouton configuré.</div>`;

    return html`
      <div class="sw-grid">
        ${items.map(item => {
          const state = this._state(item.id);
          const isOn  = state === 'on';
          const icon  = this._attr(item.id,'icon') ?? 'mdi:toggle-switch-outline';
          return html`
            <button class="sw-btn ${isOn ? 'sw-on' : 'sw-off'}"
                    @click=${() => this.hass.callService('homeassistant', 'toggle', { entity_id: item.id })}>
              <ha-icon icon="${icon}"></ha-icon>
              <div class="sw-name">${item.name}</div>
              <div class="sw-state">${state.toUpperCase()}</div>
            </button>`;
        })}
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  STRUCTURE PRINCIPALE & NAVIGATION
  // ═══════════════════════════════════════════════
  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const title = c.card_title || 'SPA LAYZSPA';
    const h = c.card_height || '640px';
    const b = c.blur_amount !== undefined ? c.blur_amount : 15;
    const bg = c.background_image ? `url(${c.background_image})` : 'none';

    return html`
      <ha-card style="height:${h};">
        <div class="bg-img" style="background-image:${bg}; filter: blur(${b}px);"></div>
        <div class="card-overlay" style="backdrop-filter: blur(${b}px); -webkit-backdrop-filter: blur(${b}px);"></div>

        <div class="card-content">
          <div class="header">${title}</div>

          <div class="main-body">
            ${this._tab === 'home' ? this._renderHome() : ''}
            ${this._tab === 'chem' ? this._renderChem() : ''}
            ${this._tab === 'cam'  ? this._renderCamView() : ''}
            ${this._tab === 'sw'   ? this._renderSwitches() : ''}
          </div>

          <div class="nav">
            <ha-icon icon="mdi:home"        class="${this._tab==='home'?'active':''}" @click=${()=>{this._tab='home';}}></ha-icon>
            <ha-icon icon="mdi:flask"       class="${this._tab==='chem'?'active':''}" @click=${()=>{this._tab='chem';}}></ha-icon>
            <ha-icon icon="mdi:camera"      class="${this._tab==='cam'?'active':''}"  @click=${()=>{this._tab='cam';}}></ha-icon>
            <ha-icon icon="mdi:unfold-more-horizontal" class="${this._tab==='sw'?'active':''}" @click=${()=>{this._tab='sw';}}></ha-icon>
          </div>
        </div>
      </ha-card>`;
  }

  // ═══════════════════════════════════════════════
  //  STYLES GRAPHICS & GLASSMORPHISM
  // ═══════════════════════════════════════════════
  static styles = css`
    :host { display:block; box-sizing:border-box; }
    ha-card {
      position:relative; overflow:hidden; border-radius:24px;
      border:1px solid rgba(255,255,255,.12); background:#12141c;
      color:#fff; font-family:var(--paper-font-body1_-_font-family,sans-serif);
    }
    .bg-img {
      position:absolute; top:-10px; left:-10px; right:-10px; bottom:-10px;
      background-size:cover; background-position:center; z-index:0; transform:scale(1.05);
    }
    .card-overlay {
      position:absolute; top:0; left:0; right:0; bottom:0;
      background:linear-gradient(135deg, rgba(20,24,35,0.72), rgba(12,14,20,0.88)); z-index:1;
    }
    .card-content {
      position:relative; z-index:2; height:100%; display:flex; flex-direction:column;
      padding:20px 18px 16px; box-sizing:border-box;
    }
    .header {
      font-size:16px; font-weight:800; letter-spacing:1px; text-transform:uppercase;
      text-align:center; color:rgba(255,255,255,.85); margin-bottom:14px;
      text-shadow:0 2px 4px rgba(0,0,0,.4);
    }
    .main-body { flex:1; overflow-y:auto; overflow-x:hidden; padding-right:2px; }
    .main-body::-webkit-scrollbar { width:4px; }
    .main-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,.15); border-radius:4px; }

    /* Conteneur Caméra + Programmation Côte à côte élargie */
    .cam-layout-container {
      display: flex;
      flex-direction: row;
      gap: 16px;
      align-items: stretch;
      width: 100%;
      margin-top: 10px;
    }
    .cam-box {
      flex: 1;
      cursor: pointer;
    }
    .cam-schedule-side {
      flex: 1.5; /* Élargit substantiellement le bloc programmation par rapport à la caméra */
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* Ajustement de l'alignement interne du module de programmation */
    .sched-bar {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 12px 16px;
      gap: 10px;
    }
    .sched-icon { color: #6b8eff; --mdc-icon-size: 22px; }
    .sched-col { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .sched-title { font-size: 11px; font-weight: 500; color: rgba(255,255,255,.5); text-transform: uppercase; }
    .sched-start { font-size: 12px; font-weight: 700; color: #6b8eff; }
    .sched-time-ctrl { display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,.2); padding: 3px 6px; border-radius: 8px; }
    .sched-btn { font-size: 10px; font-weight: bold; background: rgba(255,255,255,.08); padding: 4px 6px; border-radius: 4px; cursor: pointer; user-select: none; }
    .sched-btn:hover { background: rgba(255,255,255,.15); }
    .sched-val { font-size: 13px; font-weight: 800; min-width: 42px; text-align: center; color: #fff; }
    .sched-set-btn { background: #6b8eff; border: none; color: white; font-weight: bold; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
    .sched-set-btn:hover { filter: brightness(1.1); }

    /* ── Vue Accueil ── */
    .home-view { display:flex; flex-direction:column; gap:12px; }
    .flex-row-center { display:flex; align-items:center; justify-content:space-between; margin:6px 0; }
    .side-col { width:22%; display:flex; flex-direction:column; align-items:center; gap:10px; }
    .side-info { text-align:center; }
    .val-big { font-size:22px; font-weight:900; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,.3); }
    .label-tiny { font-size:9px; font-weight:700; color:rgba(255,255,255,.4); letter-spacing:.5px; margin-top:2px; }
    .hum-pill { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:10px; padding:4px 8px; font-size:10px; font-weight:600; color:rgba(255,255,255,.7); }
    
    /* Jauge Centrée */
    .gauge-container { display:flex; flex-direction:column; align-items:center; gap:6px; }
    .temp-btn { width:32px; height:32px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.15s; }
    .temp-btn:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.2); }
    .center-gauge { position:relative; width:120px; height:120px; display:flex; align-items:center; justify-content:center; }
    .outer-ring { position:absolute; width:100%; height:100%; border-radius:50%; border:4px dashed rgba(0,249,249,.25); animation:rot 40s linear infinite; box-shadow:0 0 15px rgba(0,249,249,0.05); }
    @keyframes rot { 100% { transform:rotate(360deg); } }
    .inner-circle { position:relative; width:102px; height:102px; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,.04) 0%, rgba(255,255,255,.01) 70%); border:1px solid rgba(255,255,255,.12); display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:inset 0 4px 12px rgba(0,0,0,.3), 0 4px 10px rgba(0,0,0,.4); }
    .water-label { font-size:10px; font-weight:800; color:#00f9f9; letter-spacing:1px; text-shadow:0 0 8px rgba(0,249,249,.4); }
    .water-val { font-size:28px; font-weight:900; color:#fff; line-height:30px; margin:2px 0; }
    .target-box { background:rgba(255,255,255,.08); border-radius:6px; padding:2px 6px; font-size:9px; font-weight:700; color:rgba(255,255,255,.6); letter-spacing:.3px; }

    /* Contrôle de la chauffe */
    .heat-ctrl { display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:8px 12px; }
    .heat-btn { display:flex; align-items:center; gap:8px; border:none; border-radius:10px; padding:8px 14px; font-weight:700; font-size:12px; cursor:pointer; transition:all .2s; }
    .heat-on { background:rgba(251,146,60,.15); border:1px solid rgba(251,146,60,.4); color:#fb923c; box-shadow:0 0 10px rgba(251,146,60,0.1); }
    .heat-off { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.5); }
    .heat-temps { display:flex; align-items:center; gap:10px; background:rgba(0,0,0,.2); padding:4px 8px; border-radius:10px; }
    .heat-t-btn { cursor:pointer; opacity:.6; transition:.15s; --mdc-icon-size:18px; }
    .heat-t-btn:hover { opacity:1; }
    .heat-target { font-size:14px; font-weight:800; min-width:32px; text-align:center; }

    /* Bandeau Statut */
    .lz-status { display:flex; align-items:center; border-radius:12px; padding:8px 12px; gap:10px; border:1px solid rgba(255,255,255,.08); }
    .lz-icon { --mdc-icon-size:20px; }
    .lz-label { font-size:12px; font-weight:600; flex:1; }
    .lz-wifi { opacity:.5; --mdc-icon-size:16px; }
    .lz-heating { background:rgba(239,68,68,.12); color:#f87171; border-color:rgba(239,68,68,.25); }
    .lz-ready { background:rgba(16,185,129,.12); color:#34d399; border-color:rgba(16,185,129,.25); }
    .lz-standby { background:rgba(107,142,255,.1); color:#93c5fd; border-color:rgba(107,142,255,.2); }
    .lz-disconnected { background:rgba(156,163,175,.12); color:#9ca3af; border-color:rgba(156,163,175,.2); }

    /* Ligne du bas */
    .footer-row { display:flex; gap:10px; justify-content:center; }
    .footer-pill { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); padding:5px 12px; border-radius:10px; font-size:11px; font-weight:600; color:rgba(255,255,255,.7); }
    .footer-pill ha-icon { --mdc-icon-size:14px; color:#fbbf24; }
    .anim-pulse { animation:pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity:1; } 50% { opacity:.4; } }

    /* Maintenance Filtre / Chlore */
    .maint-row { display:flex; gap:10px; }
    .maint-item { flex:1; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:12px; padding:8px 10px; display:flex; flex-direction:column; gap:5px; }
    .maint-head { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:rgba(255,255,255,.6); }
    .maint-head ha-icon { --mdc-icon-size:14px; }
    .maint-badge { background:rgba(239,68,68,.15); color:#f87171; font-size:8px; padding:1px 4px; border-radius:4px; margin-left:auto; text-transform:uppercase; }
    .maint-reset-btn { margin-left:auto; border:none; background:rgba(255,255,255,.1); color:#fff; font-size:9px; padding:2px 6px; border-radius:4px; cursor:pointer; }
    .maint-reset-btn:hover { background:rgba(255,255,255,.2); }
    .maint-bar { height:4px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; }
    .maint-fill { height:100%; background:#34d399; border-radius:2px; }
    .maint-fill-warn { background:#ef4444 !important; }
    .maint-val { font-size:9px; text-align:right; color:rgba(255,255,255,.4); }
    .maint-warn { border-color:rgba(239,68,68,.3); background:linear-gradient(to bottom, rgba(239,68,68,0.02), rgba(239,68,68,0.05)); }

    /* Inondation */
    .flood-bar { display:flex; align-items:center; justify-content:space-between; border-radius:12px; padding:6px 12px; border:1px solid transparent; }
    .flood-left { display:flex; align-items:center; gap:8px; }
    .flood-icon { --mdc-icon-size:16px; }
    .flood-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.3px; }
    .flood-right { display:flex; gap:6px; }
    .flood-pill { background:rgba(255,255,255,.08); padding:2px 6px; border-radius:6px; display:flex; align-items:center; gap:4px; font-size:10px; font-weight:600; }
    .flood-pill ha-icon { --mdc-icon-size:12px; }
    .flood-ok { background:rgba(16,185,129,.05); border-color:rgba(16,185,129,.15); color:rgba(52,211,153,.8); }
    .flood-alert { background:rgba(239,68,68,.12); border-color:rgba(239,68,68,.3); color:#f87171; animation:blink 1.5s infinite; }
    .flood-icon-alert { animation:pulse 0.5s infinite alternate; }
    @keyframes blink { 0%,100% { border-color:rgba(239,68,68,.3); } 50% { border-color:rgba(239,68,68,.7); box-shadow:0 0 8px rgba(239,68,68,0.2); } }
    .pill-ok { color:rgba(255,255,255,.5); }
    .pill-warn { color:#ff9800; background:rgba(255,152,0,.15); }

    /* ── Vue Chimie ── */
    .chem-list { display:flex; flex-direction:column; gap:12px; padding:4px 2px; }
    .cg-row { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:10px 12px; display:flex; flex-direction:column; gap:6px; }
    .cg-top { display:flex; align-items:center; justify-content:space-between; }
    .cg-left { display:flex; align-items:center; gap:8px; }
    .cg-icon { --mdc-icon-size:16px; color:#00f9f9; }
    .cg-icon-warn { color:#ff9800; }
    .cg-label { font-size:12px; font-weight:800; letter-spacing:.5px; color:rgba(255,255,255,.8); }
    .cg-val { font-size:13px; font-weight:700; color:#fff; display:flex; align-items:center; gap:4px; }
    .cg-unit { font-size:10px; color:rgba(255,255,255,.4); font-weight:normal; }
    .cg-status-lbl { font-size:9px; font-weight:700; margin-left:4px; text-transform:uppercase; letter-spacing:.3px; }
    .cg-track-wrap { display:flex; flex-direction:column; gap:3px; margin-top:2px; }
    .cg-track { position:relative; height:5px; background:rgba(255,255,255,.08); border-radius:3px; }
    .cg-range { position:absolute; top:0; bottom:0; background:rgba(255,255,255,.15); border-radius:1px; }
    .cg-cursor { position:absolute; top:-3px; width:11px; height:11px; border-radius:50%; transform:translateX(-50%); box-shadow:0 1px 4px rgba(0,0,0,.5); transition:left 0.3s ease; }
    .cg-ticks { position:relative; height:10px; font-size:8px; color:rgba(255,255,255,.3); font-weight:600; }
    .cg-ticks span { position:absolute; transform:translateX(-50%); }
    .cg-oor { border-color:rgba(255,152,0,.25); background:linear-gradient(to bottom, rgba(255,152,0,0.01), rgba(255,152,0,0.03)); }

    /* ── Vue Interrupteurs ── */
    .sw-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; padding:4px 2px; }
    .sw-btn { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:12px; display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; color:#fff; transition:all .15s; }
    .sw-btn ha-icon { --mdc-icon-size:22px; opacity:.6; }
    .sw-name { font-size:12px; font-weight:700; color:rgba(255,255,255,.8); text-align:center; }
    .sw-state { font-size:9px; font-weight:800; color:rgba(255,255,255,.3); letter-spacing:.5px; }
    .sw-on { background:rgba(0,249,249,.06) !important; border-color:rgba(0,249,249,.3) !important; box-shadow:0 2px 8px rgba(0,249,249,0.05); }
    .sw-on ha-icon { color:#00f9f9; opacity:1 !important; filter:drop-shadow(0 0 4px rgba(0,249,249,.4)); }
    .sw-on .sw-state { color:#00f9f9; opacity:.8; }
    .sw-btn:hover { border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.07); }
    .sw-btn:active { transform:scale(.97); }

    /* ── Barre de Navigation Basse ── */
    .nav { display:flex; justify-content:space-around; padding-top:16px; border-top:1px solid rgba(255,255,255,.1); margin-top:auto; }
    .nav ha-icon { opacity:.3; cursor:pointer; --mdc-icon-size:24px; transition:opacity .2s, color .2s; }
    .nav ha-icon:hover { opacity:.6; }
    .nav ha-icon.active { opacity:1; color:#00f9f9; filter:drop-shadow(0 0 6px rgba(0,249,249,.4)); }
    .no-data { text-align:center; color:rgba(255,255,255,.4); font-size:12px; padding:20px; }

    /* Responsive mobile */
    @media (max-width: 450px) {
      .cam-layout-container {
        flex-direction: column;
      }
    }
  `;
}
customElements.define('spa-card', SpaCard);
