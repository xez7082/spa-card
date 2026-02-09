// On récupère LitElement depuis le moteur interne de Home Assistant s'il existe, sinon on le charge
const LitElement = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace") || {}).prototype?.constructor || class {};
const html = window.litHtml || ((...args) => args);
const css = window.litCss || ((...args) => args);

// --- Début du SPA MASTER ULTIMATE ---

class SpaCardEditor extends LitElement {
  // ... (le reste du code de l'éditeur ne change pas)

  render() {
    if (!this.hass || !this._config) return html``;
    const schemas = [
      [{ name: "card_title", label: "Titre", selector: { text: {} } }, 
       { name: "title_align", label: "Alignement", selector: { select: { options: [{value: "left", label: "Gauche"}, {value: "center", label: "Milieu"}, {value: "right", label: "Droite"}] } } },
       { name: "title_size", label: "Taille Titre (px)", selector: { number: { min: 8, max: 60 } } },
       { name: "card_height_v", label: "Hauteur Carte (% écran)", selector: { number: { min: 20, max: 100, mode: "slider" } } },
       { name: "background_image", label: "Image fond (URL)", selector: { text: {} } }],
      [{ name: "btn_y", label: "Position Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "btn_w", label: "Largeur (%)", selector: { number: { min: 10, max: 100 } } }, 
       { name: "btn_h", label: "Hauteur px", selector: { number: { min: 20, max: 300 } } }, 
       { name: "btn_fs", label: "Taille texte", selector: { number: { min: 6, max: 30 } } },
        ...Array.from({length: 8}, (_, i) => [{ name: `switch_${i+1}_entity`, label: `B${i+1} Entité`, selector: { entity: {} } }, { name: `switch_${i+1}_label`, label: `Nom`, selector: { text: {} } }, { name: `switch_${i+1}_icon`, label: `Icone`, selector: { icon: {} } }]).flat()],
      [{ name: "entity_water_temp", label: "Eau", selector: { entity: {} } }, { name: "entity_ambient_temp", label: "Air", selector: { entity: {} } },
       { name: "temp_fs", label: "Taille texte Temp", selector: { number: { min: 8, max: 40 } } },
       { name: "pos_temp_x", label: "Temp X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_temp_y", label: "Temp Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "temp_w", label: "Temp Largeur", selector: { number: { min: 50, max: 500 } } }, { name: "temp_h", label: "Temp Hauteur", selector: { number: { min: 30, max: 400 } } },
       { name: "entity_ph", label: "pH", selector: { entity: {} } }, { name: "entity_orp", label: "ORP", selector: { entity: {} } }, 
       { name: "entity_bromine", label: "Brome", selector: { entity: {} } }, { name: "entity_alkalinity", label: "TAC", selector: { entity: {} } },
       { name: "chem_fs", label: "Taille texte Chimie", selector: { number: { min: 8, max: 40 } } },
       { name: "pos_chem_x", label: "Chimie X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_chem_y", label: "Chimie Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "chem_w", label: "Chimie Largeur px", selector: { number: { min: 50, max: 600 } } }, { name: "chem_h", label: "Chimie Hauteur px", selector: { number: { min: 50, max: 600 } } }],
      [...Array.from({length: 14}, (_, i) => [{ name: `sys_entity_${i+1}`, label: `Entité ${i+1}`, selector: { entity: {} } }, { name: `sys_label_${i+1}`, label: `Nom`, selector: { text: {} } }, { name: `sys_icon_${i+1}`, label: `Icone`, selector: { icon: {} } }]).flat(),
       { name: "sys_fs", label: "Taille texte", selector: { number: { min: 8, max: 35 } } }, { name: "pos_elec_x", label: "X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_elec_y", label: "Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "sys_w", label: "Largeur px", selector: { number: { min: 100, max: 800 } } }, { name: "sys_h", label: "Hauteur px", selector: { number: { min: 50, max: 800 } } }],
      [{ name: "camera_entity", label: "Caméra", selector: { entity: { domain: "camera" } } }, { name: "pos_cam_x", label: "X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_cam_y", label: "Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "camera_width", label: "W px", selector: { number: { min: 100, max: 800 } } }, { name: "camera_height", label: "H px", selector: { number: { min: 100, max: 800 } } }],
      [{ name: "show_ideal_table", label: "Afficher Cibles?", selector: { boolean: {} } }, { name: "pos_ideal_x", label: "X (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } }, { name: "pos_ideal_y", label: "Y (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
       { name: "ideal_w", label: "W px", selector: { number: { min: 50, max: 500 } } }, { name: "ideal_h", label: "H px", selector: { number: { min: 50, max: 500 } } }, { name: "ideal_fs", label: "Taille texte", selector: { number: { min: 8, max: 35 } } }]
    ];
    const tabs = ["Général", "Boutons", "Sondes", "Système", "Caméra", "Idéal"];
    return html`<div class="tabs">${tabs.map((n, i) => html`<div class="tab ${this._tab === i ? 'active' : ''}" @click=${() => this._selectTab(i)}>${n}</div>`)}</div><ha-form .hass=${this.hass} .data=${this._config} .schema=${schemas[this._tab]} @value-changed=${this._valueChanged}></ha-form>`;
  }
  static styles = css`.tabs{display:flex;flex-wrap:wrap;gap:2px;margin-bottom:8px}.tab{padding:4px 8px;background:#444;color:#fff;border-radius:4px;cursor:pointer;font-size:10px}.tab.active{background:#00f9f9;color:#000;font-weight:bold}`;
}

class SpaCard extends LitElement {
  static getConfigElement() { return document.createElement("spa-card-editor"); }
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }
  
  _getState(id, icon) {
    if (!this.hass || !id || !this.hass.states[id]) return { val: '?', unit: '', active: false, icon: icon || 'mdi:help-circle' };
    const s = this.hass.states[id];
    const rawVal = parseFloat(s.state);
    const val = !isNaN(rawVal) ? rawVal.toFixed(1) : s.state;
    const unit = s.attributes.unit_of_measurement || '';
    const isPower = unit.toLowerCase().includes('w') || unit.toLowerCase().includes('a');
    const consuming = isPower && rawVal > 0.5;
    return { val, unit, icon: icon || s.attributes.icon, active: consuming || !['off', 'unavailable', 'unknown', 'standby'].includes(s.state.toLowerCase()), consuming };
  }

  _getChemColor(type, value) {
    const v = parseFloat(value);
    if (isNaN(v)) return '#00f9f9';
    if (type === 'ph') return (v < 7.2 || v > 7.6) ? '#ff4d4d' : '#00f9f9';
    if (type === 'orp') return (v < 650) ? '#ff4d4d' : '#00f9f9';
    if (type === 'br') return (v < 3.0 || v > 5.0) ? '#ff4d4d' : '#00f9f9';
    return '#00f9f9';
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    
    // Valeurs par défaut pour éviter que les blocs soient invisibles à 0px
    const sys = [];
    for (let i = 1; i <= 14; i++) {
      if (c[`sys_entity_${i}`]) {
        const s = this._getState(c[`sys_entity_${i}`], c[`sys_icon_${i}`]);
        sys.push(html`
          <div class="sys-i" style="font-size:${c.sys_fs || 12}px;">
            <ha-icon icon="${s.icon}" class="${s.consuming ? 'power-on' : (s.active ? 'n' : '')}" style="--mdc-icon-size:${(c.sys_fs || 12)*1.3}px"></ha-icon>
            <span style="${s.consuming ? 'color:#ffcc00; font-weight:bold;' : ''}">${c[`sys_label_${i}`] || ''}: ${s.val}${s.unit}</span>
          </div>`);
      }
    }

    return html`
      <ha-card style="background-image: url('${c.background_image}'); height: ${c.card_height_v || 80}vh;">
        <div class="t" style="font-size:${c.title_size || 20}px; left:20px;">${c.card_title || 'SPA CONTROL'}</div>
        
        <div class="btns-g" style="width:${c.btn_w || 98}%; height:${c.btn_h || 80}px; top:${c.btn_y || 15}%;">
          ${Array.from({length: 8}).map((_, i) => c[`switch_${i+1}_entity`] ? html`
            <div class="sw ${this._getState(c[`switch_${i+1}_entity`]).active ? 'on' : ''}" style="font-size:${c.btn_fs || 10}px;" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: c[`switch_${i+1}_entity`]})}>
              <ha-icon icon="${c[`switch_${i+1}_icon`] || 'mdi:power'}" style="--mdc-icon-size:${(c.btn_fs || 10)*1.8}px"></ha-icon><div>${c[`switch_${i+1}_label`] || 'B'+(i+1)}</div>
            </div>` : '')}
        </div>

        <div class="gb" style="left:${c.pos_temp_x || 5}%; top:${c.pos_temp_y || 30}%; width:${c.temp_w || 200}px; height:${c.temp_h || 120}px; font-size:${c.temp_fs || 14}px;">
          <div class="bh">TEMPÉRATURES</div>
          <div class="bb">EAU: <span class="n">${this._getState(c.entity_water_temp).val}${this._getState(c.entity_water_temp).unit}</span></div>
          <div class="bb">AIR: <span>${this._getState(c.entity_ambient_temp).val}${this._getState(c.entity_ambient_temp).unit}</span></div>
        </div>

        <div class="gb" style="left:${c.pos_chem_x || 5}%; top:${c.pos_chem_y || 55}%; width:${c.chem_w || 200}px; height:${c.chem_h || 180}px; font-size:${c.chem_fs || 14}px;">
          <div class="bh">CHIMIE</div>
          <div class="bb">pH: <span style="color:${this._getChemColor('ph', this._getState(c.entity_ph).val)}">${this._getState(c.entity_ph).val}</span></div>
          <div class="bb">ORP: <span style="color:${this._getChemColor('orp', this._getState(c.entity_orp).val)}">${this._getState(c.entity_orp).val}mV</span></div>
          <div class="bb">Br: <span style="color:${this._getChemColor('br', this._getState(c.entity_bromine).val)}">${this._getState(c.entity_bromine).val}</span></div>
          <div class="bb">TAC: <span class="n">${this._getState(c.entity_alkalinity).val}</span></div>
        </div>

        <div class="gb" style="left:${c.pos_elec_x || 60}%; top:${c.pos_elec_y || 30}%; width:${c.sys_w || 250}px; height:${c.sys_h || 300}px;">
          <div class="bh">SYSTÈME</div><div class="sys-g">${sys}</div>
        </div>

        ${c.camera_entity ? html`<div class="gb" style="left:${c.pos_cam_x || 40}%; top:${c.pos_cam_y || 60}%; width:${c.camera_width || 300}px; height:${c.camera_height || 200}px; padding:2px;"><hui-image .hass=${this.hass} .cameraImage=${c.camera_entity} cameraView="live"></hui-image></div>` : ''}

        ${c.show_ideal_table !== false ? html`<div class="gb" style="left:${c.pos_ideal_x || 70}%; top:${c.pos_ideal_y || 70}%; width:${c.ideal_w || 180}px; height:${c.ideal_h || 120}px; font-size:${c.ideal_fs || 12}px;">
          <div class="bh">CIBLES IDÉALES</div>
          <div class="id"><span>pH</span><span>7.2 - 7.6</span></div>
          <div class="id"><span>ORP</span><span>> 650 mV</span></div>
          <div class="id"><span>Brome</span><span>3.0 - 5.0</span></div>
          <div class="id"><span>TAC</span><span>80 - 120</span></div>
        </div>` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { background-size: cover; background-position: center; border: 1px solid rgba(0, 249, 249, 0.5); border-radius: 20px; overflow: hidden; position: relative; color: #fff; font-family: 'Roboto', sans-serif; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
    .t { position: absolute; top: 15px; font-weight: 900; color: #00f9f9; text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 0 10px rgba(0, 249, 249, 0.8); }
    .gb { position: absolute; background: linear-gradient(135deg, rgba(0,20,30,0.85) 0%, rgba(0,0,0,0.9) 100%); border: 1px solid rgba(0, 249, 249, 0.4); border-radius: 15px 4px 15px 4px; padding: 12px; overflow: hidden; backdrop-filter: blur(12px); box-shadow: 0 4px 15px rgba(0,0,0,0.6), inset 0 0 10px rgba(0, 249, 249, 0.1); transition: all 0.3s ease; z-index: 1; }
    .bh { color: #00f9f9; font-size: 10px; font-weight: 900; letter-spacing: 1px; border-left: 3px solid #00f9f9; padding-left: 8px; margin-bottom: 10px; text-transform: uppercase; }
    .sw { background: rgba(10, 10, 10, 0.8); border: 1px solid rgba(0, 249, 249, 0.3); border-radius: 10px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: 0.2s; backdrop-filter: blur(5px); }
    .sw.on { background: rgba(0, 249, 249, 0.2); border-color: #00f9f9; box-shadow: 0 0 15px rgba(0, 249, 249, 0.5); color: #00f9f9; }
    .n { color: #00f9f9; text-shadow: 0 0 8px rgba(0, 249, 249, 0.6); font-family: 'Courier New', monospace; }
    .power-on { color: #ffcc00 !important; filter: drop-shadow(0 0 5px #ffcc00); }
    .btns-g { position: absolute; left: 1%; display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; z-index: 2; }
    .bb { display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold; }
    .sys-g { display: grid; grid-template-columns: 1fr; gap: 4px; overflow-y: auto; height: calc(100% - 25px); }
    .sys-i { display: flex; align-items: center; white-space: nowrap; margin-bottom: 2px; }
    .id { display: flex; justify-content: space-between; color: #00ff88; font-weight: bold; margin-bottom: 4px; font-size: 0.9em; }
    ha-icon { margin-right: 6px; }
    hui-image { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
  `;
}

customElements.define("spa-card-editor", SpaCardEditor);
customElements.define("spa-card", SpaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "spa-card", name: "SPA MASTER ULTIMATE", preview: true });
