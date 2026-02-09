class SpaCardV5 extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `<ha-card style="padding: 16px; background: #1c1c1c; color: white; border-radius: 15px; border: 1px solid #00d2ff;">
        <div id="container">
          <h2 id="title" style="margin: 0; color: #00d2ff;">SPA CONNECTÉ</h2>
          <div style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
            <span style="font-size: 2.5em; font-weight: bold;" id="temp">--</span>
            <span style="font-size: 1.5em;">°C</span>
          </div>
          <div id="status" style="font-size: 0.8em; opacity: 0.7;">Initialisation...</div>
        </div>
      </ha-card>`;
      this.content = this.querySelector("#container");
    }

    const config = this._config;
    const entityId = config.entity_water_temp;
    const state = hass.states[entityId];
    
    this.querySelector("#temp").textContent = state ? state.state : "??";
    this.querySelector("#title").textContent = config.card_title || "Mon Spa";
    this.querySelector("#status").textContent = state ? "Données à jour" : "Entité introuvable";
  }

  setConfig(config) {
    if (!config.entity_water_temp) throw new Error("Définissez entity_water_temp");
    this._config = config;
  }

  getCardSize() { return 3; }
}

if (!customElements.get("spa-card-v5")) {
  customElements.define("spa-card-v5", SpaCardV5);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card-v5",
  name: "Spa Card V5",
  description: "Version de secours ultra-stable"
});
