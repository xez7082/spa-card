import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class LuminaSpaEditor extends LitElement {
  static get properties() { return { hass: {}, _config: {} }; }
  setConfig(config) { this._config = config; }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const schema = [
      { name: "card_title", label: "Nom du SPA", selector: { text: {} } },
      { name: "background_image", label: "Image (/local/sparond.png)", selector: { text: {} } },
      { name: "entity_water_temp", label: "Température Eau", selector: { entity: { domain: "sensor" } } },
      { name: "entity_ph", label: "Capteur pH", selector: { entity: { domain: "sensor" } } },
      { name: "entity_bromine", label: "Capteur Brome (ppm)", selector: { entity: { domain: "sensor" } } },
      { name: "entity_alkalinity", label: "Alcalinité (TAC)", selector: { entity: { domain: "sensor" } } },
      { name: "entity_hardness", label: "Dureté (TH)", selector: { entity: { domain: "sensor" } } },
      { name: "pos_temp_x", label: "Position Temp X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_temp_y", label: "Position Temp Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_chem_x", label: "Position Chimie X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
      { name: "pos_chem_y", label: "Position Chimie Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
    ];
    return html`<ha-form .hass=${this.hass} .data=${this._config} .schema=${schema} @value-changed=${this._valueChanged}></ha-form>`;
  }
}

class LuminaSpaCard extends LitElement {
  static getConfigElement() { return document.createElement("lumina-spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }

  _get(ent) {
    if (!this.hass || !ent || !this.hass.states[ent]) return { s: '?', u: '' };
    const o = this.hass.states[ent];
    return { s: (!isNaN(parseFloat(o.state))) ? parseFloat(o.state).toFixed(1) : o.state, u: o.attributes.unit_of_measurement || '' };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    const water = this._get(c.entity_water_temp);
    const ph = this._get(c.entity_ph);
    const br = this._get(c.entity_bromine);
    const alk = this._get(c.entity_alkalinity);
    const hard = this._get(c.entity_hardness);

    return html`
      <ha-card style="background-image: url('${c.background_image || '/local/sparond.png'}');">
        <div class="header">${c.card_title || 'MON SPA'}</div>

        <div class="glass" style="left:${c.pos_temp_x || 10}%; top:${c.pos_temp_y || 15}%;">
          <div class="titre">EAU</div>
          <div class="row"><ha-icon icon="mdi:thermometer"></ha-icon> ${water.s}${water.u}</div>
        </div>

        <div class="glass" style="left:${c.pos_chem_x || 10}%; top:${c.pos_chem_y || 35}%;">
          <div class="titre">ANALYSE ACTUELLE</div>
          <div class="row"><ha-icon icon="mdi:ph"></ha-icon> pH: ${ph.s}</div>
          <div class="row"><ha-icon icon="mdi:opacity"></ha-icon> Brome: ${br.s}</div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>TEST</th>
                <th>BAS</th>
                <th class="ideal">IDÉAL</th>
                <th>HAUT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dureté</td>
                <td>< 250</td>
                <td class="ideal-val">250-500</td>
                <td>> 1000</td>
              </tr>
              <tr>
                <td>Brome</td>
                <td>< 2.0</td>
                <td class="ideal-val">3.0 - 5.0</td>
                <td>> 10.0</td>
              </tr>
              <tr>
                <td>TAC</td>
                <td>< 80</td>
                <td class="ideal-val">80 - 120</td>
                <td>> 180</td>
              </tr>
              <tr>
                <td>pH</td>
                <td>< 7.2</td>
                <td class="ideal-val">7.2 - 7.8</td>
                <td>> 8.0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { background-size: cover; background-position: center; height: 620px; position: relative; color: white; border-radius: 20px; overflow: hidden; }
    .header { position: absolute; top: 20px; left: 20px; font-weight: 900; font-size: 1.2em; text-shadow: 2px 2px 4px black; color: #00d4ff; text-transform: uppercase; }
    .glass { position: absolute; background: rgba(0,0,0,0.55); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 12px; padding: 10px; border: 1px solid rgba(255,255,255,0.1); min-width: 120px; }
    .titre { font-size: 0.6em; color: #00d4ff; font-weight: 900; letter-spacing: 1px; margin-bottom: 4px; }
    .row { display: flex; align-items: center; gap: 8px; font-size: 0.9em; font-weight: bold; }
    
    /* STYLE DU TABLEAU */
    .table-container { position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(15px); padding: 10px 0; border-top: 2px solid #00d4ff; }
    table { width: 90%; margin: 0 auto; border-collapse: collapse; font-size: 0.75em; text-align: center; }
    th { color: #00d4ff; font-weight: 900; padding-bottom: 5px; text-transform: uppercase; font-size: 0.8em; }
    td { padding: 4px 2px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .ideal { color: #00ff88; text-decoration: underline; }
    .ideal-val { color: #00ff88; font-weight: bold; background: rgba(0,255,136,0.1); border-radius: 4px; }
    ha-icon { --mdc-icon-size: 18px; }
  `;
}

customElements.define("lumina-spa-card-editor", LuminaSpaEditor);
customElements.define("lumina-spa-card", LuminaSpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "lumina-spa-card", name: "Lumina SPA AquaChek", preview: true });
