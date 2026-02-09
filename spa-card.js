// SPA Card V5 – Ultra Design Glassmorphism + Drag & Drop + HACS Ready
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }

  static getConfigElement() { return document.createElement("spa-card-editor"); }

  setConfig(config) {
    this.config = { card_title:'SPA CONTROL', btn_fs:14, temp_fs:18, chem_fs:18, sys_fs:14, positions:{}, ...config };
  }

  firstUpdated() { this._initDrag(); }
  updated() { this._initDrag(); }

  _initDrag() {
    const elements = this.renderRoot.querySelectorAll('.draggable');
    elements.forEach(el => {
      el.onpointerdown = (e) => this._startDrag(e, el);
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

  _saveConfig() { this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this.config},bubbles:true,composed:true})); }

  _getState(id) {
    const s=this.hass?.states?.[id];
    if(!s) return { val:'?', unit:'', active:false, icon:'mdi:help-circle' };
    const raw=parseFloat(s.state);
    const val=!isNaN(raw)?raw.toFixed(1):s.state;
    const unit=s.attributes.unit_of_measurement||'';
    const active=!['off','unavailable','unknown','standby'].includes(s.state.toLowerCase());
    return { val, unit, icon:s.attributes.icon, active };
  }

  _toggle(entity){ this.hass.callService('homeassistant','toggle',{entity_id:entity}); }

  render(){
    if(!this.hass||!this.config) return html``;
    const c=this.config;
    return html`
      <ha-card class="spa-card" style="background-image:url('${c.background_image||''}');">
        <div class="title">${c.card_title}</div>

        <div class="btns-g draggable" data-key="buttons">
          ${Array.from({length:8}).map((_,i)=>c[`switch_${i+1}_entity`]?html`
            <div class="sw" style="font-size:${c.btn_fs}px;" @click=${()=>this._toggle(c[`switch_${i+1}_entity`])}>
              <ha-icon icon="${c[`switch_${i+1}_icon`]}"></ha-icon>
              <div>${c[`switch_${i+1}_label`]||'B'+(i+1)}</div>
            </div>`:'')}
        </div>

        <div class="gb draggable" data-key="temps">
          <div class="bh">TEMPÉRATURES</div>
          <div>EAU: ${this._getState(c.entity_water_temp).val}${this._getState(c.entity_water_temp).unit}</div>
          <div>AIR: ${this._getState(c.entity_ambient_temp).val}${this._getState(c.entity_ambient_temp).unit}</div>
        </div>

        <div class="gb draggable" data-key="chem">
          <div class="bh">CHIMIE</div>
          <div>pH: ${this._getState(c.entity_ph).val}</div>
          <div>ORP: ${this._getState(c.entity_orp).val} mV</div>
          <div>Brome: ${this._getState(c.entity_bromine).val}</div>
        </div>

        ${c.camera_entity?html`<div class="gb cam draggable" data-key="camera"><hui-image .hass=${this.hass} .cameraImage=${c.camera_entity} cameraView="live"></hui-image></div>`:''}
      </ha-card>
    `;
  }

  static styles=css`
    ha-card.spa-card { position: relative; border-radius: 26px; overflow:hidden; backdrop-filter:blur(20px); background-size:cover; background-position:center; border:1px solid rgba(0,255,255,0.25); box-shadow:0 0 30px rgba(0,255,255,0.2); color:#fff; font-family:'Roboto',sans-serif; }
    .title { position:absolute; top:15px; left:20px; font-size:26px; font-weight:900; text-shadow:0 0 12px cyan,0 0 24px cyan; }
    .btns-g { position:absolute; top:100px; left:5%; display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
    .sw { background:rgba(0,0,0,0.6); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; height:60px; cursor:pointer; transition:all 0.25s ease; border:1px solid rgba(0,255,255,0.4); }
    .sw:hover { box-shadow:0 0 14px cyan,0 0 8px rgba(255,255,255,0.25); transform:scale(1.05); }
    .gb { position:absolute; background:rgba(0,0,0,0.5); border-radius:18px; padding:14px; border:1px solid rgba(0,255,255,0.35); backdrop-filter:blur(12px); box-shadow:0 0 12px rgba(0,255,255,0.25); margin-top:10px; }
    .bh { font-size:14px; font-weight:900; border-bottom:1px solid rgba(0,255,255,0.3); margin-bottom:6px; color:#00f9f9; }
    .cam hui-image { width:100%; height:180px; border-radius:12px; object-fit:cover; }
    @media(max-width:600px){.btns-g{grid-template-columns:repeat(2,1fr);}.cam hui-image{height:140px;}}
  `;
}

customElements.define('spa-card',SpaCard);
console.info('SPA-CARD V5 Ultra Design loaded – drag & drop + HACS ready');
