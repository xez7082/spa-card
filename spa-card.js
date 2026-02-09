// SPA Card V2 PRO – balanced design, editor-ready
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCard extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  static getConfigElement() {
    return document.createElement("spa-card-editor");
  }

  setConfig(config) {
    this.config = config;
  }

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

  _renderButtons(c) {
    return Array.from({ length: 6 }).map((_, i) => {
      const e = c[`switch_${i + 1}`];
      if (!e) return "";
      const s = this._state(e);

      return html`
        <div class="btn ${s.on ? "on" : ""}" @click=${() => this._toggle(e)}>
          <ha-icon icon="${s.icon}" />
          <span>${s.v !== "?" ? s.v : ""}</span>
        </div>
      `;
    });
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;

    const water = this._state(c.water);
    const air = this._state(c.air);

    return html`
      <ha-card>
        <div class="title">${c.title || "SPA"}</div>

        <div class="temps">
          <div>Eau <b>${water.v}${water.u}</b></div>
          <div>Air <b>${air.v}${air.u}</b></div>
        </div>

        <div class="buttons">${this._renderButtons(c)}</div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      border-radius: 24px;
      padding: 16px;
      backdrop-filter: blur(18px);
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(0, 0, 0, 0.6));
      border: 1px solid rgba(0, 255, 255, 0.4);
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.25);
      color: white;
    }

    .title {
      font-size: 22px;
      font-weight: 900;
      text-shadow: 0 0 10px cyan;
      margin-bottom: 10px;
    }

    .temps {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.4);
      transition: 0.25s;
      cursor: pointer;
    }

    .btn.on {
      background: rgba(0, 255, 255, 0.25);
      box-shadow: 0 0 12px cyan;
    }

    ha-icon {
      margin-bottom: 4px;
    }
  `;
}

customElements.define("spa-card", SpaCard);

console.info("SPA-CARD V2 PRO loaded");
