import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = config;
  }

  render() {
    return html`
      <div class="editor">
        <h3>Configuration du Spa</h3>
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            { name: "card_title", label: "Titre de la carte", selector: { text: {} } },
            { name: "section", label: "Mode d'affichage", selector: { select: { options: ["Spa", "Chimie", "Interrupteurs", "Programmation"] } } }
          ]}
          @value-changed=${this._changed}
        ></ha-form>
      </div>
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
