// FORCE ALERT POUR TESTER LE CHARGEMENT
console.log("SPA-CARD: Tentative de chargement...");

const lit = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const { LitElement, html, css } = lit.prototype ? { 
  LitElement: lit, 
  html: lit.html, 
  css: lit.css 
} : await import("https://unpkg.com/lit-element@2.4.0/lit-element.js?module");

class SpaCardV5 extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }
  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    return html`
      <ha-card style="background: rgba(0,0,0,0.5); color: white; padding: 20px; border-radius: 20px; backdrop-filter: blur(10px);">
        <h1 style="margin:0; font-weight: 300;">${c.card_title || "SPA V5"}</h1>
        <div style="font-size: 3em; font-weight: bold;">
          ${this.hass.states[c.entity_water_temp]?.state || '--'}°C
        </div>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
           ${this._renderBtn(c.switch_1_entity, c.switch_1_label)}
        </div>
      </ha-card>
    `;
  }
  _renderBtn(eid, label) {
    if(!eid) return html``;
    const active = this.hass.states[eid]?.state === "on";
    return html`
      <div @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: eid})}
           style="padding: 10px; background: ${active ? 'white' : 'rgba(255,255,255,0.2)'}; color: ${active ? 'black' : 'white'}; border-radius: 10px; cursor: pointer;">
        ${label || 'Bouton'}
      </div>`;
  }
}

if (!customElements.get("spa-card-v5")) {
  customElements.define("spa-card-v5", SpaCardV5);
}

// Enregistrement pour l'interface
window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card-v5",
  name: "SPA Card V5",
  description: "Version de secours"
});
