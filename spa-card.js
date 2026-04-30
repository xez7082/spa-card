import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ─────────────────────────────────────────────
//  EDITOR
// ─────────────────────────────────────────────
class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {}, _selectedTab: { type: String } };
  }

  // Schemas defined once as a static property — not recreated on every render()
  static get _schemas() {
    return {
      gen: [
        { name: "card_title",        label: "Titre du Spa",             selector: { text: {} } },
        { name: "background_image",  label: "Image de fond (URL)",       selector: { text: {} } },
        { name: "card_height",       label: "Hauteur totale (ex: 580px)",selector: { text: {} } },
        { name: "blur_amount",       label: "Intensité du flou (px)",    selector: { number: { mode: "slider", min: 0, max: 25 } } }
      ],
      sensors: [
        { name: "entity_water_temp", label: "Temp Eau (actuelle)",       selector: { entity: { domain: "sensor" } } },
        { name: "entity_target_temp",label: "Entité consigne de temp.",  selector: { entity: {} } },
        { name: "target_temp_min",   label: "Consigne min (°C)",         selector: { number: { mode: "box", step: 0.5 } } },
        { name: "target_temp_max",   label: "Consigne max (°C)",         selector: { number: { mode: "box", step: 0.5 } } },
        { name: "entity_ext_temp",   label: "Temp extérieure",           selector: { entity: { domain: "sensor" } } },
        { name: "entity_ext_hum",    label: "Humidité extérieure",       selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_air_temp",label:"Temp air spa",              selector: { entity: { domain: "sensor" } } },
        { name: "entity_spa_hum",    label: "Humidité air spa",          selector: { entity: { domain: "sensor" } } },
        { name: "main_cons_entity",  label: "Sonde conso électrique",    selector: { entity: {} } }
      ],
      chimie: [
        { name: "entity_ph",  label: "Entité pH",    selector: { entity: { domain: "sensor" } } },
        { name: "ph_min",     label: "pH Minimum",   selector: { number: { step: 0.1, mode: "box" } } },
        { name: "ph_max",     label: "pH Maximum",   selector: { number: { step: 0.1, mode: "box" } } },
        { name: "entity_orp", label: "Entité ORP",   selector: { entity: { domain: "sensor" } } },
        { name: "orp_min",    label: "ORP Minimum",  selector: { number: { mode: "box" } } },
        { name: "orp_max",    label: "ORP Maximum",  selector: { number: { mode: "box" } } },
        { name: "entity_tds", label: "Entité TDS",   selector: { entity: { domain: "sensor" } } },
        { name: "tds_min",    label: "TDS Minimum",  selector: { number: { mode: "box" } } },
        { name: "tds_max",    label: "TDS Maximum",  selector: { number: { mode: "box" } } },
        { name: "entity_salt",label: "Entité Sel",   selector: { entity: { domain: "sensor" } } },
        { name: "salt_min",   label: "Sel Minimum",  selector: { number: { mode: "box" } } },
        { name: "salt_max",   label: "Sel Maximum",  selector: { number: { mode: "box" } } }
      ],
      camera: [
        { name: "entity_camera", label: "Entité caméra",         selector: { entity: { domain: "camera" } } },
        { name: "cam_w_px",      label: "Largeur cadre (px)",    selector: { number: { mode: "box", min: 10, max: 1000 } } },
        { name: "cam_h_px",      label: "Hauteur cadre (px)",    selector: { number: { mode: "box", min: 10, max: 1000 } } },
        { name: "cam_radius",    label: "Arrondi des coins (px)",selector: { number: { mode: "slider", min: 0, max: 50 } } },
        { name: "cam_x",         label: "Position horizontale X (px)", selector: { number: { mode: "box", min: -500, max: 500 } } },
        { name: "cam_y",         label: "Position verticale Y (px)",   selector: { number: { mode: "box", min: -500, max: 500 } } }
      ],
      switches: Array.from({ length: 10 }, (_, i) => [
        { name: `switch_${i + 1}`,      label: `Entité bouton ${i + 1}`, selector: { entity: {} } },
        { name: `name_switch_${i + 1}`, label: `Nom bouton ${i + 1}`,    selector: { text: {} } }
      ]).flat()
    };
  }

  constructor() {
    super();
    this._selectedTab = 'gen';
  }

  setConfig(config) {
    this._config = config;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const config = { ...this._config, ...ev.detail.value };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true
    }));
  }

  // FIX: styles moved out of render() into static styles
  static styles = css`
    .editor-tabs { display: flex; gap: 5px; margin-bottom: 10px; flex-wrap: wrap; }
    .editor-tabs button {
      flex: 1; padding: 8px; cursor: pointer;
      background: #222; color: #fff;
      border: 1px solid #444; border-radius: 4px;
      font-size: 11px; letter-spacing: 1px;
    }
    .editor-tabs button.active { background: #00f9f9; color: #000; font-weight: bold; }
  `;

  render() {
    if (!this.hass || !this._config) return html``;
    const schemas = SpaCardEditor._schemas;
    return html`
      <div class="editor-tabs">
        ${Object.keys(schemas).map(t => html`
          <button
            class="${this._selectedTab === t ? 'active' : ''}"
            @click=${() => { this._selectedTab = t; }}>
            ${t.toUpperCase()}
          </button>`)}
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schemas[this._selectedTab]}
        @value-changed=${this._valueChanged}>
      </ha-form>
    `;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);


// ─────────────────────────────────────────────
//  CARD
// ─────────────────────────────────────────────
class SpaCard extends LitElement {
  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  // Provides a default config for the card picker preview
  static getStubConfig() {
    return {
      card_title: "MY SPA",
      blur_amount: 15,
      card_height: "580px"
    };
  }

  static get properties() {
    return { hass: {}, config: {}, _tab: { type: String } };
  }

  constructor() {
    super();
    this._tab = 'home';
  }

  setConfig(config) {
    this.config = config;
  }

  // Tells HA how many grid rows this card should occupy
  getCardSize() {
    const h = parseInt(this.config?.card_height) || 580;
    return Math.ceil(h / 50);
  }

  // FIX: robust existence check — handles null, undefined, unavailable states
  _exists(id) {
    if (!id || !this.hass || !this.hass.states[id]) return false;
    const s = String(this.hass.states[id].state).toLowerCase();
    return !['unavailable', 'unknown', 'none', '--', ''].includes(s);
  }

  // FIX: existence guard + min/max clamping for input_number entities
  _changeTemp(offset) {
    const id = this.config.entity_target_temp;
    if (!this._exists(id)) return;

    const current = parseFloat(this.hass.states[id].state);
    if (isNaN(current)) return;

    let val = Math.round((current + offset) * 2) / 2;

    // Clamp to configured or attribute-based limits
    const minLimit = this.config.target_temp_min
      ?? this.hass.states[id].attributes?.min
      ?? 10;
    const maxLimit = this.config.target_temp_max
      ?? this.hass.states[id].attributes?.max
      ?? 45;
    val = Math.min(maxLimit, Math.max(minLimit, val));

    const domain = id.split('.')[0];
    if (domain === 'climate') {
      this.hass.callService("climate", "set_temperature", {
        entity_id: id,
        temperature: val
      });
    } else {
      this.hass.callService("input_number", "set_value", {
        entity_id: id,
        value: val
      });
    }
  }

  // ── Home tab ──────────────────────────────
  _renderHome() {
    const c = this.config;
    return html`
      <div class="home-view">
        <div class="flex-row-center">

          <div class="side-col">
            ${this._exists(c.entity_ext_temp) ? html`
              <div class="side-info">
                <div class="val-big">${this.hass.states[c.entity_ext_temp].state}°</div>
                <div class="label-tiny">EXTÉRIEUR</div>
              </div>` : ''}
            ${this._exists(c.entity_ext_hum) ? html`
              <div class="hum-pill">${this.hass.states[c.entity_ext_hum].state}% HR</div>` : ''}
          </div>

          <div class="gauge-container">
            ${this._exists(c.entity_target_temp) ? html`
              <div class="temp-btn" role="button" aria-label="Augmenter la consigne"
                   @click=${() => this._changeTemp(0.5)}>
                <ha-icon icon="mdi:chevron-up"></ha-icon>
              </div>` : ''}
            <div class="center-gauge">
              <div class="outer-ring"></div>
              <div class="inner-circle">
                ${this._exists(c.entity_water_temp) ? html`
                  <span class="water-label">EAU</span>
                  <span class="water-val">${this.hass.states[c.entity_water_temp].state}°</span>` : ''}
                ${this._exists(c.entity_target_temp) ? html`
                  <div class="target-box">
                    CIBLE ${this.hass.states[c.entity_target_temp].state}°
                  </div>` : ''}
              </div>
            </div>
            ${this._exists(c.entity_target_temp) ? html`
              <div class="temp-btn" role="button" aria-label="Diminuer la consigne"
                   @click=${() => this._changeTemp(-0.5)}>
                <ha-icon icon="mdi:chevron-down"></ha-icon>
              </div>` : ''}
          </div>

          <div class="side-col">
            ${this._exists(c.entity_spa_air_temp) ? html`
              <div class="side-info">
                <div class="val-big">${this.hass.states[c.entity_spa_air_temp].state}°</div>
                <div class="label-tiny">AIR SPA</div>
              </div>` : ''}
            ${this._exists(c.entity_spa_hum) ? html`
              <div class="hum-pill">${this.hass.states[c.entity_spa_hum].state}% HR</div>` : ''}
          </div>

        </div>

        ${this._exists(c.main_cons_entity) ? html`
          <div class="energy-footer">
            <ha-icon icon="mdi:lightning-bolt" class="anim-pulse"></ha-icon>
            <span>
              ${this.hass.states[c.main_cons_entity].state}
              ${this.hass.states[c.main_cons_entity].attributes?.unit_of_measurement ?? ''}
            </span>
          </div>` : ''}
      </div>`;
  }

  // ── Chemistry tab ─────────────────────────
  _renderChem() {
    const c = this.config;
    const sensors = [
      { id: c.entity_ph,   n: 'pH',  i: 'mdi:flask',   min: c.ph_min,   max: c.ph_max,   u: '' },
      { id: c.entity_orp,  n: 'ORP', i: 'mdi:bolt',    min: c.orp_min,  max: c.orp_max,  u: 'mV' },
      { id: c.entity_tds,  n: 'TDS', i: 'mdi:water',   min: c.tds_min,  max: c.tds_max,  u: 'ppm' },
      { id: c.entity_salt, n: 'SEL', i: 'mdi:shaker',  min: c.salt_min, max: c.salt_max, u: 'ppm' }
    ].filter(s => this._exists(s.id));

    return html`
      <div class="chem-grid">
        ${sensors.map(s => {
          const val = parseFloat(this.hass.states[s.id].state);
          const hasRange = s.min !== undefined && s.max !== undefined;
          const isOutOfRange = (s.min !== undefined && val < s.min)
                            || (s.max !== undefined && val > s.max);

          // Progress bar: percentage within [min, max]
          let pct = 50;
          if (hasRange && s.max > s.min) {
            pct = Math.min(100, Math.max(0, ((val - s.min) / (s.max - s.min)) * 100));
          }

          return html`
            <div class="glass-card ${isOutOfRange ? 'warning-border' : ''}">
              <div class="g-header">
                <ha-icon icon="${s.i}"></ha-icon> ${s.n}
                ${isOutOfRange ? html`<ha-icon icon="mdi:alert" class="warn-icon"></ha-icon>` : ''}
              </div>
              <div class="g-main">${val}<small>${s.u}</small></div>
              ${hasRange ? html`
                <div class="g-progress-track">
                  <div class="g-progress-fill ${isOutOfRange ? 'warn' : ''}"
                       style="width: ${pct}%"></div>
                </div>` : ''}
              <div class="g-footer">
                <span class="g-min">min ${s.min ?? '--'}</span>
                <span class="g-max">max ${s.max ?? '--'}</span>
              </div>
            </div>`;
        })}
      </div>`;
  }

  // ── Switches tab ──────────────────────────
  _renderSwitches() {
    const c = this.config;
    const sws = Array.from({ length: 10 }, (_, i) => ({
      id: c[`switch_${i + 1}`],
      n: c[`name_switch_${i + 1}`]
    })).filter(s => this._exists(s.id));

    return html`
      <div class="sw-grid">
        ${sws.map(s => {
          const isOn = this.hass.states[s.id].state === 'on';
          return html`
            <div
              class="sw-card ${isOn ? 'active' : ''}"
              role="button"
              aria-label="${s.n || 'Bouton'} — ${isOn ? 'allumé' : 'éteint'}"
              @click=${() => this.hass.callService("homeassistant", "toggle", { entity_id: s.id })}>
              <ha-icon icon="${isOn ? 'mdi:power' : 'mdi:power-off'}"></ha-icon>
              <span>${s.n || 'Bouton'}</span>
            </div>`;
        })}
      </div>`;
  }

  // ── Camera tab ────────────────────────────
  _renderCamera() {
    const c = this.config;
    const w   = c.cam_w_px   || 300;
    const h   = c.cam_h_px   || 200;
    const rad = c.cam_radius  || 20;
    const posX = c.cam_x     || 0;
    const posY = c.cam_y     || 0;

    return html`
      <div class="cam-container"
           style="transform: translate(${posX}px, ${posY}px);">
        <div class="cam-crop"
             style="width:${w}px; height:${h}px; border-radius:${rad}px;">
          ${this._exists(c.entity_camera) ? html`
            <hui-image
              .hass=${this.hass}
              .cameraImage=${c.entity_camera}
              cameraView="live">
            </hui-image>` : html`
            <div class="cam-unavailable">
              <ha-icon icon="mdi:camera-off"></ha-icon>
              <span>Caméra indisponible</span>
            </div>`}
        </div>
      </div>`;
  }

  // ── Tab dispatcher ─────────────────────────
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
    const c = this.config;
    const blur = c.blur_amount !== undefined ? c.blur_amount : 15;

    // Build the navigation based on available entities
    const nav = [{ id: 'home', i: 'mdi:home-variant', label: 'Accueil' }];
    if (this._exists(c.entity_camera))
      nav.push({ id: 'cam',  i: 'mdi:camera',           label: 'Caméra' });
    if ([c.entity_ph, c.entity_orp, c.entity_tds, c.entity_salt].some(id => this._exists(id)))
      nav.push({ id: 'chem', i: 'mdi:flask-round-bottom', label: 'Chimie' });
    if (Array.from({ length: 10 }, (_, i) => c[`switch_${i + 1}`]).some(id => this._exists(id)))
      nav.push({ id: 'sw',   i: 'mdi:tune-vertical',    label: 'Équipements' });

    // FIX: reset tab to 'home' if current tab is no longer in the nav
    if (!nav.find(n => n.id === this._tab)) {
      this._tab = 'home';
    }

    return html`
      <ha-card style="height: ${c.card_height || '580px'};">
        <div class="bg"
             style="background-image: url('${c.background_image || '/local/sparond2.png'}');">
          <div class="overlay"
               style="backdrop-filter: blur(${blur}px); -webkit-backdrop-filter: blur(${blur}px);">
            <div class="header">${c.card_title || 'MY SPA'}</div>
            <div class="main-content">${this._renderTab()}</div>
            ${nav.length > 1 ? html`
              <nav class="nav" aria-label="Navigation">
                ${nav.map(n => html`
                  <ha-icon
                    class="${this._tab === n.id ? 'active' : ''}"
                    icon="${n.i}"
                    title="${n.label}"
                    role="button"
                    aria-label="${n.label}"
                    aria-current="${this._tab === n.id ? 'page' : 'false'}"
                    @click=${() => { this._tab = n.id; }}>
                  </ha-icon>`)}
              </nav>` : ''}
          </div>
        </div>
      </ha-card>`;
  }

  static styles = css`
    :host { --accent: #00f9f9; --glass: rgba(255,255,255,0.08); --warn: #ff9800; }

    ha-card {
      border-radius: 30px; overflow: hidden;
      background: #000; color: #fff; border: none;
    }
    .bg { background-size: cover; background-position: center; height: 100%; width: 100%; }
    .overlay {
      height: 100%;
      background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%);
      display: flex; flex-direction: column;
      padding: 20px; box-sizing: border-box;
    }
    .header {
      text-align: center; opacity: 0.4;
      font-size: 10px; letter-spacing: 3px; margin-bottom: 5px;
    }
    .main-content {
      flex: 1; display: flex;
      align-items: center; justify-content: center;
      overflow: hidden; position: relative;
    }

    /* ── Home ── */
    .home-view {
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .flex-row-center {
      display: flex; align-items: center;
      justify-content: center; width: 100%; gap: 10px;
    }
    .side-col {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; min-width: 70px;
    }
    /* FIX: .side-info was missing from CSS */
    .side-info {
      display: flex; flex-direction: column;
      align-items: center; gap: 2px;
    }
    .val-big { font-size: 24px; font-weight: 200; }
    .label-tiny { font-size: 7px; opacity: 0.3; text-align: center; letter-spacing: 1px; }
    .hum-pill {
      font-size: 8px; color: var(--accent);
      background: var(--glass); padding: 2px 6px;
      border-radius: 5px; margin-top: 4px;
    }

    .gauge-container {
      flex: 0 0 180px; display: flex;
      flex-direction: column; align-items: center; gap: 10px;
    }
    .center-gauge {
      position: relative; width: 180px; height: 180px;
      display: flex; align-items: center; justify-content: center;
    }
    .outer-ring {
      position: absolute; width: 100%; height: 100%;
      border-radius: 50%;
      border: 1px solid rgba(0,249,249,0.1);
      border-top: 2px solid var(--accent);
      animation: rotate 8s linear infinite;
    }
    .inner-circle {
      width: 150px; height: 150px;
      background: rgba(255,255,255,0.03);
      border-radius: 50%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .water-val { font-size: 50px; font-weight: 100; color: var(--accent); line-height: 1; }
    .water-label { font-size: 8px; opacity: 0.3; letter-spacing: 2px; }
    .target-box {
      margin-top: 5px; background: var(--glass);
      padding: 2px 8px; border-radius: 10px;
      font-size: 10px; opacity: 0.7;
    }
    .temp-btn {
      width: 38px; height: 38px; border-radius: 50%;
      background: var(--glass);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: 1px solid rgba(255,255,255,0.1);
      transition: background 0.2s, border-color 0.2s;
    }
    .temp-btn:hover { background: rgba(0,249,249,0.15); border-color: var(--accent); }
    .temp-btn:active { transform: scale(0.92); }

    .energy-footer {
      margin-top: 25px; background: var(--glass);
      padding: 5px 15px; border-radius: 20px;
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; border: 1px solid rgba(255,255,255,0.05);
    }

    /* ── Chemistry ── */
    .chem-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 12px; width: 100%; padding: 10px;
    }
    .glass-card {
      background: var(--glass); padding: 12px 10px;
      border-radius: 20px; text-align: center;
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 0.3s, background 0.3s;
    }
    .warning-border {
      border-color: var(--warn) !important;
      background: rgba(255,152,0,0.12) !important;
    }
    .g-header {
      font-size: 10px; opacity: 0.6; margin-bottom: 5px;
      display: flex; align-items: center; justify-content: center; gap: 4px;
    }
    .warn-icon { color: var(--warn); --mdc-icon-size: 14px; }
    .g-main { font-size: 24px; color: var(--accent); font-weight: 200; }
    .g-main small { font-size: 10px; margin-left: 2px; opacity: 0.8; }

    /* Progress bar for chemistry values */
    .g-progress-track {
      height: 3px; background: rgba(255,255,255,0.1);
      border-radius: 2px; margin: 8px 4px 4px;
      overflow: hidden;
    }
    .g-progress-fill {
      height: 100%; background: var(--accent);
      border-radius: 2px; transition: width 0.6s ease;
    }
    .g-progress-fill.warn { background: var(--warn); }

    .g-footer {
      display: flex; justify-content: space-between;
      margin-top: 6px; padding-top: 5px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .g-min, .g-max { font-size: 8px; opacity: 0.4; text-transform: uppercase; }

    /* ── Switches ── */
    .sw-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 12px; width: 100%;
    }
    /* FIX: added flex column so icon and label stack properly */
    .sw-card {
      background: var(--glass); padding: 15px 10px;
      border-radius: 20px; text-align: center;
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 0.3s, background 0.3s, transform 0.15s;
      cursor: pointer;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 6px;
      font-size: 10px;
    }
    .sw-card:hover  { background: rgba(255,255,255,0.12); }
    .sw-card:active { transform: scale(0.95); }
    .sw-card.active {
      border-color: var(--accent);
      background: rgba(0,249,249,0.1);
      color: var(--accent);
    }
    .sw-card ha-icon { --mdc-icon-size: 22px; }

    /* ── Camera ── */
    .cam-container { display: flex; align-items: center; justify-content: center; }
    .cam-crop {
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.2);
      background: #000; position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .cam-crop hui-image { width: 100%; height: 100%; object-fit: cover; }
    .cam-unavailable {
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px; opacity: 0.4; font-size: 11px;
    }

    /* ── Nav ── */
    .nav {
      display: flex; justify-content: space-around;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .nav ha-icon {
      opacity: 0.3; cursor: pointer;
      --mdc-icon-size: 24px;
      transition: opacity 0.2s, color 0.2s;
    }
    .nav ha-icon:hover  { opacity: 0.7; }
    .nav ha-icon.active { opacity: 1; color: var(--accent); }

    /* ── Animations ── */
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .anim-pulse { animation: pulse 2s infinite; color: var(--accent); }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }
  `;
}

customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "Spa Master V31.0",
  description: "Carte de supervision spa : températures, chimie, caméra, équipements.",
  preview: true
});
