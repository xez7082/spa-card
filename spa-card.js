import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V36
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
        { name:'entity_lz_filter',    label:'Âge filtre — jours (sensor…filter_age)',  selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_filter_max',       label:'Alerter filtre après (jours)',              selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_chlorine',  label:'Âge chlore — jours (sensor…chlorine_age)',selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_chlorine_max',     label:'Alerter chlore après (jours)',              selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_energy',    label:'Énergie totale kWh (sensor…energy)',       selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_lz_rssi',      label:'Signal WiFi RSSI (sensor…rssi)',            selector:{ entity:{ domain:'sensor' } } },
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
    const c = this.config;
    return html`
      <div style="color:#fff; padding:10px;">
        <h3>Chimie</h3>
        <p>pH: ${this._state(c.entity_ph) ?? 'N/A'}</p>
        <p>ORP: ${this._state(c.entity_orp) ?? 'N/A'}</p>
        <p>TDS: ${this._state(c.entity_tds) ?? 'N/A'}</p>
      </div>`;
  }

  _renderSw() {
    const c = this.config;
    return html`
      <div style="color:#fff; padding:10px;">
        <h3>Interrupteurs</h3>
        ${[1,2,3,4,5,6].map(i => this._exists(c['switch_'+i]) ? html`
          <div style="margin-bottom:10px;">
            ${c['name_switch_'+i] || 'Switch '+i} : 
            <strong>${this._state(c['switch_'+i])}</strong>
          </div>` : '')}
      </div>`;
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

render() {
  if (!this.hass || !this.config) return html``;
  const c = this.config;
  const bg = c.background_image
    ? `background-image:url('${c.background_image}'); background-size:cover; background-position:center;`
    : 'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);';
  const blur = c.blur_amount !== undefined ? c.blur_amount : 15;
  const height = c.card_height || '640px';

  // Ajout des onglets Chimie et Switches ici
  const TABS = [
    { id: 'home', icon: 'mdi:hot-tub',    label: c.card_title || 'SPA' },
    { id: 'cam',  icon: 'mdi:cctv',       label: 'Caméra' },
    { id: 'chem', icon: 'mdi:flask',      label: 'Chimie' },
    { id: 'sw',   icon: 'mdi:toggle-switch', label: 'Switches' }
  ];

  return html`
    <ha-card style="height:${height}; overflow:hidden; position:relative; border-radius:16px;">
      <div style="position:absolute; inset:0; ${bg} filter:blur(${blur}px); transform:scale(1.05);"></div>
      <div style="position:absolute; inset:0; background:rgba(0,0,0,0.35);"></div>
      <div style="position:relative; z-index:1; height:100%; display:flex; flex-direction:column; overflow:hidden;">

        <div style="display:flex; gap:6px; padding:10px 10px 0; flex-shrink:0;">
          ${TABS.map(t => html`
            <button
              style="flex:1; padding:7px 0; border:none; border-radius:10px; cursor:pointer; font-size:11px; font-weight:600;
                     background:${this._tab === t.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)'};
                     color:#fff; display:flex; align-items:center; justify-content:center; gap:4px;
                     border:1px solid ${this._tab === t.id ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'};"
              @click=${() => { this._tab = t.id; }}>
              <ha-icon icon="${t.icon}" style="--mdc-icon-size:16px;"></ha-icon>
              ${t.label}
            </button>
          `)}
        </div>

        <div style="flex:1; overflow-y:auto; padding:10px;">
          ${this._tab === 'home' ? this._renderHome() : ''}
          ${this._tab === 'cam'  ? this._renderCam()  : ''}
          ${this._tab === 'chem' ? this._renderChem() : ''}
          ${this._tab === 'sw'   ? this._renderSw()   : ''}
        </div>
      </div>
    </ha-card>
  `;
}

  static styles = css`
    :host { display: block; }
    .tabs {
      display:flex; gap:3px;
      background:var(--secondary-background-color,rgba(0,0,0,.05));
      border-radius:14px; padding:5px; margin-bottom:12px;
    }
    .tab {
      flex: 1; 
      display: flex; 
      align-items: center; /* Centrage vertical */
      justify-content: center; /* Centrage horizontal */
      padding: 8px; 
      cursor: pointer; 
      border: none;
      background: transparent;
      border-radius: 9px;
    }
    .tab:hover { background:rgba(0,0,0,.04); }
    .tab.on    { background:var(--card-background-color,#fff); box-shadow:0 1px 4px rgba(0,0,0,.1); }
    
    /* Conteneur pour aligner l'icône et le texte */
    .tab-inner {
      display: flex;
      flex-direction: row; 
      align-items: center;
      gap: 8px; 
    }

    .tbox {
      width:24px; height:24px; border-radius:6px;
      display:flex; align-items:center; justify-content:center;
      font-size:11px; font-weight:700; letter-spacing:-.3px;
    }
    .tlbl {
      font-size:11px; color:var(--secondary-text-color,#888);
      white-space:nowrap; transition:color .18s;
    }
    .tab.on .tlbl { color:var(--primary-text-color,#212121); font-weight:500; }

    /* Reste de vos styles inchangés */
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
//  CARTE  —  V36
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

  _renderHome() {
    const c = this.config;
    const wTemp  = this._waterTemp();
    const tTemp  = this._targetTemp();

    return html`
      <div class="home-view">
        ${this._renderHeatingControl()}

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
      <div class="sched-panel">
        <div class="sched-header">
          <ha-icon icon="mdi:clock-digital"></ha-icon>
          <span>PLANIFICATION CHAUFFE</span>
        </div>
         
        <div class="sched-display-box">
          <div class="sched-main-val">${readyStr}</div>
          <div class="sched-sub-info">
            ${startStr ? html`<span>Démarrage estimé à : <strong>${startStr}</strong></span>` : html`<span>Prêt immédiatement</span>`}
          </div>
        </div>

        <div class="sched-grid-ctrl">
          <button class="sched-ctrl-btn text-accent" @click=${()=>changeTime(-1,0)}>-1h</button>
          <button class="sched-ctrl-btn" @click=${()=>changeTime(0,-15)}>-15m</button>
          <button class="sched-ctrl-btn" @click=${()=>changeTime(0,15)}>+15m</button>
          <button class="sched-ctrl-btn text-accent" @click=${()=>changeTime(1,0)}>+1h</button>
        </div>

        <button class="sched-confirm-action" @click=${activate}>
          <ha-icon icon="mdi:calendar-check"></ha-icon> Activer la programmation
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
                  @click=${() => pressReset(c.entity_lz_reset_chlore)}>                  ✓
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
             style="width:${this._camExpanded ? '100%' : w}; height:${this._camExpanded ? 'auto' : h}; border-radius:${r}; min-height: 150px;">
          <ha-camera-stream
            .hass=${this.hass}
            .entityId=${c.entity_camera}
            style="transform: translate(${x}px, ${y}px); width: 100%; height: 100%; display: block;"
            controls
          ></ha-camera-stream>
          <div class="cam-overlay">
            <ha-icon icon="${this._camExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}"></ha-icon>
          </div>
        </div>
        ${this._renderSchedule()}
      </div>
    `;
  }


  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const bg = c.background_image
      ? `background-image:url('${c.background_image}'); background-size:cover; background-position:center;`
      : 'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);';
    const blur = c.blur_amount !== undefined ? c.blur_amount : 15;
    const height = c.card_height || '640px';

    const TABS = [
      { id: 'home', icon: 'mdi:hot-tub',       label: c.card_title || 'SPA' },
      { id: 'cam',  icon: 'mdi:cctv',           label: 'Caméra' },
    ];

    return html`
      <ha-card style="height:${height}; overflow:hidden; position:relative; border-radius:16px;">
        <div style="position:absolute; inset:0; ${bg} filter:blur(${blur}px); transform:scale(1.05);"></div>
        <div style="position:absolute; inset:0; background:rgba(0,0,0,0.35);"></div>
        <div style="position:relative; z-index:1; height:100%; display:flex; flex-direction:column; overflow:hidden;">

          <!-- Tabs nav -->
          <div style="display:flex; gap:6px; padding:10px 10px 0; flex-shrink:0;">
            ${TABS.map(t => html`
              <button
                style="flex:1; padding:7px 0; border:none; border-radius:10px; cursor:pointer; font-size:12px; font-weight:600;
                       background:${this._tab === t.id ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'};
                       color:#fff; display:flex; align-items:center; justify-content:center; gap:5px;
                       border:1px solid ${this._tab === t.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'};"
                @click=${() => { this._tab = t.id; }}>
                <ha-icon icon="${t.icon}" style="--mdc-icon-size:15px;"></ha-icon>
                <span>${t.label}</span>
              </button>
            `)}
          </div>

          <!-- Content -->
          <div style="flex:1; overflow-y:auto; overflow-x:hidden;">
            ${this._tab === 'home' ? this._renderHome() : this._renderCam()}
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host { display: block; --glass-border: rgba(255,255,255,0.12); --txt-p: #ffffff; --txt-s: rgba(255,255,255,0.65); }
    .home-view, .cam-view { display: flex; flex-direction: column; gap: 14px; padding: 10px; }
    .flex-row-center { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; }
    .side-col { width: 75px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .side-info { text-align: center; }
    .val-big { font-size: 20px; font-weight: 700; color: var(--txt-p); text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .label-tiny { font-size: 9px; font-weight: 600; color: var(--txt-s); letter-spacing: 0.5px; margin-top: 2px; }
    .hum-pill { background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border); border-radius: 20px; padding: 3px 8px; font-size: 10px; color: var(--txt-p); font-weight: 500; }
    
    .gauge-container { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .center-gauge { width: 140px; height: 140px; position: relative; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; border: 2px dashed rgba(255,255,255,0.15); box-sizing: border-box; }
    .inner-circle { width: 116px; height: 116px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 0 15px rgba(255,255,255,0.02), 0 4px 15px rgba(0,0,0,0.15); }
    .water-label { font-size: 9px; font-weight: 700; color: var(--txt-s); letter-spacing: 1px; }
    .water-val { font-size: 32px; font-weight: 800; color: var(--txt-p); line-height: 36px; letter-spacing: -0.5px; }
    .target-box { font-size: 9px; font-weight: 600; color: #10b981; background: rgba(16,185,129,0.12); padding: 2px 7px; border-radius: 20px; margin-top: 2px; border: 1px solid rgba(16,185,129,0.2); }
    .temp-btn { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; color: var(--txt-p); cursor: pointer; transition: all 0.2s; }
    .temp-btn:hover { background: rgba(255,255,255,0.15); }
    
    .heat-ctrl { display: flex; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 14px; padding: 6px; align-items: center; justify-content: space-between; }
    .heat-btn { border: none; outline: none; border-radius: 10px; padding: 8px 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
    .heat-off { background: rgba(255,255,255,0.05); color: var(--txt-s); border: 1px solid transparent; }
    .heat-on { background: linear-gradient(135deg, #ff9800, #f44336); color: #fff; box-shadow: 0 3px 10px rgba(244,67,54,0.3); border: 1px solid rgba(255,255,255,0.1); }
    .heat-temps { display: flex; align-items: center; gap: 12px; padding-right: 6px; }
    .heat-target { font-size: 16px; font-weight: 700; color: var(--txt-p); min-width: 40px; text-align: center; }
    .heat-t-btn { color: var(--txt-p); cursor: pointer; display: flex; align-items: center; opacity: 0.7; transition: 0.2s; }
    .heat-t-btn:hover { opacity: 1; transform: scale(1.1); }
    
    .footer-row { display: flex; gap: 8px; justify-content: center; }
    .footer-pill { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 10px; padding: 5px 10px; font-size: 11px; color: var(--txt-p); font-weight: 500; }
    .footer-pill ha-icon { --mdc-icon-size: 13px; }
    .anim-pulse { animation: pulse 2s infinite ease-in-out; }
    @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; color: #ffeb3b; } }

    .maint-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .maint-item { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 5px; position: relative; overflow: hidden; }
    .maint-head { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--txt-s); }
    .maint-head ha-icon { --mdc-icon-size: 14px; }
    .maint-bar { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; margin-top: 2px; }
    .maint-fill { height: 100%; background: #10b981; border-radius: 2px; }
    .maint-fill-warn { background: #ef4444 !important; }
    .maint-val { font-size: 10px; color: var(--txt-p); font-weight: 500; text-align: right; }
    .maint-badge { font-size: 8px; font-weight: 700; text-transform: uppercase; padding: 1px 4px; border-radius: 4px; background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
    .maint-reset-btn { position: absolute; top: 6px; right: 6px; width: 16px; height: 16px; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--txt-p); font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .maint-reset-btn:hover { background: #10b981; color: #fff; border-color: transparent; }
    .maint-warn { border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.01); }

    .flood-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; border: 1px solid transparent; }
    .flood-ok { background: rgba(16,185,129,0.04); border-color: rgba(16,185,129,0.15); color: #10b981; }
    .flood-alert { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); color: #ef4444; animation: flood-flash 1.5s infinite alternate; }
    .flood-left { display: flex; align-items: center; gap: 8px; }
    .flood-icon { --mdc-icon-size: 16px; }
    @keyframes flood-flash { 0% { box-shadow: 0 0 4px rgba(239,68,68,0.1); } 100% { box-shadow: 0 0 12px rgba(239,68,68,0.3); } }
    .flood-icon-alert { animation: rot-alert 0.5s infinite alternate; }
    @keyframes rot-alert { 0% { transform: rotate(-5deg); } 100% { transform: rotate(5deg); } }
    .flood-pill { display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 6px; font-size: 9px; }
    .pill-ok { background: rgba(255,255,255,0.05); color: var(--txt-p); }
    .pill-warn { background: rgba(239,68,68,0.15); color: #ef4444; }

    .sched-panel { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
    .sched-header { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: var(--txt-s); letter-spacing: 0.5px; }
    .sched-header ha-icon { --mdc-icon-size: 15px; color: #6b8eff; }
    .sched-display-box { text-align: center; padding: 4px 0; }
    .sched-main-val { font-size: 26px; font-weight: 800; color: var(--txt-p); letter-spacing: -0.5px; }
    .sched-sub-info { font-size: 10px; color: var(--txt-s); margin-top: 1px; }
    .sched-sub-info strong { color: #6b8eff; font-weight: 600; }
    .sched-grid-ctrl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
    .sched-ctrl-btn { border: none; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px 0; color: var(--txt-p); font-size: 11px; font-weight: 600; cursor: pointer; transition: 0.15s; }
    .sched-ctrl-btn:hover { background: rgba(255,255,255,0.12); }
    .text-accent { color: #6b8eff !important; }
    .sched-confirm-action { border: none; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; border-radius: 10px; padding: 8px 0; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 3px 8px rgba(29,78,216,0.2); transition: 0.2s; }
    .sched-confirm-action:hover { opacity: 0.9; transform: translateY(-0.5px); }
    .sched-confirm-action ha-icon { --mdc-icon-size: 13px; }

    .cam-container { position: relative; background: #000; overflow: hidden; border: 1px solid var(--glass-border); box-sizing: border-box; margin: 0 auto; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .cam-overlay { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.5); color: #fff; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
    .cam-container:hover .cam-overlay { opacity: 1; }
    .cam-overlay ha-icon { --mdc-icon-size: 16px; }
    .cam-expanded { position: fixed !important; top: 10vh; left: 5vw; width: 90vw !important; height: auto !important; max-height: 80vh; z-index: 99; }
    .empty-msg { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; color: var(--txt-s); font-size: 12px; gap: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; }
    .empty-msg ha-icon { --mdc-icon-size: 24px; }
  `;
}
customElements.define('spa-card', SpaCard);

// ── Déclaration pour le sélecteur de cartes HA ──────────────────────
window.customCards = window.customCards || [];
window.customCards.push({
  type:        'spa-card',
  name:        'Spa Card',
  description: 'Carte de contrôle LayZSpa / spa avec températures, maintenance, caméra et programmation.',
  preview:     true,
});
