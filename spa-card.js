// Test minimaliste
console.log("TEST SPA CARD: Le fichier est bien chargé !");

class TestCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `<ha-card style="padding:20px; font-size:24px; color:red;">
        CARTE SPA CHARGÉE AVEC SUCCÈS !
      </ha-card>`;
      this.content = true;
    }
  }
}
customElements.define("spa-card", TestCard);
