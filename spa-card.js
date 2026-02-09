// Remplacez la section "render()" et "styles" de votre SpaCard par celle-ci :

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    
    // Calcul de la progression de la température (ex: entre 15°C et 40°C)
    const tempState = this._getState(c.entity_water_temp);
    const tempVal = parseFloat(tempState.val) || 0;
    const tempPercent = Math.min(Math.max(((tempVal - 15) / (40 - 15)) * 100, 0), 100);

    return html`
      <ha-card style="background-image: url('${c.background_image}'); height: ${c.card_height_v || 80}vh;">
        <div class="overlay"></div>
        
        <div class="header" style="justify-content: ${c.title_align || 'center'}">
           <h1 style="font-size: ${c.title_size || 22}px">${c.card_title || 'SPA MANAGEMENT'}</h1>
        </div>

        <div class="button-grid" style="top: ${c.btn_y || 15}%;">
          ${Array.from({length: 8}).map((_, i) => {
            const entity = c[`switch_${i+1}_entity`];
            if (!entity) return '';
            const state = this._getState(entity);
            return html`
              <div class="btn-item ${state.active ? 'active' : ''}" @click=${() => this.hass.callService("homeassistant", "toggle", {entity_id: entity})}>
                <ha-icon icon="${c[`switch_${i+1}_icon`] || 'mdi:power'}"></ha-icon>
                <span>${c[`switch_${i+1}_label`] || 'B'+(i+1)}</span>
              </div>
            `;
          })}
        </div>

        <div class="glass-panel temp-panel" style="left:${c.pos_temp_x}%; top:${c.pos_temp_y}%; width:${c.temp_w}px;">
          <div class="panel-header">ÉDITION THERMIQUE</div>
          <div class="temp-main">
            <span class="temp-value">${tempVal}</span><span class="temp-unit">${tempState.unit}</span>
          </div>
          <div class="temp-bar-container">
            <div class="temp-bar-fill" style="width: ${tempPercent}%"></div>
          </div>
          <div class="data-row" style="margin-top:8px;">
            <span>AIR AMBIANT</span>
            <span>${this._getState(c.entity_ambient_temp).val}°</span>
          </div>
        </div>

        <div class="glass-panel" style="left:${c.pos_chem_x}%; top:${c.pos_chem_y}%; width:${c.chem_w}px;">
          <div class="panel-header">ANALYSE CHIMIQUE</div>
          <div class="data-row">
            <span>pH</span>
            <span class="value" style="color: ${this._getChemColor('ph', this._getState(c.entity_ph).val)}">
              ${this._getState(c.entity_ph).val}
            </span>
          </div>
          <div class="data-row">
            <span>ORP</span>
            <span class="value" style="color: ${this._getChemColor('orp', this._getState(c.entity_orp).val)}">
              ${this._getState(c.entity_orp).val} mV
            </span>
          </div>
          <div class="data-row">
            <span>BROME</span>
            <span class="value" style="color: ${this._getChemColor('br', this._getState(c.entity_bromine).val)}">
              ${this._getState(c.entity_bromine).val} mg/L
            </span>
          </div>
        </div>

        ${c.camera_entity ? html`
          <div class="glass-panel camera-box" style="left:${c.pos_cam_x}%; top:${c.pos_cam_y}%; width:${c.camera_width}px; height:${c.camera_height}px; padding:4px;">
            <hui-image .hass=${this.hass} .cameraImage=${c.camera_entity} cameraView="live"></hui-image>
          </div>
        ` : ''}

      </ha-card>
    `;
  }

  static styles = css`
    ha-card { 
      background-size: cover; background-position: center; 
      border-radius: 24px; overflow: hidden; position: relative; 
      color: white; font-family: 'system-ui', sans-serif;
      border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .overlay { 
      position: absolute; width: 100%; height: 100%; 
      background: radial-gradient(circle at center, rgba(0,0,0,0) 20%, rgba(0,0,0,0.4) 100%); 
    }
    .header h1 { margin: 0; text-transform: uppercase; font-weight: 200; letter-spacing: 4px; color: #00f9f9; text-shadow: 0 0 15px rgba(0,249,249,0.5); }
    
    .button-grid { position: absolute; width: 94%; left: 3%; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; z-index: 2; }
    .btn-item {
      background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
      padding: 15px 5px; display: flex; flex-direction: column; align-items: center;
      cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-item.active { 
      background: rgba(0, 249, 249, 0.15); border-color: #00f9f9; 
      box-shadow: 0 0 20px rgba(0, 249, 249, 0.4), inset 0 0 10px rgba(0, 249, 249, 0.2);
      color: #00f9f9;
    }
    .btn-item ha-icon { --mdc-icon-size: 28px; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5)); }
    .btn-item span { font-size: 10px; margin-top: 6px; font-weight: 600; opacity: 0.8; }

    .glass-panel {
      position: absolute; background: rgba(15, 15, 15, 0.7); backdrop-filter: blur(20px);
      border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 15px; box-sizing: border-box; z-index: 2;
    }
    .panel-header { font-size: 9px; letter-spacing: 1px; font-weight: 800; color: rgba(255,255,255,0.5); margin-bottom: 10px; text-transform: uppercase; }
    
    .temp-main { display: flex; align-items: baseline; justify-content: center; margin-bottom: 5px; }
    .temp-value { font-size: 32px; font-weight: 200; color: #00f9f9; }
    .temp-unit { font-size: 14px; margin-left: 4px; opacity: 0.6; }
    
    .temp-bar-container { width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
    .temp-bar-fill { height: 100%; background: linear-gradient(90deg, #00f9f9, #ff4d4d); transition: width 1s ease-in-out; }

    .data-row { display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-top: 6px; }
    .value { font-family: 'Courier New', monospace; font-size: 13px; font-weight: bold; }
    
    hui-image { border-radius: 12px; overflow: hidden; }
  `;
