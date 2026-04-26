import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {}, _tab: { type: String } }; }
  constructor() { super(); this._tab = 'home'; }
  setConfig(config) { this.config = config; }

  _get(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].state : '--'; }
  _getUnit(id) { return (this.hass && id && this.hass.states[id]) ? this.hass.states[id].attributes.unit_of_measurement || '' : ''; }

  _renderTab() {
    const c = this.config;
    if (this._tab === 'home') {
        const valW = parseFloat(this._get(c.entity_water_temp));
        const isAlert = (c.max_temp && valW > c.max_temp) || (c.min_temp && valW < c.min_temp);
        return html`
          <div class="home-view">
            <div class="main-display">
                <div class="side-info left">
                    <div class="val-big">${this._get(c.entity_ext_temp)}°</div>
                    <div class="label-tiny">EXTÉRIEUR</div>
                    <div class="hum-pill">${this._get(c.entity_ext_hum)}% HR</div>
                </div>

                <div class="center-gauge">
                    <div class="outer-ring ${isAlert ? 'alert' : ''}"></div>
                    <div class="inner-circle">
                        <span class="water-label">TEMP EAU</span>
                        <span class="water-val">${valW || '--'}</span>
                        <span class="water-unit">°CELSIUS</span>
                    </div>
                </div>

                <div class="side-info right">
                    <div class="val-big">${this._get(c.entity_spa_air_temp)}°</div>
                    <div class="label-tiny">AIR SPA</div>
                    <div class="hum-pill">${this._get(c.entity_spa_hum)}% HR</div>
                </div>
            </div>

            <div class="energy-card">
                <div class="energy-icon"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div>
                <div class="energy-details">
                    <div class="energy-val">${this._get(c.main_cons_entity)} <small>${this._getUnit(c.main_cons_entity)}</small></div>
                    <div class="energy-label">PUISSANCE ABSORBÉE</div>
                </div>
            </div>
          </div>`;
    }
    
    if (this._tab === 'chem') {
        const s = [
            { n: 'pH', v: this._get(c.entity_ph), min: c.min_ph, max: c.max_ph, i: 'mdi:flask-outline' },
            { n: 'ORP', v: this._get(c.entity_orp), u: 'mV', min: c.min_orp, max: c.max_orp, i: 'mdi:bolt' },
            { n: 'TDS', v: this._get(c.entity_tds), u: 'ppm', min: c.min_tds, max: c.max_tds, i: 'mdi:water-check' },
            { n: 'SEL', v: this._get(c.entity_salt), u: 'ppm', min: c.min_salt, max: c.max_salt, i: 'mdi:shaker-outline' }
        ];
        return html`<div class="glass-grid">${s.map(item => html`
            <div class="glass-card">
                <ha-icon icon="${item.i}"></ha-icon>
                <div class="g-val">${item.v}</div>
                <div class="g-label">${item.n}</div>
                <div class="g-range">${item.min||'--'} | ${item.max||'--'}</div>
            </div>
        `)}</div>`;
    }

    if (this._tab === 'sw') {
        return html`<div class="sw-grid-elegant">${Array.from({length:9},(_,i)=>{
            const id = c[`switch_${i+1}`]; if(!id) return '';
            const on = this.hass.states[id]?.state === 'on';
            return html`
              <div class="sw-btn ${on?'on':''}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:id})}>
                <ha-icon icon="mdi:power"></ha-icon>
                <span>${c[`name_switch_${i+1}`] || 'Bouton'}</span>
              </div>`;
        })}</div>`;
    }
  }

  render() {
    const c = this.config;
    return html`
      <ha-card>
        <div class="bg" style="background-image: url('${c.background_image || '/local/sparond2.png'}');">
            <div class="glass-overlay">
                <div class="card-header">${c.card_title || 'MY SPA'}</div>
                <div class="content">${this._renderTab()}</div>
                <div class="navbar">
                    <ha-icon class="${this._tab==='home'?'active':''}" icon="mdi:home-variant" @click=${()=>this._tab='home'}></ha-icon>
                    <ha-icon class="${this._tab==='chem'?'active':''}" icon="mdi:flask-round-bottom" @click=${()=>this._tab='chem'}></ha-icon>
                    <ha-icon class="${this._tab==='sw'?'active':''}" icon="mdi:tune-vertical" @click=${()=>this._tab='sw'}></ha-icon>
                </div>
            </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host { --accent: #00f9f9; --glass: rgba(255, 255, 255, 0.05); }
    ha-card { border-radius: 30px; overflow: hidden; border: none; background: #000; color: #fff; font-family: 'Roboto', sans-serif; }
    .bg { background-size: cover; background-position: center; height: 580px; transition: 0.5s; }
    .glass-overlay { height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%); backdrop-filter: blur(8px); display: flex; flex-direction: column; padding: 25px; box-sizing: border-box; }
    
    .card-header { text-align: center; font-weight: 200; letter-spacing: 6px; font-size: 14px; margin-bottom: 20px; opacity: 0.7; }
    .content { flex: 1; display: flex; align-items: center; justify-content: center; }

    /* HOME VIEW - LUXURY GAUGE */
    .main-display { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 30px; }
    .side-info { flex: 1; text-align: center; }
    .val-big { font-size: 28px; font-weight: 200; }
    .label-tiny { font-size: 8px; letter-spacing: 2px; opacity: 0.4; margin: 4px 0; }
    .hum-pill { font-size: 10px; background: var(--glass); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); }

    .center-gauge { position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; }
    .outer-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid transparent; border-top: 2px solid var(--accent); border-bottom: 2px solid var(--accent); animation: rotate 4s linear infinite; opacity: 0.5; }
    .outer-ring.alert { border-color: #ff4b4b; box-shadow: 0 0 20px #ff4b4b; }
    .inner-circle { width: 130px; height: 130px; background: rgba(255,255,255,0.03); border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 0 20px rgba(0,249,249,0.05); }
    .water-label { font-size: 8px; letter-spacing: 3px; opacity: 0.5; }
    .water-val { font-size: 50px; font-weight: 100; color: var(--accent); text-shadow: 0 0 15px rgba(0,249,249,0.3); }
    .water-unit { font-size: 8px; opacity: 0.3; }

    /* ENERGY CARD */
    .energy-card { background: var(--glass); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 15px 25px; display: flex; align-items: center; gap: 20px; width: 80%; }
    .energy-icon ha-icon { --mdc-icon-size: 30px; color: var(--accent); filter: drop-shadow(0 0 5px var(--accent)); }
    .energy-val { font-size: 20px; font-weight: 300; }
    .energy-val small { font-size: 12px; opacity: 0.5; }
    .energy-label { font-size: 9px; letter-spacing: 1px; opacity: 0.4; }

    /* CHEMISTRY GRID */
    .glass-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; width: 100%; }
    .glass-card { background: var(--glass); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 20px; text-align: center; }
    .glass-card ha-icon { --mdc-icon-size: 20px; color: var(--accent); margin-bottom: 8px; }
    .g-val { font-size: 22px; font-weight: 200; color: var(--accent); }
    .g-label { font-size: 9px; letter-spacing: 1px; opacity: 0.5; }
    .g-range { font-size: 8px; opacity: 0.2; margin-top: 5px; }

    /* SWITCHES */
    .sw-grid-elegant { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; }
    .sw-btn { background: var(--glass); border: 1px solid rgba(255,255,255,0.1); padding: 15px 5px; border-radius: 15px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: 0.3s; }
    .sw-btn ha-icon { --mdc-icon-size: 20px; opacity: 0.3; }
    .sw-btn span { font-size: 9px; opacity: 0.6; text-transform: uppercase; }
    .sw-btn.on { background: rgba(0,249,249,0.1); border-color: var(--accent); }
    .sw-btn.on ha-icon { opacity: 1; color: var(--accent); filter: drop-shadow(0 0 5px var(--accent)); }

    /* NAVBAR */
    .navbar { display: flex; justify-content: space-around; margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); }
    .navbar ha-icon { cursor: pointer; opacity: 0.3; transition: 0.3s; --mdc-icon-size: 26px; }
    .navbar ha-icon.active { opacity: 1; color: var(--accent); filter: drop-shadow(0 0 8px var(--accent)); }

    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;
}
customElements.define("spa-card", SpaCard);
