import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V35  (Compact 550px & Caméra + Prog)
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
    return html`${this._acc('a-disp','background:rgba(107,142,255,.18);color:#6b8eff;','GEN','Apparence générale',[
      { name:'card_title',       label:'Titre du spa',                selector:{ text:{} } },
      { name:'background_image', label:'Image de fond (URL)',          selector:{ text:{} } },
      { name:'card_height',      label:'Hauteur totale (ex : 550px)', selector:{ text:{} } },
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
        { name:'entity_camera', label:'Entité caméra',         selector:{ entity:{ domain:'camera' } } }
      ])}`;
  }
  _renderSw() {
    const schema = Array.from({ length:10 }, (_,i) => [
      { name:`switch_${i+1}`,      label:`Entité bouton ${i+1}`, selector:{ entity:{} } },
      { name:`name_switch_${i+1}`, label:`Nom bouton ${i+1}`,    selector:{ text:{} } }
    ]).flat();
    return html`${this._acc('a-sw','background:rgba(251,146,60,.15);color:#f97316;','SW','10 boutons',schema)}`;
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
    return html`
      <div class="editor-wrap">
        <div class="tabs">
          ${TABS.map(t => html`
            <button class="tab ${this._tab===t.id?'on':''}" @click=${()=>{ this._tab=t.id; }}>
              <div class="tbox" style="${t.s}">${t.i}</div>
              <span class="tlbl">${t.l}</span>
            </button>`)}
        </div>
        <div class="sections">${{ gen:this._renderGen(), sens:this._renderSens(), chem:this._renderChem(), cam:this._renderCam(), sw:this._renderSw() }[this._tab]}</div>
      </div>`;
  }
  static styles = css`
    :host { display: block; }
    .tabs { display:flex; gap:3px; background:var(--secondary-background-color,rgba(0,0,0,.05)); border-radius:14px; padding:5px; margin-bottom:12px; }
    .tab { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; padding:5px 2px 7px; cursor:pointer; border:none; background:transparent; border-radius:9px; font-family:sans-serif; }
    .tab.on { background:var(--card-background-color,#fff); box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .tbox { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; }
    .tlbl { font-size:10px; color:var(--secondary-text-color,#888); }
    .tab.on .tlbl { color:var(--primary-text-color,#212121); font-weight:500; }
    .acc { border:1px solid var(--divider-color,rgba(0,0,0,.12)); border-radius:12px; margin-bottom:8px; overflow:hidden; }
    .ach { display:flex; align-items:center; gap:10px; padding:11px 13px; cursor:pointer; background:var(--secondary-background-color,rgba(0,0,0,.03)); }
    .aibox { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; }
    .ach-title { flex:1; font-size:13px; font-weight:500; }
    .arr { transition:transform .28s; }
    .acc.open .arr { transform:rotate(180deg); }
    .acb { display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s; }
    .acc.open .acb { grid-template-rows:1fr; }
    .acbi { padding:6px 6px 14px; }
  `;
}
customElements.define('spa-card-editor', SpaCardEditor);


// ═══════════════════════════════════════════════════════════════════
//  CARTE  —  V35  (Optimisée hauteur 550px avec Caméra & Chimie)
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement('spa-card-editor'); }
  static getStubConfig() {
    return {
      card_title:'MY LAYZSPA', blur_amount:15, card_height:'550px',
      entity_water_temp: 'sensor.layzspa_temp_c', entity_target_temp: 'climate.layzspa_temperature_control',
      target_temp_min: 20, target_temp_max: 40, lz_volume: 500, ph_min:7.2, ph_max:7.6, salt_min:2500, salt_max:3500
    };
  }
  static get properties() { return { hass:{}, config:{}, _tab:{ type:String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _exists(id) {
    if (!id || !this.hass?.states[id]) return false;
    return !['unavailable','unknown','none','--',''].includes(String(this.hass.states[id].state).toLowerCase());
  }
  _state(id) { return this._exists(id) ? this.hass.states[id].state : null; }
  _attr(id, a) { return this.hass?.states[id]?.attributes?.[a] ?? null; }

  _changeTemp(offset) {
    const id = this.config.entity_target_temp; if (!this._exists(id)) return;
    const cur = id.startsWith('climate.') ? parseFloat(this._attr(id, 'temperature') ?? this._state(id)) : parseFloat(this._state(id));
    if (isNaN(cur)) return;
    const val = Math.min(Number(this.config.target_temp_max??40), Math.max(Number(this.config.target_temp_min??20), Math.round((cur+offset)*2)/2));
    if (id.split('.')[0]==='climate') { this.hass.callService('climate','set_temperature',{ entity_id:id, temperature:val }); }
    else { this.hass.callService('input_number','set_value',{ entity_id:id, value:val }); }
  }

  _waterTemp() {
    if (this._exists(this.config.entity_water_temp)) return this._state(this.config.entity_water_temp);
    if (this.config.entity_target_temp && this.hass?.states[this.config.entity_target_temp]) {
      const cur = this._attr(this.config.entity_target_temp,'current_temperature'); if (cur !== null) return String(cur);
    }
    return null;
  }
  _targetTemp() {
    const id = this.config.entity_target_temp; if (!id || !this.hass?.states[id]) return null;
    return id.startsWith('climate.') ? String(this._attr(id,'temperature') ?? this._state(id)) : this._state(id);
  }

  _renderHome() {
    const c = this.config; const wTemp = this._waterTemp(); const tTemp = this._targetTemp();
    return html`
      <div class="home-view">
        ${this._renderHeatingControl()}
        ${this._renderLayzspaStatus()}
        <div class="flex-row-center">
          <div class="side-col">
            ${this._exists(c.entity_ext_temp) ? html`<div class="side-info"><div class="val-big">${this._state(c.entity_ext_temp)}°</div><div class="label-tiny">EXTÉRIEUR</div></div>` : ''}
            ${this._exists(c.entity_ext_hum) ? html`<div class="hum-pill">${this._state(c.entity_ext_hum)}%</div>` : ''}
          </div>
          <div class="gauge-container">
            <div class="center-gauge">
              <div class="outer-ring"></div>
              <div class="inner-circle">
                ${wTemp ? html`<span class="water-label">EAU</span><span class="water-val">${wTemp}°</span>` : ''}
                ${tTemp ? html`<div class="target-box">CIBLE ${tTemp}°</div>` : ''}
              </div>
            </div>
          </div>
          <div class="side-col">
            ${this._exists(c.entity_spa_air_temp) ? html`<div class="side-info"><div class="val-big">${this._state(c.entity_spa_air_temp)}°</div><div class="label-tiny">AIR SPA</div></div>` : ''}
            ${this._exists(c.entity_spa_hum) ? html`<div class="hum-pill">${this._state(c.entity_spa_hum)}%</div>` : ''}
          </div>
        </div>
        ${this._renderFooterRow()}
        ${this._renderMaintenance()}
        ${this._renderFlood()}
      </div>`;
  }

  _renderHeatingControl() {
    const id = this.config.entity_target_temp; if (!id || !this.hass?.states[id]) return html``;
    const isOn = this.hass.states[id].state === 'heat'; const tgtTemp = parseFloat(this._targetTemp() ?? 34);
    return html`
      <div class="heat-ctrl">
        <button class="heat-btn ${isOn?'heat-on':'heat-off'}" @click=${()=>this.hass.callService('climate','set_hvac_mode',{entity_id:id, hvac_mode:isOn?'off':'heat'})}>
          <ha-icon icon="${isOn?'mdi:radiator':'mdi:radiator-off'}"></ha-icon><span>${isOn?'Chauffe ON':'OFF'}</span>
        </button>
        <div class="heat-temps">
          <div class="heat-t-btn" @click=${()=>this._changeTemp(-0.5)}><ha-icon icon="mdi:minus"></ha-icon></div>
          <div class="heat-target">${tgtTemp}°</div>
          <div class="heat-t-btn" @click=${()=>this._changeTemp(0.5)}><ha-icon icon="mdi:plus"></ha-icon></div>
        </div>
      </div>`;
  }

  _calcHeatingTime() {
    const c = this.config; const volume = Number(c.lz_volume ?? 500); const loss = Number(c.lz_heat_loss ?? 30)/100;
    let powerW = 1942; if (this._exists(c.main_cons_entity)) { const raw = parseFloat(this._state(c.main_cons_entity)); powerW = (this._attr(c.main_cons_entity,'unit_of_measurement')??'').toLowerCase().includes('kw')?raw*1000:raw; }
    const curTemp = parseFloat(this._waterTemp() ?? NaN); const tgtTemp = parseFloat(this._targetTemp() ?? NaN);
    if (isNaN(curTemp) || isNaN(tgtTemp) || tgtTemp <= curTemp) return null;
    return { timeH: (volume * 1.163 * (tgtTemp - curTemp)) / (powerW * (1 - loss)), tgtTemp };
  }

  _renderLayzspaStatus() {
    const c = this.config; if (!this._exists(c.entity_lz_ready)) return html``;
    const ready = this._state(c.entity_lz_ready) === 'on'; const heating = this._state(c.entity_lz_heater) === 'on';
    const calc = this._calcHeatingTime(); let label = 'En veille', cls = 'lz-standby';
    if (ready || (calc === null && this._waterTemp() >= this._targetTemp())) { label = 'Prêt !'; cls = 'lz-ready'; }
    else if (heating || calc) {
      cls = heating ? 'lz-heating' : 'lz-standby';
      if (calc) { const h = Math.floor(calc.timeH), m = Math.round((calc.timeH - h)*60); label = `${heating?'Chauffe':'Attente'} — ${h>0?h+'h':''}${m}m pour ${calc.tgtTemp}°`; }
      else { label = 'En chauffe…'; }
    }
    return html`<div class="lz-status ${cls}"><ha-icon class="lz-icon" icon="mdi:hot-tub"></ha-icon><span class="lz-label">${label}</span></div>`;
  }

  _renderFooterRow() {
    const c = this.config; if (!this._exists(c.main_cons_entity)) return html``;
    return html`<div class="footer-row"><div class="footer-pill"><ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon><span>${this._state(c.main_cons_entity)} W</span></div></div>`;
  }
  _renderMaintenance() {
    const c = this.config; const fAge = this._state(c.entity_lz_filter); if (!fAge) return html``;
    const fMax = Number(c.lz_filter_max ?? 60); const warn = parseFloat(fAge) > fMax;
    return html`<div class="maint-row"><div class="maint-item ${warn?'maint-warn':''}"><div class="maint-head"><ha-icon icon="mdi:air-filter"></ha-icon><span>Filtre : ${Math.round(fAge)}j / ${fMax}j</span>${warn?html`<span class="maint-badge">Changer</span>`:''}</div></div></div>`;
  }
  _renderFlood() {
    const c = this.config; if (!this._exists(c.entity_water_leak)) return html``;
    const leak = this._state(c.entity_water_leak) === 'on';
    return html`<div class="flood-bar ${leak?'flood-alert':'flood-ok'}"><ha-icon icon="mdi:water-alert"></ha-icon><span>${leak?'FUITE DÉTECTÉE !':'Système étanche'}</span></div>`;
  }

  // ═══════════════════════════════════════════════
  //  CHIMIE (Messages clairs intégrés)
  // ═══════════════════════════════════════════════
  _renderChem() {
    const c = this.config; const n = v => (v!==undefined&&v!==null&&v!=='') ? Number(v) : undefined;
    const DISPLAY = { ph:{lo:6.0, hi:9.0, dec:1}, orp:{lo:200, hi:900, dec:0}, salt:{lo:0, hi:5000, dec:0} };
    const sensors = [
      {id:c.entity_ph, key:'ph', label:'pH', icon:'mdi:flask', min:n(c.ph_min), max:n(c.ph_max), u:''},
      {id:c.entity_orp, key:'orp', label:'ORP', icon:'mdi:lightning-bolt', min:n(c.orp_min), max:n(c.orp_max), u:'mV'},
      {id:c.entity_salt, key:'salt', label:'SEL', icon:'mdi:shaker-outline', min:n(c.salt_min), max:n(c.salt_max), u:'ppm'}
    ].filter(s => this._exists(s.id));
    return html`<div class="chem-list">${sensors.map(s => this._chemGauge(s, DISPLAY[s.key]))}</div>`;
  }

  _getChemActionMessage(key, val, min, max) {
    if (min === undefined || max === undefined || isNaN(val)) return null;
    const vol = Number(this.config.lz_volume ?? 500);
    if (key === 'ph') {
      if (val < min) { const qte = Math.round(((min - val) / 0.1) * 10 * (vol / 1000)); return { cls:'c-m-p', txt:`TROP BAS : Mettre ${qte}g de pH PLUS` }; }
      if (val > max) { const qte = Math.round(((val - max) / 0.1) * 10 * (vol / 1000)); return { cls:'c-m-m', txt:`TROP HAUT : Mettre ${qte}g de pH MOINS` }; }
    }
    if (key === 'salt') {
      if (val < min) { const kg = (((min - val) * vol) / 1000000).toFixed(1); return { cls:'c-m-p', txt:`MANQUE DE SEL : Ajouter ${kg} kg de Sel` }; }
      if (val > max) { return { cls:'c-m-m', txt:`TROP DE SEL : Renouveler un peu d'eau` }; }
    }
    if (key === 'orp' && val < min) return { cls:'c-m-p', txt:`DÉSINFECTANT BAS : Ajouter 1 galet ou Chlore Choc` };
    return { cls:'c-m-o', txt:'Valeur Correcte ✓' };
  }

  _chemGauge(s, d) {
    const val = parseFloat(this._state(s.id)); const hasR = s.min!==undefined && s.max!==undefined;
    const oor = hasR && (val < s.min || val > s.max); const cp = Math.min(100, Math.max(0, (val-d.lo)/(d.hi-d.lo)*100));
    const mnP = hasR ? (s.min-d.lo)/(d.hi-d.lo)*100 : 20; const mxP = hasR ? (s.max-d.lo)/(d.hi-d.lo)*100 : 80;
    const act = this._getChemActionMessage(s.key, val, s.min, s.max);
    return html`
      <div class="cg-row ${oor?'cg-oor':''}">
        <div class="cg-top">
          <div class="cg-left"><ha-icon class="cg-icon ${oor?'cg-icon-warn':''}" icon="${s.icon}"></ha-icon><span class="cg-label">${s.label} : <b>${val.toFixed(d.dec)} ${s.u}</b></span></div>
          <div class="cg-lims">${hasR?html`Norme: ${s.min} - ${s.max}`:''}</div>
        </div>
        <div class="cg-track-wrap"><div class="cg-track">${hasR?html`<div class="cg-zone" style="left:${mnP}%; width:${mxP-mnP}%"></div>`:''}<div class="cg-dot ${oor?'cg-dot-oor':''}" style="left:${cp}%"></div></div></div>
        ${act?html`<div class="chem-action-msg ${act.cls}">${act.txt}</div>`:''}
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  ONGLET CAMÉRA + PROGRAMMATION (Grand cadre optimisé 550px)
  // ═══════════════════════════════════════════════
  _renderCamTab() {
    const c = this.config;
    return html`
      <div class="cam-view-layout">
        <div class="cam-frame-container">
          ${this._exists(c.entity_camera) ? html`
            <div class="cam-wrapper">
              <hc-camera class="embedded-cam" .hass=${this.hass} .entityId=${c.entity_camera} controls></hc-camera>
            </div>` : html`
            <div class="cam-placeholder"><ha-icon icon="mdi:camera-off"></ha-icon><span>Pas de flux vidéo</span></div>`}
        </div>

        ${this._renderSchedule()}
      </div>`;
  }

  _renderSchedule() {
    const schedId = this.config.entity_lz_schedule; if (!schedId || !this.hass?.states[schedId]) return html``;
    const raw = this.hass.states[schedId].state; const parts = raw.split(':');
    const h = parseInt(parts[0]??0), m = parseInt(parts[1]??0);
    const readyStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

    const changeTime = (dh, dm) => {
      let nh = h + dh, nm = m + dm; if (nm>=60){nm-=60; nh+=1;} if (nm<0){nm+=60; nh-=1;} nh=((nh%24)+24)%24;
      this.hass.callService('input_datetime','set_datetime',{ entity_id:schedId, time:`${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}:00` });
    };

    return html`
      <div class="big-sched-box">
        <div class="bs-header">
          <ha-icon icon="mdi:clock-check-outline"></ha-icon>
          <span class="bs-title">PROGRAMMATION HEURE DE BAIGNADE</span>
        </div>
        <div class="bs-controls">
          <button class="bs-btn-large" @click=${()=>changeTime(-1,0)}>-1h</button>
          <button class="bs-btn-large" @click=${()=>changeTime(0,-15)}>-15m</button>
          <div class="bs-display-val">${readyStr}</div>
          <button class="bs-btn-large" @click=${()=>changeTime(0,15)}>+15m</button>
          <button class="bs-btn-large" @click=${()=>changeTime(1,0)}>+1h</button>
        </div>
        <button class="bs-confirm-action" @click=${()=>this.hass.callService('persistent_notification','create',{title:'🛁 Programmation', message:`Spa programmé pour être prêt à ${readyStr}`})}>
          VALIDER L'HEURE REQUISE
        </button>
      </div>`;
  }

  _renderSwitches() {
    const c = this.config; const items = [];
    for (let i=1; i<=10; i++) { if (this._exists(c[`switch_${i}`])) items.push({ id:c[`switch_${i}`], name:c[`name_switch_${i}`]||`Bouton ${i}` }); }
    if (!items.length) return html`<div style="padding:20px;text-align:center;opacity:.5;">Aucun bouton configuré</div>`;
    return html`<div class="sw-grid">${items.map(item => html`<button class="sw-btn ${this._state(item.id)==='on'?'sw-active':''}" @click=${()=>this.hass.callService('switch','toggle',{entity_id:item.id})}><ha-icon icon="mdi:power-plug"></ha-icon><span>${item.name}</span></button>`)}</div>`;
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const title = this.config.card_title || 'SPA';
    const bg = this.config.background_image ? `url(${this.config.background_image})` : 'none';
    return html`
      <ha-card style="height:${this.config.card_height || '550px'};">
        <div class="bg-img" style="background-image:${bg}; filter: blur(${this.config.blur_amount??15}px);"></div>
        <div class="glass-overlay"></div>
        <div class="main-container">
          <div class="header"><h1>${title}</h1></div>
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
    :host { display:block; position:relative; overflow:hidden; font-family:sans-serif; }
    ha-card { position:relative; width:100%; height:100%; background:transparent; border-radius:24px; overflow:hidden; border:1px solid rgba(255,255,255,.12); box-shadow:0 8px 32px rgba(0,0,0,.3); }
    .bg-img { position:absolute; top:-10px; left:-10px; right:-10px; bottom:-10px; background-size:cover; background-position:center; z-index:0; }
    .glass-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(15,22,42,0.5); z-index:1; }
    .main-container { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box; padding:14px; }
    .header h1 { margin:0; font-size:15px; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:1px; text-align:center; }
    .content-body { flex:1; margin-top:8px; overflow-y:auto; overflow-x:hidden; }
    
    /* ── Layout Caméra & Programmation (Fitte dans 550px) ── */
    .cam-view-layout { display:flex; flex-direction:column; gap:10px; width:100%; }
    .cam-frame-container { width:100%; background:rgba(0,0,0,.4); border-radius:12px; border:1px solid rgba(255,255,255,.1); overflow:hidden; }
    .cam-wrapper { width:100%; height:140px; overflow:hidden; line-height:0; }
    .embedded-cam { width:100%; height:140px; object-fit:cover; display:block; }
    .cam-placeholder { height:140px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:rgba(255,255,255,0.4); gap:6px; font-size:12px; }
    
    /* Cadre de Programmation Compact */
    .big-sched-box { background:rgba(255,255,255,.04); border:1px solid rgba(107,142,255,.25); border-radius:12px; padding:10px; display:flex; flex-direction:column; gap:8px; }
    .bs-header { display:flex; align-items:center; gap:6px; color:#6b8eff; }
    .bs-header ha-icon { --mdc-icon-size:18px; }
    .bs-title { font-size:11px; font-weight:700; color:#fff; }
    .bs-controls { display:flex; align-items:center; justify-content:space-between; gap:4px; }
    .bs-btn-large { flex:1; height:36px; border-radius:8px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.06); color:#fff; font-size:11px; font-weight:bold; cursor:pointer; }
    .bs-btn-large:active { transform:scale(0.96); }
    .bs-display-val { padding:0 6px; font-size:20px; font-weight:800; color:#6b8eff; font-family:monospace; }
    .bs-confirm-action { width:100%; height:34px; border:none; border-radius:8px; background:linear-gradient(135deg,#4f46e5,#3b82f6); color:#fff; font-size:11px; font-weight:700; cursor:pointer; }

    /* ── Chimie & Diagnostics Réduits ── */
    .chem-list { display:flex; flex-direction:column; gap:8px; }
    .cg-row { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:8px 10px; }
    .cg-oor { border-color:rgba(239,68,68,.3); }
    .cg-top { display:flex; justify-content:space-between; align-items:center; }
    .cg-left { display:flex; align-items:center; gap:6px; }
    .cg-icon { color:#00f9f9; --mdc-icon-size:16px; }
    .cg-icon-warn { color:#ef4444; }
    .cg-label { font-size:11px; color:#fff; }
    .cg-lims { font-size:9px; opacity:0.4; color:#fff; }
    .cg-track-wrap { position:relative; height:4px; margin:6px 0; }
    .cg-track { height:100%; background:rgba(255,255,255,.1); border-radius:2px; position:relative; }
    .cg-zone { position:absolute; height:100%; background:rgba(0,249,249,0.2); }
    .cg-dot { width:8px; height:8px; background:#fff; border-radius:50%; position:absolute; top:-2px; transform:translateX(-50%); }
    .cg-dot-oor { background:#ef4444; }
    .chem-action-msg { margin-top:4px; padding:4px; border-radius:6px; font-size:10px; font-weight:700; text-align:center; text-transform:uppercase; }
    .c-m-p { background:rgba(245,158,11,.12); border:1px solid rgba(245,158,11,.3); color:#f59e0b; }
    .c-m-m { background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.3); color:#f87171; }
    .c-m-o { background:rgba(16,185,129,.08); color:#34d399; opacity:0.7; }

    /* ── Reste de l'interface d'origine compactée ── */
    .home-view { display:flex; flex-direction:column; gap:8px; }
    .flex-row-center { display:flex; align-items:center; justify-content:space-between; margin:4px 0; }
    .side-col { width:25%; text-align:center; }
    .val-big { font-size:15px; font-weight:700; color:#fff; }
    .label-tiny { font-size:8px; opacity:.4; color:#fff; }
    .hum-pill { display:inline-block; padding:1px 4px; background:rgba(255,255,255,.05); border-radius:10px; font-size:8px; color:rgba(255,255,255,.6); margin-top:2px; }
    .gauge-container { display:flex; justify-content:center; }
    .center-gauge { width:74px; height:74px; position:relative; display:flex; align-items:center; justify-content:center; }
    .outer-ring { position:absolute; width:100%; height:100%; border:2px dashed rgba(255,255,255,.1); border-radius:50%; }
    .inner-circle { width:64px; height:64px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.1); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .water-label { font-size:8px; opacity:.4; color:#fff; }
    .water-val { font-size:18px; font-weight:800; color:#fff; line-height:18px; }
    .target-box { font-size:7px; background:rgba(255,255,255,.1); padding:1px 3px; border-radius:3px; color:#fff; }
    .heat-ctrl { display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:6px 10px; }
    .heat-btn { border:none; border-radius:6px; height:28px; padding:0 8px; display:flex; align-items:center; gap:4px; font-weight:600; font-size:11px; cursor:pointer; }
    .heat-on { background:rgba(251,146,60,.15); border:1px solid rgba(251,146,60,.3); color:#fb923c; }
    .heat-off { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.5); }
    .heat-temps { display:flex; align-items:center; gap:6px; }
    .heat-t-btn { cursor:pointer; width:22px; height:22px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.04); border-radius:4px; color:#fff; }
    .heat-target { font-size:13px; font-weight:700; color:#fff; }
    .lz-status { display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:8px; font-size:10px; font-weight:600; text-transform:uppercase; }
    .lz-icon { --mdc-icon-size:14px; }
    .lz-heating { background:rgba(239,68,68,.08); color:#f87171; border:1px solid rgba(239,68,68,.15); }
    .lz-ready { background:rgba(16,185,129,.08); color:#34d399; border:1px solid rgba(16,185,129,.15); }
    .lz-standby { background:rgba(255,255,255,.04); color:rgba(255,255,255,.5); }
    .footer-row { display:flex; justify-content:center; }
    .footer-pill { display:flex; align-items:center; gap:4px; padding:2px 8px; background:rgba(255,255,255,.03); border-radius:10px; font-size:9px; color:rgba(255,255,255,.6); }
    .maint-row { display:flex; }
    .maint-item { flex:1; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:4px 8px; font-size:10px; color:#fff; }
    .maint-badge { background:#f59e0b; color:#000; padding:0 3px; border-radius:2px; font-weight:700; float:right; font-size:8px; }
    .flood-bar { display:flex; align-items:center; gap:6px; padding:5px 10px; border-radius:10px; font-size:10px; font-weight:600; }
    .flood-ok { background:rgba(16,185,129,.04); color:rgba(255,255,255,.6); }
    .flood-alert { background:rgba(239,68,68,.1); color:#f87171; }
    .sw-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
    .sw-btn { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:10px; height:36px; display:flex; align-items:center; gap:6px; padding:0 10px; color:#fff; font-size:11px; cursor:pointer; }
    .sw-active { background:rgba(251,146,60,.12); border-color:rgba(251,146,60,.3); color:#fb923c; }
    .nav { display:flex; justify-content:space-around; padding-top:8px; border-top:1px solid rgba(255,255,255,.1); }
    .nav ha-icon { opacity:.3; cursor:pointer; --mdc-icon-size:18px; color:#fff; }
    .nav ha-icon.active { opacity:1; color:#00f9f9; }
  `;
}
customElements.define('spa-card', SpaCard);
