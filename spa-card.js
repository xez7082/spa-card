import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = { ...config }; }

  _val(ev) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: ev.detail.value },
      bubbles: true, composed: true
    }));
  }

  render() {
    if (!this.hass) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${[
          { name: "card_title", label: "Titre de la carte", selector: { text: {} } },
          
          { name: "general", label: "--- GÉNÉRAL ---", selector: { ui: { type: "section" } } },
          { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_target_temp", label: "Climate Spa", selector: { entity: { domain: "climate" } } },

          { name: "camera", label: "--- CAMÉRA ---", selector: { ui: { type: "section" } } },
          { name: "entity_camera", label: "Caméra Spa", selector: { entity: { domain: "camera" } } },

          { name: "chimie", label: "--- CHIMIE ---", selector: { ui: { type: "section" } } },
          { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_salt", label: "Salinité", selector: { entity: { domain: "sensor" } } },

          { name: "switches", label: "--- INTERRUPTEURS ---", selector: { ui: { type: "section" } } },
          { name: "switch_1", label: "Spa", selector: { entity: { domain: "switch" } } },
          { name: "switch_2", label: "Télévision", selector: { entity: { domain: "switch" } } },
          { name: "switch_3", label: "Caméra", selector: { entity: { domain: "switch" } } },

          { name: "prog", label: "--- PROGRAMMATION ---", selector: { ui: { type: "section" } } },
          { name: "entity_lz_schedule", label: "Entité horaire", selector: { entity: { domain: "input_datetime" } } }
        ]}
        @value-changed=${this._val}
      ></ha-form>
    `;
  }
}
if (!customElements.get("spa-card-editor")) customElements.define("spa-card-editor", SpaCardEditor);

// --- CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }
  static getConfigElement() { return document.createElement("spa-card-editor"); }

  render() {
    return html`
      <ha-card .header="${this.config.card_title || 'Spa'}">
        <div style="padding:16px">
          Carte configurée. Vous pouvez maintenant ajouter vos entités via l'éditeur visuel.
        </div>
      </ha-card>`;
  }
}
if (!customElements.get("spa-card")) customElements.define("spa-card", SpaCard);
