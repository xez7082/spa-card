import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════
// 1. ÉDITEUR (Ne contient que le formulaire)
// ═══════════════════════════════════════════════
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }

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

  / ${hasEnergy ? html`
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
  }/ ─── Bandeau statut LayZSpa (prêt / en chauffe / déconnecté) ───
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

  static get styles() {
    return css`
      .cg-row { margin-bottom: 10px; }
      .sw-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      /* Ajoutez ici vos styles CSS */
    `;
  }
}
if (!customElements.get("spa-card")) customElements.define("spa-card", SpaCard);

// 3. ENREGISTREMENT
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Control Card", preview: true });
