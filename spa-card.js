/**
 * SPA CARD PREMIUM V5 - CONFIGURATION COMPLÈTE
 */

// Importation hybride pour éviter l'erreur "ReferenceError"
const lit = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const { LitElement, html, css } = lit.prototype ? { 
  LitElement: lit, 
  html: lit.html, 
  css: lit.css 
} : await import("https://unpkg.com/lit-element@2.4.0/lit-element.js?module");

console.info("%c 🫧 SPA CARD V5 %c READY ", "color: white; background: #00d2ff; font-weight: 700;", "color: #00d2ff; background: white; font-weight: 700;");

/**
 * LA CARTE PRINCIPALE
 */
class SpaCardV5 extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }

  setConfig(config) {
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="height: ${c.card_height_v || 70}vh; background-image: url('${c.background_image}');">
        <div class="glass-container">
          
          <div class="top-bar">
             <h1>${c.card_title || "Wellness Center"}</h1>
             <div class="status-badge">
               <span class="dot pulse"></span> Connecté
             </div>
          </div>

          <div class="main-sensors">
            ${this._renderSensor(c.entity_water_temp, "Eau", "mdi:thermometer-water", "#00d2ff", true)}
            ${this._renderSensor(c.entity_ambient_temp, "Air", "mdi:weather-windy", "#ff9a9e", false)}
          </div>

          <div class="controls-grid">
            ${Array.from({ length: 8 }).map((_, i) => {
              const eid = c[`switch_${i+1}_entity`];
              return eid ? this._renderBtn(eid, c[`switch_${i+1}_label`] || `B${i+1}`, c[`switch_${i+1}_icon`]) : "";
            })}
          </div>

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
    return s ? html`<div class="mini-stat"><ha-icon icon="${icon}"></ha-icon> <strong>${label}:</strong> ${s.state}</div>` : "";
  }

  static styles = css`
    :host { --accent-color: #00f9f9; }
    ha-card { background-size: cover; background-position: center; border-radius: 28px; overflow: hidden; color: white; border: none; }
    
    .glass-container { 
      height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%); 
      backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); padding: 24px; display: flex; flex-direction: column;
    }
    
    h1 { font-size: 22px; font-weight: 300; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    
    .status-badge { font-size: 10px; background: rgba(76, 175, 80, 0.2); color: #81c784; padding: 4px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(76, 175, 80, 0.3); }
    .dot { width: 6px; height: 6px; background: #4caf50; border-radius: 50%; }

    .pulse { animation: pulse-green 2s infinite; }
    @keyframes pulse-green {
      0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(76, 175, 80, 0); }
      100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }

    .main-sensors { display: flex; gap: 15px; margin: 25px 0; }
    .sensor-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 20px; flex: 1; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .icon-circle { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    
    .breathe { animation: breathe 3s ease-in-out infinite; }
    @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

    .val { font-size: 22px; font-weight: 700; }
    .lbl { font-size: 10px; opacity: 0.6; text-transform: uppercase; display: block; }

    .controls-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .btn { background: rgba(255,255,255,0.08); padding: 12px 5px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; transition: 0.3s; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); }
    .btn.on { background: white; color: #1a1a1a; transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.4); }
    
    .active-anim { animation: rotate-gentle 4s linear infinite; }
    @keyframes rotate-gentle { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .btn-icon-bg { width: 38px; height: 38px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; }
    .btn.on .btn-icon-bg { background: var(--accent-color); color: white; }
    .btn span { font-size: 9px; font-weight: bold; text-transform: uppercase; }

    .bottom-stats { display: flex; justify-content: center; gap: 20px; font-size: 11px; margin-top: auto; padding-top: 15px; }
    .mini-stat { display: flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 10px; }
    .mini-stat ha-icon { --mdc-icon-size: 12px; color: var(--accent-color); }
  `;
}

// Enregistrement sécurisé
if (!customElements.get("spa-card-v5")) {
  customElements.define("spa-card-v5", SpaCardV5);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "spa-card-v5",
  name: "SPA Card V5",
  description: "Version stable et animée."
});
