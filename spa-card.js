import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

/**
 * ==========================================
 * L'ÉDITEUR "DESIGN" (SPA-CARD-EDITOR)
 * ==========================================
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
    const config = ev.detail.value;
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

    const tabs = [
      { label: "Design", icon: "mdi:brush", color: "#FF5722" },
      { label: "Boutons", icon: "mdi:hand-pointing-up", color: "#2196F3" },
      { label: "Capteurs", icon: "mdi:gauge", color: "#4CAF50" },
      { label: "Caméra", icon: "mdi:cctv", color: "#9C27B0" }
    ];

    const schemas = [
      [
        { name: "card_title", label: "Nom du SPA", selector: { text: {} } },
        { name: "background_image", label: "URL Image de fond", selector: { text: {} } },
        { name: "card_height_v", label: "Hauteur de la carte (%)", selector: { number: { min: 20, max: 100, mode: "slider" } } },
      ],
      Array.from({ length: 8 }, (_, i) => [
        { name: `switch_${i + 1}_label`, label: `B${i + 1} Label`, selector: { text: {} } },
        { name: `switch_${i + 1}_entity`, label: `B${i + 1} Entité`, selector: { entity: { domain: ["switch", "light", "fan", "input_boolean"] } } },
        { name: `switch_${i + 1}_icon`, label: `B${i + 1} Icône`, selector: { icon: {} } },
      ]).flat(),
      [
        { name: "entity_water_temp", label: "Capteur Eau", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ambient_temp", label: "Capteur Air", selector: { entity: { domain: "sensor" } } },
        { name: "entity_ph", label: "Valeur pH", selector: { entity: { domain: "sensor" } } },
        { name: "entity_orp", label: "Valeur ORP", selector: { entity: { domain: "sensor" } } },
      ],
      [
        { name: "camera_entity", label: "Entité Caméra", selector: { entity: { domain: "camera" } } },
      ]
    ];

    return html`
      <div class="editor-container">
        <div class="nav-pills">
          ${tabs.map((t, i) => html`
            <div class="pill ${this._tab === i ? 'active' : ''}" @click=${() => this._selectTab(i)} style="--pill-color: ${t.color}">
              <ha-icon icon="${t.icon}"></ha-icon>
              <span>${t.label}</span>
            </div>
          `)}
        </div>
        
        <div class="form-wrapper">
          <ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${schemas[this._tab]}
            .computeLabel=${(s) => s.label}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>
      </div>
    `;
  }

  static styles = css`
    .editor-container { animation: fadeIn 0.5s ease; }
    .nav-pills { 
      display: flex; 
      gap: 10px; 
      margin-bottom: 20px; 
      background: var(--card-background-color); 
      padding: 10px; 
      border-radius: 18px; 
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
    }
    .pill { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      padding: 10px; 
      border-radius: 14px; 
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: var(--secondary-text-color);
      border: 1px solid transparent;
    }
    .pill ha-icon { --mdc-icon-size: 24px; margin-bottom: 4px; }
    .pill span { font-size: 11px; font-weight: 600; }
    
    .pill:hover { background: rgba(var(--rgb-primary-text-color), 0.05); }
    
    .pill.active { 
      background: var(--pill-color); 
      color: white; 
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      transform: translateY(-2px);
    }

    .form-wrapper {
      background: var(--card-background-color);
      padding: 16px;
      border-radius: 18px;
      border: 1px solid var(--divider-color);
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);

/**
 * ==========================================
 * LA CARTE PRINCIPALE (SPA-CARD)
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
            <div class="title-area">
               <h1>${c.card_title || "Wellness Center"}</h1>
               <div class="status-badge">
                 <span class="dot"></span> Connecté
               </div>
            </div>
          </div>

          <div class="main-sensors">
            ${this._renderSensor(c.entity_water_temp, "Temp. Eau", "mdi:thermometer-water", "#00d2ff")}
            ${this._renderSensor(c.entity_ambient_temp, "Air", "mdi:weather-windy", "#ff9a9e")}
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
             ${this._renderMini(c.entity_ph, "pH", "mdi:flask-round-bottom")}
             ${this._renderMini(c.entity_orp, "ORP", "mdi:lightning-bolt")}
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderSensor(eid, label, icon, color) {
    const s = this.hass.states[eid];
    return s ? html`
      <div class="sensor-card">
        <div class="icon-circle" style="background: ${color}22; color: ${color}">
          <ha-icon icon="${icon}"></ha-icon>
        </div>
        <div class="sensor-data">
          <span class="val">${s.state}°</span>
          <span class="lbl">${label}</span>
        </div>
      </div>
    ` : "";
  }

  _renderBtn(eid, label, icon) {
    const active = this.hass.states[eid]?.state === "on";
    return html`
      <div class="btn ${active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: eid})}>
        <div class="btn-icon-bg">
          <ha-icon icon="${icon || 'mdi:power'}"></ha-icon>
        </div>
        <span>${label}</span>
      </div>
    `;
  }

  _renderMini(eid, label, icon) {
    const s = this.hass.states[eid];
    return s ? html`
      <div class="mini-stat">
        <ha-icon icon="${icon}"></ha-icon>
        <strong>${label}:</strong> ${s.state}
      </div>` : "";
  }

  static styles = css`
    :host { --accent-color: #00f9f9; }
    ha-card { background-size: cover; background-position: center; border-radius: 28px; overflow: hidden; position: relative; color: white; border: none; transition: all 0.3s ease; }
    
    .glass-container { 
      height: 100%; 
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%); 
      backdrop-filter: blur(12px); 
      -webkit-backdrop-filter: blur(12px);
      padding: 24px; 
      display: flex; 
      flex-direction: column; 
      box-sizing: border-box;
    }
    
    h1 { font-size: 26px; font-weight: 300; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    
    .status-badge { 
      font-size: 11px; 
      background: rgba(76, 175, 80, 0.2); 
      color: #81c784;
      padding: 4px 12px; 
      border-radius: 20px; 
      display: inline-flex; 
      align-items: center;
      gap: 6px;
      margin-top: 5px;
      border: 1px solid rgba(76, 175, 80, 0.3);
    }
    .dot { width: 6px; height: 6px; background: #4caf50; border-radius: 50%; box-shadow: 0 0 8px #4caf50; }

    .main-sensors { display: flex; gap: 16px; margin: 30px 0; }
    .sensor-card { 
      background: rgba(255,255,255,0.08); 
      padding: 16px; 
      border-radius: 20px; 
      flex: 1; 
      display: flex; 
      align-items: center; 
      gap: 15px; 
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(5px);
    }
    .icon-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .val { font-size: 24px; font-weight: 700; display: block; }
    .lbl { font-size: 12px; opacity: 0.6; font-weight: 500; }

    .controls-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
    .btn { 
      background: rgba(255,255,255,0.1); 
      padding: 15px 10px; 
      border-radius: 22px; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
      cursor: pointer; 
      border: 1px solid rgba(255,255,255,0.05); 
    }
    .btn-icon-bg { 
      width: 45px; height: 45px; 
      background: rgba(255,255,255,0.1); 
      border-radius: 50%; 
      display: flex; align-items: center; justify-content: center; 
      margin-bottom: 10px;
      transition: 0.3s;
    }
    .btn ha-icon { --mdc-icon-size: 24px; }
    .btn span { font-size: 10px; text-transform: uppercase; font-weight: 700; opacity: 0.8; letter-spacing: 0.5px; }
    
    .btn.on { 
      background: white; 
      color: #1a1a1a; 
      transform: scale(1.05);
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    .btn.on .btn-icon-bg { background: var(--accent-color); color: white; }

    .cam-box { border-radius: 20px; overflow: hidden; margin: 10px 0; border: 2px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .bottom-stats { display: flex; justify-content: center; gap: 25px; font-size: 13px; margin-top: auto; padding-top: 20px; }
    .mini-stat { display: flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); }
    .mini-stat ha-icon { --mdc-icon-size: 16px; color: var(--accent-color); }
  `;
}
customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card",
  name: "SPA Card Premium",
  description: "L'interface ultime pour votre Spa (Glassmorphism & Design Editor).",
});
