// SPA Card Editor – V4 ULTIMATE
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {}, _tab: { type: Number } };
  }

  constructor() {
    super();
    this._tab = 0;
  }

  setConfig(config) {
    this._config = config;
  }

  _selectTab(idx) {
    this._tab = idx;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: ev.detail.value }, bubbles:true, composed:true }));
  }

  render() {
    if(!this._config || !this.hass) return html``;
    const tabs = ['Général','Boutons','Sondes','Système','Caméra','Cibles'];
    return html`
      <div class="tabs">
        ${tabs.map((n,i)=>html`<div class="tab ${this._tab===i?'active':''}" @click=${()=>this._selectTab(i)}>${n}</div>`)}
      </div>
      <div class="editor">
        <!-- ici on peut insérer un formulaire Lovelace dynamique basé sur ha-form -->
        <ha-form .hass=${this.hass} .data=${this._config} .schema=${this._getSchema(this._tab)} @value-changed=${this._valueChanged}></ha-form>
      </div>
    `;
  }

  _getSchema(tab) {
    const c=this._config;
    const schemas = [
      [ {name:'title', label:'Titre', selector:{text:{}}} ],
      Array.from({length:4},(_,i)=>({name:`switch_${i+1}`, label:`Bouton ${i+1}`, selector:{entity:{}}})),
      [ {name:'water', label:'Eau', selector:{entity:{}}}, {name:'air', label:'Air', selector:{entity:{}}}, {name:'ph', label:'pH', selector:{entity:{}}}, {name:'orp', label:'ORP', selector:{entity:{}}}, {name:'br', label:'Brome', selector:{entity:{}}} ],
      [], // système à étendre si besoin
      [ {name:'camera', label:'Caméra', selector:{entity:{domain:'camera'}}} ],
      [ {name:'positions', label:'Positions Drag & Drop', selector:{text:{}}} ]
    ];
    return schemas[tab] || [];
  }

  static styles = css`
    .tabs { display:flex; gap:4px; margin-bottom:8px; }
    .tab { padding:4px 8px; background:#444; color:#fff; border-radius:4px; cursor:pointer; font-size:12px; }
    .tab.active { background:#00f9f9; color:#000; font-weight:bold; }
    .editor { margin-top:10px; }
  `;
}

customElements.define('spa-card-editor', SpaCardEditor);
console.info('SPA-CARD-EDITOR V4 loaded – drag & drop HACS ready');
