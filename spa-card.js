import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════
// 1. ÉDITEUR (Lien avec l'interface de config)
// ═══════════════════════════════════════════════════════════════════
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }

  render() {
    return html`
      <div class="editor">
        <h3>Configuration du Spa</h3>
        <p>Utilisez le YAML pour configurer les entités ou ajoutez les champs ici.</p>
      </div>
    `;
  }
}
customElements.define('spa-card-editor', SpaCardEditor);

// ═══════════════════════════════════════════════════════════════════
// 2. CARTE PRINCIPALE (Le rendu)
// ═══════════════════════════════════════════════════════════════════
class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }

  constructor() {
    super();
    this._tab = 'home';
  }

  setConfig(config) { this.config = config; }
  
  // C'est cette ligne qui active l'éditeur visuel
  static getConfigElement() { return document.createElement("spa-card-editor"); }

  render() {
    if (!this.hass || !this.config) return html``;
    return html`
      <ha-card .header="${this.config.card_title || 'Spa Control'}">
        <div class="content">
          ${this._tab === 'home' ? html`<div>Accueil</div>` : ''}
          ${this._tab === 'chem' ? html`<div>Chimie</div>` : ''}
          ${this._tab === 'cam'  ? html`<div>Caméra</div>` : ''}
          ${this._tab === 'sw'   ? html`<div>Switches</div>` : ''}
        </div>
        
        <div class="nav">
          <ha-icon icon="mdi:home" @click=${() => this._tab = 'home'}></ha-icon>
          <ha-icon icon="mdi:water-check" @click=${() => this._tab = 'chem'}></ha-icon>
          <ha-icon icon="mdi:camera" @click=${() => this._tab = 'cam'}></ha-icon>
          <ha-icon icon="mdi:toggle-switch" @click=${() => this._tab = 'sw'}></ha-icon>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .content { padding: 16px; min-height: 100px; }
      .nav { display:flex; justify-content:space-around; padding:16px; border-top:1px solid var(--divider-color); }
      ha-icon { cursor: pointer; opacity: 0.6; }
      ha-icon:hover { opacity: 1; }
    `;
  }
}
customElements.define('spa-card', SpaCard);

// 3. ENREGISTREMENT POUR LE SÉLECTEUR
window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "Spa Control Card",
  preview: true,
  description: "Carte personnalisée pour Spa"
});
