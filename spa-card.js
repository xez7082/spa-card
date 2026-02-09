// SPA Card Editor V5 – Drag & Drop, Configurable, HACS Ready
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
      _tab: { type: Number }
    };
  }

  constructor() {
    super();
    this._tab = 0;
  }

  setConfig(config) {
    this._config = { ...config };
  }

  _selectTab(idx) {
    this._tab = idx;
    this.requestUpdate();
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true, composed: true,
    }));
  }

  render() {
    if(!this.hass || !this._config) return html``;

    const tabs = ["Général","Boutons","Sondes","Caméra","Chimie"];
    const c = this._config;

    // Générer un tableau simple de champs configurables pour chaque onglet
    const schemas = [
      [
        { name:"card_title", label:"Titre", selector:{ text:{} } },
        { name:"background_image", label:"Image fond (URL)", selector:{ text:{} } },
        { name:"card_height_v", label:"Hauteur carte (%)", selector:{ number:{ min:20,max:100,mode:"slider" } } }
      ],
      Array.from({length:8},(_,i)=>[
        { name:`switch_${i+1}_label`, label:`B${i+1} Label`, selector:{ text:{} } },
        { name:`switch_${i+1}_entity`, label:`B${i+1} Entité`, selector:{ entity:{} } },
        { name:`switch_${i+1}_icon`, label:`B${i+1} Icone`, selector:{ icon:{} } }
      ]).flat(),
      [
        { name:"entity_water_temp", label:"Eau", selector:{ entity:{} } },
        { name:"entity_ambient_temp", label:"Air", selector:{ entity:{} } }
      ],
      [
        { name:"camera_entity", label:"Caméra", selector:{ entity:{ domain:"camera" } } },
        { name:"camera_width", label:"Width px", selector:{ number:{ min:100,max:800 } } },
        { name:"camera_height", label:"Height px", selector:{ number:{ min:100,max:800 } } }
      ],
      [
        { name:"entity_ph", label:"pH", selector:{ entity:{} } },
        { name:"entity_orp", label:"ORP", selector:{ entity:{} } },
        { name:"entity_bromine", label:"Brome", selector:{ entity:{} } }
      ]
    ];

    return html`
      <div class="tabs">
        ${tabs.map((n,i)=>html`<div class="tab ${this._tab===i?'active':''}" @click=${()=>this._selectTab(i)}>${n}</div>`)}
      </div>

      <ha-form
        .hass=${this.hass}
        .data=${c}
        .schema=${schemas[this._tab]}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  static styles = css`
    .tabs { display:flex; flex-wrap:wrap; gap:2px; margin-bottom:8px; }
    .tab { padding:4px 8px; background:#444; color:#fff; border-radius:4px; cursor:pointer; font-size:12px; }
    .tab.active { background:#00f9f9; color:#000; font-weight:bold; }
  `;
}

customElements.define("spa-card-editor", SpaCardEditor);
