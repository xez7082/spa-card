class SpaCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <ha-card header="Spa Control">
          <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button class="btn">Bouton 1</button>
            <button class="btn">Bouton 2</button>
            <button class="btn">Bouton 3</button>
            <button class="btn">Bouton 4</button>
          </div>
        </ha-card>
        <style>
          .btn { padding: 20px; cursor: pointer; border: 1px solid #ccc; border-radius: 8px; background: #f0f0f0; }
          .btn:hover { background: #e0e0e0; }
        </style>
      `;
      this.content = true;
    }
  }
}

customElements.define("spa-card", SpaCard);
