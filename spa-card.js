import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

/**
 * LA CARTE PRINCIPALE (Votre code qui fonctionne)
 */
class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }
  
  // Cette ligne fait le lien avec la classe définie plus bas
  static getConfigElement() { return document.createElement("spa-card-editor"); }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="height: ${c.card_height_v || 80}vh; background-image: url('${c.background_image}');">
        <div class="glass-container">
          
          <div class="top-bar">
            <div class="title-area">
               <h1>${c.card_title || "Wellness Center"}</h1>
               <div class="status-badge">Connecté</div>
            </div>
          </div>

          <div class="main-sensors">
            ${this._renderSensor(c.entity_water_temp, "Temp. Eau", "mdi:thermometer-water")}
            ${this._renderSensor(c.entity_ambient_temp, "Air", "mdi:weather-windy")}
          </div>

          <div class="controls-grid">
            ${Array.from({ length: 8 }).map((_, i) => {
              const eid = c[`switch_${i+1}_entity`];
              if (!eid) return "";
              return this._renderBtn(eid, c[`switch_${i+1}_label`] || `B${i+1}`, c[`switch_${i+1}_icon`]);
            })}
          </div>

          ${c.camera_entity ? html`
            <div class="cam-box">
               <hui-image .hass=${this.hass} .cameraImage=${c.camera_entity} cameraView="live"></hui-image>
            </div>
          ` : ""}

          <div class="bottom-stats">
             ${this._renderMini(c.entity_ph, "pH")}
             ${this._renderMini(c.entity_orp, "ORP")}
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderSensor(eid, label, icon) {
    const s = this.hass.states[eid];
    return s ? html`
      <div class="sensor-card">
        <ha-icon icon="${icon}"></ha-icon>
        <div class="sensor-data">
          <span class="val">${s.state}${s.attributes.unit_of_measurement || "°"}</span>
          <span class="lbl">${label}</span>
        </div>
      </div>
    ` : "";
  }

  _renderBtn(eid, label, icon) {
    const active = this.hass.states[eid]?.state === "on";
    return html`
      <div class="btn ${active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: eid})}>
        <ha-icon icon="${icon || 'mdi:power'}"></ha-icon>
        <span>${label}</span>
      </div>
    `;
  }

  _renderMini(eid, label) {
    const s = this.hass.states[eid];
    return s ? html`<div class="mini-stat"><strong>${label}:</strong> ${s.state}</div>` : "";
  }

  static styles = css`
    ha-card { background-size: cover; background-position: center; border-radius: 24px; overflow: hidden; position: relative; color: white; border: none; }
    .glass-container { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 24px; display: flex; flex-direction: column; box-sizing: border-box; }
    
    h1 { font-size: 24px; font-weight: 300; margin: 0; letter-spacing: 1px; }
    .status-badge { font-size: 10px; background: #4caf50; padding: 2px 8px; border-radius: 10px; display: inline-block; }

    .main-sensors { display: flex; gap: 16px; margin: 24px 0; }
    .sensor-card { background: rgba(255,255,255,0.1); padding: 16px; border-radius: 16px; flex: 1; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .val { font-size: 22px; font-weight: bold; display: block; }
    .lbl { font-size: 11px; opacity: 0.7; }

    .controls-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .btn { background: rgba(255,255,255,0.1); padding: 12px 8px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; transition: 0.3s; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); }
    .btn ha-icon { margin-bottom: 8px; --mdc-icon-size: 24px; }
    .btn span { font-size: 10px; text-transform: uppercase; font-weight: 600; text-align: center; }
    .btn.on { background: white; color: black; box-shadow: 0 4px 15px rgba(255,255,255,0.3); }

    .cam-box { border-radius: 16px; overflow: hidden; margin: 10px 0; border: 1px solid rgba(255,255,255,0.2); }
    .bottom-stats { display: flex; justify-content: center; gap: 20px; font-size: 12px; opacity: 0.8; margin-top: auto; }
  `;
}
customElements.define("spa-card", SpaCard);

/**
 * L'ÉDITEUR (Ajouté à la suite dans le même fichier)
 */
class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {}, _tab: { type: Number } };
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
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true, composed: true,
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;
    
    const tabs = [
      { label: "Style", icon: "mdi:palette" },
      { label: "Boutons", icon: "mdi:remote" },
      { label: "Sondes", icon: "mdi:thermometer" },
      { label: "Caméra", icon: "mdi:camera" }
    ];

    const schemas = [
      [
        { name: "card_title", label: "Titre", selector: { text: {} } },
        { name: "background_image", label: "Image (URL)", selector: { text: {} } },
        { name: "card_height_v", label: "Hauteur (%)", selector: { number: { min: 20, max: 100, mode: "slider" } } }
      ],
      Array.from({ length: 8 }, (_, i) => [
        { name: `switch_${i + 1}_label`, label: `B${i + 1} Nom`, selector: { text: {} } },
        { name: `switch_${i + 1}_entity`, label: `B${i + 1} Entité`, selector: { entity: {} } },
        { name: `switch_${i + 1}_icon`, label: `B${i + 1} Icône`, selector: { icon: {} } }
      ]).flat(),
      [
        { name: "entity_water_temp", label: "Eau", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ambient_temp", label: "Air", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } }
      ],
      [
        { name: "camera_entity", label: "Caméra", selector: { entity: { domain: "camera" } } }
      ]
    ];

    return html`
      <div class="nav">
        ${tabs.map((t, i) => html`
          <div class="nav-item ${this._tab === i ? 'active' : ''}" @click=${() => this._selectTab(i)}>
            <ha-icon icon="${t.icon}"></ha-icon>
            <span>${t.label}</span>
          </div>
        `)}
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schemas[this._tab]}
        .computeLabel=${(s) => s.label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  static styles = css`
    .nav { display: flex; background: var(--secondary-background-color); padding: 8px; border-radius: 12px; margin-bottom: 15px; }
    .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; cursor: pointer; color: var(--secondary-text-color); padding: 5px; }
    .nav-item.active { background: var(--primary-color); color: white; border-radius: 10px; }
    .nav-item ha-icon { --mdc-icon-size: 20px; }
    .nav-item span { font-size: 10px; margin-top: 2px; }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);

// Enregistrement pour le sélecteur de cartes
window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "SPA Card Modern",
  description: "Contrôle complet de Spa avec effet verre.",
});
