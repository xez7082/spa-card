import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
//  ÉDITEUR  —  V33  (LayZSpa intégré)
// ═══════════════════════════════════════════════════════════════════
class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {}, _tab: { type: String }, _open: {} };
  }

  constructor() {
    super();
    this._tab = 'gen';
    this._open = new Set(['a-disp', 'a-temps', 'a-layzspa', 'a-ph', 'a-cdim']);
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
      <div class="acc ${open ? 'open' : ''}">
        <div class="ach" @click=${() => this._tog(id)}>
          <div class="aibox" style="${boxStyle}">${icon}</div>
          <span class="ach-title">${title}</span>
          <ha-icon class="arr" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="acb"><div class="acbi">
          <ha-form .hass=${this.hass} .data=${this._config}
            .schema=${schema} @value-changed=${this._val}>
          </ha-form>
        </div></div>
      </div>`;
  }

  // (Les méthodes _renderGen, _renderSens, etc., sont conservées ici dans votre fichier réel)
  render() {
    if (!this.hass || !this._config) return html``;
    return html`<div class="editor-wrap">Configuration active.</div>`;
  }

  static styles = css`
    /* Styles simplifiés pour l'éditeur */
    .editor-wrap { padding: 10px; }
    .acc { border:1px solid var(--divider-color); border-radius:12px; margin-bottom:8px; }
  `;
}
customElements.define('spa-card-editor', SpaCardEditor);

// ═══════════════════════════════════════════════════════════════════
//  CARTE PRINCIPALE  —  V33
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement('spa-card-editor'); }

  static get properties() {
    return { hass: {}, config: {}, _tab: { type: String } };
  }

  setConfig(config) { this.config = config; }

  render() {
    if (!this.hass || !this.config) return html``;
    
    return html`
      <ha-card .header="${this.config.card_title || 'Spa Control'}">
        <div class="card-content">
          ${this._renderContent()}
        </div>
        <div class="nav">
          <ha-icon icon="mdi:home" @click=${() => this._tab = 'home'}></ha-icon>
          <ha-icon icon="mdi:flask" @click=${() => this._tab = 'chem'}></ha-icon>
          <ha-icon icon="mdi:cog" @click=${() => this._tab = 'sw'}></ha-icon>
        </div>
      </ha-card>
    `;
  }

  _renderContent() {
    switch(this._tab) {
      case 'chem': return html`<div>Vue Chimie</div>`;
      case 'sw': return html`<div>Vue Interrupteurs</div>`;
      default: return html`<div>Vue Accueil</div>`;
    }
  }

  static styles = css`
    .nav { display:flex; justify-content:space-around; padding:16px; border-top:1px solid var(--divider-color); }
    ha-icon { cursor: pointer; }
  `;
}
customElements.define('spa-card', SpaCard);
