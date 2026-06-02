import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = config;
  }

render() {
    if (!this.hass) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${[
          { name: "card_title", label: "Titre de la carte", selector: { text: {} } },
          { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_target_temp", label: "Contrôle Temp (Climate)", selector: { entity: { domain: "climate" } } },
          { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_camera", label: "Caméra Spa", selector: { entity: { domain: "camera" } } },
          // Ajoutez ici les autres lignes selon le même modèle
        ]}
        @value-changed=${this._val}
      ></ha-form>
    `;
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
  
  _changed(ev) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true
    }));
  }
}
customElements.define("spa-card-editor", SpaCardEditor);
