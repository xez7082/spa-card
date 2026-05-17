import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V32  (onglets icônes + accordéons)
// ═══════════════════════════════════════════════════════════════════
class SpaCardEditor extends LitElement {

  static get properties() {
    return {
      hass:    {},
      _config: {},
      _tab:    { type: String },
      _open:   {}
    };
  }

  constructor() {
    super();
    this._tab  = 'gen';
    // Accordéons ouverts par défaut
    this._open = new Set(['a-disp', 'a-temps', 'a-ph', 'a-cdim']);
  }

  setConfig(config) { this._config = { ...config }; }

  // ── Propagation des changements vers HA ──
  _val(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true
    }));
  }

  // ── Toggle accordéon ──
  _tog(id) {
    const o = new Set(this._open);
    o.has(id) ? o.delete(id) : o.add(id);
    this._open = o;
  }

  // ── Composant accordéon réutilisable ──
  _acc(id, boxStyle, icon, title, schema) {
    const open = this._open.has(id);
    return html`
      <div class="acc ${open ? 'open' : ''}">
        <div class="ach" @click=${() => this._tog(id)}>
          <div class="aibox" style="${boxStyle}">${icon}</div>
          <span class="ach-title">${title}</span>
          <ha-icon class="arr" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="acb">
          <div class="acbi">
            <ha-form
              .hass=${this.hass}
              .data=${this._config}
              .schema=${schema}
              @value-changed=${this._val}>
            </ha-form>
          </div>
        </div>
      </div>`;
  }

  // ── Contenu par onglet ──

  _renderGen() {
    return html`
      ${this._acc('a-disp',
        'background:rgba(107,142,255,.18);color:#6b8eff;',
        'GEN', 'Apparence générale',
        [
          { name: 'card_title',       label: 'Titre du spa',                selector: { text: {} } },
          { name: 'background_image', label: 'Image de fond (URL)',          selector: { text: {} } },
          { name: 'card_height',      label: 'Hauteur totale  (ex : 580px)', selector: { text: {} } },
          { name: 'blur_amount',      label: 'Intensité du flou (0 – 25 px)',
            selector: { number: { mode: 'slider', min: 0, max: 25 } } }
        ]
      )}`;
  }

  _renderSens() {
    return html`
      ${this._acc('a-temps',
        'background:rgba(52,211,153,.15);color:#10b981;',
        'T°', 'Températures',
        [
          { name: 'entity_water_temp',   label: 'Temp. eau (actuelle)',     selector: { entity: { domain: 'sensor' } } },
          { name: 'entity_target_temp',  label: 'Entité consigne',          selector: { entity: {} } },
          { name: 'target_temp_min',     label: 'Consigne min (°C)',         selector: { number: { mode: 'box', step: 0.5 } } },
          { name: 'target_temp_max',     label: 'Consigne max (°C)',         selector: { number: { mode: 'box', step: 0.5 } } },
          { name: 'entity_ext_temp',     label: 'Temp. extérieure',          selector: { entity: { domain: 'sensor' } } },
          { name: 'entity_spa_air_temp', label: 'Temp. air spa',             selector: { entity: { domain: 'sensor' } } }
        ]
      )}
      ${this._acc('a-hum',
        'background:rgba(52,211,153,.15);color:#10b981;',
        '~', 'Humidité & Énergie',
        [
          { name: 'entity_ext_hum',   label: 'Humidité extérieure',    selector: { entity: { domain: 'sensor' } } },
          { name: 'entity_spa_hum',   label: 'Humidité spa',            selector: { entity: { domain: 'sensor' } } },
          { name: 'main_cons_entity', label: 'Sonde conso électrique', selector: { entity: {} } }
        ]
      )}
      ${this._acc('a-flood',
        'background:rgba(56,189,248,.15);color:#0ea5e9;',
        '💧', 'Capteur d\'inondation',
        [
          { name: 'entity_water_leak', label: 'Détecteur fuite eau',    selector: { entity: { domain: 'binary_sensor' } } },
          { name: 'entity_tamper',     label: 'Alerte sabotage',        selector: { entity: { domain: 'binary_sensor' } } },
          { name: 'entity_flood_bat',  label: 'Batterie capteur (%)',   selector: { entity: { domain: 'sensor' } } }
        ]
      )}`;
  }

  _renderChem() {
    return html`
      ${this._acc('a-ph',
        'background:rgba(167,139,250,.15);color:#8b5cf6;',
        'pH', 'pH',
        [
          { name: 'entity_ph', label: 'Entité pH',  selector: { entity: { domain: 'sensor' } } },
          { name: 'ph_min',    label: 'pH Minimum', selector: { number: { step: 0.1, mode: 'box' } } },
          { name: 'ph_max',    label: 'pH Maximum', selector: { number: { step: 0.1, mode: 'box' } } }
        ]
      )}
      ${this._acc('a-orp',
        'background:rgba(167,139,250,.15);color:#8b5cf6;',
        'ORP', 'ORP (mV)',
        [
          { name: 'entity_orp', label: 'Entité ORP',  selector: { entity: { domain: 'sensor' } } },
          { name: 'orp_min',    label: 'ORP Minimum', selector: { number: { mode: 'box' } } },
          { name: 'orp_max',    label: 'ORP Maximum', selector: { number: { mode: 'box' } } }
        ]
      )}
      ${this._acc('a-tds',
        'background:rgba(167,139,250,.15);color:#8b5cf6;',
        'TDS', 'TDS (ppm)',
        [
          { name: 'entity_tds', label: 'Entité TDS',  selector: { entity: { domain: 'sensor' } } },
          { name: 'tds_min',    label: 'TDS Minimum', selector: { number: { mode: 'box' } } },
          { name: 'tds_max',    label: 'TDS Maximum', selector: { number: { mode: 'box' } } }
        ]
      )}
      ${this._acc('a-salt',
        'background:rgba(167,139,250,.15);color:#8b5cf6;',
        'SEL', 'Sel (ppm)',
        [
          { name: 'entity_salt', label: 'Entité sel',  selector: { entity: { domain: 'sensor' } } },
          { name: 'salt_min',    label: 'Sel Minimum', selector: { number: { mode: 'box' } } },
          { name: 'salt_max',    label: 'Sel Maximum', selector: { number: { mode: 'box' } } }
        ]
      )}`;
  }

  _renderCam() {
    return html`
      ${this._acc('a-cdim',
        'background:rgba(56,189,248,.15);color:#0ea5e9;',
        'CAM', 'Caméra & dimensions',
        [
          { name: 'entity_camera', label: 'Entité caméra',         selector: { entity: { domain: 'camera' } } },
          { name: 'cam_w_px',      label: 'Largeur cadre (px)',     selector: { number: { mode: 'box', min: 10, max: 1000 } } },
          { name: 'cam_h_px',      label: 'Hauteur cadre (px)',     selector: { number: { mode: 'box', min: 10, max: 1000 } } },
          { name: 'cam_radius',    label: 'Arrondi des coins (px)', selector: { number: { mode: 'slider', min: 0, max: 50 } } }
        ]
      )}
      ${this._acc('a-cpos',
        'background:rgba(56,189,248,.15);color:#0ea5e9;',
        'XY', 'Position',
        [
          { name: 'cam_x', label: 'Décalage horizontal X (px)', selector: { number: { mode: 'box', min: -500, max: 500 } } },
          { name: 'cam_y', label: 'Décalage vertical Y (px)',   selector: { number: { mode: 'box', min: -500, max: 500 } } }
        ]
      )}`;
  }

  _renderSw() {
    const schema = Array.from({ length: 10 }, (_, i) => [
      { name: `switch_${i + 1}`,      label: `Entité bouton ${i + 1}`, selector: { entity: {} } },
      { name: `name_switch_${i + 1}`, label: `Nom bouton ${i + 1}`,    selector: { text: {} } }
    ]).flat();
    return html`
      ${this._acc('a-sw',
        'background:rgba(251,146,60,.15);color:#f97316;',
        'SW', '10 interrupteurs configurables',
        schema
      )}`;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const TABS = [
      { id: 'gen',  s: 'background:rgba(107,142,255,.18);color:#6b8eff;', i: 'GEN', l: 'Général'  },
      { id: 'sens', s: 'background:rgba(52,211,153,.15);color:#10b981;',  i: 'T°',  l: 'Capteurs' },
      { id: 'chem', s: 'background:rgba(167,139,250,.15);color:#8b5cf6;', i: 'pH',  l: 'Chimie'   },
      { id: 'cam',  s: 'background:rgba(56,189,248,.15);color:#0ea5e9;',  i: 'CAM', l: 'Caméra'   },
      { id: 'sw',   s: 'background:rgba(251,146,60,.15);color:#f97316;',  i: 'SW',  l: 'Switches' }
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
        <!-- Barre d'onglets avec icônes -->
        <div class="tabs">
          ${TABS.map(t => html`
            <button
              class="tab ${this._tab === t.id ? 'on' : ''}"
              @click=${() => { this._tab = t.id; }}>
              <div class="tbox" style="${t.s}">${t.i}</div>
              <span class="tlbl">${t.l}</span>
            </button>`)}
        </div>

        <!-- Sections accordéon -->
        <div class="sections">
          ${content[this._tab]}
        </div>
      </div>`;
  }

  static styles = css`
    :host { display: block; }

    /* ── Barre d'onglets ── */
    .tabs {
      display: flex;
      gap: 3px;
      background: var(--secondary-background-color, rgba(0,0,0,.05));
      border-radius: 14px;
      padding: 5px;
      margin-bottom: 12px;
    }
    .tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 5px 2px 7px;
      cursor: pointer;
      border: none;
      background: transparent;
      border-radius: 9px;
      transition: background .18s;
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
    }
    .tab:hover  { background: rgba(0,0,0,.04); }
    .tab.on     { background: var(--card-background-color, #fff); box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .tbox {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: -.3px;
      transition: .18s;
    }
    .tlbl {
      font-size: 10px;
      color: var(--secondary-text-color, #888);
      letter-spacing: .2px;
      transition: color .18s;
      white-space: nowrap;
    }
    .tab.on .tlbl {
      color: var(--primary-text-color, #212121);
      font-weight: 500;
    }

    /* ── Accordéon ── */
    .sections { display: flex; flex-direction: column; }

    .acc {
      border: 1px solid var(--divider-color, rgba(0,0,0,.12));
      border-radius: 12px;
      margin-bottom: 8px;
      overflow: hidden;
    }
    .ach {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 13px;
      cursor: pointer;
      background: var(--secondary-background-color, rgba(0,0,0,.03));
      transition: background .15s;
      user-select: none;
    }
    .ach:hover { background: rgba(0,0,0,.06); }

    .aibox {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
      letter-spacing: -.3px;
    }
    .ach-title {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text-color, #212121);
    }

    /* Flèche animée */
    .arr {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color, #aaa);
      transition: transform .28s cubic-bezier(.4,0,.2,1);
    }
    .acc.open .arr { transform: rotate(180deg); }

    /* Animation hauteur via CSS grid trick */
    .acb {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows .3s cubic-bezier(.4,0,.2,1);
    }
    .acc.open .acb { grid-template-rows: 1fr; }

    .acb > div { overflow: hidden; }
    .acbi { padding: 6px 6px 14px; }

    /* ha-form hérite naturellement des styles HA, pas besoin de surcharge */
  `;
}
customElements.define('spa-card-editor', SpaCardEditor);


// ═══════════════════════════════════════════════════════════════════
//  CARTE  —  V32
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {

  static getConfigElement() { return document.createElement('spa-card-editor'); }

  static getStubConfig() {
    return {
      card_title:  'MY SPA',
      blur_amount: 15,
      card_height: '580px',
      // Valeurs recommandées — spa 4 personnes / 500 L
      ph_min:   7.2,  ph_max:   7.6,
      orp_min:  650,  orp_max:  800,
      tds_min:  500,  tds_max:  1500,
      salt_min: 2500, salt_max: 3500,
      target_temp_min: 25, target_temp_max: 40
    };
  }

  static get properties() {
    return { hass: {}, config: {}, _tab: { type: String } };
  }

  constructor() { super(); this._tab = 'home'; }

  setConfig(config) { this.config = config; }

  getCardSize() {
    return Math.ceil((parseInt(this.config?.card_height) || 580) / 50);
  }

  // Vérifie qu'une entité HA existe et a un état valide
  _exists(id) {
    if (!id || !this.hass?.states[id]) return false;
    return !['unavailable', 'unknown', 'none', '--', ''].includes(
      String(this.hass.states[id].state).toLowerCase()
    );
  }

  // Modifie la consigne de température (+0.5 / -0.5) avec clamping
  _changeTemp(offset) {
    const id = this.config.entity_target_temp;
    if (!this._exists(id)) return;
    const current = parseFloat(this.hass.states[id].state);
    if (isNaN(current)) return;

    // FIX: Number() pour éviter les strings venant de ha-form
    const mn = Number(this.config.target_temp_min ?? this.hass.states[id].attributes?.min ?? 10);
    const mx = Number(this.config.target_temp_max ?? this.hass.states[id].attributes?.max ?? 45);
    const val = Math.min(mx, Math.max(mn, Math.round((current + offset) * 2) / 2));

    const domain = id.split('.')[0];
    if (domain === 'climate') {
      this.hass.callService('climate', 'set_temperature', { entity_id: id, temperature: val });
    } else {
      this.hass.callService('input_number', 'set_value', { entity_id: id, value: val });
    }
  }

  // ── Onglet Accueil ──────────────────────────────────────────────
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
              <div class="temp-btn"
                   role="button" aria-label="Augmenter la consigne"
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
              <div class="temp-btn"
                   role="button" aria-label="Diminuer la consigne"
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

        ${this._renderFlood()}
      </div>`;
  }

  // ── Capteur inondation (affiché sur l'accueil) ─────────────────
  _renderFlood() {
    const c = this.config;
    const leakId   = c.entity_water_leak;
    const tamperId = c.entity_tamper;
    const batId    = c.entity_flood_bat;
    const hasAny   = this._exists(leakId) || this._exists(tamperId) || this._exists(batId);
    if (!hasAny) return html``;

    // États
    const leak   = this._exists(leakId)   ? this.hass.states[leakId].state   === 'on' : false;
    const tamper = this._exists(tamperId)  ? this.hass.states[tamperId].state === 'on' : false;
    const bat    = this._exists(batId)     ? parseFloat(this.hass.states[batId].state) : null;

    const alerting = leak || tamper;

    // Icône batterie selon niveau
    const batIcon = bat === null ? 'mdi:battery-unknown'
      : bat >= 90 ? 'mdi:battery'
      : bat >= 70 ? 'mdi:battery-80'
      : bat >= 50 ? 'mdi:battery-60'
      : bat >= 30 ? 'mdi:battery-40'
      : bat >= 15 ? 'mdi:battery-20'
      : 'mdi:battery-alert';
    const batLow = bat !== null && bat < 20;

    return html`
      <div class="flood-bar ${alerting ? 'flood-alert' : 'flood-ok'}">
        <div class="flood-left">
          <ha-icon
            icon="${leak ? 'mdi:water-alert' : 'mdi:water-check'}"
            class="flood-icon ${leak ? 'flood-icon-alert' : ''}">
          </ha-icon>
          <span class="flood-label">${leak ? 'FUITE DÉTECTÉE !' : 'Pas de fuite'}</span>
        </div>
        <div class="flood-right">
          ${this._exists(tamperId) ? html`
            <ha-icon
              icon="${tamper ? 'mdi:shield-alert' : 'mdi:shield-check'}"
              class="flood-pill ${tamper ? 'pill-warn' : 'pill-ok'}"
              title="${tamper ? 'Sabotage !' : 'Intégrité OK'}">
            </ha-icon>` : ''}
          ${bat !== null ? html`
            <div class="flood-pill ${batLow ? 'pill-warn' : 'pill-ok'}">
              <ha-icon icon="${batIcon}"></ha-icon>
              <span>${Math.round(bat)}%</span>
            </div>` : ''}
        </div>
      </div>`;
  }

  // ── Onglet Chimie — jauges horizontales ────────────────────────
  _renderChem() {
    const c = this.config;
    const n = v => (v !== undefined && v !== null && v !== '') ? Number(v) : undefined;

    const DISPLAY = {
      ph:   { lo: 6.0,  hi: 9.0,  dec: 1 },
      orp:  { lo: -200, hi: 1000, dec: 0 },
      tds:  { lo: 0,    hi: 3000, dec: 0 },
      salt: { lo: 0,    hi: 6000, dec: 0 }
    };

    const sensors = [
      { id: c.entity_ph,   key: 'ph',   label: 'pH',  icon: 'mdi:flask',         min: n(c.ph_min),   max: n(c.ph_max),   u: ''    },
      { id: c.entity_orp,  key: 'orp',  label: 'ORP', icon: 'mdi:lightning-bolt', min: n(c.orp_min),  max: n(c.orp_max),  u: 'mV'  },
      { id: c.entity_tds,  key: 'tds',  label: 'TDS', icon: 'mdi:water-percent',  min: n(c.tds_min),  max: n(c.tds_max),  u: 'ppm' },
      { id: c.entity_salt, key: 'salt', label: 'SEL', icon: 'mdi:shaker-outline', min: n(c.salt_min), max: n(c.salt_max), u: 'ppm' }
    ].filter(s => this._exists(s.id));

    return html`
      <div class="chem-list">
        ${sensors.map(s => this._chemGauge(s, DISPLAY[s.key]))}
      </div>`;
  }

  _chemGauge(s, d) {
    const val     = parseFloat(this.hass.states[s.id].state);
    const hasR    = s.min !== undefined && s.max !== undefined && !isNaN(s.min) && !isNaN(s.max);
    const tooLow  = hasR && val < s.min;
    const tooHigh = hasR && val > s.max;
    const oor     = tooLow || tooHigh;
    const toPos   = v => Math.min(100, Math.max(0, (v - d.lo) / (d.hi - d.lo) * 100));
    const cp      = toPos(val);
    const mnP     = hasR ? toPos(s.min) : 20;
    const mxP     = hasR ? toPos(s.max) : 80;
    const cc      = oor ? '#ff9800' : '#00f9f9';
    const slabel  = tooLow ? 'TROP BAS' : tooHigh ? 'TROP HAUT' : 'OK';

    return html`
      <div class="cg-row ${oor ? 'cg-oor' : ''}">
        <div class="cg-top">
          <div class="cg-left">
            <ha-icon class="cg-icon ${oor ? 'cg-icon-warn' : ''}" icon="${s.icon}"></ha-icon>
            <span class="cg-label">${s.label}</span>
          </div>
          <div class="cg-val">${val.toFixed(d.dec)}<span class="cg-unit">${s.u}</span></div>
          <div class="cg-status ${oor ? 'cs-warn' : 'cs-ok'}">${slabel}</div>
        </div>
        <div class="cg-track-wrap">
          <div class="cg-track">
            <div class="cg-zone cg-danger" style="left:0%;width:${mnP}%"></div>
            <div class="cg-zone cg-ok"     style="left:${mnP}%;width:${mxP - mnP}%"></div>
            <div class="cg-zone cg-danger" style="left:${mxP}%;width:${100 - mxP}%"></div>
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

  // ── Onglet Interrupteurs ────────────────────────────────────────
  _renderSwitches() {
    const c   = this.config;
    const sws = Array.from({ length: 10 }, (_, i) => ({
      id: c[`switch_${i + 1}`],
      n:  c[`name_switch_${i + 1}`]
    })).filter(s => this._exists(s.id));

    return html`
      <div class="sw-grid">
        ${sws.map(s => {
          const isOn = this.hass.states[s.id].state === 'on';
          return html`
            <div class="sw-card ${isOn ? 'active' : ''}"
                 role="button"
                 aria-label="${s.n || 'Bouton'} — ${isOn ? 'allumé' : 'éteint'}"
                 @click=${() => this.hass.callService('homeassistant', 'toggle', { entity_id: s.id })}>
              <ha-icon icon="${isOn ? 'mdi:power' : 'mdi:power-off'}"></ha-icon>
              <span>${s.n || 'Bouton'}</span>
            </div>`;
        })}
      </div>`;
  }

  // ── Onglet Caméra ───────────────────────────────────────────────
  _renderCamera() {
    const c   = this.config;
    const w   = c.cam_w_px  || 300;
    const h   = c.cam_h_px  || 200;
    const rad = c.cam_radius || 20;
    const px  = c.cam_x     || 0;
    const py  = c.cam_y     || 0;

    return html`
      <div class="cam-container" style="transform:translate(${px}px,${py}px);">
        <div class="cam-crop" style="width:${w}px;height:${h}px;border-radius:${rad}px;">
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

  // ── Routeur d'onglets ───────────────────────────────────────────
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

    // Navigation dynamique selon les entités disponibles
    const nav = [{ id: 'home', i: 'mdi:home-variant',      label: 'Accueil' }];
    if (this._exists(c.entity_camera))
      nav.push({ id: 'cam',  i: 'mdi:camera',              label: 'Caméra' });
    if ([c.entity_ph, c.entity_orp, c.entity_tds, c.entity_salt].some(id => this._exists(id)))
      nav.push({ id: 'chem', i: 'mdi:flask-round-bottom',  label: 'Chimie' });
    if (Array.from({ length: 10 }, (_, i) => c[`switch_${i + 1}`]).some(id => this._exists(id)))
      nav.push({ id: 'sw',   i: 'mdi:tune-vertical',       label: 'Équipements' });

    // Retour à Home si l'onglet actif a disparu
    if (!nav.find(n => n.id === this._tab)) this._tab = 'home';

    return html`
      <ha-card style="height:${c.card_height || '580px'};">
        <div class="bg"
             style="background-image:url('${c.background_image || '/local/sparond2.png'}');">
          <div class="overlay"
               style="backdrop-filter:blur(${blur}px);-webkit-backdrop-filter:blur(${blur}px);">
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

    ha-card { border-radius: 30px; overflow: hidden; background: #000; color: #fff; border: none; }
    .bg     { background-size: cover; background-position: center; height: 100%; width: 100%; }
    .overlay {
      height: 100%;
      background: linear-gradient(180deg, rgba(0,0,0,.2) 0%, rgba(0,0,0,.85) 100%);
      display: flex; flex-direction: column;
      padding: 20px; box-sizing: border-box;
    }
    .header {
      text-align: center; opacity: .4;
      font-size: 10px; letter-spacing: 3px; margin-bottom: 5px;
    }
    .main-content {
      flex: 1; display: flex;
      align-items: center; justify-content: center;
      overflow: hidden; position: relative;
    }

    /* ── Accueil ── */
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
    .side-info { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .val-big   { font-size: 24px; font-weight: 200; }
    .label-tiny{ font-size: 7px; opacity: .3; text-align: center; letter-spacing: 1px; }
    .hum-pill  {
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
      border: 1px solid rgba(0,249,249,.1);
      border-top: 2px solid var(--accent);
      animation: rotate 8s linear infinite;
    }
    .inner-circle {
      width: 150px; height: 150px;
      background: rgba(255,255,255,.03); border-radius: 50%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      border: 1px solid rgba(255,255,255,.05);
    }
    .water-val   { font-size: 50px; font-weight: 100; color: var(--accent); line-height: 1; }
    .water-label { font-size: 8px; opacity: .3; letter-spacing: 2px; }
    .target-box  {
      margin-top: 5px; background: var(--glass);
      padding: 2px 8px; border-radius: 10px;
      font-size: 10px; opacity: .7;
    }
    .temp-btn {
      width: 38px; height: 38px; border-radius: 50%;
      background: var(--glass);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: 1px solid rgba(255,255,255,.1);
      transition: background .2s, border-color .2s;
    }
    .temp-btn:hover  { background: rgba(0,249,249,.15); border-color: var(--accent); }
    .temp-btn:active { transform: scale(.92); }
    .energy-footer {
      margin-top: 25px; background: var(--glass);
      padding: 5px 15px; border-radius: 20px;
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; border: 1px solid rgba(255,255,255,.05);
    }

    /* ── Capteur inondation ── */
    .flood-bar {
      margin-top: 12px; width: 100%;
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 14px; border-radius: 14px; box-sizing: border-box;
      border: 1px solid; transition: all .3s;
    }
    .flood-ok {
      background: rgba(0,249,249,.06);
      border-color: rgba(0,249,249,.2);
    }
    .flood-alert {
      background: rgba(255,50,50,.12);
      border-color: rgba(255,80,80,.6);
      animation: flood-pulse 1.2s ease-in-out infinite;
    }
    @keyframes flood-pulse {
      0%,100% { box-shadow: 0 0 0px rgba(255,50,50,0); }
      50%      { box-shadow: 0 0 12px rgba(255,80,80,.4); }
    }
    .flood-left {
      display: flex; align-items: center; gap: 7px;
    }
    .flood-icon { --mdc-icon-size: 20px; color: var(--accent); }
    .flood-icon-alert { color: #ff4444; animation: pulse 1s infinite; }
    .flood-label { font-size: 11px; font-weight: 500; letter-spacing: .5px; }
    .flood-right {
      display: flex; align-items: center; gap: 6px;
    }
    .flood-pill {
      display: flex; align-items: center; gap: 3px;
      padding: 2px 7px; border-radius: 8px; font-size: 10px;
      --mdc-icon-size: 14px;
    }
    .pill-ok   { background: rgba(0,249,249,.1);  color: var(--accent); }
    .pill-warn { background: rgba(255,152,0,.18); color: #ff9800; }

    /* ── Chimie — jauges horizontales ── */
    .chem-list {
      display: flex; flex-direction: column;
      gap: 10px; width: 100%; padding: 4px 6px;
    }
    .cg-row {
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px;
      padding: 10px 13px 12px;
      transition: border-color .3s, background .3s;
    }
    .cg-row.cg-oor {
      border-color: rgba(255,152,0,.5);
      background: rgba(255,152,0,.07);
    }
    /* Ligne du haut : icône + nom + valeur + badge */
    .cg-top {
      display: flex; align-items: center; gap: 8px; margin-bottom: 9px;
    }
    .cg-left {
      display: flex; align-items: center; gap: 5px; flex: 0 0 64px;
    }
    .cg-icon { --mdc-icon-size: 16px; opacity: .55; }
    .cg-icon-warn { color: var(--warn); opacity: 1; }
    .cg-label { font-size: 11px; font-weight: 500; letter-spacing: .8px; opacity: .7; }
    .cg-val {
      flex: 1; font-size: 22px; font-weight: 200;
      color: var(--accent); line-height: 1; text-align: center;
    }
    .cg-unit { font-size: 9px; opacity: .7; margin-left: 2px; }
    .cg-status {
      font-size: 9px; font-weight: 600; letter-spacing: .8px;
      padding: 3px 8px; border-radius: 8px;
    }
    .cs-ok   { background: rgba(0,249,249,.12); color: #00f9f9; }
    .cs-warn { background: rgba(255,152,0,.18);  color: #ff9800; }

    /* Jauge */
    .cg-track-wrap { position: relative; padding-bottom: 14px; }
    .cg-track {
      position: relative; height: 8px;
      border-radius: 4px; overflow: visible;
      background: rgba(255,255,255,.06);
    }
    /* Zones colorées */
    .cg-zone {
      position: absolute; top: 0; height: 100%;
      border-radius: 0;
    }
    .cg-danger { background: rgba(255,80,80,.25); }
    .cg-ok     { background: rgba(0,249,249,.22); border-radius: 0; }
    /* Arrondir uniquement les extrémités extérieures */
    .cg-zone:first-child { border-radius: 4px 0 0 4px; }
    .cg-zone:last-child  { border-radius: 0 4px 4px 0; }

    /* Séparateurs de zone */
    .cg-sep {
      position: absolute; top: -2px; height: 12px;
      width: 1.5px; background: rgba(255,255,255,.25);
      transform: translateX(-50%);
    }
    /* Curseur (rond + flèche vers le bas) */
    .cg-cursor {
      position: absolute; top: 50%; transform: translate(-50%, -50%);
      width: 13px; height: 13px; border-radius: 50%;
      transition: left .5s cubic-bezier(.4,0,.2,1);
      z-index: 2;
    }
    .cg-needle {
      position: absolute; top: 100%; left: 50%;
      transform: translateX(-50%) translateY(2px);
      width: 0; height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid;
    }
    /* Labels min / max */
    .cg-labs {
      position: relative; height: 14px; margin-top: 3px;
    }
    .cg-lab {
      position: absolute; transform: translateX(-50%);
      font-size: 9px; opacity: .45; white-space: nowrap;
    }

    /* ── Interrupteurs ── */
    .sw-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 12px; width: 100%;
    }
    .sw-card {
      background: var(--glass); padding: 15px 10px;
      border-radius: 20px; text-align: center;
      border: 1px solid rgba(255,255,255,.1);
      transition: border-color .3s, background .3s, transform .15s;
      cursor: pointer;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 6px;
      font-size: 10px;
    }
    .sw-card:hover  { background: rgba(255,255,255,.12); }
    .sw-card:active { transform: scale(.95); }
    .sw-card.active { border-color: var(--accent); background: rgba(0,249,249,.1); color: var(--accent); }
    .sw-card ha-icon { --mdc-icon-size: 22px; }

    /* ── Caméra ── */
    .cam-container { display: flex; align-items: center; justify-content: center; }
    .cam-crop {
      overflow: hidden;
      border: 2px solid rgba(255,255,255,.2);
      background: #000; position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,.5);
    }
    .cam-crop hui-image { width: 100%; height: 100%; object-fit: cover; }
    .cam-unavailable {
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px; opacity: .4; font-size: 11px;
    }

    /* ── Navigation ── */
    .nav {
      display: flex; justify-content: space-around;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,.1);
    }
    .nav ha-icon {
      opacity: .3; cursor: pointer;
      --mdc-icon-size: 24px;
      transition: opacity .2s, color .2s;
    }
    .nav ha-icon:hover  { opacity: .7; }
    .nav ha-icon.active { opacity: 1; color: var(--accent); }

    /* ── Animations ── */
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .anim-pulse { animation: pulse 2s infinite; color: var(--accent); }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: .3; }
    }
  `;
}

customElements.define('spa-card', SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'spa-card',
  name:        'Spa Master V32.3',
  description: 'Supervision spa — températures, chimie, caméra, équipements.',
  preview:     true
});
