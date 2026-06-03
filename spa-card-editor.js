import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SpaCardEditor extends LitElement {

  static get properties() {
    return {
      hass: {},
      lovelace: {},
      config: {}
    };
  }

  constructor() {
    super();
    this.config = {};
  }

  setConfig(config) {
    this.config = { ...config };
  }

  _updateConfig(key, value) {
    this.config = { ...this.config, [key]: value };
    this._fireConfigChanged();
  }

  _fireConfigChanged() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _getEntities(domain) {
    if (!this.hass?.states) return [];
    return Object.keys(this.hass.states)
      .filter(eid => eid.startsWith(domain + '.'))
      .sort();
  }

  render() {
    if (!this.hass) return html`<p>Chargement...</p>`;

    const c = this.config;
    const sensors = this._getEntities('sensor');
    const climates = this._getEntities('climate');
    const binaries = this._getEntities('binary_sensor');
    const switches = this._getEntities('switch');
    const buttons = this._getEntities('button');
    const cameras = this._getEntities('camera');
    const inputNumbers = this._getEntities('input_number');
    const inputDatetimes = this._getEntities('input_datetime');

    return html`
      <div class="editor-container">
        <!-- Section Général -->
        <div class="editor-section">
          <h3 class="section-header">📋 Général</h3>
          
          <div class="editor-row">
            <label>Titre de la carte</label>
            <input type="text" 
              .value="${c.card_title || 'MY LAYZSPA'}"
              @change="${e => this._updateConfig('card_title', e.target.value)}"
              placeholder="MY LAYZSPA">
          </div>

          <div class="editor-row">
            <label>Hauteur de la carte (px)</label>
            <input type="text" 
              .value="${c.card_height || '640px'}"
              @change="${e => this._updateConfig('card_height', e.target.value)}"
              placeholder="640px">
          </div>

          <div class="editor-row">
            <label>Intensité du flou (0-50)</label>
            <input type="range" min="0" max="50"
              .value="${c.blur_amount ?? 15}"
              @change="${e => this._updateConfig('blur_amount', parseInt(e.target.value))}">
            <span class="value-display">${c.blur_amount ?? 15}</span>
          </div>

          <div class="editor-row">
            <label>Image de fond (URL)</label>
            <input type="text" 
              .value="${c.background_image || ''}"
              @change="${e => this._updateConfig('background_image', e.target.value)}"
              placeholder="https://...">
          </div>
        </div>

        <!-- Section Température -->
        <div class="editor-section">
          <h3 class="section-header">🌡️ Température</h3>

          <div class="editor-row">
            <label>Entité température eau</label>
            <select @change="${e => this._updateConfig('entity_water_temp', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_water_temp === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Entité température cible (Climate)</label>
            <select @change="${e => this._updateConfig('entity_target_temp', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${climates.map(e => html`
                <option .selected="${c.entity_target_temp === e}" value="${e}">${e}</option>
              `)}
              ${inputNumbers.map(e => html`
                <option .selected="${c.entity_target_temp === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Température minimale (°C)</label>
            <input type="number" 
              .value="${c.target_temp_min ?? 20}"
              @change="${e => this._updateConfig('target_temp_min', parseFloat(e.target.value))}">
          </div>

          <div class="editor-row">
            <label>Température maximale (°C)</label>
            <input type="number" 
              .value="${c.target_temp_max ?? 40}"
              @change="${e => this._updateConfig('target_temp_max', parseFloat(e.target.value))}">
          </div>

          <div class="editor-row">
            <label>Température extérieure</label>
            <select @change="${e => this._updateConfig('entity_ext_temp', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_ext_temp === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Humidité extérieure</label>
            <select @change="${e => this._updateConfig('entity_ext_hum', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_ext_hum === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Température air spa</label>
            <select @change="${e => this._updateConfig('entity_spa_air_temp', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_spa_air_temp === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Humidité spa</label>
            <select @change="${e => this._updateConfig('entity_spa_hum', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_spa_hum === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>
        </div>

        <!-- Section État Spa -->
        <div class="editor-section">
          <h3 class="section-header">⚙️ État Spa</h3>

          <div class="editor-row">
            <label>Spa prêt (binary_sensor)</label>
            <select @change="${e => this._updateConfig('entity_lz_ready', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${binaries.map(e => html`
                <option .selected="${c.entity_lz_ready === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Chauffage actif</label>
            <select @change="${e => this._updateConfig('entity_lz_heater', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${binaries.map(e => html`
                <option .selected="${c.entity_lz_heater === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Consommation électrique</label>
            <select @change="${e => this._updateConfig('main_cons_entity', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.main_cons_entity === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Énergie consommée</label>
            <select @change="${e => this._updateConfig('entity_lz_energy', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_lz_energy === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Signal RSSI</label>
            <select @change="${e => this._updateConfig('entity_lz_rssi', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_lz_rssi === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>
        </div>

        <!-- Section Calcul Chauffe -->
        <div class="editor-section">
          <h3 class="section-header">🔥 Paramètres Chauffage</h3>

          <div class="editor-row">
            <label>Volume (L)</label>
            <input type="number" 
              .value="${c.lz_volume ?? 500}"
              @change="${e => this._updateConfig('lz_volume', parseFloat(e.target.value))}">
          </div>

          <div class="editor-row">
            <label>Puissance chauffage (W)</label>
            <input type="number" 
              .value="${c.lz_power_w ?? 1942}"
              @change="${e => this._updateConfig('lz_power_w', parseFloat(e.target.value))}">
          </div>

          <div class="editor-row">
            <label>Perte thermique (%)</label>
            <input type="number" 
              .value="${c.lz_heat_loss ?? 30}"
              @change="${e => this._updateConfig('lz_heat_loss', parseFloat(e.target.value))}">
          </div>
        </div>

        <!-- Section Maintenance -->
        <div class="editor-section">
          <h3 class="section-header">🧹 Maintenance</h3>

          <div class="editor-row">
            <label>Âge du filtre</label>
            <select @change="${e => this._updateConfig('entity_lz_filter', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_lz_filter === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Durée max du filtre (j)</label>
            <input type="number" 
              .value="${c.lz_filter_max ?? 60}"
              @change="${e => this._updateConfig('lz_filter_max', parseFloat(e.target.value))}">
          </div>

          <div class="editor-row">
            <label>Bouton réinitialiser filtre</label>
            <select @change="${e => this._updateConfig('entity_lz_reset_filter', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${buttons.map(e => html`
                <option .selected="${c.entity_lz_reset_filter === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Âge du chlore</label>
            <select @change="${e => this._updateConfig('entity_lz_chlorine', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_lz_chlorine === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Durée max du chlore (j)</label>
            <input type="number" 
              .value="${c.lz_chlorine_max ?? 14}"
              @change="${e => this._updateConfig('lz_chlorine_max', parseFloat(e.target.value))}">
          </div>

          <div class="editor-row">
            <label>Bouton réinitialiser chlore</label>
            <select @change="${e => this._updateConfig('entity_lz_reset_chlore', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${buttons.map(e => html`
                <option .selected="${c.entity_lz_reset_chlore === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>
        </div>

        <!-- Section Chimie -->
        <div class="editor-section">
          <h3 class="section-header">⚗️ Chimie de l'eau</h3>

          <div class="editor-row">
            <label>pH</label>
            <select @change="${e => this._updateConfig('entity_ph', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_ph === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>pH min - max</label>
            <div class="inline-inputs">
              <input type="number" step="0.1"
                .value="${c.ph_min ?? 7.2}"
                @change="${e => this._updateConfig('ph_min', parseFloat(e.target.value))}"
                placeholder="7.2">
              <span>-</span>
              <input type="number" step="0.1"
                .value="${c.ph_max ?? 7.6}"
                @change="${e => this._updateConfig('ph_max', parseFloat(e.target.value))}"
                placeholder="7.6">
            </div>
          </div>

          <div class="editor-row">
            <label>ORP (Oxydoréduction)</label>
            <select @change="${e => this._updateConfig('entity_orp', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_orp === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>ORP min - max</label>
            <div class="inline-inputs">
              <input type="number"
                .value="${c.orp_min ?? 650}"
                @change="${e => this._updateConfig('orp_min', parseFloat(e.target.value))}"
                placeholder="650">
              <span>-</span>
              <input type="number"
                .value="${c.orp_max ?? 800}"
                @change="${e => this._updateConfig('orp_max', parseFloat(e.target.value))}"
                placeholder="800">
            </div>
          </div>

          <div class="editor-row">
            <label>TDS (Minéralité)</label>
            <select @change="${e => this._updateConfig('entity_tds', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_tds === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>TDS min - max</label>
            <div class="inline-inputs">
              <input type="number"
                .value="${c.tds_min ?? 500}"
                @change="${e => this._updateConfig('tds_min', parseFloat(e.target.value))}"
                placeholder="500">
              <span>-</span>
              <input type="number"
                .value="${c.tds_max ?? 1500}"
                @change="${e => this._updateConfig('tds_max', parseFloat(e.target.value))}"
                placeholder="1500">
            </div>
          </div>

          <div class="editor-row">
            <label>Sel</label>
            <select @change="${e => this._updateConfig('entity_salt', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_salt === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Sel min - max</label>
            <div class="inline-inputs">
              <input type="number"
                .value="${c.salt_min ?? 2500}"
                @change="${e => this._updateConfig('salt_min', parseFloat(e.target.value))}"
                placeholder="2500">
              <span>-</span>
              <input type="number"
                .value="${c.salt_max ?? 3500}"
                @change="${e => this._updateConfig('salt_max', parseFloat(e.target.value))}"
                placeholder="3500">
            </div>
          </div>
        </div>

        <!-- Section Sécurité (Inondation) -->
        <div class="editor-section">
          <h3 class="section-header">🚨 Sécurité - Inondation</h3>

          <div class="editor-row">
            <label>Fuite d'eau détectée</label>
            <select @change="${e => this._updateConfig('entity_water_leak', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${binaries.map(e => html`
                <option .selected="${c.entity_water_leak === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Sabotage détecté</label>
            <select @change="${e => this._updateConfig('entity_tamper', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${binaries.map(e => html`
                <option .selected="${c.entity_tamper === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Batterie capteur inondation</label>
            <select @change="${e => this._updateConfig('entity_flood_bat', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${sensors.map(e => html`
                <option .selected="${c.entity_flood_bat === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>
        </div>

        <!-- Section Programmation -->
        <div class="editor-section">
          <h3 class="section-header">⏰ Programmation Chauffe</h3>

          <div class="editor-row">
            <label>Entité planification (input_datetime)</label>
            <select @change="${e => this._updateConfig('entity_lz_schedule', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${inputDatetimes.map(e => html`
                <option .selected="${c.entity_lz_schedule === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>
        </div>

        <!-- Section Caméra -->
        <div class="editor-section">
          <h3 class="section-header">📹 Caméra</h3>

          <div class="editor-row">
            <label>Entité caméra</label>
            <select @change="${e => this._updateConfig('entity_camera', e.target.value)}">
              <option value="">-- Aucun --</option>
              ${cameras.map(e => html`
                <option .selected="${c.entity_camera === e}" value="${e}">${e}</option>
              `)}
            </select>
          </div>

          <div class="editor-row">
            <label>Largeur caméra (px)</label>
            <input type="number" 
              .value="${c.cam_w_px || ''}"
              @change="${e => this._updateConfig('cam_w_px', e.target.value ? parseInt(e.target.value) : undefined)}"
              placeholder="Défaut: 100%">
          </div>

          <div class="editor-row">
            <label>Hauteur caméra (px)</label>
            <input type="number" 
              .value="${c.cam_h_px || ''}"
              @change="${e => this._updateConfig('cam_h_px', e.target.value ? parseInt(e.target.value) : undefined)}"
              placeholder="Défaut: 210">
          </div>

          <div class="editor-row">
            <label>Rayon coin (px)</label>
            <input type="number" 
              .value="${c.cam_radius || ''}"
              @change="${e => this._updateConfig('cam_radius', e.target.value ? parseInt(e.target.value) : undefined)}"
              placeholder="Défaut: 12">
          </div>

          <div class="editor-row">
            <label>Décalage X (px)</label>
            <input type="number" 
              .value="${c.cam_x || 0}"
              @change="${e => this._updateConfig('cam_x', parseInt(e.target.value))}">
          </div>

          <div class="editor-row">
            <label>Décalage Y (px)</label>
            <input type="number" 
              .value="${c.cam_y || 0}"
              @change="${e => this._updateConfig('cam_y', parseInt(e.target.value))}">
          </div>
        </div>

        <!-- Section Commandes (Switches) -->
        <div class="editor-section">
          <h3 class="section-header">⚙️ Commandes (Switches)</h3>

          ${[1,2,3,4,5,6].map(i => html`
            <div class="editor-subsection">
              <h4>Commande ${i}</h4>
              <div class="editor-row">
                <label>Switch ${i}</label>
                <select @change="${e => this._updateConfig('switch_'+i, e.target.value)}">
                  <option value="">-- Aucun --</option>
                  ${switches.map(e => html`
                    <option .selected="${c['switch_'+i] === e}" value="${e}">${e}</option>
                  `)}
                </select>
              </div>
              <div class="editor-row">
                <label>Nom du switch ${i}</label>
                <input type="text" 
                  .value="${c['name_switch_'+i] || ''}"
                  @change="${e => this._updateConfig('name_switch_'+i, e.target.value)}"
                  placeholder="Ex: Pompe">
              </div>
            </div>
          `)}
        </div>

      </div>
    `;
  }

  static styles = css`
    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .editor-section {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-header {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #212121;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 8px;
    }

    .editor-subsection {
      border-left: 3px solid #e3f2fd;
      padding-left: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .editor-subsection h4 {
      margin: 0;
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .editor-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .editor-row label {
      font-size: 12px;
      font-weight: 600;
      color: #424242;
    }

    .editor-row input,
    .editor-row select {
      padding: 8px 10px;
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      font-size: 13px;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .editor-row input:focus,
    .editor-row select:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
    }

    .editor-row input[type="range"] {
      padding: 0;
      border: none;
      flex: 1;
    }

    .editor-row input[type="number"] {
      max-width: 120px;
    }

    .value-display {
      font-size: 12px;
      font-weight: 600;
      color: #1976d2;
      margin-left: 8px;
    }

    .inline-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .inline-inputs input {
      flex: 1;
      max-width: 100px;
    }

    .inline-inputs span {
      color: #999;
      font-weight: 600;
    }
  `;
}

customElements.define('spa-card-editor', SpaCardEditor);
