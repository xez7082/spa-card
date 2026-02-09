import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {}, _tab: { type: Number } };
  }

  constructor() { super(); this._tab = 0; }
  setConfig(config) { this._config = config; }

  _selectTab(idx) { this._tab = idx; }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true, composed: true,
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const tabs = [
      {label: "Général", icon: "mdi:cog"},
      {label: "Boutons", icon: "mdi:remote"},
      {label: "Sondes", icon: "mdi:thermometer"},
      {label: "Caméra", icon: "mdi:camera"},
      {label: "Chimie", icon: "mdi:flask"}
    ];

    const schemas = [
      [{ name: "card_title", label: "Nom du Spa", selector: { text: {} } },
       { name: "background_image", label: "Image (URL)", selector: { text: {} } },
       { name: "card_height_v", label: "Hauteur (%)", selector: { number: { min: 20, max: 100, mode: "slider" } } }],
      Array.from({ length: 8 }, (_, i) => [
        { name: `switch_${i+1}_label`, label: `Nom B${i+1}`, selector: { text: {} } },
        { name: `switch_${i+1}_entity`, label: `Entité B${i+1}`, selector: { entity: { domain: ["switch", "light", "input_boolean"] } } },
        { name: `switch_${i+1}_icon`, label: `Icône B${i+1}`, selector: { icon: {} } }
      ]).flat(),
      [{ name: "entity_water_temp", label: "Eau", selector: { entity: { domain: "sensor" } } },
       { name: "entity_ambient_temp", label: "Air", selector: { entity: { domain: "sensor" } } }],
      [{ name: "camera_entity", label: "Caméra", selector: { entity: { domain: "camera" } } }],
      [{ name: "entity_ph", label: "pH", selector: { entity: { domain: "sensor" } } },
       { name: "entity_orp", label: "ORP", selector: { entity: { domain: "sensor" } } }]
    ];

    return html`
      <div class="nav">
        ${tabs.map((t, i) => html`
          <div class="nav-item ${this._tab === i ? 'active' : ''}" @click=${() => this._selectTab(i)}>
            <ha-icon icon="${t.icon}"></ha-icon>
            <span>${t.label}</span>
          </div>
        `)}
      </div>
      <div class="content">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${schemas[this._tab]}
          .computeLabel=${(s) => s.label}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }

  static styles = css`
    .nav { display: flex; justify-content: space-between; background: var(--card-background-color); padding: 8px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--divider-color); }
    .nav-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 8px; flex: 1; border-radius: 8px; transition: 0.3s; color: var(--secondary-text-color); }
    .nav-item ha-icon { --mdc-icon-size: 20px; margin-bottom: 4px; }
    .nav-item span { font-size: 10px; font-weight: 500; }
    .nav-item.active { background: var(--primary-color); color: white; }
    .content { padding: 4px; animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `;
}
customElements.define("spa-card-editor", SpaCardEditor);
