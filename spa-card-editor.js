import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCard extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }
  
  setConfig(config) { this.config = config; }

  _getState(id) {
    if (!this.hass || !id || !this.hass.states[id]) return { val: '?', unit: '' };
    const s = this.hass.states[id];
    const val = parseFloat(s.state);
    return { 
      val: !isNaN(val) ? val.toFixed(1) : s.state, 
      unit: s.attributes.unit_of_measurement || '' 
    };
  }

  // Logique de couleur spécifique au Brome et Intex
  _getColor(type, value) {
    const v = parseFloat(value);
    if (isNaN(v)) return '#00f9f9';
    switch (type) {
      case 'ph': return (v >= 7.2 && v <= 7.6) ? '#00ff88' : '#ff4d4d';
      case 'orp': return (v >= 650) ? '#00ff88' : '#ffcc00';
      case 'tds': return (v < 2000) ? '#00ff88' : '#ffcc00';
      default: return '#00f9f9';
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card style="background-image: url('${c.background_image}');">
        <div class="glass-overlay">
          
          <div class="header">
            <h1>${c.card_title || 'SPA INTEX BROME'}</h1>
          </div>

          <div class="temp-section">
            <div class="circle-main">
              <span class="v-temp">${this._getState(c.entity_water_temp).val}</span>
              <span class="u-temp">°C</span>
            </div>
          </div>

          <div class="tuya-grid">
            <div class="measure">
              <span class="m-label">pH</span>
              <span class="m-val" style="color: ${this._getColor('ph', this._getState(c.entity_ph).val)}">${this._getState(c.entity_ph).val}</span>
            </div>
            <div class="measure">
              <span class="m-label">ORP</span>
              <span class="m-val" style="color: ${this._getColor('orp', this._getState(c.entity_orp).val)}">${this._getState(c.entity_orp).val} <small>mV</small></span>
            </div>
            <div class="measure">
              <span class="m-label">TDS</span>
              <span class="m-val" style="color: ${this._getColor('tds', this._getState(c.entity_tds).val)}">${this._getState(c.entity_tds).val}</span>
            </div>
            <div class="measure">
              <span class="m-label">EC</span>
              <span class="m-val">${this._getState(c.entity_ec).val} <small>µs</small></span>
            </div>
          </div>

          <div class="ideal-table">
            <div class="ideal-title">CIBLES IDÉALES</div>
            <div class="ideal-row"><span>pH</span><span>7.2 - 7.6</span></div>
            <div class="ideal-row"><span>Brome (ORP)</span><span>> 650 mV</span></div>
            <div class="ideal-row"><span>TDS</span><span>< 2000 ppm</span></div>
          </div>

        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { height: 520px; background-size: cover; border-radius: 25px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.2); }
    .glass-overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%); backdrop-filter: blur(3px); padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; }
    
    .header h1 { color: #00f9f9; font-weight: 300; letter-spacing: 3px; text-align: center; font-size: 18px; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
    
    .temp-section { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
    .circle-main { width: 160px; height: 160px; border-radius: 50%; border: 2px solid rgba(0,249,249,0.3); background: rgba(0,0,0,0.4); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(0,0,0,0.6); }
    .v-temp { font-size: 58px; font-weight: 200; color: #00f9f9; }
    .u-temp { font-size: 16px; opacity: 0.6; color: white; margin-top: -10px; }

    .tuya-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px; }
    .measure { background: rgba(255,255,255,0.08); padding: 12px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); text-align: center; }
    .m-label { display: block; font-size: 10px; opacity: 0.6; text-transform: uppercase; margin-bottom: 5px; }
    .m-val { font-size: 18px; font-weight: bold; }
    small { font-size: 10px; font-weight: normal; }

    .ideal-table { background: rgba(0, 255, 136, 0.05); border: 1px dashed rgba(0, 255, 136, 0.2); border-radius: 15px; padding: 10px; }
    .ideal-title { font-size: 9px; font-weight: 900; color: #00ff88; margin-bottom: 5px; text-align: center; }
    .ideal-row { display: flex; justify-content: space-between; font-size: 11px; color: white; opacity: 0.8; padding: 2px 0; }
  `;
}

customElements.define("spa-card", SpaCard);
