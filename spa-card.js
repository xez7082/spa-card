import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

/**
 * ==========================================
 * L'ÉDITEUR "DESIGN" (SPA-CARD-EDITOR)
 * ==========================================
 */
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {}, _tab: { type: Number } }; }
  constructor() { super(); this._tab = 0; }
  setConfig(config) { this._config = config; }
  _selectTab(idx) { this._tab = idx; }
  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value }, bubbles: true, composed: true,
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const tabs = [
      { label: "Design", icon: "mdi:brush", color: "#FF5722" },
      { label: "Boutons", icon: "mdi:hand-pointing-up", color: "#2196F3" },
      { label: "Capteurs", icon: "mdi:gauge", color: "#4CAF50" },
      { label: "Caméra", icon: "mdi:cctv", color: "#9C27B0" }
    ];
    const schemas = [
      [{ name: "card_title", label: "Nom du SPA", selector: { text: {} } }, { name: "background_image", label: "URL Image", selector: { text: {} } }, { name: "card_height_v", label: "Hauteur (%)", selector: { number: { min: 20, max: 100, mode: "slider" } } }],
      Array.from({ length: 8 }, (_, i) => [{ name: `switch_${i + 1}_label`, label: `B${i + 1} Label`, selector: { text: {} } }, { name: `switch_${i + 1}_entity`, label: `B${i + 1} Entité`, selector: { entity: { domain: ["switch", "light", "fan", "input_boolean"] } } }, { name: `switch_${i + 1}_icon`, label: `B${i + 1} Icône`, selector: { icon: {} } }]).flat(),
      [{ name: "entity_water_temp", label: "Capteur Eau", selector: { entity: { domain: "sensor" } } }, { name: "entity_ambient_temp", label: "Capteur Air", selector: { entity: { domain: "sensor" } } }, { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } }, { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } }],
      [{ name: "camera_entity", label: "Caméra", selector: { entity: { domain: "camera" } } }]
    ];

    return html`
      <div class="nav-pills">
        ${tabs.map((t, i) => html`
          <div class="pill ${this._tab === i ? 'active' : ''}" @click=${() => this._selectTab(i)} style="--pill-color: ${t.color}">
            <ha-icon icon="${t.icon}"></ha-icon><span>${t.label}</span>
          </div>`)}
      </div>
      <div class="form-wrapper">
        <ha-form .hass=${this.hass} .data=${this._config} .schema=${schemas[this._tab]} .computeLabel=${(s) => s.label} @value-changed=${this._valueChanged}></ha-form>
      </div>
    `;
  }

  static styles = css`
    .nav-pills { display: flex; gap: 8px; margin-bottom: 15px; background: var(--secondary-background-color); padding: 8px; border-radius: 14px; }
    .pill { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 8px; border-radius: 10px; cursor: pointer; color: var(--secondary-text-color); transition: 0.3s; }
    .pill.active { background: var(--pill-color); color: white; transform: scale(1.05); }
    .pill ha-icon { --mdc-icon-size: 20px; }
    .pill span { font-size: 10px; font-weight: bold; margin-top: 4px; }
    .form-wrapper { background: var(--card-background-color); padding: 12px; border-radius: 14px; }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);

/**
 * ==========================================
 * LA CARTE PRINCIPALE (SPA-CARD) ANIMÉE
 * ==========================================
 */
class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }
  static getConfigElement() { return document.createElement("spa-card-editor"); }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="height: ${c.card_height_v || 80}vh; background-image: url('${c.background_image}');">
        <div class="glass-container">
          
          <div class="top-bar">
            <h1>${c.card_title || "Wellness Center"}</h1>
            <div class="status-badge">
              <span class="dot pulse"></span> Connecté
            </div>
          </div>

          <div class="main-sensors">
            ${this._renderSensor(c.entity_water_temp, "Temp. Eau", "mdi:thermometer-water", "#00d2ff", true)}
            ${this._renderSensor(c.entity_ambient_temp, "Air", "mdi:weather-windy", "#ff9a9e", false)}
          </div>

          <div class="controls-grid">
            ${Array.from({ length: 8 }).map((_, i) => {
              const eid = c[`switch_${i+1}_entity`];
              return eid ? this._renderBtn(eid, c[`switch_${i+1}_label`] || `B${i+1}`, c[`switch_${i+1}_icon`]) : "";
            })}
          </div>

          ${c.camera_entity ? html`
            <div class="cam-box"><hui-image .hass=${this.hass} .cameraImage=${c.camera_entity} cameraView="live"></hui-image></div>
          ` : ""}

          <div class="bottom-stats">
             ${this._renderMini(c.entity_ph, "pH", "mdi:flask-round-bottom")}
             ${this._renderMini(c.entity_orp, "ORP", "mdi:lightning-bolt")}
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderSensor(eid, label, icon, color, animate) {
    const s = this.hass.states[eid];
    return s ? html`
      <div class="sensor-card">
        <div class="icon-circle ${animate ? 'breathe' : ''}" style="background: ${color}22; color: ${color}">
          <ha-icon icon="${icon}"></ha-icon>
        </div>
        <div class="sensor-data">
          <span class="val">${s.state}°</span>
          <span class="lbl">${label}</span>
        </div>
      </div>` : "";
  }

  _renderBtn(eid, label, icon) {
    const active = this.hass.states[eid]?.state === "on";
    return html`
      <div class="btn ${active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: eid})}>
        <div class="btn-icon-bg ${active ? 'active-anim' : ''}">
          <ha-icon icon="${icon || 'mdi:power'}"></ha-icon>
        </div>
        <span>${label}</span>
      </div>`;
  }

  _renderMini(eid, label, icon) {
    const s = this.hass.states[eid];
    return s ? html`<div class="mini-stat"><ha-icon icon="${icon}"></ha-icon> ${label}: ${s.state}</div>` : "";
  }

  static styles = css`
    :host { --accent-color: #00f9f9; }
    ha-card { background-size: cover; background-position: center; border-radius: 28px; overflow: hidden; color: white; border: none; }
    
    .glass-container { 
      height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(15px); 
      -webkit-backdrop-filter: blur(15px); padding: 24px; display: flex; flex-direction: column;
    }

    h1 { font-size: 24px; font-weight: 300; margin: 0; letter-spacing: 2px; }
    
    .status-badge { font-size: 11px; background: rgba(76, 175, 80, 0.2); padding: 4px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; }
    
    /* ANIMATION PULSE */
    .dot { width: 6px; height: 6px; background: #4caf50; border-radius: 50%; }
    .pulse { animation: pulse-green 2s infinite; }
    @keyframes pulse-green {
      0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
      100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }

    .main-sensors { display: flex; gap: 16px; margin: 25px 0; }
    .sensor-card { background: rgba(255,255,255,0.1); padding: 16px; border-radius: 20px; flex: 1; display: flex; align-items: center; gap: 12px; }
    
    /* ANIMATION BREATH */
    .breathe { animation: breathe 3s ease-in-out infinite; }
    @keyframes breathe {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
    }

    .controls-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .btn { background: rgba(255,255,255,0.1); padding: 15px 5px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: 0.3s; }
    .btn.on { background: white; color: #1a1a1a; transform: translateY(-3px); }
    
    /* ANIMATION ICONE ACTIVE */
    .active-anim { animation: rotate-gentle 4s linear infinite; }
    @keyframes rotate-gentle {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .btn-icon-bg { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-bottom: 8px; background: rgba(255,255,255,0.1); }
    .btn.on .btn-icon-bg { background: var(--accent-color); color: white; }
    .btn span { font-size: 9px; font-weight: bold; text-transform: uppercase; }

    .cam-box { border-radius: 20px; overflow: hidden; margin: 15px 0; border: 1px solid rgba(255,255,255,0.2); }
    .bottom-stats { display: flex; justify-content: center; gap: 15px; margin-top: auto; }
    .mini-stat { background: rgba(0,0,0,0.3); padding: 5px 12px; border-radius: 12px; font-size: 11px; display: flex; align-items: center; gap: 5px; }
  `;
}
customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA Card Premium Animated", description: "Spa card avec animations fluides." });
