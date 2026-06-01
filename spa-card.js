class SpaCard extends HTMLElement {
  // 1. Indispensable : Home Assistant appelle cette méthode pour passer la configuration
  setConfig(config) {
    // On valide que la config existe pour éviter les erreurs au démarrage
    if (!config) {
      throw new Error("Configuration invalide");
    }
    this._config = config;
  }

  // 2. Indispensable : Home Assistant passe l'objet 'hass' ici
  set hass(hass) {
    this._hass = hass;
    // On appelle render() une seule fois pour éviter de redessiner en boucle
    if (!this.content) {
      this.render();
    }
  }

  // 3. Méthode de rendu
render() {
  return html`
    <ha-card .header="${this.config.card_title}">
      ${this._tab === "home" ? this._renderHome() : ""}
      
      ${this._tab === "cam" ? this._renderCam() : ""}
      
      ${this._tab === "chem" ? this._renderChem() : ""}
      
      ${this._tab === "switches" ? this._renderSwitches() : ""}

      <div class="nav-bar">
        <ha-icon-button icon="mdi:home" @click=${() => this._tab = "home"}></ha-icon-button>
        <ha-icon-button icon="mdi:camera" @click=${() => this._tab = "cam"}></ha-icon-button>
        <ha-icon-button icon="mdi:water-check" @click=${() => this._tab = "chem"}></ha-icon-button>
        <ha-icon-button icon="mdi:cog" @click=${() => this._tab = "switches"}></ha-icon-button>
      </div>
    </ha-card>
  `;
}

  // 4. Important : Permet d'appeler l'éditeur visuel (spa-editor)
  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  // 5. Permet d'avoir une configuration par défaut
  static getStubConfig() {
    return { card_title: "Spa" };
  }
}

// 6. Enregistrement de l'élément
if (!customElements.get("spa-card")) {
  customElements.define("spa-card", SpaCard);
}

// 7. Ajout au sélecteur de cartes Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "Spa Control Card",
  preview: true
});
