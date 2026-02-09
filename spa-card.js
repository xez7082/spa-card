class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }

  setConfig(config) { this.config = config; }

  _getState(id, icon) {
    const s = this.hass?.states?.[id];
    if (!s) return { val: '?', unit: '', icon: icon || 'mdi:help-circle', active: false };

    const raw = parseFloat(s.state);
    const val = isNaN(raw) ? s.state : raw.toFixed(1);
    const unit = s.attributes.unit_of_measurement || '';

    const isPower = /[wa]/i.test(unit);
    const consuming = isPower && raw > 0.5;
    const active = consuming || !['off','unknown','unavailable','standby'].includes(s.state);

    return { val, unit, icon: icon || s.attributes.icon, active, consuming };
  }

  _getChemColor(type, value) {
    const v = parseFloat(value);
    if (isNaN(v)) return '#00f9f9';

    const ranges = {
      ph: [7.2, 7.6],
      br: [3, 5],
      orp: [650, Infinity],
    };

    if (type === 'orp') return v < 650 ? '#ff4d4d' : '#00f9f9';

    const [min, max] = ranges[type] || [];
    return v < min || v > max ? '#ff4d4d' : '#00f9f9';
  }

  /* ---------- RENDER HELPERS ---------- */

  _renderSwitches(c) {
    return Array.from({ length: 8 }).map((_, i) => {
      const e = c[`switch_${i+1}_entity`];
      if (!e) return '';

      const s = this._getState(e);

      return html`
        <div class="sw ${s.active ? 'on' : ''}"
             style="font-size:${c.btn_fs || 10}px;"
             @click=${() => this.hass.callService("homeassistant","toggle",{entity_id:e})}>
          <ha-icon icon="${c[`switch_${i+1}_icon`]}"
                   style="--mdc-icon-size:${(c.btn_fs || 10)*1.8}px"></ha-icon>
          <div>${c[`switch_${i+1}_label`] || `B${i+1}`}</div>
        </div>
      `;
    });
  }

  _renderSystem(c) {
    return Array.from({ length: 14 }).map((_, i) => {
      const id = c[`sys_entity_${i+1}`];
      if (!id) return '';

      const s = this._getState(id, c[`sys_icon_${i+1}`]);

      return html`
        <div class="sys-i" style="font-size:${c.sys_fs || 12}px;">
          <ha-icon icon="${s.icon}"
                   class="${s.consuming ? 'power-on' : (s.active ? 'n' : '')}"
                   style="--mdc-icon-size:${(c.sys_fs || 12)*1.3}px"></ha-icon>
          <span style="${s.consuming ? 'color:#ffcc00;font-weight:bold;' : ''}">
            ${c[`sys_label_${i+1}`] || ''}: ${s.val}${s.unit}
          </span>
        </div>
      `;
    });
  }

  _renderTemps(c) {
    const water = this._getState(c.entity_water_temp);
    const air = this._getState(c.entity_ambient_temp);

    return html`
      <div class="gb"
           style="left:${c.pos_temp_x}%; top:${c.pos_temp_y}%;
                  width:${c.temp_w}px; height:${c.temp_h}px;
                  font-size:${c.temp_fs}px;">
        <div class="bh">TEMPÉRATURES</div>
        <div class="bb">EAU: <span class="n">${water.val}${water.unit}</span></div>
        <div class="bb">AIR: <span>${air.val}${air.unit}</span></div>
      </div>
    `;
  }

  _renderChem(c) {
    const ph = this._getState(c.entity_ph);
    const orp = this._getState(c.entity_orp);
    const br = this._getState(c.entity_bromine);
    const tac = this._getState(c.entity_alkalinity);

    return html`
      <div class="gb"
           style="left:${c.pos_chem_x}%; top:${c.pos_chem_y}%;
                  width:${c.chem_w}px; height:${c.chem_h}px;
                  font-size:${c.chem_fs}px;">
        <div class="bh">CHIMIE</div>
        <div class="bb">pH: <span style="color:${this._getChemColor('ph', ph.val)}">${ph.val}</span></div>
        <div class="bb">ORP: <span style="color:${this._getChemColor('orp', orp.val)}">${orp.val}mV</span></div>
        <div class="bb">Br: <span style="color:${this._getChemColor('br', br.val)}">${br.val}</span></div>
        <div class="bb">TAC: <span class="n">${tac.val}</span></div>
      </div>
    `;
  }

  _renderCamera(c) {
    if (!c.camera_entity) return '';
    return html`
      <div class="gb"
           style="left:${c.pos_cam_x}%; top:${c.pos_cam_y}%;
                  width:${c.camera_width}px; height:${c.camera_height}px; padding:2px;">
        <hui-image .hass=${this.hass} .cameraImage=${c.camera_entity} cameraView="live"></hui-image>
      </div>
    `;
  }

  _renderIdeal(c) {
    if (c.show_ideal_table === false) return '';
    return html`
      <div class="gb"
           style="left:${c.pos_ideal_x}%; top:${c.pos_ideal_y}%;
                  width:${c.ideal_w}px; height:${c.ideal_h}px;
                  font-size:${c.ideal_fs}px;">
        <div class="bh">CIBLES IDÉALES</div>
        ${[
          ['pH','7.2 - 7.6'],
          ['ORP','> 650 mV'],
          ['Brome','3.0 - 5.0'],
          ['TAC','80 - 120'],
        ].map(i => html`<div class="id"><span>${i[0]}</span><span>${i[1]}</span></div>`)}
      </div>
    `;
  }

  /* ---------- MAIN RENDER ---------- */

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    const titlePos =
      c.title_align === 'center' ? 'left:50%;transform:translateX(-50%);' :
      c.title_align === 'right'  ? 'right:20px;' :
      'left:20px;';

    return html`
      <ha-card style="background-image:url('${c.background_image}');
                     height:${c.card_height_v || 80}vh;">
        <div class="t" style="font-size:${c.title_size || 20}px; ${titlePos}">
          ${c.card_title || 'SPA CONTROL'}
        </div>

        <div class="btns-g"
             style="width:${c.btn_w || 98}%;
                    height:${c.btn_h || 60}px;
                    top:${c.btn_y || 15}%;">
          ${this._renderSwitches(c)}
        </div>

        ${this._renderTemps(c)}
        ${this._renderChem(c)}

        <div class="gb"
             style="left:${c.pos_elec_x}%; top:${c.pos_elec_y}%;
                    width:${c.sys_w}px; height:${c.sys_h}px;">
          <div class="bh">SYSTÈME</div>
          <div class="sys-g">${this._renderSystem(c)}</div>
        </div>

        ${this._renderCamera(c)}
        ${this._renderIdeal(c)}
      </ha-card>
    `;
  }
}
