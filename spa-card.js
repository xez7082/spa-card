// ═══════════════════════════════════════════════
  //  ONGLET CHIMIE
  // ═══════════════════════════════════════════════
  _renderChem() {
    const c = this.config;
    
    // Sécurisation des valeurs par défaut en amont pour éviter les conflits de tokens dans le template
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
          
          // Calcul du pourcentage pour la jauge visuelle
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
  //  ONGLET CAMÉRA
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
  //  ONGLET SWITCHES
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
  //  RENDU PRINCIPAL & STYLES
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

    /* ACCUEIL V33 */
    .home-view { display: flex; flex-direction: column; gap: 14px; }

    /* Bandeau Statut LayZSpa */
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

    /* Contrôle chauffage épuré */
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

    /* Jauge & Blocs Latéraux */
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

    /* Footer Conso / Énergie */
    .footer-row { display: flex; justify-content: center; gap: 8px; margin-top: 2px; }
    .footer-pill {
      background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255,255,255,0.06);
      padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 600; color: var(--txt-s);
    }
    .footer-pill ha-icon { --mdc-icon-size: 13px; color: var(--accent-blue); }
    .anim-pulse { animation: pulse-glow 1.8s infinite ease-in-out; }
    @keyframes pulse-glow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; transform: scale(1.05); } }

    /* Maintenance filtre / chlore */
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

    /* Inondation */
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

    /* Programmation horaire */
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

    /* CHIMIE V33 */
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
    
    .chem-gauge-bg { height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; position: relative; overflow: hidden; margin: 2px 0; }
    .chem-gauge-fill { height: 100%; background: var(--accent-green); border-radius: 3px; }
    .chem-marker { position: absolute; top:0; width: 1px; height: 100%; background: rgba(255,255,255,0.4); }
    .chem-range { font-size: 9px; color: var(--txt-s); font-weight: 500; }

    .chem-ok { border-color: rgba(74, 222, 128, 0.12); }
    .chem-ok .chem-header ha-icon { color: var(--accent-green); }
    .chem-ok .chem-status-tag { background: rgba(74, 222, 128, 0.12); color: #4ade80; }
    
    .chem-warn { border-color: rgba(248, 113, 113, 0.25); background: rgba(248, 113, 113, 0.01); }
    .chem-warn .chem-header ha-icon { color: var(--accent-red); }
    .chem-warn .chem-status-tag { background: rgba(248, 113, 113, 0.15); color: #f87171; }
    .chem-warn .chem-gauge-fill { background: var(--accent-red); }

    /* CAMÉRA */
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

    /* SWITCHES */
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

    /* DIVERS */
    .empty-msg { text-align: center; padding: 40px 20px; color: var(--txt-s); }
    .empty-msg ha-icon { --mdc-icon-size: 32px; opacity: 0.5; margin-bottom: 8px; }
    .empty-msg p { margin: 0; font-size: 13px; }
  `;
}
customElements.define('spa-card', SpaCard);
