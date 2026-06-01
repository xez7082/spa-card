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
    this.innerHTML = `
      <ha-card header="Spa Control">
        <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="btn">Spa</button>
          <button class="btn">Chimies</button>
          <button class="btn">Interrupteurs</button>
          <button class="btn">Programmation</button>
        </div>
      </ha-card>
      <style>
        .btn { padding: 20px; cursor: pointer; border: 1px solid #ccc; border-radius: 8px; background: #f0f0f0; font-weight: bold; }
        .btn:hover { background: #e0e0e0; }
      </style>
    `;
    this.content = true;
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
