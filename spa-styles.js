import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { sharedStyles } from "./spa-styles.js";

export class SpaCardEditor extends LitElement {

  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
      _tab: { type: String },
      _open: { type: Object }
    };
  }

  constructor() {
    super();
    this._config = {};
    this._tab = "gen";
    this._open = new Set(["a-disp", "a-temps", "a-layzspa", "a-ph"]);
  }

  setConfig(config) {
    this._config = { ...config };
  }

  _val(ev) {
    this._config = { ...this._config, ...ev.detail.value };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }

  _tog(id) {
    const open = new Set(this._open);
    open.has(id) ? open.delete(id) : open.add(id);
    this._open = open;
    this.requestUpdate();
  }

  _acc(id, icon, title, schema) {
    if (!this.hass) return html``;
    const open = this._open.has(id);

    return html`
      <div class="acc">
        <div class="ach" @click=${() => this._tog(id)}>
          <div class="aibox">${icon}</div>
          <span class="title">${title}</span>
          <ha-icon .icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
        </div>
        ${open ? html`
          <div class="acbi">
            <ha-form
              .hass=${this.hass}
              .data=${this._config}
              .schema=${schema}
              @value-changed=${this._val}
            ></ha-form>
          </div>
        ` : ""}
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    return html`
      <div class="editor-wrap">
        <div class="tabs">
          <button class="${this._tab === "gen" ? "active" : ""}" @click=${() => (this._tab = "gen")}>Général</button>
          <button class="${this._tab === "chem" ? "active" : ""}" @click=${() => (this._tab = "chem")}>Chimie</button>
        </div>

        <div class="sections">
          ${this._tab === "gen"
            ? this._acc("a-disp", "🛁", "Apparence", [
                { name: "card_title", label: "Titre", selector: { text: {} } },
                { name: "entity_water_temp", label: "Température eau", selector: { entity: { domain: "sensor" } } },
                { name: "entity_filter", label: "Filtration", selector: { entity: {} } }
              ])
            : this._acc("a-ph", "🧪", "Chimie", [
                { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } }
              ])
          }
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        .tabs { display: flex; border-bottom: 1px solid var(--divider-color); margin-bottom: 15px; }
        .tabs button { padding: 10px 16px; border: none; background: none; cursor: pointer; color: var(--secondary-text-color); }
        .tabs button.active { border-bottom: 2px solid var(--primary-color); color: var(--primary-color); font-weight: 600; }
        .acc { margin-bottom: 12px; border: 1px solid var(--divider-color); border-radius: 12px; overflow: hidden; }
        .ach { display: flex; align-items: center; padding: 12px; cursor: pointer; }
        .aibox { margin-right: 10px; }
        .title { flex-grow: 1; font-weight: 500; }
        .acbi { padding: 12px; }
      `
    ];
  }
}

if (!customElements.get("spa-card-editor")) {
  customElements.define("spa-card-editor", SpaCardEditor);
}
