import { LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
class SpaCard extends LitElement {
  setConfig(config) { this.config = config; }
  render() { return html`<ha-card style="padding:20px; background: red; color: white;"><h1>SI TU VOIS CE MESSAGE ROUGE, LE LIEN FONCTIONNE !</h1></ha-card>`; }
}
customElements.define("spa-card", SpaCard);
