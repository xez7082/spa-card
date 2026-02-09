class SpaCardV5 extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <ha-card style="padding: 16px; background: #1a1a1a; color: white; border-radius: 15px; border: 2px solid #00d2ff;">
          <div id="container">
            <h2 id="title" style="margin: 0; color: #00d2ff; font-family: sans-serif;">SPA CONNECTÉ</h2>
            <div style="display: flex; align-items: center; gap: 10px; margin: 15px 0;">
              <span style="font-size: 3em; font-weight: bold; font-family: sans-serif;" id="temp">--</span>
              <span style="font-size: 1.5em; color: #00d2ff;">°C</span>
            </div>
            <div id="status" style="font-size: 0.8em; opacity: 0.6; font-family: sans-serif;">Initialisation...</div>
          </div>
        </ha-card>`;
      this.content = this.querySelector("#container");
    }

    const config = this._config;
    const entityId = config.entity_water_temp;
    const stateObj = hass.states[entityId];
    
    this.querySelector("#temp").textContent = stateObj ? stateObj.state : "??";
    this.querySelector("#title").textContent = config.card_title || "Mon Spa";
    this.querySelector("#status").textContent = stateObj ? "Données reçues" : "Entité introuvable";
  }

  setConfig(config) {
    if (!config.entity_water_temp) throw new Error("Veuillez définir l'entité : entity_water_temp");
    this._config = config;
  }

  getCardSize() { return 3; }
}

// On tente d'enregistrer le nom v5
if (!customElements.get("spa-card-v5")) {
  customElements.define("spa-card-v5", SpaCardV5);
}

// On force l'apparition dans la liste des cartes
window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card-v5",
  name: "Spa Card V5",
  preview: true,
  description: "Version de secours ultra-stable"
});
