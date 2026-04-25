import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR DE CONFIGURATION ---
class SpaCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const config = { ...this._config, ...ev.detail.value };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true, composed: true
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const schema = [
      { name: "card_title", label: "Nom du Spa", selector: { text: {} } },
      { name: "background_image", label: "URL Image de fond", selector: { text: {} } },
      {
        name: "entities",
        type: "grid",
        schema: [
          { name: "entity_water_temp", label: "Température Eau (Tuya)", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ext_temp", label: "Température Extérieure", selector: { entity: { domain: "sensor" } } },
          { name: "entity_camera", label: "Caméra Spa", selector: { entity: { domain: "camera" } } },
          { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "Capteur ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_tds", label: "Capteur TDS", selector: { entity: { domain: "sensor" } } },
        ]
      },
      {
        name: "switches",
        label: "Contrôles (Interrupteurs)",
        type: "grid",
        schema: [
          { name: "switch_1", label: "Interrupteur 1", selector: { entity: { domain: ["switch", "light"] } } },
          { name: "switch_2", label: "Interrupteur 2", selector: { entity: { domain: ["switch", "light"] } } },
          { name: "switch_3", label: "Interrupteur 3", selector: { entity: { domain: ["switch", "light"] } } },
          { name: "switch_4", label: "Interrupteur 4", selector: { entity: { domain: ["switch", "light"] } } },
        ]
      }
    ];

    return html`
      <div style="padding: 20px;">
        <ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form>
      </div>
    `;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- CARTE PRINCIPALE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }

  setConfig(config) { this.config = config; }

  _getState(entityId) {
    if (!this.hass || !entityId || !this.hass.states[entityId]) return { state: '--', active: false };
    const s = this.hass.states[entityId];
    return { 
      state: s.state, 
      active: !['off', 'unavailable', 'unknown'].includes(s.state.toLowerCase()),
      icon: s.attributes.icon
    };
  }

  _toggle(entityId) {
    this.hass.callService("homeassistant", "toggle", { entity_id: entityId });
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="background-image: url('${c.background_image}');">
        <div class="overlay">
          
          <div class="top-bar">
            <div class="ext-temp">
              <ha-icon icon="mdi:thermometer"></ha-icon>
              <span>EXT: ${this._getState(c.entity_ext_temp).state}°C</span>
            </div>
            <h1>${c.card_title || 'SPA CONTROL'}</h1>
          </div>

          <div class="content-layout">
            ${c.entity_camera ? html`
              <div class="camera-container">
                <hui-image 
                  .hass=${this.hass} 
                  .cameraImage=${c.entity_camera} 
                  cameraView="live">
                </hui-image>
              </div>
            ` : ''}

            <div class="water-temp-box">
              <div class="circle">
                <span class="val">${this._getState(c.entity_water_temp).state}</span>
                <span class="unit">°C EAU</span>
              </div>
            </div>
          </div>

          <div class="chem-grid">
            <div class="chem-item"><span>pH</span> <b>${this._getState(c.entity_ph).state}</b></div>
            <div class="chem-item"><span>ORP</span> <b>${this._getState(c.entity_orp).state} mV</b></div>
            <div class="chem-item"><span>TDS</span> <b>${this._getState(c.entity_tds).state}</b></div>
          </div>

          <div class="switch-row">
            ${[c.switch_1, c.switch_2, c.switch_3, c.switch_4].map(ent => {
              if (!ent) return '';
              const s = this._getState(ent);
              return html`
                <div class="sw-btn ${s.active ? 'on' : ''}" @click=${() => this._toggle(ent)}>
                  <ha-icon icon="${s.icon || 'mdi:power'}"></ha-icon>
                </div>
              `;
            })}
          </div>

        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { height: 550px; background-size: cover; border-radius: 24px; overflow: hidden; color: white; position: relative; }
    .overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%); backdrop-filter: blur(2px); display: flex; flex-direction: column; padding: 15px; box-sizing: border-box; }
    
    .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .ext-temp { background: rgba(0,0,0,0.5); padding: 5px 12px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 5px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { font-size: 18px; font-weight: 300; letter-spacing: 2px; color: #00f9f9; margin: 0; }

    .content-layout { flex-grow: 1; display: grid; grid-template-columns: 1.2fr 1fr; gap: 15px; align-items: center; }
    
    .camera-container { border-radius: 15px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); height: 160px; background: black; }
    hui-image { width: 100%; height: 100%; object-fit: cover; }

    .circle { width: 130px; height: 130px; border-radius: 50%; border: 2px solid #00f9f9; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); margin: auto; box-shadow: 0 0 20px rgba(0,249,249,0.2); }
    .val { font-size: 45px; color: #00f9f9; font-weight: 100; }
    .unit { font-size: 10px; opacity: 0.6; }

    .chem-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
    .chem-item { background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px; text-align: center; font-size: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .chem-item span { display: block; font-size: 9px; opacity: 0.6; margin-bottom: 3px; }
    .chem-item b { color: #00f9f9; }

    .switch-row { display: flex; justify-content: space-around; gap: 10px; margin-top: 10px; }
    .sw-btn { width: 55px; height: 55px; border-radius: 18px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
    .sw-btn.on { background: rgba(0,249,249,0.2); border-color: #00f9f9; color: #00f9f9; box-shadow: 0 0 15px rgba(0,249,249,0.3); }
    .sw-btn ha-icon { --mdc-icon-size: 28px; }
  `;
}
customElements.define("spa-card", SpaCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master Complete", preview: true });
