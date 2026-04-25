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
      { name: "card_title", label: "Titre du Spa", selector: { text: {} } },
      { 
        name: "design", 
        label: "Réglages Design",
        type: "grid",
        schema: [
          { name: "card_height", label: "Hauteur Carte (ex: 600px)", selector: { text: {} } },
          { name: "text_color", label: "Couleur du texte", selector: { color_rgb: {} } },
          { name: "font_size_title", label: "Taille Titre (ex: 20px)", selector: { text: {} } },
          { name: "font_size_values", label: "Taille Valeurs (ex: 18px)", selector: { text: {} } },
        ]
      },
      { name: "background_image", label: "URL Image de fond", selector: { text: {} } },
      { name: "entity_camera", label: "Caméra", selector: { entity: { domain: "camera" } } },
      {
        name: "sensors",
        label: "Capteurs (Sondes)",
        type: "grid",
        schema: [
          { name: "entity_water_temp", label: "Temp Eau", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ext_temp", label: "Temp Ext", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
          { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } },
          { name: "entity_tds", label: "TDS", selector: { entity: { domain: "sensor" } } },
          { name: "entity_ec", label: "EC", selector: { entity: { domain: "sensor" } } },
        ]
      },
      {
        name: "switches",
        label: "Les 10 Interrupteurs",
        type: "grid",
        schema: Array.from({ length: 10 }, (_, i) => ({
          name: `switch_${i + 1}`,
          label: `Interrupteur ${i + 1}`,
          selector: { entity: {} }
        }))
      }
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
    if (!this.hass || !entityId || !this.hass.states[entityId]) return { state: '--', active: false, icon: 'mdi:help-circle' };
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
    const textColor = c.text_color ? `rgb(${c.text_color.join(',')})` : '#00f9f9';

    return html`
      <ha-card style="height: ${c.card_height || '550px'}; background-image: url('${c.background_image || ''}'); color: ${textColor};">
        <div class="overlay">
          
          <div class="header">
             <div class="ext" style="color:white">EXT: ${this._getState(c.entity_ext_temp).state}°</div>
             <h1 style="font-size: ${c.font_size_title || '20px'}; color: ${textColor};">${c.card_title || 'SPA'}</h1>
          </div>

          <div class="grid-main">
            <div class="cam">
              ${c.entity_camera ? html`<hui-image .hass=${this.hass} .cameraImage=${c.entity_camera} cameraView="live"></hui-image>` : html`<div class="no-cam">Pas de caméra</div>`}
            </div>
            <div class="water">
              <div class="circle" style="border-color: ${textColor}">
                <div class="val" style="color: ${textColor}">${this._getState(c.entity_water_temp).state}</div>
                <div class="unit">°C EAU</div>
              </div>
            </div>
          </div>

          <div class="chem" style="font-size: ${c.font_size_values || '14px'}">
            <div class="c-item">pH: <b>${this._getState(c.entity_ph).state}</b></div>
            <div class="c-item">ORP: <b>${this._getState(c.entity_orp).state}</b></div>
            <div class="c-item">TDS: <b>${this._getState(c.entity_tds).state}</b></div>
          </div>

          <div class="btns">
            ${Array.from({ length: 10 }, (_, i) => {
              const id = c[`switch_${i + 1}`];
              if (!id) return '';
              const s = this._getState(id);
              return html`
                <div class="btn ${s.active ? 'on' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: id})}>
                  <ha-icon icon="${s.icon}"></ha-icon>
                </div>
              `;
            })}
          </div>

        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { background-size: cover; border-radius: 20px; overflow: hidden; transition: all 0.3s; }
    .overlay { height: 100%; background: rgba(0,0,0,0.65); display: flex; flex-direction: column; padding: 15px; box-sizing: border-box; backdrop-filter: blur(2px); }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .header h1 { margin: 0; font-weight: 200; letter-spacing: 2px; }
    .ext { font-size: 12px; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 10px; }
    .grid-main { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex-grow: 1; align-items: center; }
    .cam { height: 140px; background: #000; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
    .no-cam { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 10px; opacity: 0.5; color: white; }
    .circle { width: 110px; height: 110px; border-radius: 50%; border: 2px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: auto; background: rgba(0,0,0,0.3); }
    .val { font-size: 38px; }
    .unit { font-size: 9px; color: white; opacity: 0.6; }
    .chem { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 10px 0; }
    .c-item { background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
    .btns { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: auto; }
    .btn { height: 45px; border-radius: 12px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); transition: 0.2s; color: white; }
    .btn.on { background: rgba(0,249,249,0.2); border-color: inherit; color: inherit; box-shadow: 0 0 10px rgba(0,249,249,0.2); }
    ha-icon { --mdc-icon-size: 22px; }
  `;
}
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "Spa Master PRO", preview: true });
