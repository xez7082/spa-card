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

  // ─── Capteur inondation ───────────────────────────────────────
  _renderFlood() {
    const c = this.config;
    const hasAny = this._exists(c.entity_water_leak)||this._exists(c.entity_tamper)||this._exists(c.entity_flood_bat);
    if (!hasAny) return html``;

    const leak   = this._state(c.entity_water_leak) === 'on';
    const tamper = this._state(c.entity_tamper)      === 'on';
    const bat    = this._exists(c.entity_flood_bat)  ? parseFloat(this._state(c.entity_flood_bat)) : null;
    const alerting = leak || tamper;
    const batLow = bat !== null && bat < 20;
    const batIcon = bat===null ? 'mdi:battery-unknown'
      : bat>=90 ? 'mdi:battery'
      : bat>=70 ? 'mdi:battery-80'
      : bat>=50 ? 'mdi:battery-60'
      : bat>=30 ? 'mdi:battery-40'
      : bat>=15 ? 'mdi:battery-20'
      : 'mdi:battery-alert';

    return html`
      <div class="flood-bar ${alerting?'flood-alert':'flood-ok'}">
        <div class="flood-left">
          <ha-icon icon="${leak?'mdi:water-alert':'mdi:water-check'}"
                   class="flood-icon ${leak?'flood-icon-alert':''}"></ha-icon>
          <span class="flood-label">${leak?'FUITE DÉTECTÉE !':'Pas de fuite'}</span>
        </div>
        <div class="flood-right">
          ${this._exists(c.entity_tamper) ? html`
            <ha-icon icon="${tamper?'mdi:shield-alert':'mdi:shield-check'}"
                     class="flood-pill ${tamper?'pill-warn':'pill-ok'}"
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
      ph:   {lo:6.0, hi:9.0,  dec:1},
      orp:  {lo:-200,hi:1000, dec:0},
      tds:  {lo:0,   hi:3000, dec:0},
      salt: {lo:0,   hi:6000, dec:0}
    };
    const sensors = [
      {id:c.entity_ph,   key:'ph',   label:'pH',  icon:'mdi:flask',          min:n(c.ph_min),   max:n(c.ph_max),   u:''   },
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
    const val    = parseFloat(this._state(s.id));
    const hasR   = s.min!==undefined && s.max!==undefined && !isNaN(s.min) && !isNaN(s.max);
    const tooLow = hasR && val < s.min;
    const tooHigh= hasR && val > s.max;
    const oor    = tooLow||tooHigh;
    const toPos  = v => Math.min(100,Math.max(0,(v-d.lo)/(d.hi-d.lo)*100));
    const cp     = toPos(val);
    const mnP    = hasR ? toPos(s.min) : 20;
    const mxP    = hasR ? toPos(s.max) : 80;
    const cc     = oor ? '#ff9800' : '#00f9f9';
    const slabel = tooLow ? 'TROP BAS' : tooHigh ? 'TROP HAUT' : 'OK';
    return html`
      <div class="cg-row ${oor?'cg-oor':''}">
        <div class="cg-top">
          <div class="cg-left">
            <ha-icon class="cg-icon ${oor?'cg-icon-warn':''}" icon="${s.icon}"></ha-icon>
            <span class="cg-label">${s.label}</span>
          </div>
          <div class="cg-val">${val.toFixed(d.dec)}<span class="cg-unit">${s.u}</span></div>
          <div class="cg-status ${oor?'cs-warn':'cs-ok'}">${slabel}</div>
        </div>
        <div class="cg-track-wrap">
          <div class="cg-track">
            <div class="cg-zone cg-danger" style="left:0%;width:${mnP}%"></div>
            <div class="cg-zone cg-ok"     style="left:${mnP}%;width:${mxP-mnP}%"></div>
            <div class="cg-zone cg-danger" style="left:${mxP}%;width:${100-mxP}%"></div>
            ${hasR ? html`
              <div class="cg-sep" style="left:${mnP}%"></div>
              <div class="cg-sep" style="left:${mxP}%"></div>` : ''}
            <div class="cg-cursor" style="left:${cp}%;background:${cc};box-shadow:0 0 8px ${cc}80;">
              <div class="cg-needle" style="border-top-color:${cc}"></div>
            </div>
          </div>
          ${hasR ? html`
            <div class="cg-labs">
              <div class="cg-lab" style="left:${mnP}%">${s.min}</div>
              <div class="cg-lab" style="left:${mxP}%">${s.max}</div>
            </div>` : ''}
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  INTERRUPTEURS
  // ═══════════════════════════════════════════════
  _renderSwitches() {
    const c = this.config;
    const ICONS = {
      'switch.layzspa_pump':          'mdi:pump',
      'switch.layzspa_jets':          'mdi:hydro-power',
      'switch.layzspa_airbubbles':    'mdi:chart-bubble',
      'switch.layzspa_heat_regulation':'mdi:radiator',
      'switch.layzspa_power_switch':  'mdi:power',
      'switch.layzspa_lock':          'mdi:lock'
    };
    const sws = Array.from({length:10},(_,i)=>({
      id:c[`switch_${i+1}`], n:c[`name_switch_${i+1}`]
    })).filter(s => this._exists(s.id));
    return html`
      <div class="sw-grid">
        ${sws.map(s => {
          const isOn = this._state(s.id)==='on';
          const icon = ICONS[s.id] ?? (isOn?'mdi:power':'mdi:power-off');
          const domain = s.id.split('.')[0];
          const isBtn  = domain === 'button';
          const onClick = isBtn
            ? () => this.hass.callService('button','press',{entity_id:s.id})
            : () => this.hass.callService('homeassistant','toggle',{entity_id:s.id});
          const btnIcon = isBtn ? 'mdi:gesture-tap-button' : icon;
          return html`
            <div class="sw-card ${isOn&&!isBtn?'active':''}" role="button"
                 aria-label="${s.n||'Bouton'}"
                 @click=${onClick}>
              <ha-icon icon="${btnIcon}"></ha-icon>
              <span>${s.n||'Bouton'}</span>
            </div>`;
        })}
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  CAMÉRA + PROGRAMMATION (layout côte à côte)
  // ═══════════════════════════════════════════════
  _renderCamera() {
    const c        = this.config;
    const rad      = c.cam_radius || 14;
    // Taille caméra configurable — la prog prend le reste
    const camW     = c.cam_w_px ? `${c.cam_w_px}px` : '50%';   // largeur fixe ou 50%
    const camH     = c.cam_h_px ? `${c.cam_h_px}px` : '100%';  // hauteur fixe ou auto
    const schedId  = c.entity_lz_schedule;
    const hasSched = schedId && this.hass?.states[schedId];
    const calc     = this._calcHeatingTime();
    const curTemp  = parseFloat(this._waterTemp() ?? 0);
    const tgtTemp  = parseFloat(this._targetTemp() ?? 34);
    const isHeating= this._state(c.entity_lz_heater) === 'on';
    const isReady  = this._state(c.entity_lz_ready)  === 'on';

    // Durée formatée
    let timeStr = '';
    if (calc && calc !== 0) {
      const hh = Math.floor(calc.timeH);
      const mm = Math.round((calc.timeH - hh) * 60);
      timeStr  = hh > 0 ? `${hh}h${mm > 0 ? mm.toString().padStart(2,'0') : ''}` : `${mm} min`;
    }

    // Heure prêt + démarrage
    let readyStr = '--:--', startStr = '--:--';
    if (hasSched) {
      const raw   = this.hass.states[schedId].state;
      const parts = raw.split(':');
      const rh    = parseInt(parts[0] ?? 0);
      const rm    = parseInt(parts[1] ?? 0);
      readyStr    = `${String(rh).padStart(2,'0')}:${String(rm).padStart(2,'0')}`;
      if (calc && calc !== 0) {
        const nowD   = new Date();
        const readyD = new Date(nowD);
        readyD.setHours(rh, rm, 0, 0);
        if (readyD < nowD) readyD.setDate(readyD.getDate() + 1);
        const startD = new Date(readyD.getTime() - calc.timeH * 3600000);
        startStr = `${String(startD.getHours()).padStart(2,'0')}:${String(startD.getMinutes()).padStart(2,'0')}`;
      }
    }

    const changeTime = (dh, dm) => {
      if (!hasSched) return;
      const raw   = this.hass.states[schedId].state;
      const parts = raw.split(':');
      let nh = parseInt(parts[0] ?? 0) + dh;
      let nm = parseInt(parts[1] ?? 0) + dm;
      if (nm >= 60) { nm -= 60; nh += 1; }
      if (nm < 0)   { nm += 60; nh -= 1; }
      nh = ((nh % 24) + 24) % 24;
      this.hass.callService('input_datetime', 'set_datetime', {
        entity_id: schedId,
        time: `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}:00`
      });
    };

    const activateSched = () => {
      this.hass.callService('persistent_notification', 'create', {
        title: '🛁 Spa programmé',
        message: `Prêt à ${readyStr} — chauffe à ${startStr}`,
        notification_id: 'spa_schedule'
      });
    };

    const toggleHeat = () => {
      const id   = c.entity_target_temp;
      const hvac = this.hass.states[id]?.state;
      this.hass.callService('climate', 'set_hvac_mode', {
        entity_id: id, hvac_mode: hvac === 'heat' ? 'off' : 'heat'
      });
    };

    // ── Modal plein écran caméra ──
    const camModal = this._camExpanded ? html`
      <div class="cam-modal" @click=${()=>{ this._camExpanded = false; }}>
        <div class="cam-modal-inner" @click=${(e)=>e.stopPropagation()}>
          <button class="cam-modal-close" @click=${()=>{ this._camExpanded = false; }}>✕</button>
          ${this._exists(c.entity_camera) ? html`
            <hui-image .hass=${this.hass} .cameraImage=${c.entity_camera}
                       cameraView="live" style="width:100%;height:100%;object-fit:contain;">
            </hui-image>` : ''}
        </div>
      </div>` : '';

    return html`
      ${camModal}
      <div class="cam-split">

        <!-- ── Gauche : caméra ── -->
        <div class="cam-left" style="flex:0 0 ${camW};min-height:${camH};">
          <div class="cam-crop-side" style="border-radius:${rad}px;width:100%;height:${camH};"
               @click=${()=>{ this._camExpanded = true; }}>
            ${this._exists(c.entity_camera) ? html`
              <hui-image .hass=${this.hass} .cameraImage=${c.entity_camera}
                         cameraView="live">
              </hui-image>` : html`
              <div class="cam-unavailable">
                <ha-icon icon="mdi:camera-off"></ha-icon>
                <span>Caméra indisponible</span>
              </div>`}
            <div class="cam-expand-hint">
              <ha-icon icon="mdi:fullscreen"></ha-icon>
            </div>
          </div>
        </div>

        <!-- ── Droite : programmation ── -->
        <div class="prog-right">

          <!-- Statut -->
          <div class="prog-status-row">
            <span class="prog-status-pill ${isReady?'ps-ready':isHeating?'ps-heat':'ps-idle'}">
              ${isReady ? '✓ Prêt' : isHeating ? '🔥 Chauffe' : '⏸ Veille'}
            </span>
          </div>

          <!-- Températures -->
          <div class="prog-temps-mini">
            <span class="ptm-val">${curTemp}°</span>
            <span class="ptm-arr">→</span>
            <span class="ptm-val ptm-accent">${tgtTemp}°</span>
            ${timeStr ? html`<span class="ptm-dur">${timeStr}</span>` : ''}
          </div>

          <!-- Sélecteur heure -->
          ${hasSched ? html`
            <div class="prog-time-mini">
              <div class="ptm-label">Prêt à</div>
              <div class="ptm-row">
                <button class="prog-adj-btn" @click=${()=>changeTime(-1,0)}>−h</button>
                <button class="prog-adj-btn" @click=${()=>changeTime(0,-15)}>−15'</button>
                <div class="prog-time-display">${readyStr}</div>
                <button class="prog-adj-btn" @click=${()=>changeTime(0,15)}>+15'</button>
                <button class="prog-adj-btn" @click=${()=>changeTime(1,0)}>+h</button>
              </div>
              <div class="prog-start-mini">
                ▶ démarrage à <strong>${startStr}</strong>
              </div>
            </div>` : ''}

          <!-- Actions -->
          <div class="prog-actions-mini">
            <button class="prog-action-btn ${isHeating?'pab-on':'pab-off'}"
                    @click=${toggleHeat}>
              <ha-icon icon="${isHeating?'mdi:radiator':'mdi:radiator-off'}"></ha-icon>
              ${isHeating ? 'Stop' : 'Chauffer'}
            </button>
            ${hasSched ? html`
              <button class="prog-action-btn pab-sched" @click=${activateSched}>
                <ha-icon icon="mdi:alarm-check"></ha-icon>
                ${readyStr}
              </button>` : ''}
          </div>

        </div>
      </div>`;
  }

    _renderTab() {
    switch (this._tab) {
      case 'home': return this._renderHome();
      case 'chem': return this._renderChem();
      case 'sw':   return this._renderSwitches();
      case 'cam':  return this._renderCamera();
      default:     return html``;
    }
  }

  render() {
    const c    = this.config;
    const blur = c.blur_amount !== undefined ? c.blur_amount : 15;
    const nav  = [{id:'home',i:'mdi:home-variant',label:'Accueil'}];
    if (this._exists(c.entity_camera))
      nav.push({id:'cam', i:'mdi:camera',             label:'Caméra'});
    if ([c.entity_ph,c.entity_orp,c.entity_tds,c.entity_salt].some(id=>this._exists(id)))
      nav.push({id:'chem',i:'mdi:flask-round-bottom', label:'Chimie'});
    if (Array.from({length:10},(_,i)=>c[`switch_${i+1}`]).some(id=>this._exists(id)))
      nav.push({id:'sw',  i:'mdi:tune-vertical',      label:'Équipements'});
    if (!nav.find(n=>n.id===this._tab)) this._tab='home';

    return html`
      <ha-card style="height:${c.card_height||'640px'};">
        <div class="bg" style="background-image:url('${c.background_image||'/local/sparond2.png'}');">
          <div class="overlay"
               style="backdrop-filter:blur(${blur}px);-webkit-backdrop-filter:blur(${blur}px);">
            <div class="header">${c.card_title||'MY SPA'}</div>
            <div class="main-content">${this._renderTab()}</div>
            ${nav.length>1 ? html`
              <nav class="nav" aria-label="Navigation">
                ${nav.map(n=>html`
                  <ha-icon class="${this._tab===n.id?'active':''}"
                           icon="${n.i}" title="${n.label}"
                           role="button" aria-label="${n.label}"
                           @click=${()=>{ this._tab=n.id; }}>
                  </ha-icon>`)}
              </nav>` : ''}
          </div>
        </div>
      </ha-card>`;
  }

  static styles = css`
    :host { --accent:#00f9f9; --glass:rgba(255,255,255,.08); --warn:#ff9800; }

    ha-card { border-radius:30px; overflow:hidden; background:#000; color:#fff; border:none; }
    .bg     { background-size:cover; background-position:center; height:100%; width:100%; }
    .overlay {
      height:100%;
      background:linear-gradient(180deg,rgba(0,0,0,.2) 0%,rgba(0,0,0,.85) 100%);
      display:flex; flex-direction:column; padding:12px 16px 14px; box-sizing:border-box;
    }
    .header { text-align:center; opacity:.4; font-size:10px; letter-spacing:3px; margin-bottom:2px; }
    .main-content { flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }

    /* ── Statut LayZSpa ── */
    .lz-status {
      width:100%; display:flex; align-items:center; gap:8px;
      padding:7px 14px; border-radius:14px; box-sizing:border-box;
      margin-bottom:7px; border:1px solid; font-size:11px; font-weight:500;
      letter-spacing:.3px; transition:all .4s;
    }
    .lz-icon { --mdc-icon-size:18px; }
    .lz-label { flex:1; }
    .lz-wifi  { --mdc-icon-size:14px; opacity:.5; }
    .lz-ready       { background:rgba(52,211,153,.12);  border-color:rgba(52,211,153,.4);  color:#34d399; }
    .lz-heating     { background:rgba(251,146,60,.1);   border-color:rgba(251,146,60,.35); color:#fb923c; }
    .lz-standby     { background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.1); color:rgba(255,255,255,.4); }
    .lz-disconnected{ background:rgba(255,80,80,.1);    border-color:rgba(255,80,80,.4);   color:#f87171; }

    /* ── Accueil ── */
    .home-view { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding-top:4px; }
    .flex-row-center { display:flex; align-items:center; justify-content:center; width:100%; gap:6px; }
    .side-col  { flex:1; display:flex; flex-direction:column; align-items:center; min-width:70px; }
    .side-info { display:flex; flex-direction:column; align-items:center; gap:2px; }
    .val-big   { font-size:20px; font-weight:200; }
    .label-tiny{ font-size:7px; opacity:.3; text-align:center; letter-spacing:1px; }
    .hum-pill  { font-size:8px; color:var(--accent); background:var(--glass); padding:2px 6px; border-radius:5px; margin-top:4px; }
    .gauge-container { flex:0 0 150px; display:flex; flex-direction:column; align-items:center; gap:6px; }
    .center-gauge    { position:relative; width:150px; height:150px; display:flex; align-items:center; justify-content:center; }
    .outer-ring {
      position:absolute; width:100%; height:100%; border-radius:50%;
      border:1px solid rgba(0,249,249,.1); border-top:2px solid var(--accent);
      animation:rotate 8s linear infinite;
    }
    .inner-circle {
      width:124px; height:124px; background:rgba(255,255,255,.03); border-radius:50%;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      border:1px solid rgba(255,255,255,.05);
    }
    .water-val   { font-size:42px; font-weight:100; color:var(--accent); line-height:1; }
    .water-label { font-size:8px; opacity:.3; letter-spacing:2px; }
    .target-box  { margin-top:5px; background:var(--glass); padding:2px 8px; border-radius:10px; font-size:10px; opacity:.7; }
    .temp-btn {
      width:32px; height:32px; border-radius:50%; background:var(--glass);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; border:1px solid rgba(255,255,255,.1); transition:background .2s,border-color .2s;
    }
    .temp-btn:hover  { background:rgba(0,249,249,.15); border-color:var(--accent); }
    .temp-btn:active { transform:scale(.92); }

    /* ── Footer conso + énergie ── */
    .footer-row { display:flex; gap:6px; margin-top:7px; flex-wrap:wrap; justify-content:center; }
    .footer-pill {
      background:var(--glass); padding:3px 10px; border-radius:12px;
      display:flex; align-items:center; gap:5px; font-size:10px;
      border:1px solid rgba(255,255,255,.06);
    }

    /* ── Maintenance filtre / chlore ── */
    .maint-row { display:flex; gap:6px; margin-top:6px; width:100%; }
    .maint-item {
      flex:1; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
      border-radius:12px; padding:6px 9px; transition:.3s;
    }
    .maint-item.maint-warn { border-color:rgba(255,152,0,.5); background:rgba(255,152,0,.08); }
    .maint-head {
      display:flex; align-items:center; gap:5px;
      font-size:9px; opacity:.65; margin-bottom:4px;
      --mdc-icon-size:12px;
    }
    .maint-badge {
      margin-left:auto; font-size:8px; font-weight:700; letter-spacing:.5px;
      background:rgba(255,152,0,.25); color:#ff9800; padding:1px 6px; border-radius:5px;
    }
    .maint-bar { height:4px; background:rgba(255,255,255,.1); border-radius:2px; overflow:hidden; }
    .maint-fill      { height:100%; background:rgba(0,249,249,.6); border-radius:2px; transition:width .5s; }
    .maint-fill-warn { background:#ff9800; }
    .maint-val { font-size:8px; opacity:.35; margin-top:4px; text-align:right; }

    /* ── Inondation ── */
    .flood-bar {
      margin-top:6px; width:100%;
      display:flex; align-items:center; justify-content:space-between;
      padding:7px 14px; border-radius:14px; box-sizing:border-box; border:1px solid; transition:all .3s;
    }
    .flood-ok    { background:rgba(0,249,249,.06);  border-color:rgba(0,249,249,.2); }
    .flood-alert { background:rgba(255,50,50,.12);   border-color:rgba(255,80,80,.6); animation:flood-pulse 1.2s ease-in-out infinite; }
    @keyframes flood-pulse { 0%,100%{box-shadow:0 0 0 rgba(255,50,50,0)} 50%{box-shadow:0 0 12px rgba(255,80,80,.4)} }
    .flood-left  { display:flex; align-items:center; gap:7px; }
    .flood-icon  { --mdc-icon-size:20px; color:var(--accent); }
    .flood-icon-alert { color:#ff4444; animation:pulse 1s infinite; }
    .flood-label { font-size:11px; font-weight:500; letter-spacing:.5px; }
    .flood-right { display:flex; align-items:center; gap:6px; }
    .flood-pill  { display:flex; align-items:center; gap:3px; padding:2px 7px; border-radius:8px; font-size:10px; --mdc-icon-size:14px; }
    .pill-ok     { background:rgba(0,249,249,.1);  color:var(--accent); }
    .pill-warn   { background:rgba(255,152,0,.18); color:#ff9800; }

    /* ── Chimie ── */
    .chem-list { display:flex; flex-direction:column; gap:10px; width:100%; padding:4px 6px; }
    .cg-row {
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
      border-radius:16px; padding:10px 13px 12px; transition:border-color .3s,background .3s;
    }
    .cg-row.cg-oor { border-color:rgba(255,152,0,.5); background:rgba(255,152,0,.07); }
    .cg-top  { display:flex; align-items:center; gap:8px; margin-bottom:9px; }
    .cg-left { display:flex; align-items:center; gap:5px; flex:0 0 64px; }
    .cg-icon      { --mdc-icon-size:16px; opacity:.55; }
    .cg-icon-warn { color:var(--warn); opacity:1; }
    .cg-label { font-size:11px; font-weight:500; letter-spacing:.8px; opacity:.7; }
    .cg-val   { flex:1; font-size:22px; font-weight:200; color:var(--accent); line-height:1; text-align:center; }
    .cg-unit  { font-size:9px; opacity:.7; margin-left:2px; }
    .cg-status{ font-size:9px; font-weight:600; letter-spacing:.8px; padding:3px 8px; border-radius:8px; }
    .cs-ok    { background:rgba(0,249,249,.12); color:#00f9f9; }
    .cs-warn  { background:rgba(255,152,0,.18); color:#ff9800; }
    .cg-track-wrap { position:relative; padding-bottom:14px; }
    .cg-track { position:relative; height:8px; border-radius:4px; overflow:visible; background:rgba(255,255,255,.06); }
    .cg-zone  { position:absolute; top:0; height:100%; border-radius:0; }
    .cg-danger{ background:rgba(255,80,80,.25); }
    .cg-ok    { background:rgba(0,249,249,.22); }
    .cg-zone:first-child { border-radius:4px 0 0 4px; }
    .cg-zone:last-child  { border-radius:0 4px 4px 0; }
    .cg-sep   { position:absolute; top:-2px; height:12px; width:1.5px; background:rgba(255,255,255,.25); transform:translateX(-50%); }
    .cg-cursor{ position:absolute; top:50%; transform:translate(-50%,-50%); width:13px; height:13px; border-radius:50%; transition:left .5s cubic-bezier(.4,0,.2,1); z-index:2; }
    .cg-needle{ position:absolute; top:100%; left:50%; transform:translateX(-50%) translateY(2px); width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-top:5px solid; }
    .cg-labs  { position:relative; height:14px; margin-top:3px; }
    .cg-lab   { position:absolute; transform:translateX(-50%); font-size:9px; opacity:.45; white-space:nowrap; }

    /* ── Interrupteurs ── */
    .sw-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(90px,1fr)); gap:12px; width:100%; }
    .sw-card {
      background:var(--glass); padding:15px 10px; border-radius:20px; text-align:center;
      border:1px solid rgba(255,255,255,.1); transition:border-color .3s,background .3s,transform .15s;
      cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; font-size:10px;
    }
    .sw-card:hover  { background:rgba(255,255,255,.12); }
    .sw-card:active { transform:scale(.95); }
    .sw-card.active { border-color:var(--accent); background:rgba(0,249,249,.1); color:var(--accent); }
    .sw-card ha-icon { --mdc-icon-size:22px; }

    /* ── Caméra ── */
    .cam-container { display:flex; align-items:center; justify-content:center; }
    .cam-crop      { overflow:hidden; border:2px solid rgba(255,255,255,.2); background:#000; position:relative; box-shadow:0 10px 30px rgba(0,0,0,.5); }
    .cam-crop hui-image { width:100%; height:100%; object-fit:cover; }
    .cam-unavailable { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; opacity:.4; font-size:11px; }

    /* ── Contrôle chauffe ── */
    .heat-ctrl {
      display:flex; align-items:center; gap:8px; width:100%;
      margin-bottom:6px;
    }
    .heat-btn {
      flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
      padding:8px 12px; border-radius:14px; border:1px solid; cursor:pointer;
      font-size:11px; font-weight:600; letter-spacing:.4px;
      transition:all .25s; font-family:var(--paper-font-body1_-_font-family,sans-serif);
      --mdc-icon-size:16px;
    }
    .heat-on  { background:rgba(251,146,60,.15); border-color:rgba(251,146,60,.5); color:#fb923c; }
    .heat-off { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.15); color:rgba(255,255,255,.45); }
    .heat-btn:active { transform:scale(.96); }
    .heat-temps {
      display:flex; align-items:center; gap:6px;
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
      border-radius:14px; padding:5px 10px;
    }
    .heat-target { font-size:18px; font-weight:200; color:var(--accent); min-width:38px; text-align:center; }
    .heat-t-btn {
      width:26px; height:26px; border-radius:50%;
      background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; --mdc-icon-size:14px; transition:.15s;
    }
    .heat-t-btn:hover  { background:rgba(0,249,249,.15); border-color:var(--accent); }
    .heat-t-btn:active { transform:scale(.9); }

    /* ── Programmation ── */
    .sched-bar {
      display:flex; align-items:center; gap:7px; width:100%;
      background:rgba(107,142,255,.08); border:1px solid rgba(107,142,255,.25);
      border-radius:14px; padding:7px 11px; box-sizing:border-box;
      margin-bottom:5px;
    }
    .sched-icon { --mdc-icon-size:16px; color:#6b8eff; flex-shrink:0; }
    .sched-col  { display:flex; flex-direction:column; gap:1px; flex:0 0 auto; }
    .sched-title{ font-size:9px; text-transform:uppercase; letter-spacing:.6px; opacity:.45; }
    .sched-start{ font-size:9px; color:#6b8eff; opacity:.8; }
    .sched-time-ctrl {
      flex:1; display:flex; align-items:center; justify-content:center; gap:4px;
    }
    .sched-btn {
      font-size:9px; color:rgba(255,255,255,.4);
      background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
      border-radius:6px; padding:2px 5px; cursor:pointer; transition:.15s;
      white-space:nowrap;
    }
    .sched-btn:hover  { background:rgba(107,142,255,.2); color:#6b8eff; border-color:rgba(107,142,255,.4); }
    .sched-btn:active { transform:scale(.93); }
    .sched-val {
      font-size:16px; font-weight:300; color:#6b8eff;
      min-width:44px; text-align:center; letter-spacing:.5px;
    }
    .sched-set-btn {
      background:rgba(107,142,255,.18); border:1px solid rgba(107,142,255,.4);
      color:#6b8eff; border-radius:8px; padding:3px 8px;
      font-size:12px; font-weight:700; cursor:pointer; transition:.15s; flex-shrink:0;
    }
    .sched-set-btn:hover  { background:rgba(107,142,255,.32); }
    .sched-set-btn:active { transform:scale(.93); }

    /* Bouton ✓ reset maintenance */
    .maint-reset-btn {
      margin-left:auto; background:rgba(52,211,153,.15);
      border:1px solid rgba(52,211,153,.4); color:#34d399;
      border-radius:6px; padding:1px 6px; font-size:10px; font-weight:700;
      cursor:pointer; transition:.15s; line-height:1.4;
    }
    .maint-reset-btn:hover  { background:rgba(52,211,153,.3); }
    .maint-reset-btn:active { transform:scale(.93); }

    /* ── Caméra + programmation (split gauche/droite) ── */
    .cam-split {
      display:flex; gap:10px; width:100%; height:100%;
      align-items:stretch;
    }

    /* Gauche — caméra */
    .cam-left { flex:1; display:flex; align-items:center; justify-content:center; }
    .cam-crop-side {
      position:relative; width:100%; height:100%;
      overflow:hidden; cursor:pointer;
      border:1px solid rgba(255,255,255,.15); background:#000;
      box-shadow:0 4px 16px rgba(0,0,0,.5);
      transition:box-shadow .2s;
    }
    .cam-crop-side:hover { box-shadow:0 4px 24px rgba(0,249,249,.2); }
    .cam-crop-side hui-image { width:100%; height:100%; object-fit:cover; }
    .cam-expand-hint {
      position:absolute; bottom:6px; right:6px;
      background:rgba(0,0,0,.5); border-radius:6px; padding:3px 5px;
      --mdc-icon-size:14px; color:rgba(255,255,255,.6); opacity:0;
      transition:opacity .2s;
    }
    .cam-crop-side:hover .cam-expand-hint { opacity:1; }

    /* Modal plein écran */
    .cam-modal {
      position:absolute; inset:0; z-index:100;
      background:rgba(0,0,0,.92);
      display:flex; align-items:center; justify-content:center;
      border-radius:30px; cursor:pointer;
    }
    .cam-modal-inner {
      position:relative; width:calc(100% - 24px); height:calc(100% - 48px);
      cursor:default;
    }
    .cam-modal-close {
      position:absolute; top:-28px; right:0; z-index:10;
      background:rgba(255,255,255,.15); border:none; color:#fff;
      border-radius:8px; padding:3px 10px; font-size:13px; cursor:pointer;
      transition:.15s;
    }
    .cam-modal-close:hover { background:rgba(255,80,80,.4); }
    .cam-modal-inner hui-image { width:100%; height:100%; object-fit:contain; }

    /* Droite — programmation */
    .prog-right {
      flex:1; min-width:110px; display:flex; flex-direction:column;
      gap:10px; overflow:hidden;
    }

    /* Badge statut */
    .prog-status-row { display:flex; }
    .prog-status-pill {
      font-size:13px; font-weight:700; padding:6px 13px;
      border-radius:10px; letter-spacing:.3px;
    }
    .ps-ready { background:rgba(52,211,153,.18); color:#34d399; }
    .ps-heat  { background:rgba(251,146,60,.18);  color:#fb923c; }
    .ps-idle  { background:rgba(255,255,255,.08); color:rgba(255,255,255,.45); }

    /* Températures */
    .prog-temps-mini {
      display:flex; align-items:center; gap:6px;
      background:rgba(255,255,255,.05); border-radius:12px;
      padding:10px 12px; flex-wrap:wrap;
    }
    .ptm-val    { font-size:28px; font-weight:200; }
    .ptm-accent { color:var(--accent); }
    .ptm-arr    { font-size:16px; opacity:.3; }
    .ptm-dur    {
      font-size:14px; font-weight:500; opacity:.6;
      margin-left:auto; color:var(--accent);
    }

    /* Sélecteur heure */
    .prog-time-mini { display:flex; flex-direction:column; gap:5px; }
    .ptm-label {
      font-size:12px; text-transform:uppercase; letter-spacing:1px; opacity:.4; font-weight:500;
    }
    .ptm-row {
      display:flex; align-items:center; gap:4px; flex-wrap:wrap;
    }
    .prog-adj-btn {
      background:rgba(107,142,255,.14); border:1px solid rgba(107,142,255,.35);
      color:#6b8eff; border-radius:8px; padding:7px 10px;
      font-size:13px; font-weight:700; cursor:pointer;
      transition:.15s; font-family:inherit; flex:1;
    }
    .prog-adj-btn:hover  { background:rgba(107,142,255,.28); }
    .prog-adj-btn:active { transform:scale(.93); }

    /* Heure affichée */
    .prog-time-display {
      font-size:36px; font-weight:200; color:#6b8eff;
      min-width:0; flex:2; text-align:center; letter-spacing:.5px;
    }

    /* Ligne démarrage */
    .prog-start-mini {
      font-size:13px; opacity:.6; text-align:center;
      background:rgba(255,255,255,.04); border-radius:8px; padding:6px 8px;
    }
    .prog-start-mini strong { color:rgba(255,255,255,.85); font-size:16px; }

    /* Boutons action */
    .prog-actions-mini { display:flex; flex-direction:column; gap:6px; margin-top:auto; }
    .prog-action-btn {
      display:flex; align-items:center; justify-content:center;
      gap:6px; padding:11px 8px; border-radius:12px; border:1px solid;
      cursor:pointer; font-size:14px; font-weight:700; letter-spacing:.2px;
      transition:all .2s; font-family:inherit; --mdc-icon-size:18px;
      width:100%;
    }
    .pab-on    { background:rgba(251,146,60,.15); border-color:rgba(251,146,60,.5); color:#fb923c; }
    .pab-off   { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.18); color:rgba(255,255,255,.5); }
    .pab-sched { background:rgba(107,142,255,.15); border-color:rgba(107,142,255,.45); color:#6b8eff; }
    .prog-action-btn:hover  { filter:brightness(1.2); }
    .prog-action-btn:active { transform:scale(.96); }

    /* ── Nav ── */
    .nav { display:flex; justify-content:space-around; padding-top:16px; border-top:1px solid rgba(255,255,255,.1); }
    .nav ha-icon { opacity:.3; cursor:pointer; --mdc-icon-size:24px; transition:opacity .2s,color .2s; }
    .nav ha-icon:hover  { opacity:.7; }
    .nav ha-icon.active { opacity:1; color:var(--accent); }

    /* ── Animations ── */
    @keyframes rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .anim-pulse { animation:pulse 2s infinite; color:var(--accent); }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  `;
}

customElements.define('spa-card', SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'spa-card',
  name:        'Spa Master V33.9 — LayZSpa',
  description: 'Supervision spa — températures, statut LayZSpa, chimie, maintenance, caméra, équipements.',
  preview:     true
});
