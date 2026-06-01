import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from "./spa-styles.js";

export class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {}, _tab: { type: String }, _open: {} };
  }

  constructor() {
    super();
    this._tab = 'gen';
    this._open = new Set(['a-disp', 'a-ph']);
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

  _acc(id, boxStyle, icon, title, schema) {
    const open = this._open.has(id);
    return html`
      <div class="acc">
        <div class="ach" @click=${() => this._tog(id)}>
          <div class="aibox" style="${boxStyle}">${icon}</div>
          <span style="flex-grow:1; font-weight:500;">${title}</span>
          <ha-icon icon="${open ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
        </div>
        ${open ? html`
          <div class="acbi">
            <ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._val}></ha-form>
          </div>` : ''}
      </div>`;
  }

  render() {
    if (!this.hass || !this._config) return html``;
    
    return html`
      <div class="editor-wrap">
        <div class="tabs">
          <button class="${this._tab === 'gen' ? 'active' : ''}" @click=${() => this._tab = 'gen'}>Général</button>
          <button class="${this._tab === 'chem' ? 'active' : ''}" @click=${() => this._tab = 'chem'}>Chimie</button>
        </div>
        <div class="sections">
          ${this._tab === 'gen' ? 
            this._acc('a-disp', 'background:rgba(107,142,255,.18);color:#6b8eff;', 'GEN', 'Apparence générale', [
              { name: 'card_title', label: 'Titre du spa', selector: { text: {} } },
              { name: 'background_image', label: 'Image de fond (URL)', selector: { text: {} } }
            ]) 
            : 
            this._acc('a-ph', 'background:rgba(167,139,250,.15);color:#8b5cf6;', 'pH', 'Réglages Chimie', [
              { name: 'entity_ph', label: 'Entité pH', selector: { entity: { domain: 'sensor' } } },
              { name: 'entity_orp', label: 'Entité ORP', selector: { entity: { domain: 'sensor' } } }
            ])
          }
        </div>
      </div>
    `;
  }

  static styles = [sharedStyles, css`
    :host { display: block; }
    .tabs { display: flex; margin-bottom: 15px; border-bottom: 1px solid var(--divider-color); }
    .tabs button { 
      padding: 10px 20px; cursor: pointer; background: none; border: none; 
      color: var(--secondary-text-color); font-weight: 500;
    }
    .tabs button.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
    .tabs button:hover { color: var(--primary-color); }
  `];
}

customElements.define('spa-card-editor', SpaCardEditor);
