import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCard extends LitElement {
  static get properties() {
    return { 
      hass: { type: Object }, 
      _config: { type: Object },
      _tab: { type: String }
    };
  }

  constructor() {
    super();
    this._tab = "home"; // Valeur par défaut
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration invalide");
    this._config = config;
  }

  // Permet de changer d'onglet et de rafraîchir l'affichage
  setTab(tab) {
    this._tab = tab;
    this.requestUpdate();
  }

  render() {
    if (!this._config || !this.hass) return html``;

    return html`
      <ha-card .header="${this._config.card_title || "Spa"}">
        <div class="card-content">
          ${this._tab === "home" ? this._renderHome() : ""}
          ${this._tab === "cam" ? this._renderCam() : ""}
          ${this._tab === "chem" ? this._renderChem() : ""}
          ${this._tab === "switches" ? this._renderSwitches() : ""}
        </div>

        <div class="nav-bar">
          <ha-icon-button icon="mdi:home" @click=${() => this.setTab("home")}></ha-icon-button>
          <ha-icon-button icon="mdi:camera" @click=${() => this.setTab("cam")}></ha-icon-button>
          <ha-icon-button icon="mdi:water-check" @click=${() => this.setTab("chem")}></ha-icon-button>
          <ha-icon-button icon="mdi:cog" @click=${() => this.setTab("switches")}></ha-icon-button>
        </div>
      </ha-card>
    `;
  }

  // Vos méthodes de rendu (doivent exister dans votre fichier)
  _renderHome() { return html`<div>Vue Maison</div>`; }
  _renderCam() { return html`<div>Vue Caméra</div>`; }
  _renderChem() { return html`<div>Vue Chimie</div>`; }
  _renderSwitches() { return html`<div>Vue Switches</div>`; }

  static get styles() {
    return css`
      .nav-bar { display: flex; justify-content: space-around; padding: 10px; border-top: 1px solid var(--divider-color); }
      .card-content { padding: 16px; min-height: 200px; }
    `;
  }

  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }
}

if (!customElements.get("spa-card")) {
  customElements.define("spa-card", SpaCard);
}
