// SPA Card V4 STABLE – V2.2.0 + Drag & Drop + HACS Ready
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCard extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  setConfig(config) {
    this.config = {
      card_title: 'SPA CONTROL',
      btn_fs: 12,
      temp_fs: 16,
      chem_fs: 16,
      sys_fs: 12,
      positions: {},
      ...config
    };
  }

  firstUpdated() {
    this._initDrag();
  }

  updated() {
    this._initDrag();
  }

  _initDrag() {
    const elements = this.renderRoot.querySelectorAll('.draggable');
    elements.forEach(el => {
      el.onpointerdown = (e) => this._startDrag(e, el);
      // restore saved positions
      const pos = this.config.positions[el.dataset.key];
      if(pos){ el.style.transform = `translate(${pos.x}px, ${pos.y}px)`; }
    });
  }

  _startDrag(e, el) {
    e.preventDefault();
    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const move = (ev) => {
      const x = ev.clientX - offsetX;
      const y = ev.clientY - offsetY;
      el.style.transform = `translate(${x}px, ${y}px)`;
      this.config.positions[el.dataset.key] = { x, y };
    };

    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this._saveConfig();
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  _saveConfig() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }, bubbles: true, composed: true
    }));
  }

  _getState(id) {
    const s = this.hass?.states?.[id];
    if (!s) return { val: '?', unit: '', active: false, icon: 'mdi:help-circle' };
    const rawVal = parseFloat(s.state);
    const val = !isNaN(rawVal) ? rawVal.toFixed(1) : s.state;
    const unit = s.attributes.unit_of_measurement || '';
    const active = !['off','unavailable','unknown','standby'].includes(s.state.toLowerCase());
    return { val, unit, icon: s.attributes.icon, active };
  }

  _toggle(entity) {
    this.hass.callService('homeassistant', 'toggle', { entity_id: entity });
  }

  render() {
    if(!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="background-image:url('${c.background_image || ''}'); height:${c.card_height_v || 80}vh;">
        <div class="t" style="font-size:${c.title_size || 20}px; left:20px;">${c.card_title}</div>

        <!-- Buttons -->
        <div class="btns-g draggable" data-key="buttons" style="width:${c.btn_w || 98}%; height:${c.btn_h || 60}px; top:${c.btn_y || 15}%;">
          ${Array.from({length:8}).map((_,i)=>c[`switch_${i+1}_entity`] ? html`
            <div class="sw" style="font-size:${c.btn_fs}px;" @click=${()=>this._toggle(c[`switch_${i+1}_entity`])}>
              <ha-icon icon="${c[`switch_${i+1}_icon`]}"></ha-icon>
              <div>${c[`switch_${i+1}_label`] || 'B'+(i+1)}</div>
            </div>` : '')}
        </div>

        <!-- Temperatures -->
        <div class="gb draggable" data-key="temps" style="left:${c.pos_temp_x}%; top:${c.pos_temp_y}%; width:${c.temp_w}px; height:${c.temp_h}px; font-size:${c.temp_fs}px;">
          <div class="bh">TEMPÉRATURES</div>
          <div>EAU: ${this._getState(c.entity_water_temp).val}${this._getState(c.entity_water_temp).unit}</div>
          <div>AIR: ${this._getState(c.entity_ambient_temp).val}${this._getState(c.entity_ambient_temp).unit}</div>
        </div>

        <!-- Chemistry -->
        <div class="gb draggable" data-key="chem" style="left:${c.pos_chem_x}%; top:${c.pos_chem_y}%; width:${c.chem_w}px; height:${c.chem_h}px; font-size:${c.chem_fs}px;">
          <div class="bh">CHIMIE</div>
          <div>pH: ${this._getState(c.entity_ph).val}</div>
          <div>ORP: ${this._getState(c.entity_orp).val} mV</div>
          <div>Br: ${this._getState(c.entity_bromine).val}</div>
        </div>

        <!-- Camera -->
        ${c.camera_entity ? html`<div class="gb draggable" data-key="camera" style="left:${c.pos_cam_x}%; top:${c.pos_cam_y}%; width:${c.camera_width}px; height:${c.camera_height}px;"><hui-image .hass=${this.hass} .cameraImage=${c.camera_entity} cameraView="live"></hui-image></div>` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { background-size: cover; background-position: center; border-radius: 15px; position: relative; color: #fff; font-family: 'Roboto', sans-serif; }
    .t { position:absolute; top:15px; font-weight:900; color:#00f9f9; }
    .btns-g, .gb { position:absolute; background:rgba(0,0,0,0.75); border:1px solid #00f9f9; border-radius:12px; padding:12px; backdrop-filter:blur(8px); }
    .sw { background:rgba(0,0,0,0.8); border:1px solid #00f9f9; border-radius:8px; text-align:center; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; }
    .sw:hover { box-shadow:0 0 10px #00f9f9; }
    .bh { color:#00f9f9; font-size:11px; font-weight:900; border-bottom:1px solid rgba(0,249,249,0.3); margin-bottom:8px; }
    hui-image { width:100%; height:100%; object-fit:cover; border-radius:6px; }
  `;
}

customElements.define('spa-card', SpaCard);
console.info('SPA-CARD V4 STABLE loaded – drag & drop + HACS ready');
