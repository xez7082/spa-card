import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V37
// ═══════════════════════════════════════════════════════════════════
class SpaCardEditor extends LitElement {

  static get properties() {
    return { hass: {}, _config: {}, _tab: { type: String }, _open: {} };
  }

  constructor() {
    super();
    this._tab  = 'gen';
    this._open = new Set(['a-disp','a-temps','a-layzspa','a-ph','a-cdim']);
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

  _acc(id, color, icon, title, schema) {
    const open = this._open.has(id);
    return html`
      <div class="acc ${open ? 'open' : ''}">
        <div class="ach" @click=${() => this._tog(id)}>
          <div class="aibox" style="background:${color}22; color:${color};">${icon}</div>
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
      ${this._acc('a-disp','#6b8eff','🎨','Apparence générale',[
        { name:'card_title',       label:'Titre du spa',               selector:{ text:{} } },
        { name:'background_image', label:'Image de fond (URL)',         selector:{ text:{} } },
        { name:'card_height',      label:'Hauteur totale (ex: 640px)', selector:{ text:{} } },
        { name:'blur_amount',      label:'Intensité du flou (0–25)',   selector:{ number:{ mode:'slider', min:0, max:25 } } }
      ])}`;
  }

  _renderSens() {
    return html`
      ${this._acc('a-temps','#10b981','🌡️','Températures',[
        { name:'entity_water_temp',  label:'Temp. eau actuelle',  selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_target_temp', label:'Entité consigne',     selector:{ entity:{} } },
        { name:'target_temp_min',    label:'Consigne min (°C)',   selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'target_temp_max',    label:'Consigne max (°C)',   selector:{ number:{ mode:'box', step:0.5 } } },
        { name:'entity_ext_temp',    label:'Temp. extérieure',    selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_spa_air_temp',label:'Temp. air spa',       selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_ext_hum',     label:'Humidité extérieure', selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_spa_hum',     label:'Humidité spa',        selector:{ entity:{ domain:'sensor' } } }
      ])}
      ${this._acc('a-layzspa','#f59e0b','🛁','LayZSpa — états & maintenance',[
        { name:'entity_lz_ready',        label:'Prêt (binary_sensor)',           selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_heater',       label:'Chauffage actif (binary_sensor)',selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_conn',         label:'Connexion WiFi (binary_sensor)', selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_lz_filter',       label:'Âge filtre — jours',            selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_filter_max',          label:'Alerter filtre après (jours)',   selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_reset_filter', label:'Bouton reset filtre',            selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_chlorine',     label:'Âge chlore — jours',            selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_chlorine_max',        label:'Alerter chlore après (jours)',   selector:{ number:{ mode:'box', min:1, max:365 } } },
        { name:'entity_lz_reset_chlore', label:'Bouton reset chlore',            selector:{ entity:{ domain:'button' } } },
        { name:'entity_lz_energy',       label:'Énergie totale kWh',             selector:{ entity:{ domain:'sensor' } } },
        { name:'entity_lz_rssi',         label:'Signal WiFi RSSI',               selector:{ entity:{ domain:'sensor' } } },
        { name:'lz_volume',              label:'Volume eau (litres)',             selector:{ number:{ mode:'box', min:100, max:5000 } } },
        { name:'lz_power_w',             label:'Puissance chauffe (W)',           selector:{ number:{ mode:'box', min:500, max:5000 } } },
        { name:'lz_heat_loss',           label:'Pertes thermiques (%)',           selector:{ number:{ mode:'slider', min:0, max:60 } } },
        { name:'entity_lz_schedule',     label:'Programmation (input_datetime)', selector:{ entity:{ domain:'input_datetime' } } },
        { name:'main_cons_entity',       label:'Sonde conso (W ou kWh)',          selector:{ entity:{} } }
      ])}
      ${this._acc('a-flood','#0ea5e9','💧',"Capteur d'inondation",[
        { name:'entity_water_leak', label:'Détecteur fuite eau', selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_tamper',     label:'Alerte sabotage',     selector:{ entity:{ domain:'binary_sensor' } } },
        { name:'entity_flood_bat',  label:'Batterie capteur (%)',selector:{ entity:{ domain:'sensor' } } }
      ])}`;
  }

  _renderChem() {
    return html`
      ${this._acc('a-ph','#8b5cf6','pH','pH',[
        { name:'entity_ph', label:'Entité pH',  selector:{ entity:{ domain:'sensor' } } },
        { name:'ph_min',    label:'pH Minimum', selector:{ number:{ step:0.1, mode:'box' } } },
        { name:'ph_max',    label:'pH Maximum', selector:{ number:{ step:0.1, mode:'box' } } }
      ])}
      ${this._acc('a-orp','#8b5cf6','ORP','ORP (mV)',[
        { name:'entity_orp', label:'Entité ORP',  selector:{ entity:{ domain:'sensor' } } },
        { name:'orp_min',    label:'ORP Minimum', selector:{ number:{ mode:'box' } } },
        { name:'orp_max',    label:'ORP Maximum', selector:{ number:{ mode:'box' } } }
      ])}
      ${this._acc('a-tds','#8b5cf6','TDS','TDS (ppm)',[
        { name:'entity_tds', label:'Entité TDS',  selector:{ entity:{ domain:'sensor' } } },
        { name:'tds_min',    label:'TDS Minimum', selector:{ number:{ mode:'box' } } },
        { name:'tds_max',    label:'TDS Maximum', selector:{ number:{ mode:'box' } } }
      ])}
      ${this._acc('a-salt','#8b5cf6','SEL','Sel (ppm)',[
        { name:'entity_salt', label:'Entité sel',  selector:{ entity:{ domain:'sensor' } } },
        { name:'salt_min',    label:'Sel Minimum', selector:{ number:{ mode:'box' } } },
        { name:'salt_max',    label:'Sel Maximum', selector:{ number:{ mode:'box' } } }
      ])}`;
  }

  _renderCamEditor() {
    return html`
      ${this._acc('a-cdim','#0ea5e9','📷','Caméra & dimensions',[
        { name:'entity_camera', label:'Entité caméra',              selector:{ entity:{ domain:'camera' } } },
        { name:'cam_w_px',      label:'Largeur (px) — vide = 100%', selector:{ number:{ mode:'box', min:40, max:800 } } },
        { name:'cam_h_px',      label:'Hauteur (px)',               selector:{ number:{ mode:'box', min:40, max:800 } } },
        { name:'cam_radius',    label:'Arrondi coins (px)',          selector:{ number:{ mode:'slider', min:0, max:50 } } },
        { name:'cam_x',         label:'Décalage X (px)',             selector:{ number:{ mode:'box', min:-500, max:500 } } },
        { name:'cam_y',         label:'Décalage Y (px)',             selector:{ number:{ mode:'box', min:-500, max:500 } } }
      ])}`;
  }

  _renderSwEditor() {
    const schema = Array.from({ length:10 }, (_,i) => [
      { name:`switch_${i+1}`,      label:`Entité bouton ${i+1}`, selector:{ entity:{} } },
      { name:`name_switch_${i+1}`, label:`Nom bouton ${i+1}`,    selector:{ text:{} } }
    ]).flat();
    return html`
      ${this._acc('a-sw','#f97316','⚙️','10 interrupteurs configurables', schema)}`;
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const TABS = [
      { id:'gen',  color:'#6b8eff', icon:'🎨', label:'Général'  },
      { id:'sens', color:'#10b981', icon:'🌡️', label:'Capteurs' },
      { id:'chem', color:'#8b5cf6', icon:'⚗️', label:'Chimie'   },
      { id:'cam',  color:'#0ea5e9', icon:'📷', label:'Caméra'   },
      { id:'sw',   color:'#f97316', icon:'⚙️', label:'Switches' }
    ];
    const content = {
      gen:  this._renderGen(),
      sens: this._renderSens(),
      chem: this._renderChem(),
      cam:  this._renderCamEditor(),
      sw:   this._renderSwEditor()
    };
    return html`
      <div class="editor-wrap">
        <div class="tabs">
          ${TABS.map(t => html`
            <button class="tab ${this._tab===t.id?'on':''}"
                    style="${this._tab===t.id ? `background:${t.color}22; border-color:${t.color}55;` : ''}"
                    @click=${()=>{ this._tab=t.id; }}>
              <span class="ticon">${t.icon}</span>
              <span class="tlbl">${t.label}</span>
            </button>`)}
        </div>
        <div class="sections">${content[this._tab]}</div>
      </div>`;
  }

  static styles = css`
    :host { display: block; }
    .tabs {
      display: flex; gap: 4px; flex-wrap: wrap;
      background: var(--secondary-background-color, rgba(0,0,0,.05));
      border-radius: 14px; padding: 5px; margin-bottom: 12px;
    }
    .tab {
      flex: 1; min-width: 52px; display: flex; flex-direction: column; align-items: center;
      gap: 3px; padding: 6px 4px 8px; cursor: pointer; border: 1px solid transparent;
      background: transparent; border-radius: 9px; transition: all .18s;
      font-family: inherit;
    }
    .tab:hover { background: rgba(0,0,0,.04); }
    .tab.on { box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .ticon { font-size: 16px; line-height: 1; }
    .tlbl { font-size: 10px; color: var(--secondary-text-color,#888); font-weight: 600; white-space: nowrap; }
    .tab.on .tlbl { color: var(--primary-text-color,#212121); }
    .sections { display: flex; flex-direction: column; }
    .acc { border: 1px solid var(--divider-color,rgba(0,0,0,.12)); border-radius: 12px; margin-bottom: 8px; overflow: hidden; }
    .ach { display: flex; align-items: center; gap: 10px; padding: 11px 13px; cursor: pointer; background: var(--secondary-background-color,rgba(0,0,0,.03)); transition: background .15s; user-select: none; }
    .ach:hover { background: rgba(0,0,0,.06); }
    .aibox { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
    .ach-title { flex: 1; font-size: 13px; font-weight: 500; color: var(--primary-text-color,#212121); }
    .arr { --mdc-icon-size: 20px; color: var(--secondary-text-color,#aaa); transition: transform .28s cubic-bezier(.4,0,.2,1); }
    .acc.open .arr { transform: rotate(180deg); }
    .acb { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s cubic-bezier(.4,0,.2,1); }
    .acc.open .acb { grid-template-rows: 1fr; }
    .acb > div { overflow: hidden; }
    .acbi { padding: 6px 6px 14px; }
  `;
}
customElements.define('spa-card-editor', SpaCardEditor);


// ═══════════════════════════════════════════════════════════════════
//  CARTE  —  V37
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
      lz_volume: 500, lz_power_w: 1942, lz_heat_loss: 30,
      entity_lz_reset_filter: 'button.layzspa_reset_filter_change_timer',
      entity_lz_schedule:     'input_datetime.spa_ready_at',
      entity_lz_reset_chlore: 'button.layzspa_reset_chlorine_timer',
      lz_filter_max: 60,
      entity_lz_chlorine: 'sensor.layzspa_chlorine_age',
      lz_chlorine_max: 14,
      entity_lz_energy: 'sensor.layzspa_energy',
      entity_lz_rssi:   'sensor.layzspa_rssi',
      main_cons_entity: 'sensor.layzspa_power',
      entity_water_leak:'binary_sensor.innondation_spa_water_leak',
      entity_tamper:    'binary_sensor.innondation_spa_tamper',
      entity_flood_bat: 'sensor.innondation_spa_battery',
      entity_ph:'sensor.layzspa_ph', entity_orp:'sensor.layzspa_orp',
      entity_tds:'sensor.layzspa_tds', entity_salt:'sensor.layzspa_salt',
      ph_min:7.2, ph_max:7.6, orp_min:650, orp_max:800,
      tds_min:500, tds_max:1500, salt_min:2500, salt_max:3500,
      switch_1:'switch.layzspa_pump',           name_switch_1:'Pompe',
      switch_2:'switch.layzspa_jets',            name_switch_2:'Jets',
      switch_3:'switch.layzspa_airbubbles',     name_switch_3:'Bulles',
      switch_4:'switch.layzspa_heat_regulation', name_switch_4:'Chauffe',
      switch_5:'switch.layzspa_power_switch',   name_switch_5:'Alimentation',
      switch_6:'switch.layzspa_lock',           name_switch_6:'Verrouillage'
    };
  }

  static get properties() {
    return { hass:{}, config:{}, _tab:{ type:String }, _camExpanded:{ type:Boolean } };
  }

  constructor() { super(); this._tab = 'gen'; this._camExpanded = false; }
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
    const cur = id.startsWith('climate.')
      ? parseFloat(this._attr(id,'temperature') ?? this._state(id))
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
    if (id.startsWith('climate.')) return String(this._attr(id,'temperature') ?? this._state(id));
    return this._state(id);
  }

  _calcHeatingTime() {
    const c = this.config;
    const volume      = Number(c.lz_volume   ?? 500);
    const efficiency  = 1 - Number(c.lz_heat_loss ?? 30) / 100;
    let powerW        = Number(c.lz_power_w ?? 0);
    if (!powerW && this._exists(c.main_cons_entity)) {
      const unit = this._attr(c.main_cons_entity,'unit_of_measurement') ?? '';
      const raw  = parseFloat(this._state(c.main_cons_entity));
      powerW = unit.toLowerCase().includes('kw') ? raw*1000 : raw;
    }
    if (!powerW || isNaN(powerW)) powerW = 1942;
    const curTemp = parseFloat(this._waterTemp() ?? NaN);
    const tgtTemp = parseFloat(this._targetTemp() ?? NaN);
    if (isNaN(curTemp) || isNaN(tgtTemp)) return null;
    const deltaT = tgtTemp - curTemp;
    if (deltaT <= 0.5) return 0;
    const timeH = (volume * 1.163 * deltaT) / (powerW * efficiency);
    return { timeH, deltaT, curTemp, tgtTemp, powerW, efficiency };
  }

  // ═══════════════════════════════════════════════
  //  ACCUEIL
  // ═══════════════════════════════════════════════
  _renderHome() {
    const c     = this.config;
    const wTemp = this._waterTemp();
    const tTemp = this._targetTemp();
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
              <div class="temp-btn" @click=${()=>this._changeTemp(0.5)}>
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
              <div class="temp-btn" @click=${()=>this._changeTemp(-0.5)}>
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
    const c  = this.config;
    const id = c.entity_target_temp;
    if (!id || !id.startsWith('climate.') || !this.hass?.states[id]) return html``;
    const isOn    = this.hass.states[id].state === 'heat';
    const curTemp = parseFloat(this._waterTemp() ?? 0);
    const tgtTemp = parseFloat(this._targetTemp() ?? 34);
    const atTemp  = curTemp >= tgtTemp - 0.5;
    const toggle  = () => this.hass.callService('climate','set_hvac_mode',{ entity_id:id, hvac_mode: isOn?'off':'heat' });
    return html`
      <div class="heat-ctrl">
        <button class="heat-btn ${isOn ? 'heat-on' : 'heat-off'}" @click=${toggle}>
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

  _renderFooterRow() {
    const c = this.config;
    const hasCons   = this._exists(c.main_cons_entity);
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
    const c        = this.config;
    const filterAge = this._exists(c.entity_lz_filter)   ? parseFloat(this._state(c.entity_lz_filter))   : null;
    const chloreAge = this._exists(c.entity_lz_chlorine) ? parseFloat(this._state(c.entity_lz_chlorine)) : null;
    const filterMax = Number(c.lz_filter_max  ?? 60);
    const chloreMax = Number(c.lz_chlorine_max ?? 14);
    if (filterAge === null && chloreAge === null) return html``;
    const filterWarn = filterAge !== null && filterAge > filterMax;
    const chloreWarn = chloreAge !== null && chloreAge > chloreMax;
    const filterPct  = filterAge !== null ? Math.min(100, filterAge/filterMax*100) : 0;
    const chlorePct  = chloreAge !== null ? Math.min(100, chloreAge/chloreMax*100) : 0;
    const pressReset = id => this.hass.callService('button','press',{ entity_id:id });
    return html`
      <div class="maint-row">
        ${filterAge !== null ? html`
          <div class="maint-item ${filterWarn?'maint-warn':''}">
            <div class="maint-head">
              <ha-icon icon="mdi:air-filter"></ha-icon><span>Filtre</span>
              ${filterWarn ? html`<span class="maint-badge">À changer</span>` : ''}
              ${c.entity_lz_reset_filter ? html`
                <button class="maint-reset-btn" @click=${()=>pressReset(c.entity_lz_reset_filter)}>✓</button>` : ''}
            </div>
            <div class="maint-bar"><div class="maint-fill ${filterWarn?'maint-fill-warn':''}" style="width:${filterPct}%"></div></div>
            <div class="maint-val">${Math.round(filterAge)} j / ${filterMax} j</div>
          </div>` : ''}
        ${chloreAge !== null ? html`
          <div class="maint-item ${chloreWarn?'maint-warn':''}">
            <div class="maint-head">
              <ha-icon icon="mdi:flask-outline"></ha-icon><span>Chlore</span>
              ${chloreWarn ? html`<span class="maint-badge">À renouveler</span>` : ''}
              ${c.entity_lz_reset_chlore ? html`
                <button class="maint-reset-btn" @click=${()=>pressReset(c.entity_lz_reset_chlore)}>✓</button>` : ''}
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
    const leak    = this._state(c.entity_water_leak) === 'on';
    const tamper  = this._state(c.entity_tamper)     === 'on';
    const bat     = this._exists(c.entity_flood_bat) ? parseFloat(this._state(c.entity_flood_bat)) : null;
    const alerting = leak || tamper;
    const batLow  = bat !== null && bat <= 15;
    return html`
      <div class="flood-bar ${alerting?'flood-alert':'flood-ok'}">
        <div class="flood-left">
          <ha-icon class="flood-icon ${alerting?'flood-icon-alert':''}"
                   icon="${leak?'mdi:water-alert':tamper?'mdi:shield-alert':'mdi:shield-check'}"></ha-icon>
          <span>${leak?'FUITE EAU DETECTÉE !':tamper?'SABOTAGE DETECTÉ !':'Sécurité OK'}</span>
        </div>
        <div class="flood-right">
          ${bat !== null ? html`
            <div class="flood-pill ${batLow?'pill-warn':'pill-ok'}">
              <ha-icon icon="${batLow?'mdi:battery-alert':'mdi:battery'}"></ha-icon>
              <span>${Math.round(bat)}%</span>
            </div>` : ''}
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  PROGRAMMATION
  // ═══════════════════════════════════════════════
  _renderSchedule() {
    const c       = this.config;
    const schedId = c.entity_lz_schedule;
    if (!schedId || !this.hass?.states[schedId]) return html`
      <div class="empty-msg">
        <ha-icon icon="mdi:clock-outline"></ha-icon>
        <p>Configurer entity_lz_schedule dans l'éditeur</p>
      </div>`;
    const raw    = this.hass.states[schedId].state;
    const parts  = raw.split(':');
    const h      = parseInt(parts[0] ?? 0);
    const m      = parseInt(parts[1] ?? 0);
    const calc   = this._calcHeatingTime();
    let startStr = '';
    const readyStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    if (calc && calc !== 0) {
      const nowD   = new Date();
      const readyD = new Date(nowD); readyD.setHours(h,m,0,0);
      if (readyD < nowD) readyD.setDate(readyD.getDate()+1);
      const startD = new Date(readyD.getTime() - calc.timeH*3600000);
      startStr = `${String(startD.getHours()).padStart(2,'0')}:${String(startD.getMinutes()).padStart(2,'0')}`;
    }
    const changeTime = (dh, dm) => {
      let nh = h+dh, nm = m+dm;
      if (nm>=60){ nm-=60; nh+=1; }
      if (nm<0)  { nm+=60; nh-=1; }
      nh = ((nh%24)+24)%24;
      this.hass.callService('input_datetime','set_datetime',{
        entity_id: schedId,
        time: `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}:00`
      });
    };
    const activate = () => {
      // 1. Déclenche l'automatisation
      this.hass.callService('automation', 'trigger', {
        entity_id: 'automation.spa_demarrage_programme_intelligent'
      });
    
      // 2. Message de confirmation visuel sur l'écran
      this.hass.callService('persistent_notification', 'create', {
        title: '🛁 Spa Programmé',
        message: 'La programmation est activée. Le système surveille l\'heure de démarrage.'
      });
      
        // 3. (Optionnel) Ajout d'une petite animation ou changement d'état 
        // si vous voulez que le bouton change de couleur ou d'icône.
      };
    return html`
      <div class="sched-panel">
        <div class="sched-header"><ha-icon icon="mdi:clock-digital"></ha-icon><span>PLANIFICATION CHAUFFE</span></div>
        <div class="sched-display-box">
          <div class="sched-main-val">${readyStr}</div>
          <div class="sched-sub-info">
            ${startStr
              ? html`<span>Démarrage estimé : <strong>${startStr}</strong></span>`
              : html`<span>Prêt immédiatement</span>`}
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

  // ═══════════════════════════════════════════════
  //  CHIMIE
  // ═══════════════════════════════════════════════
  _renderChemistry() {
    const c = this.config;
    const items = [
      { id:c.entity_ph,   name:'pH',  icon:'mdi:ph',        min:c.ph_min??7.2,   max:c.ph_max??7.6,   dec:1, u:'' },
      { id:c.entity_orp,  name:'ORP', icon:'mdi:test-tube', min:c.orp_min??650,  max:c.orp_max??800,  dec:0, u:' mV' },
      { id:c.entity_tds,  name:'TDS', icon:'mdi:shaker',    min:c.tds_min??500,  max:c.tds_max??1500, dec:0, u:' ppm' },
      { id:c.entity_salt, name:'Sel', icon:'mdi:snowflake', min:c.salt_min??2500,max:c.salt_max??3500, dec:0, u:' ppm' }
    ];
    return html`
      <div class="chem-view">
        ${items.map(item => {
          if (!this._exists(item.id)) return '';
          const val    = parseFloat(this._state(item.id));
          const isLow  = val < item.min;
          const isHigh = val > item.max;
          const ok     = !isLow && !isHigh;
          const span   = (item.max*1.2) - (item.min*0.8);
          const pct    = span>0 ? Math.min(100,Math.max(0,((val-(item.min*0.8))/span)*100)) : 0;
          const mMin   = span>0 ? ((item.min-(item.min*0.8))/span)*100 : 0;
          const mMax   = span>0 ? ((item.max-(item.min*0.8))/span)*100 : 0;
          return html`
            <div class="chem-card ${ok?'chem-ok':'chem-warn'}">
              <div class="chem-header">
                <ha-icon icon="${item.icon}"></ha-icon>
                <span class="chem-title">${item.name}</span>
                <span class="chem-status-tag">${ok?'Idéal':'Ajuster'}</span>
              </div>
              <div class="chem-value">${val.toFixed(item.dec)}${item.u}</div>
              <div class="chem-gauge-bg">
                <div class="chem-gauge-fill ${!ok?'chem-fill-warn':''}" style="width:${pct}%"></div>
                <div class="chem-marker" style="left:${mMin}%"></div>
                <div class="chem-marker" style="left:${mMax}%"></div>
              </div>
              <div class="chem-range">Cible : ${item.min} – ${item.max}${item.u}</div>
              ${!ok ? html`
                <div class="chem-alert-text">
                  <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                  <span>${isLow ? 'Valeur trop basse — corriger avant utilisation.' : 'Valeur trop haute — corriger avant utilisation.'}</span>
                </div>` : ''}
            </div>`;
        })}
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  CAMÉRA
  // ═══════════════════════════════════════════════
  _renderCam() {
    const c = this.config;
    if (!c.entity_camera || !this.hass?.states[c.entity_camera]) {
      return html`<div class="empty-msg"><ha-icon icon="mdi:camera-off"></ha-icon><p>Aucune caméra configurée</p></div>`;
    }
    const w = c.cam_w_px ? `${c.cam_w_px}px` : '100%';
    const h = c.cam_h_px ? `${c.cam_h_px}px` : '300px';
    const r = c.cam_radius !== undefined ? `${c.cam_radius}px` : '12px';
    const x = c.cam_x || 0;
    const y = c.cam_y || 0;

    const ts   = Math.floor(Date.now() / 5000);
    const base = this.hass.states[c.entity_camera]?.attributes?.entity_picture ?? '';
    const src  = base ? `${base}${base.includes('?') ? '&' : '?'}_t=${ts}` : '';

    if (!src) {
      return html`<div class="empty-msg"><ha-icon icon="mdi:camera-off"></ha-icon><p>Flux caméra indisponible</p></div>`;
    }

    return html`
      <div class="cam-view">
        <div class="cam-container ${this._camExpanded ? 'cam-expanded' : ''}"
             style="width:${this._camExpanded ? '100%' : w}; height:${this._camExpanded ? '80vh' : h}; border-radius:${r};">
          <img src="${src}" alt="Caméra spa"
               style="width:100%; height:100%; object-fit:cover; border-radius:${r}; transform:translate(${x}px,${y}px); display:block;"
               @error=${(e) => { e.target.style.opacity = '0.3'; }}>
          <div class="cam-overlay" @click=${() => { this._camExpanded = !this._camExpanded; this.requestUpdate(); }}>
            <ha-icon icon="${this._camExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}"></ha-icon>
          </div>
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════
  //  SWITCHES
  // ═══════════════════════════════════════════════
  _renderSwitches() {
    const c       = this.config;
    const buttons = [];
    for (let i=1; i<=10; i++) {
      const entity = c[`switch_${i}`];
      if (!entity || !this.hass.states[entity]) continue;
      const label  = c[`name_switch_${i}`] || `Switch ${i}`;
      const active = ['on','heat','playing'].includes(this.hass.states[entity].state);
      let icon = 'mdi:power';
      const txt = label.toLowerCase();
      if (txt.includes('spa'))     icon='mdi:hot-tub';
      else if (txt.includes('tv'))    icon='mdi:television';
      else if (txt.includes('cam'))   icon='mdi:cctv';
      else if (txt.includes('filtr')) icon='mdi:air-filter';
      else if (txt.includes('bull'))  icon='mdi:bubble';
      else if (txt.includes('led'))   icon='mdi:led-strip-variant';
      else if (txt.includes('chauff'))icon='mdi:radiator';
      else if (txt.includes('lumi'))  icon='mdi:lightbulb';
      else if (txt.includes('pompe')) icon='mdi:pump';
      else if (txt.includes('jet'))   icon='mdi:turbine';
      const toggle = ev => { ev.stopPropagation(); this.hass.callService(entity.split('.')[0],'toggle',{ entity_id:entity }); };
      buttons.push(html`
        <div class="switch-card ${active?'sw-active':''}" @click=${toggle} tabindex="0" role="button" aria-label="${label}">
          <div class="sw-led"></div>
          <div class="sw-icon"><ha-icon icon="${icon}"></ha-icon></div>
          <div class="sw-meta">
            <span class="sw-name">${label}</span>
            <span class="sw-status">${active?'ACTIF':'ÉTEINT'}</span>
          </div>
        </div>`);
    }
    if (!buttons.length) return html`
      <div class="empty-msg"><ha-icon icon="mdi:toggle-switch-off"></ha-icon><p>Aucun interrupteur configuré</p></div>`;
    return html`<div class="switch-grid">${buttons}</div>`;
  }

  // ═══════════════════════════════════════════════
  //  RENDU PRINCIPAL
  // ═══════════════════════════════════════════════
  render() {
    if (!this.hass || !this.config) return html``;
    const c      = this.config;
    const bg     = c.background_image
      ? `background-image:url('${c.background_image}'); background-size:cover; background-position:center;`
      : 'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);';
    const blur   = c.blur_amount !== undefined ? c.blur_amount : 15;
    const height = c.card_height || '640px';

    const TABS = [
      { id:'gen',  icon:'mdi:home-thermometer', label:'Général',       color:'#6b8eff' },
      { id:'prog', icon:'mdi:clock-outline',     label:'Programme',     color:'#10b981' },
      { id:'chem', icon:'mdi:flask-outline',     label:'Chimie',        color:'#8b5cf6' },
      { id:'cam',  icon:'mdi:cctv',              label:'Caméra',        color:'#0ea5e9' },
      { id:'sw',   icon:'mdi:toggle-switch',     label:'Interrupteurs', color:'#f97316' }
    ];

    return html`
      <ha-card style="height:${height}; overflow:hidden; position:relative; border-radius:16px;">
        <div style="position:absolute; inset:0; ${bg} filter:blur(${blur}px); transform:scale(1.05);"></div>
        <div style="position:absolute; inset:0; background:rgba(0,0,0,0.35);"></div>
        <div style="position:relative; z-index:1; height:100%; display:flex; flex-direction:column; overflow:hidden;">

          <div class="tabs-menu">
            ${TABS.map(t => html`
              <button class="tab-btn ${this._tab===t.id?'tab-active':''}"
                      style="${this._tab===t.id?`border-color:${t.color}66; background:${t.color}22; color:#fff;`:''}"
                      @click=${()=>{ this._tab=t.id; }}>
                <ha-icon icon="${t.icon}"></ha-icon>
                <span>${t.label}</span>
              </button>`)}
          </div>

          <div class="content-area">
            ${this._tab==='gen'  ? this._renderHome()      : ''}
            ${this._tab==='prog' ? this._renderSchedule()  : ''}
            ${this._tab==='chem' ? this._renderChemistry() : ''}
            ${this._tab==='cam'  ? this._renderCam()       : ''}
            ${this._tab==='sw'   ? this._renderSwitches()  : ''}
          </div>
        </div>
      </ha-card>`;
  }

  static styles = css`
    :host { display: block; --glass-border: rgba(255,255,255,0.12); --txt-p: #ffffff; --txt-s: rgba(255,255,255,0.65); }

    /* ── Navigation ── */
    .tabs-menu { display:flex; gap:4px; padding:8px 6px; flex-shrink:0; overflow-x:auto; scrollbar-width:none; }
    .tabs-menu::-webkit-scrollbar { display:none; }
    .tab-btn {
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:3px; padding:6px 10px; border:1px solid rgba(255,255,255,0.1);
      border-radius:10px; background:rgba(255,255,255,0.04); color:var(--txt-s);
      font-size:10px; font-weight:600; cursor:pointer; white-space:nowrap;
      transition:all 0.2s; flex-shrink:0; font-family:inherit;
    }
    .tab-btn:hover { background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.2); color:#fff; }
    .tab-btn ha-icon { --mdc-icon-size:18px; }

    /* ── Content ── */
    .content-area { flex:1; overflow-y:auto; padding:10px; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.1) transparent; }
    .content-area::-webkit-scrollbar { width:4px; }
    .content-area::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }

    .home-view, .cam-view { display:flex; flex-direction:column; gap:14px; }

    /* ── Gauge + temp ── */
    .flex-row-center { display:flex; align-items:center; justify-content:space-between; gap:10px; width:100%; }
    .side-col { width:75px; display:flex; flex-direction:column; align-items:center; gap:10px; }
    .side-info { text-align:center; }
    .val-big { font-size:20px; font-weight:700; color:var(--txt-p); }
    .label-tiny { font-size:9px; font-weight:600; color:var(--txt-s); letter-spacing:0.5px; margin-top:2px; }
    .hum-pill { background:rgba(255,255,255,0.06); border:1px solid var(--glass-border); border-radius:20px; padding:3px 8px; font-size:10px; color:var(--txt-p); font-weight:500; }
    .gauge-container { display:flex; flex-direction:column; align-items:center; gap:6px; }
    .center-gauge { width:140px; height:140px; position:relative; display:flex; align-items:center; justify-content:center; }
    .outer-ring { position:absolute; top:0; left:0; width:100%; height:100%; border-radius:50%; border:2px dashed rgba(255,255,255,0.15); box-sizing:border-box; }
    .inner-circle { width:116px; height:116px; border-radius:50%; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
    .water-label { font-size:9px; font-weight:700; color:var(--txt-s); letter-spacing:1px; }
    .water-val { font-size:32px; font-weight:800; color:var(--txt-p); line-height:36px; }
    .target-box { font-size:9px; font-weight:600; color:#10b981; background:rgba(16,185,129,0.12); padding:2px 7px; border-radius:20px; border:1px solid rgba(16,185,129,0.25); }
    .temp-btn { width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); display:flex; align-items:center; justify-content:center; color:var(--txt-s); cursor:pointer; transition:0.2s; }
    .temp-btn:hover { background:rgba(255,255,255,0.15); color:var(--txt-p); }

    /* ── Chauffage ── */
    .heat-ctrl { display:flex; background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); border-radius:14px; padding:6px; align-items:center; justify-content:space-between; }
    .heat-btn { border:none; border-radius:10px; padding:8px 14px; display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; font-size:12px; transition:all 0.2s; }
    .heat-off { background:rgba(255,255,255,0.05); color:var(--txt-s); }
    .heat-off:hover { background:rgba(255,255,255,0.1); color:#fff; }
    .heat-on { background:linear-gradient(135deg,#ff9800,#f44336); color:#fff; box-shadow:0 3px 10px rgba(244,67,54,0.3); }
    .heat-temps { display:flex; align-items:center; gap:12px; padding-right:6px; }
    .heat-target { font-size:16px; font-weight:700; color:var(--txt-p); min-width:40px; text-align:center; }
    .heat-t-btn { color:var(--txt-p); cursor:pointer; display:flex; align-items:center; opacity:0.7; transition:0.2s; }
    .heat-t-btn:hover { opacity:1; }

    /* ── Footer ── */
    .footer-row { display:flex; gap:8px; justify-content:center; }
    .footer-pill { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); border-radius:10px; padding:5px 10px; font-size:11px; color:var(--txt-p); }
    .footer-pill ha-icon { --mdc-icon-size:13px; }
    .anim-pulse { animation:pulse 2s infinite ease-in-out; }
    @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1; color:#ffeb3b;} }

    /* ── Maintenance ── */
    .maint-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .maint-item { background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:14px; padding:10px; display:flex; flex-direction:column; gap:5px; position:relative; }
    .maint-head { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:var(--txt-s); }
    .maint-head ha-icon { --mdc-icon-size:14px; }
    .maint-bar { height:4px; background:rgba(255,255,255,0.08); border-radius:2px; overflow:hidden; margin-top:2px; }
    .maint-fill { height:100%; background:#10b981; border-radius:2px; }
    .maint-fill-warn { background:#ef4444 !important; }
    .maint-val { font-size:10px; color:var(--txt-p); font-weight:500; text-align:right; }
    .maint-badge { font-size:8px; font-weight:700; padding:1px 4px; border-radius:4px; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.25); margin-left:auto; }
    .maint-reset-btn { position:absolute; top:6px; right:6px; width:16px; height:16px; border-radius:4px; background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); color:var(--txt-s); cursor:pointer; font-size:9px; display:flex; align-items:center; justify-content:center; transition:0.2s; }
    .maint-reset-btn:hover { background:#10b981; color:#fff; }
    .maint-warn { border-color:rgba(239,68,68,0.25); background:rgba(239,68,68,0.01); }

    /* ── Inondation ── */
    .flood-bar { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-radius:12px; font-size:11px; font-weight:600; border:1px solid transparent; }
    .flood-ok { background:rgba(16,185,129,0.04); border-color:rgba(16,185,129,0.15); color:#10b981; }
    .flood-alert { background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.3); color:#ef4444; animation:flood-flash 1.5s infinite alternate; }
    .flood-left { display:flex; align-items:center; gap:8px; }
    .flood-icon { --mdc-icon-size:16px; }
    @keyframes flood-flash { 0%{box-shadow:0 0 4px rgba(239,68,68,0.1)} 100%{box-shadow:0 0 12px rgba(239,68,68,0.3)} }
    .flood-icon-alert { animation:rot-alert 0.5s infinite alternate; }
    @keyframes rot-alert { 0%{transform:rotate(-5deg)} 100%{transform:rotate(5deg)} }
    .flood-pill { display:flex; align-items:center; gap:4px; padding:2px 6px; border-radius:6px; font-size:9px; }
    .pill-ok { background:rgba(255,255,255,0.05); color:var(--txt-p); }
    .pill-warn { background:rgba(239,68,68,0.15); color:#ef4444; }

    /* ── Programmation ── */
    .sched-panel { background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:16px; padding:12px; display:flex; flex-direction:column; gap:10px; }
    .sched-header { display:flex; align-items:center; gap:8px; font-size:11px; font-weight:700; color:var(--txt-s); letter-spacing:0.5px; }
    .sched-header ha-icon { --mdc-icon-size:15px; color:#6b8eff; }
    .sched-display-box { text-align:center; padding:4px 0; }
    .sched-main-val { font-size:26px; font-weight:800; color:var(--txt-p); letter-spacing:-0.5px; }
    .sched-sub-info { font-size:10px; color:var(--txt-s); margin-top:1px; }
    .sched-sub-info strong { color:#6b8eff; font-weight:600; }
    .sched-grid-ctrl { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
    .sched-ctrl-btn { border:none; background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); border-radius:8px; padding:6px 0; color:var(--txt-p); font-size:11px; font-weight:600; cursor:pointer; transition:0.2s; font-family:inherit; }
    .sched-ctrl-btn:hover { background:rgba(255,255,255,0.12); }
    .text-accent { color:#6b8eff !important; }
    .sched-confirm-action { border:none; background:linear-gradient(135deg,#3b82f6,#1d4ed8); color:#fff; border-radius:10px; padding:8px 0; font-size:11px; font-weight:600; cursor:pointer; transition:0.2s; display:flex; align-items:center; justify-content:center; gap:6px; font-family:inherit; }
    .sched-confirm-action:hover { opacity:0.9; transform:translateY(-0.5px); }
    .sched-confirm-action ha-icon { --mdc-icon-size:13px; }

    /* ── Chimie ── */
    .chem-view { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .chem-card { background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); border-radius:16px; padding:12px; display:flex; flex-direction:column; gap:4px; }
    .chem-header { display:flex; align-items:center; gap:6px; }
    .chem-header ha-icon { --mdc-icon-size:16px; }
    .chem-title { font-size:13px; font-weight:600; color:var(--txt-s); }
    .chem-status-tag { font-size:9px; padding:2px 6px; border-radius:8px; font-weight:700; margin-left:auto; }
    .chem-value { font-size:22px; font-weight:800; color:var(--txt-p); margin:2px 0; font-variant-numeric:tabular-nums; }
    .chem-gauge-bg { height:5px; background:rgba(255,255,255,0.08); border-radius:3px; position:relative; overflow:visible; margin:4px 0; }
    .chem-gauge-fill { height:100%; background:#4ade80; border-radius:3px; }
    .chem-fill-warn { background:#f87171 !important; }
    .chem-marker { position:absolute; top:-2px; width:2px; height:9px; background:rgba(255,255,255,0.5); }
    .chem-range { font-size:9px; color:var(--txt-s); font-weight:500; }
    .chem-alert-text { display:flex; gap:6px; margin-top:6px; background:rgba(248,113,113,0.08); border-radius:8px; padding:6px 8px; font-size:10px; line-height:1.3; color:#fca5a5; align-items:flex-start; border:1px solid rgba(248,113,113,0.15); }
    .chem-alert-text ha-icon { --mdc-icon-size:12px; flex-shrink:0; margin-top:1px; color:#f87171; }
    .chem-ok { border-color:rgba(74,222,128,0.12); }
    .chem-ok .chem-header ha-icon { color:#4ade80; }
    .chem-ok .chem-status-tag { background:rgba(74,222,128,0.12); color:#4ade80; }
    .chem-warn { border-color:rgba(248,113,113,0.25); }
    .chem-warn .chem-header ha-icon { color:#f87171; }
    .chem-warn .chem-status-tag { background:rgba(248,113,113,0.15); color:#f87171; }

    /* ── Caméra ── */
    .cam-container { position:relative; background:#000; overflow:hidden; border:1px solid var(--glass-border); box-sizing:border-box; margin:0 auto; cursor:pointer; transition:all 0.3s; }
    .cam-overlay { position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.5); color:#fff; padding:4px; border-radius:6px; display:flex; align-items:center; justify-content:center; opacity:0.7; transition:0.2s; }
    .cam-container:hover .cam-overlay { opacity:1; }
    .cam-overlay ha-icon { --mdc-icon-size:16px; }
    .cam-expanded { position:fixed !important; top:10vh; left:5vw; width:90vw !important; height:auto !important; max-height:80vh; z-index:99; }

    /* ── Switches ── */
    .switch-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
    @media (max-width:480px) { .switch-grid { grid-template-columns:repeat(2,1fr); } }
    .switch-card { position:relative; min-height:80px; padding:10px; border-radius:16px; background:rgba(20,30,45,0.8); border:1px solid rgba(255,255,255,0.06); cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; transition:all 0.2s; }
    .switch-card:hover { transform:translateY(-2px); border-color:rgba(255,255,255,0.12); }
    .switch-card.sw-active { border-color:rgba(56,189,248,0.45); box-shadow:0 0 16px rgba(56,189,248,0.12); }
    .sw-led { position:absolute; top:7px; right:7px; width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.1); transition:all 0.2s; }
    .sw-active .sw-led { background:#38bdf8; box-shadow:0 0 6px #38bdf8; }
    .sw-icon { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.05); transition:all 0.2s; }
    .sw-icon ha-icon { --mdc-icon-size:22px; color:var(--txt-s); }
    .sw-active .sw-icon { background:rgba(56,189,248,0.2); border-color:rgba(56,189,248,0.3); box-shadow:0 0 10px rgba(56,189,248,0.2); }
    .sw-active .sw-icon ha-icon { color:#38bdf8; }
    .sw-meta { text-align:center; }
    .sw-name { display:block; font-size:10px; font-weight:700; color:var(--txt-p); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:80px; }
    .sw-status { display:block; font-size:8px; font-weight:700; letter-spacing:0.4px; color:var(--txt-s); margin-top:1px; }
    .sw-active .sw-status { color:#38bdf8; }

    /* ── Divers ── */
    .empty-msg { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; color:var(--txt-s); font-size:12px; gap:8px; background:rgba(255,255,255,0.02); border-radius:12px; text-align:center; }
    .empty-msg ha-icon { --mdc-icon-size:28px; opacity:0.4; }
  `;
}
customElements.define('spa-card', SpaCard);

// ── Déclaration pour le sélecteur de cartes HA ──────────────────────
window.customCards = window.customCards || [];
window.customCards.push({
  type:        'spa-card',
  name:        'Spa Card',
  description: 'Carte de contrôle LayZSpa complète avec température, chimie, caméra et programmation',
  preview:     true,
});
