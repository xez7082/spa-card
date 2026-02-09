// SPA Card Editor V5 - Corrected
import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
      _tab: { type: Number },
    };
  }

  constructor() {
    super();
    this._tab = 0;
  }

  setConfig(config) {
    this._config = config;
  }

  _selectTab(idx) {
    this._tab = idx;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const config = ev.detail.value;
    
    // On émet l'événement pour sauvegarder la config
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const tabs = ["Général", "Boutons", "Sondes", "Caméra", "Chimie"];
    
    // Définition des schémas pour ha-form
    const schemas = [
      // Onglet 0: Général
      [
        { name: "card_title", label: "Titre de la carte", selector: { text: {} } },
        { name: "background_image", label: "URL de l'image de fond", selector: { text: {} } },
        { name: "card_height_v", label: "Hauteur de la carte (%)", selector: { number: { min: 20, max: 100, mode: "slider" } } },
      ],
      // Onglet 1: Boutons (Générés dynamiquement)
      Array.from({ length: 8 }, (_, i) => [
        { name: `switch_${i + 1}_label`, label: `Bouton ${i + 1} - Nom`, selector: { text: {} } },
        { name: `switch_${i + 1}_entity`, label: `Bouton ${i + 1} - Entité`, selector: { entity: {} } },
        { name: `switch_${i + 1}_icon`, label: `Bouton ${i + 1} - Icône`, selector: { icon: {} } },
      ]).flat(),
      // Onglet 2: Sondes
      [
        { name: "entity_water_temp", label: "Capteur Température Eau", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ambient_temp", label: "Capteur Température Air", selector: { entity: { domain: "sensor" } } },
      ],
      // Onglet 3: Caméra
      [
        { name: "camera_entity", label: "Entité Caméra", selector: { entity: { domain: "camera" } } },
        { name: "camera_width", label: "Largeur (px)", selector: { number: { min: 100, max: 800 } } },
        { name: "camera_height", label: "Hauteur (px)", selector: { number: { min: 100, max: 800 } } },
      ],
      // Onglet 4: Chimie
      [
        { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } },
        { name: "entity_bromine", label: "Capteur Brome", selector: { entity: { domain: "sensor" } } },
      ],
    ];

    return html`
      <div class="tabs">
        ${tabs.map(
          (n, i) => html`
            <div
              class="tab ${this._tab === i ? "active" : ""}"
              @click=${() => this._selectTab(i)}
            >
              ${n}
            </div>
          `
        )}
      </div>

      <div class="form-container">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${schemas[this._tab]}
          .computeLabel=${(schema) => schema.label}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }

  static get styles() {
    return css`
      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 8px;
      }
      .tab {
        padding: 6px 12px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-radius: 20px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.3s ease;
        border: 1px solid var(--divider-color);
      }
      .tab.active {
        background: var(--accent-color);
        color: var(--text-primary-color, white);
        border-color: var(--accent-color);
      }
      .form-container {
        padding: 8px 0;
      }
      ha-form {
        display: block;
        margin-bottom: 24px;
      }
    `;
  }
}

customElements.define("spa-card-editor", SpaCardEditor);
