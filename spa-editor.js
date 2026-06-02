import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = config;
  }

render() {
    if (!this.hass) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${[
          { name: "card_title", label: "Titre de la carte", selector: { text: {} } },
          { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_target_temp", label: "Contrôle Temp (Climate)", selector: { entity: { domain: "climate" } } },
          { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_camera", label: "Caméra Spa", selector: { entity: { domain: "camera" } } },
          // Ajoutez ici les autres lignes selon le même modèle
        ]}
        @value-changed=${this._val}
      ></ha-form>
    `;
  }

  _changed(ev) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true
    }));
  }
}
customElements.define("spa-card-editor", SpaCardEditor);
