import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- EDITEUR ---
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
      { name: "card_title", label: "Titre", selector: { text: {} } },
      { name: "background_image", label: "URL Image", selector: { text: {} } },
      { name: "entity_water_temp", label: "Temp Eau", selector: { entity: { domain: "sensor" } } },
      { name: "entity_ext_temp", label: "Temp Ext", selector: { entity: { domain: "sensor" } } },
      { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
      { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
      { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
      { name: "switch_1", label: "Bouton 1", selector: { entity: {} } },
      { name: "switch_2", label: "Bouton 2", selector: { entity: {} } }
    ];
    return html`<div style="padding:20px;"><ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form></div>`;
  }
}
customElements.define("spa-card-editor", SpaCardEditor);

// --- CARTE ---
class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }

  _getState(entityId) {
    if (!this.hass || !entityId || !this.hass.states[entityId]) return { state: 'N/A', active: false, icon: 'mdi:alert-circle-outline' };
    const s = this.hass.states[entityId];
    return { 
      state: s.state, 
      active: !['off', 'unavailable', 'unknown'].includes(s.state.toLowerCase()),
      icon: s.attributes.icon || 'mdi:power'
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="background-image: url('${c.background_image || ''}');">
        <div class="overlay">
          
          <div class="header">
             <div class="ext">EXT: ${this._getState(c.entity_ext_temp).state}°</div>
             <h1>${c.card_title || 'SPA'}</h1>
          </div>

          <div class="grid-main">
            <div class="cam">
              ${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : html`<div class="no-cam">Pas de caméra</div>`}
            </div>
            
            <div class="water">
              <div class="circle">
                <div class="val">${this._getState(c.entity_water_temp).state}</div>
                <div class="unit">°C EAU</div>
              </div>
            </div>
          </div>

          <div class="chem">
            <div class="c-item">pH: ${this._getState(c.entity_ph).state}</div>
            <div class="c-item">ORP: ${this._getState(c.entity_orp).state}</div>
          </div>

          <div class="btns">
            ${[c.switch_1, c.switch_2].map(id => id ? html`
              <div class="btn ${this._getState(id).active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: id})}>
                <ha-icon icon="${this._getState(id).icon}"></ha-icon>
              </div>
            ` : '')}
          </div>

        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { height: 500px; background-size: cover; border-radius: 20px; overflow: hidden; color: white; }
    .overlay { height: 100%; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; padding: 15px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .header h1 { font-size: 18px; margin: 0; color: #00f9f9; }
    .ext { font-size: 12px; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 10px; }
    .grid-main { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex-grow: 1; align-items: center; }
    .cam { height: 150px; background: #111; border-radius: 10px; overflow: hidden; border: 1px solid #333; }
    .no-cam { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 10px; opacity: 0.5; }
    .circle { width: 120px; height: 120px; border-radius: 50%; border: 2px solid #00f9f9; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: auto; }
    .val { font-size: 40px; color: #00f9f9; }
    .unit { font-size: 10px; }
    .chem { display: flex; gap: 10px; margin: 15px 0; }
    .c-item { flex: 1; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; text-align: center; }
    .btns { display: flex; justify-content: center; gap: 20px; }
    .btn { width: 60px; height: 60px; border-radius: 15px; background: #222; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #444; }
    .btn.on { background: rgba(0,249,249,0.2); border-color: #00f9f9; color: #00f9f9; }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master V3", preview: true });
