import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from "./spa-styles.js";

export class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {}, _tab: { type: String }, _open: { type: Object } }; }
  
  constructor() {
    super();
    this._tab = 'gen';
    this._open = new Set(['a-disp', 'a-temps', 'a-layzspa', 'a-ph']);
  }

  setConfig(config) { this._config = { ...config }; }
  
  _val(ev) { 
    this.dispatchEvent(new CustomEvent('config-changed', { 
      detail: { config: ev.detail.value }, 
      bubbles: true, 
      composed: true 
    })); 
  }
  
  _tog(id) { 
    const o = new Set(this._open); 
    o.has(id) ? o.delete(id) : o.add(id); 
    this._open = o; 
    this.requestUpdate();
  }
  
  _acc(id, icon, title, schema) {
    if (!this.hass) return html``;
    const open = this._open.has(id);
    return html`
      <div class="acc">
        <div class="ach" @click=${() => this._tog(id)}>
          <div class="aibox">${icon}</div>
          <span style="flex-grow:1; font-weight:500;">${title}</span>
          <ha-icon icon="${open ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
        </div>
        ${open ? html`<div class="acbi"><ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._val}></ha-form></div>` : ''}
      </div>`;
  }

  render() {
    return html`
      <div class="editor-wrap">
        <div class="tabs">
          <button class="${this._tab === 'gen' ? 'active' : ''}" @click=${() => this._tab = 'gen'}>Général</button>
          <button class="${this._tab === 'chem' ? 'active' : ''}" @click=${() => this._tab = 'chem'}>Chimie</button>
        </div>
        ${this._tab === 'gen' 
          ? this._acc('a-disp', '🛁', 'Apparence', [{name:'card_title', label:'Titre', selector:{text:{}}}]) 
          : this._acc('a-ph', '🧪', 'Chimie', [{name:'entity_ph', label:'Entité pH', selector:{entity:{domain:'sensor'}} }])}
      </div>`;
  }

  static styles = [sharedStyles, css` 
    .tabs { display:flex; border-bottom:1px solid var(--divider-color); margin-bottom:15px; } 
    .tabs button { padding:10px; border:none; background:none; cursor:pointer; } 
    .tabs button.active { border-bottom:2px solid var(--primary-color); color:var(--primary-color); } 
  `];
}
customElements.define('spa-card-editor', SpaCardEditor);
