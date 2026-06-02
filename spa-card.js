import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V33
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
        { name:'card_height',      label:'Hauteur totale (ex : 590px)', selector:{ text:{} } },
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
        { name:'entity_lz_chlorine',  label:'Âge chlore/brome — jours',                  selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_chlorine_max',     label:'Alerter désinfectant après (jours)',       selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_energy',    label:'Énergie totale kWh (sensor…energy)',       selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_lz_rssi',      label:'Signal WiFi RSSI (sensor…rssi)',           selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_volume',           label:'Volume eau (litres, défaut 500)',           selector:{ number:{ mode:'box', min:100, max:5000 } } },
        { name:'lz_power_w',          label:'Puissance chauffe (W, défaut 2000)',        selector:{ number:{ mode:'box', min:500, max:5000 } } },
        { name:'lz_heat_loss',        label:'Pertes thermiques (%, défaut 25)',          selector:{ number:{ mode:'slider', min:0, max:60 } } },
        { name:'entity_lz_reset_filter',  label:'Bouton reset filtre',                      selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_reset_chlore',  label:'Bouton reset désinfectant',                selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_schedule',      label:'Programmation — helper heure',              selector:{ entity:{ domain:'input_datetime' } } }
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
        { name:'cam_w_px',      label:'Largeur caméra (px)',    selector:{ number:{ mode:'box', min:40, max:800 } } },
        { name:'cam_h_px',      label:'Hauteur caméra (px)',   selector:{ number:{ mode:'box', min:40, max:800 } } },
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
//  CARTE  —  V33
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {

  static getConfigElement() { return document.createElement('spa-card-editor'); }

  static get properties() {
    return { hass:{}, config:{}, _tab:{ type:String }, _camExpanded:{ type:Boolean } };
  }

  constructor() { super(); this._tab = 'home'; this._camExpanded = false; }
  setConfig(config) { this.config = config; }
  getCardSize() { return Math.ceil((parseInt(this.config?.card_height)||590)/50); }

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
    const mn = Number(this.config.target_temp_min ?? this._attr(id,'min') ?? 20);
    const mx = Number(this.config.target_temp_max ?? this._attr(id,'max') ?? 40);
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
    const volume     = Number(c.lz_volume   ?? 500);
    const lossRatio  = Number(c.lz_heat_loss ?? 25) / 100;
    const efficiency = 1 - lossRatio;

    let powerW = Number(c.lz_power_w ?? 2000);
    if (!powerW && this._exists(c.main_cons_entity)) {
      const unit = this._attr(c.main_cons_entity, 'unit_of_measurement') ?? '';
      const raw  = parseFloat(this._state(c.main_cons_entity));
      powerW = unit.toLowerCase().includes('kw') ? raw * 1000 : raw;
    }
    if (!powerW || isNaN(powerW)) powerW = 2000;

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
        ${this._renderSchedule(false)}

        <div class="flex-row-center">
          <div class="side-col">
            ${this._exists(c.entity_ext_temp) ? html`
              <div class="side-info">
                <div class="val-big">${parseFloat(this._state(c.entity_ext_temp)).toFixed(1)}°</div>
                <div class="label-tiny">EXTÉRIEUR</div>
              </div>` : ''}
            ${this._exists(c.entity_ext_hum) ? html`
              <div class="hum-pill">${Math.round(this._state(c.entity_ext_hum))}% HR</div>` : ''}
          </div>

          <div class="gauge-container">
            ${this._exists(c.entity_target_temp) ? html`
              <div class="temp-btn" @click=${()=>this._changeTemp(0.5)}>
                <ha-icon icon="mdi:chevron-up"></ha-icon>
              </div>` : ''}
            <div class="center-gauge">
              <div class="outer-ring"></div>
              <div class="inner-circle">
                ${wTemp ? html`
                  <span class="water-label">EAU</span>
                  <span class="water-val">${parseFloat(wTemp).toFixed(1)}°</span>` : ''}
                ${tTemp ? html`
                  <div class="target-box">CIBLE ${parseFloat(tTemp).toFixed(1)}°</div>` : ''}
              </div>
            </div>
            ${this._exists(c.entity_target_temp) ? html`
              <div class="temp-btn" @click=${()=>this._changeTemp(-0.5)}>
                <ha-icon icon="mdi:chevron-down"></ha-icon>
              </div>` : ''}
          </div>

          <div class="side-col">
            ${this._exists(c.entity_spa_air_temp) ? html`
              <div class="side-info">
                <div class="val-big">${parseFloat(this._state(c.entity_spa_air_temp)).toFixed(1)}°</div>
                <div class="label-tiny">AIR SPA</div>
              </div>` : ''}
            ${this._exists(c.entity_spa_hum) ? html`
              <div class="hum-pill">${Math.round(this._state(c.entity_spa_hum))}% HR</div>` : ''}
          </div>
        </div>

        ${this._renderFooterRow()}
        ${this._renderMaintenance()}
        ${this._renderFlood()}
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
    const tgtTemp = parseFloat(this._targetTemp() ?? 37);
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
          <div class="heat-target">${parseFloat(tgtTemp).toFixed(1)}°</div>
          <div class="heat-t-btn" @click=${()=>this._changeTemp(1)}>
            <ha-icon icon="mdi:plus"></ha-icon>
          </div>
        </div>
      </div>`;
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
        timeStr   = h > 0 ? `${h}h${min > 0 ? min.toString().padStart(2,'0') : ''}` : `${min} min`;
        label = `En chauffe — reste ${timeStr}`;
      } else {
        label = 'En chauffe…';
      }
      icon='mdi:radiator'; cls='lz-heating';
    } else {
      if (calc !== null && calc !== 0) {
        const h   = Math.floor(calc.timeH);
        const min = Math.round((calc.timeH - h) * 60);
        timeStr   = h > 0 ? `${h}h${min > 0 ? min.toString().padStart(2,'0') : ''}` : `${min} min`;
        label = `En veille — besoin de ${timeStr} pour ${parseFloat(calc.tgtTemp).toFixed(1)}°`;
      } else {
        label = 'En veille';
      }
      icon='mdi:power-sleep'; cls='lz-standby';
    }

    const rssi = this._exists(c.entity_lz_rssi) ? parseInt(this._state(c.entity_lz_rssi)) : null;
    const rssiIcon = rssi===null ? '' : rssi>=-60 ? 'mdi:wifi-strength-4' : rssi>=-70 ? 'mdi:wifi-strength-3' : rssi>=-80 ? 'mdi:wifi-strength-2' : 'mdi:wifi-strength-1';

    return html`
      <div class="lz-status ${cls}">
        <ha-icon class="lz-icon" icon="${icon}"></ha-icon>
        <span class="lz-label">${label}</span>
        ${rssiIcon ? html`<ha-icon class="lz-wifi" icon="${rssiIcon}" title="${rssi} dBm"></ha-icon>` : ''}
      </div>`;
  }

  _renderSchedule(isSidebar = false) {
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
        message: `Prêt à ${readyStr} — la chauffe démarrera à ${startStr || '…'}`,
        notification_id: 'spa_schedule'
      });
    };

    return html`
      <div class="sched-bar ${isSidebar ? 'sidebar-sched' : ''}">
        <div class="sched-info-group">
          <ha-icon class="sched-icon" icon="mdi:clock-outline"></ha-icon>
          <div class="sched-col">
            <div class="sched-title">Prêt à</div>
            ${startStr ? html`<div class="sched-start">Départ : ${startStr}</div>` : ''}
          </div>
        </div>
        <div class="sched-time-ctrl">
          <div class="sched-btn" @click=${()=>changeTime(-1,0)}>◂ h</div>
          <div class="sched-btn" @click=${()=>changeTime(0,-15)}>◂ 15'</div>
          <div class="sched-val">${readyStr}</div>
          <div class="sched-btn" @click=${()=>changeTime(0,15)}>15' ▸</div>
          <div class="sched-btn" @click=${()=>changeTime(1,0)}>h ▸</div>
        </div>
        <button class="sched-set-btn" @click=${activate}>✓</button>
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
            <span>${Math.round(this._state(c.main_cons_entity))} W</span>
          </div>` : ''}
        ${hasEnergy ? html`
          <div class="footer-pill">
            <ha-icon icon="mdi:flash"></ha-icon>
            <span>${parseFloat(this._state(c.entity_lz_energy)).toFixed(1)} kWh</span>
          </div>` : ''}
      </div>`;
  }

  _renderMaintenance() {
    const c = this.config;
    const filterAge  = this._exists(c.entity_lz_filter)   ? parseFloat(this._state(c.entity_lz_filter))   : null;
    const chloreAge  = this._exists(c.entity_lz_chlorine) ? parseFloat(this._state(c.entity_lz_chlorine)) : null;
    const filterMax  = Number(c.lz_filter_max ?? 3);
    const chloreMax  = Number(c.lz_chlorine_max ?? 13);
    const hasResetF  = !!c.entity_lz_reset_filter;
    const hasResetC  = !!c.entity_lz_reset_chlore;

    if (filterAge === null && chloreAge === null) return html``;

    const filterWarn = filterAge !== null && filterAge > filterMax;
    const chloreWarn = chloreAge !== null && chloreAge > chloreMax;
    const filterPct  = filterAge !== null ? Math.min(100, filterAge / filterMax * 100) : 0;
    const chlorePct  = chloreAge !== null ? Math.min(100, chloreAge / chloreMax * 100) : 0;

    return html`
      <div class="maint-row">
        ${filterAge !== null ? html`
          <div class="maint-item ${filterWarn ? 'maint-warn' : ''}">
            <div class="maint-head">
              <ha-icon icon="mdi:air-filter"></ha-icon>
              <span>Filtre</span>
              ${hasResetF ? html`<button class="maint-reset-btn" @click=${() => this.hass.callService('button', 'press', { entity_id: c.entity_lz_reset_filter })}>✓</button>` : ''}
            </div>
            <div class="maint-bar">
              <div class="maint-fill ${filterWarn?'maint-fill-warn':''}" style="width:${filterPct}%"></div>
            </div>
            <div class="maint-val">${Math.round(filterAge)}/${filterMax}j</div>
          </div>` : ''}

        ${chloreAge !== null ? html`
          <div class="maint-item ${chloreWarn ? 'maint-warn' : ''}">
            <div class="maint-head">
              <ha-icon icon="mdi:flask-outline"></ha-icon>
              <span>Brome</span>
              ${hasResetC ? html`<button class="maint-reset-btn" @click=${() => this.hass.callService('button', 'press', { entity_id: c.entity_lz_reset_chlore })}>✓</button>` : ''}
            </div>
            <div class="maint-bar">
              <div class="maint-fill ${chloreWarn?'maint-fill-warn':''}" style="width:${chlorePct}%"></div>
            </div>
            <div class="maint-val">${Math.round(chloreAge)}/${chloreMax}j</div>
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

    return html`
      <div class="flood-bar ${alerting?'flood-alert':'flood-ok'}">
        <div class="flood-left">
          <ha-icon icon="${leak?'mdi:water-alert':'mdi:water-check'}" class="flood-icon ${leak?'flood-icon-alert':''}"></ha-icon>
          <span class="flood-label">${leak?'FUITE DÉTECTÉE !':'Pas de fuite'}</span>
        </div>
        <div class="flood-right">
          ${this._exists(c.entity_tamper) && tamper ? html`<ha-icon icon="mdi:shield-alert" class="flood-pill pill-warn" title="Sabotage !"></ha-icon>` : ''}
          ${bat !== null ? html`<div class="flood-pill ${bat < 20?'pill-warn':'pill-ok'}"><ha-icon icon="mdi:battery"></ha-icon><span>${Math.round(bat)}%</span></div>` : ''}
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  CHIMIE (Spécifique Brome)
  // ═══════════════════════════════════════════════
  _renderChem() {
    const c = this.config;
    const n = v => (v!==undefined&&v!==null&&v!=='') ? Number(v) : undefined;

    const DISPLAY = {
      ph:   { lo: 6.0,  hi: 9.0,  dec: 1 },
      orp:  { lo: 200,  hi: 900,  dec: 0 },
      tds:  { lo: 0,    hi: 2500, dec: 0 },
      salt: { lo: 0,    hi: 1000, dec: 0 }
    };

    const sensors = [
      { id: c.entity_ph,   key: 'ph',   label: 'pH',  icon: 'mdi:flask',             min: n(c.ph_min??7.4),   max: n(c.ph_max??7.8),   u: '' },
      { id: c.entity_orp,  key: 'orp',  label: 'ORP', icon: 'mdi:lightning-bolt',     min: n(c.orp_min??650),  max: n(c.orp_max??750),  u: 'mV' },
      { id: c.entity_tds,  key: 'tds',  label: 'TDS', icon: 'mdi:water-percent',      min: n(c.tds_min??500),  max: n(c.tds_max??1499), u: 'ppm' },
      { id: c.entity_salt, key: 'salt', label: 'SEL', icon: 'mdi:shaker-outline',     min: n(c.salt_min??300), max: n(c.salt_max??500),  u: 'ppm' }
    ].filter(s => this._exists(s.id));

    if (sensors.length === 0) {
      return html`<div class="empty-view">Aucun capteur chimique configuré.</div>`;
    }

    return html`
      <div class="chem-list">
        ${sensors.map(s => this._chemGauge(s, DISPLAY[s.key]))}
      </div>`;
  }

  _getChemActionMessage(key, tooLow, tooHigh) {
    if (!tooLow && !tooHigh) return '';
    if (key === 'ph')   return tooLow ? 'Action : Ajouter du pH Plus (+)' : 'Action : Ajouter du pH Moins (-)';
    if (key === 'orp')  return tooLow ? 'Action : Ajouter 10g de Brome Choc ou Régénérateur (Oxygène Actif)' : 'Action : Trop de désinfectant, ouvrir la couverture';
    if (key === 'tds')  return tooLow ? 'Action : Eau pure' : 'Action : Eau saturée. Vider 250L (la moitié) et remettre de l\'eau';
    if (key === 'salt') return tooLow ? 'Action : Ajouter du sel' : 'Action : Taux trop élevé. Diluer l\'eau';
    return '';
  }

  _chemGauge(s, d) {
    const val = parseFloat(this._state(s.id));
    const hasR = s.min!==undefined && s.max!==undefined && !isNaN(s.min) && !isNaN(s.max);
    
    const tooLow  = hasR && val < s.min;
    const tooHigh = hasR && val > s.max;
    const oor     = tooLow || tooHigh;

    const toPos = v => Math.min(100, Math.max(0, ((v - d.lo) / (d.hi - d.lo)) * 100));
    
    const cp   = toPos(val);
    const mnP  = hasR ? toPos(s.min) : 25;
    const mxP  = hasR ? toPos(s.max) : 75;
    const idealW = mxP - mnP;

    const cc     = oor ? 'rgba(239, 68, 68, 0.85)' : 'rgba(0, 249, 249, 0.85)';
    const slabel = tooLow ? 'TROP BAS' : tooHigh ? 'TROP HAUT' : 'CORRECT';
    const actionMsg = this._getChemActionMessage(s.key, tooLow, tooHigh);

    return html`
      <div class="cg-row ${oor?'cg-oor':''}">
        <div class="cg-top">
          <div class="cg-left">
            <ha-icon class="cg-icon ${oor?'cg-icon-warn':''}" icon="${s.icon}"></ha-icon>
            <span class="cg-label">${s.label}</span>
            <span class="cg-status-lbl" style="color: ${cc}">${slabel}</span>
          </div>
          <div class="cg-val">${val.toFixed(d.dec)} <span class="cg-unit">${s.u}</span></div>
        </div>
        <div class="cg-track-wrap">
          <div class="cg-track">
            ${hasR ? html`<div class="cg-ideal" style="left:${mnP}%; width:${idealW}%"></div>` : ''}
            <div class="cg-cursor" style="left:${cp}%; background:${cc}"></div>
          </div>
          ${hasR ? html`
            <div class="cg-limits">
              <span style="left:${mnP}%">${s.min}</span>
              <span style="left:${mxP}%">${s.max}</span>
            </div>` : ''}
        </div>
        ${actionMsg ? html`<div class="cg-action-msg">${actionMsg}</div>` : ''}
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  CAMÉRA + PROGRAMMATION CHAUFFE INTÉGRÉE
  // ═══════════════════════════════════════════════
  _renderCam() {
    const c = this.config;
    if (!this._exists(c.entity_camera)) {
      return html`<div class="empty-view">Aucune entité caméra configurée.</div>`;
    }

    const w      = c.cam_w_px ? `${c.cam_w_px}px` : '100%';
    const h      = c.cam_h_px ? `${c.cam_h_px}px` : '240px';
    const rad    = c.cam_radius ? `${c.cam_radius}px` : '12px';
    const x      = c.cam_x ? `${c.cam_x}px` : '0px';
    const y      = c.cam_y ? `${c.cam_y}px` : '0px';

    const camStyle = this._camExpanded 
      ? `width: 100%; height: auto; border-radius: 12px; transform: none; margin: 0; transition: all 0.3s ease;`
      : `width: ${w}; height: ${h}; border-radius: ${rad}; transform: translate(${x}, ${y}); transition: all 0.3s ease;`;

    return html`
      <div class="cam-layout-wrapper ${this._camExpanded ? 'cam-expanded-fullscreen' : ''}">
        <div class="cam-main-box">
          <div class="cam-container" style="${camStyle}" @click=${() => this._camExpanded = !this._camExpanded}>
            <ha-camera-stream
              .hass=${this.hass}
              .stateObj=${this.hass.states[c.entity_camera]}
              show-controls
            ></ha-camera-stream>
            <div class="cam-overlay">
              <ha-icon icon="${this._camExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}"></ha-icon>
            </div>
          </div>
        </div>

        ${!this._camExpanded ? html`
          <div class="cam-sidebar-controls">
            <div class="sidebar-header">🛠️ PROGRAMMATION</div>
            ${this._renderHeatingControl()}
            <div class="sidebar-divider"></div>
            ${this._renderSchedule(true)}
          </div>
        ` : ''}
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  INTERRUPTEURS / SWITCHES
  // ═══════════════════════════════════════════════
  _renderSwitches() {
    const c = this.config;
    const sws = Array.from({ length: 10 }, (_, i) => {
      const id = c[`switch_${i + 1}`];
      return id && this.hass?.states[id] ? { id, name: c[`name_switch_${i + 1}`] || this.hass.states[id].attributes?.friendly_name || `Bouton ${i + 1}` } : null;
    }).filter(x => x !== null);

    if (sws.length === 0) {
      return html`<div class="empty-view">Aucun bouton configuré.</div>`;
    }

    return html`
      <div class="sw-grid">
        ${sws.map(s => {
          const state = this._state(s.id);
          const isOn = state === 'on';
          const isLight = s.id.startsWith('light.');
          const domain = s.id.split('.')[0];
          return html`
            <button class="prog-action-btn ${isOn ? 'pab-on' : 'pab-off'}" @click=${() => this.hass.callService(domain, 'toggle', { entity_id: s.id })}>
              <ha-icon icon="${isLight ? (isOn ? 'mdi:lightbulb' : 'mdi:lightbulb-off') : (isOn ? 'mdi:power-plug' : 'mdi:power-plug-off')}"></ha-icon>
              <span>${s.name}</span>
            </button>`;
        })}
      </div>`;
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const title = c.card_title || 'SPA';
    const h     = c.card_height || '590px';
    const blur  = c.blur_amount !== undefined ? `${c.blur_amount}px` : '5px';
    const bg    = c.background_image ? `url(${c.background_image})` : 'rgba(20, 30, 45, 0.85)';

    const content = {
      home: this._renderHome(),
      chem: this._renderChem(),
      cam:  this._renderCam(),
      sw:   this._renderSwitches()
    };

    return html`
      <ha-card class="spa-card" style="height: ${h}; background: ${bg}; --blur-amount: ${blur}">
        <div class="main-container">
          <div class="header">
            <h1 class="title">${title}</h1>
          </div>
          
          <div class="content-view">
            ${content[this._tab]}
          </div>

          <div class="nav">
            <ha-icon icon="mdi:home" class="${this._tab==='home'?'active':''}" @click=${()=>this._tab='home'}></ha-icon>
            <ha-icon icon="mdi:flask" class="${this._tab==='chem'?'active':''}" @click=${()=>this._tab='chem'}></ha-icon>
            <ha-icon icon="mdi:video" class="${this._tab==='cam'?'active':''}" @click=${()=>this._tab='cam'}></ha-icon>
            <ha-icon icon="mdi:toggle-switch" class="${this._tab==='sw'?'active':''}" @click=${()=>this._tab='sw'}></ha-icon>
          </div>
        </div>
      </ha-card>`;
  }

  static styles = css`
    :host { display:block; margin: 0 auto; overflow: hidden; }
    
    .spa-card {
      position: relative; overflow: hidden; border-radius: 24px;
      background-size: cover !important; background-position: center !important;
      color: #fff; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 16px 40px rgba(0,0,0,0.4);
    }
    .main-container {
      position: relative; height: 100%; display: flex; flex-direction: column;
      background: rgba(10, 18, 30, 0.6); backdrop-filter: blur(var(--blur-amount));
      -webkit-backdrop-filter: blur(var(--blur-amount)); padding: 12px 14px; box-sizing: border-box;
    }
    .header { text-align: center; margin-bottom: 4px; }
    .title { font-size: 16px; font-weight: 700; letter-spacing: 1px; margin: 0; opacity: 0.9; text-transform: uppercase; }
    .content-view { flex: 1; overflow-y: auto; overflow-x: hidden; }
    
    .content-view::-webkit-scrollbar { width: 0px; background: transparent; }

    /* ── Vue Accueil (Sans scroll) ── */
    .home-view { display: flex; flex-direction: column; gap: 6px; height: 100%; justify-content: space-between; overflow: hidden; }
    .flex-row-center { display: flex; align-items: center; justify-content: space-between; margin: 2px 0; }
    .side-col { width: 100px; display: flex; flex-direction: column; gap: 4px; align-items: center; }
    .side-info { text-align: center; background: rgba(255,255,255,0.05); padding: 4px 2px; border-radius: 10px; width: 100%; border: 1px solid rgba(255,255,255,0.08); }
    .val-big { font-size: 15px; font-weight: 700; color: #00f9f9; }
    .label-tiny { font-size: 8px; opacity: 0.5; font-weight: 600; letter-spacing: 0.5px; margin-top: 1px; }
    .hum-pill { font-size: 9px; background: rgba(255,255,255,0.08); padding: 2px 5px; border-radius: 20px; white-space: nowrap; color: rgba(255,255,255,0.8); }
    
   /* Jauge circulaire agrandie */
    .center-gauge { 
      position: relative; 
      width: 130px;   /* Augmenté de 100px à 130px */
      height: 130px;  /* Augmenté de 100px à 130px */
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }
    
    .inner-circle {
      width: 114px;   /* Augmenté de 86px à 114px (pour garder l'épaisseur de l'anneau) */
      height: 114px;  /* Augmenté de 86px à 114px */
      border-radius: 50%; 
      background: rgba(255,255,255,0.04);
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      border: 1px solid rgba(255,255,255,0.1);
    }
    .water-label { font-size: 8px; opacity: 0.5; font-weight: 700; }
    .water-val { font-size: 24px; font-weight: 800; color: #fff; text-shadow: 0 2px 6px rgba(0,0,0,0.5); }
    .target-box { font-size: 8px; background: rgba(0,249,249,0.15); color: #00f9f9; padding: 1px 4px; border-radius: 6px; font-weight: 600; }
    .temp-btn {
      width: 24px; height: 24px; background: rgba(255,255,255,0.08); border-radius: 50%;
      display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.12);
    }
    .temp-btn ha-icon { --mdc-icon-size: 14px; }
    
    /* Chauffage */
    .heat-ctrl { display: flex; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 3px; border: 1px solid rgba(255,255,255,0.08); justify-content: space-between; align-items: center; }
    .heat-btn { border: none; border-radius: 9px; display: flex; align-items: center; gap: 5px; padding: 5px 10px; font-weight: 700; cursor: pointer; font-size: 11px; font-family: inherit; transition: all 0.2s; }
    .heat-on { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); }
    .heat-off { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); }
    .heat-temps { display: flex; align-items: center; gap: 6px; padding-right: 2px; }
    .heat-t-btn { width: 22px; height: 22px; background: rgba(255,255,255,0.06); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); }
    .heat-t-btn ha-icon { --mdc-icon-size: 12px; }
    .heat-target { font-size: 12px; font-weight: 700; min-width: 26px; text-align: center; }

    /* Statuts LayZSpa */
    .lz-status { display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); font-size: 11px; font-weight: 600; }
    .lz-icon { --mdc-icon-size: 14px; }
    .lz-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lz-ready { background: rgba(16, 185, 129, 0.12); color: #10b981; border-color: rgba(16, 185, 129, 0.25); }
    .lz-heating { background: rgba(245, 158, 11, 0.12); color: #f59e0b; border-color: rgba(245, 158, 11, 0.25); }
    .lz-standby { background: rgba(255, 255, 255, 0.04); color: rgba(255,255,255,0.6); }
    .lz-disconnected { background: rgba(239, 68, 68, 0.12); color: #ef4444; border-color: rgba(239, 68, 68, 0.25); }
    .lz-wifi { --mdc-icon-size: 12px; opacity: 0.6; }

    /* Horloge */
    .sched-bar { display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: rgba(107,142,255,0.08); border: 1px solid rgba(107,142,255,0.2); border-radius: 10px; font-size: 11px; 
    width: 50%; /* Force à prendre toute la largeur */
  box-sizing: border-box;    /* Évite que le padding ne dépasse */
  justify-content: space-between; /* Écarte les infos à gauche et les contrôles à droite */
} }
    .sched-info-group { display: flex; align-items: center; gap: 6px; flex: 1; }
    .sched-icon { color: #6b8eff; --mdc-icon-size: 14px; }
    .sched-col { display: flex; flex-direction: column; }
    .sched-title { font-weight: 700; color: rgba(255,255,255,0.9); }
    .sched-start { font-size: 9px; color: #6b8eff; opacity: 0.9; margin-top: 1px; }
    .sched-time-ctrl { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.04); padding: 4px 6px; border-radius: 6px; }
    .sched-btn { padding: 4px 8px; background: rgba(255,255,255,0.06); border-radius: 4px; cursor: pointer; font-size: 9px; font-weight: bold; }
    .sched-btn:hover { background: rgba(255,255,255,0.15); }
    .sched-val { font-weight: 700; padding: 0 2px; color: #6b8eff; font-size: 13px; }
    .sched-set-btn { background: #6b8eff; border: none; color: #fff; border-radius: 4px; padding: 4px 10px; font-weight: bold; cursor: pointer; font-size: 10px; }

    /* ── Vue Caméra Découpée en Colonnes (Intégration Droite) ── */
    .cam-layout-wrapper { display: flex; gap: 10px; padding: 4px 0; height: 100%; align-items: stretch; }
    .cam-main-box { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .cam-sidebar-controls { width: 230px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 8px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; }
    .sidebar-header { font-size: 9px; font-weight: 800; opacity: 0.4; letter-spacing: 0.5px; text-align: center; }
    .sidebar-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 2px 0; }
    .sidebar-sched { flex-direction: column; align-items: stretch; gap: 6px; padding: 6px; background: transparent; border: none; }
    .sidebar-sched .sched-info-group { justify-content: center; margin-bottom: 2px; }
    .sidebar-sched .sched-time-ctrl { justify-content: center; width: 100%; padding: 4px 2px; }
    .sidebar-sched .sched-set-btn { width: 100%; padding: 4px; margin-top: 2px; }
    
    .cam-container { position: relative; overflow: hidden; background: #000; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 6px 20px rgba(0,0,0,0.5); cursor: pointer; box-sizing: border-box; }
    .cam-container ha-camera-stream { width: 100%; height: 100%; display: block; }
    .cam-overlay { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.5); padding: 4px; border-radius: 6px; pointer-events: none; opacity: 0; transition: opacity 0.2s; }
    .cam-container:hover .cam-overlay { opacity: 1; }
    .cam-overlay ha-icon { --mdc-icon-size: 14px; color: #fff; }
    .cam-expanded-fullscreen .cam-main-box { width: 100%; }

    /* Maintenance & Pied */
    .maint-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .maint-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 5px 6px; border-radius: 10px; }
    .maint-head { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 600; opacity: 0.8; position: relative; }
    .maint-head ha-icon { --mdc-icon-size:12px; }
    .maint-bar { height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; margin: 3px 0; }
    .maint-fill { height: 100%; background: #00f9f9; }
    .maint-fill-warn { background: #ef4444 !important; }
    .maint-warn { border-color: rgba(239, 68, 68, 0.25); background: rgba(239, 68, 68, 0.02); }
    .maint-reset-btn { position: absolute; right: 0; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 3px; padding: 0px 3px; cursor: pointer; font-size: 8px; }
    .maint-val { font-size: 8px; opacity: 0.4; text-align: right; }

    .footer-row { display: flex; gap: 6px; justify-content: center; }
    .footer-pill { background: rgba(255,255,255,0.04); padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 4px; }
    .footer-pill ha-icon { --mdc-icon-size: 11px; color: #f59e0b; }

    /* Inondation */
    .flood-bar { display: flex; align-items: center; justify-content: space-between; padding: 3px 6px; border-radius: 8px; font-size: 9px; font-weight: 600; }
    .flood-ok { background: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.12); color: rgba(255,255,255,0.5); }
    .flood-alert { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; animation: pulse-border 1.5s infinite; }
    .flood-left { display: flex; align-items: center; gap: 4px; }
    .flood-icon { --mdc-icon-size: 12px; color: #10b981; }
    .flood-icon-alert { color: #ef4444; }
    .flood-right { display: flex; gap: 3px; }
    .flood-pill { display: flex; align-items: center; gap: 2px; padding: 1px 3px; border-radius: 4px; font-size: 8px; }
    .pill-ok { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }
    .pill-warn { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

    /* ── Vue Chimie ── */
    .chem-list { display: flex; flex-direction: column; gap: 8px; padding: 2px; }
    .cg-row { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 10px; border-radius: 12px; }
    .cg-oor { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.02); }
    .cg-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .cg-left { display: flex; align-items: center; gap: 6px; }
    .cg-icon { --mdc-icon-size: 14px; color: #8b5cf6; }
    .cg-icon-warn { color: #ef4444; }
    .cg-label { font-size: 11px; font-weight: 700; }
    .cg-status-lbl { font-size: 8px; font-weight: 700; background: rgba(255,255,255,0.04); padding: 1px 4px; border-radius: 5px; text-transform: uppercase; }
    .cg-val { font-size: 12px; font-weight: 700; }
    .cg-unit { font-size: 9px; opacity: 0.5; }
    .cg-track-wrap { position: relative; padding-bottom: 8px; }
    .cg-track { height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; position: relative; }
    .cg-ideal { position: absolute; height: 100%; background: rgba(16, 185, 129, 0.25); border-left: 1px solid rgba(16, 185, 129, 0.4); border-right: 1px solid rgba(16, 185, 129, 0.4); }
    .cg-cursor { position: absolute; width: 4px; height: 11px; top: -3px; border-radius: 2px; box-shadow: 0 0 4px currentColor; margin-left: -2px; }
    .cg-limits { position: absolute; width: 100%; top: 7px; font-size: 8px; opacity: 0.3; font-weight: 600; }
    .cg-limits span { position: absolute; transform: translateX(-50%); }
    .cg-action-msg { font-size: 9px; color: #ef4444; font-weight: 700; margin-top: 4px; padding-top: 2px; border-top: 1px dashed rgba(239,68,68,0.2); text-transform: uppercase; letter-spacing: 0.2px; }

    /* ── Vue Switches ── */
    .sw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 2px; }
    .prog-action-btn {
      border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 8px 10px;
      display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
      transition: all .2s; font-family: inherit; --mdc-icon-size: 14px; width: 100%; cursor: pointer;
    }
    .pab-on    { background: rgba(251,146,60,.15); border-color: rgba(251,146,60,.4); color: #fb923c; }
    .pab-off   { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.1); color: rgba(255,255,255,.4); }
    .prog-action-btn:hover { background: rgba(255,255,255,0.08); }
    .prog-action-btn:active { transform: scale(.97); }

    .empty-view { text-align: center; padding: 30px 10px; opacity: 0.5; font-size: 11px; font-style: italic; }

    /* ── Navigation Globale ── */
    .nav { display: flex; justify-content: space-around; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.1); margin-top: 4px; }
    .nav ha-icon { opacity: .3; cursor: pointer; --mdc-icon-size: 20px; transition: opacity .2s, color .2s; }
    .nav ha-icon:hover { opacity: .6; }
    .nav ha-icon.active { opacity: 1; color: #00f9f9; filter: drop-shadow(0 0 5px rgba(0,249,249,0.4)); }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-pulse { animation: pulse 1.8s infinite; }
    @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
    @keyframes pulse-border { 0% { border-color: rgba(239, 68, 68, 0.4); } 50% { border-color: rgba(239, 68, 68, 0.8); } 100% { border-color: rgba(239, 68, 68, 0.4); } }
  `;
}
customElements.define('spa-card', SpaCard);
