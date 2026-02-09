// SPA Card V3 FIXED – compatible Home Assistant (no external CDN imports)
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCard extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  setConfig(config) {
    this.config = {
      title: "SPA",
      ...config,
    };
  }

  /* ---------- SAFE STATE ---------- */

  _state(id) {
    const s = this.hass?.states?.[id];
    if (!s) return { v: "?", u: "", on: false, icon: "mdi:help" };

    const raw = parseFloat(s.state);
    const v = isNaN(raw) ? s.state : raw.toFixed(1);
    const u = s.attributes.unit_of_measurement || "";
    const on = !["off", "unknown", "unavailable"].includes(s.state);

    return { v, u, on, icon: s.attributes.icon };
  }

  _toggle(e) {
    this.hass.callService("homeassistant", "toggle", { entity_id: e });
  }

  /* ---------- MODULES ---------- */

  _renderTemps(c) {
    const water = this._state(c.water);
    const air = this._state(c.air);

    return html`
      <div class="panel">
        <div class="h">Températures</div>
        <div>Eau <b>${water.v}${water.u}</b></div>
        <div>Air <b>${air.v}${air.u}</b></div>
      </div>
    `;
  }

  _renderChem(c) {
    const ph = this._state(c.ph);
    const orp = this._state(c.orp);
    const br = this._state(c.br);

    return html`
      <div class="panel">
        <div class="h">Chimie</div>
        <div>pH <b>${ph.v}</b></div>
        <div>ORP <b>${orp.v} mV</b></div>
        <div>Brome <b>${br.v}</b></div>
      </div>
    `;
  }

  _renderCamera(c) {
    if (!c.camera) return "";

    return html`
      <div class="panel cam">
        <hui-image .hass=${this.hass} .cameraImage=${c.camera} cameraView="live"></hui-image>
      </div>
    `;
  }

  _renderButtons(c) {
    return html`
      <div class="buttons panel">
        ${[1, 2, 3, 4].map((i) => {
          const e = c[`switch_${i}`];
          if (!e) return "";
          const s = this._state(e);

          return html`
            <div class="btn ${s.on ? "on" : ""}" @click=${() => this._toggle(e)}>
              <ha-icon icon="${s.icon}"></ha-icon>
            </div>
          `;
        })}
      </div>
    `;
  }

  /* ---------- MAIN ---------- */

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    return html`
      <ha-card>
        <div class="title">${c.title}</div>

        ${this._renderTemps(c)}
        ${this._renderChem(c)}
        ${this._renderButtons(c)}
        ${this._renderCamera(c)}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      position: relative;
      border-radius: 26px;
      padding: 16px;
      overflow: hidden;
      backdrop-filter: blur(20px);
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.18), rgba(0, 0, 0, 0.7));
      border: 1px solid rgba(0, 255, 255, 0.35);
      box-shadow: 0 0 25px rgba(0, 255, 255, 0.25);
      color: white;
    }

    .title {
      font-size: 22px;
      font-weight: 900;
      margin-bottom: 8px;
      text-shadow: 0 0 12px cyan, 0 0 24px cyan;
    }

    .panel {
      border-radius: 18px;
      padding: 12px;
      margin-top: 10px;
      backdrop-filter: blur(14px);
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(0, 255, 255, 0.35);
      box-shadow: 0 0 12px rgba(0, 255, 255, 0.25);
    }

    .buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .btn {
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.4);
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .btn.on {
      background: rgba(0, 255, 255, 0.3);
      box-shadow: 0 0 14px cyan, inset 0 0 10px rgba(255, 255, 255, 0.25);
      animation: glow 2s infinite alternate;
    }

    @keyframes glow {
      from { box-shadow: 0 0 6px cyan; }
      to { box-shadow: 0 0 18px cyan; }
    }

    .cam hui-image {
      width: 100%;
      height: 180px;
      border-radius: 12px;
      object-fit: cover;
    }

    @media (max-width: 600px) {
      .buttons { grid-template-columns: repeat(2, 1fr); }
      .cam hui-image { height: 140px; }
    }
  `;
}

customElements.define("spa-card", SpaCard);

console.info("SPA-CARD V3 FIXED loaded");
