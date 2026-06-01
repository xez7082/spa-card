import { css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export const sharedStyles = css`
  /* ── Structure éditeur ── */
  .editor-wrap { padding: 10px; font-family: var(--paper-font-body1_-_font-family, sans-serif); }
  
  .acc { border: 1px solid var(--divider-color, rgba(0,0,0,.12)); border-radius: 12px; margin-bottom: 8px; overflow: hidden; }
  .ach { display: flex; align-items: center; gap: 10px; padding: 11px 13px; cursor: pointer; background: var(--secondary-background-color, rgba(0,0,0,.03)); }
  .aibox { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; }
  .acbi { padding: 6px 6px 14px; }
  
  /* ── Composants Carte ── */
  .home-view { background-size: cover; border-radius: 14px; padding: 15px; }
  .main-split-container { display: flex; gap: 15px; }
  
  /* ── Jauges & Chimie ── */
  .chem-list { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .chem-advice-box { 
    margin: 10px; padding: 12px; border-radius: 10px; 
    text-align: center; font-weight: 500; 
  }
  
  /* ── Boutons Action & Nav ── */
  .prog-action-btn { 
    padding: 8px; border-radius: 8px; border: 1px solid; 
    cursor: pointer; transition: all .2s; 
  }
  .nav { 
    display: flex; justify-content: space-around; 
    padding-top: 16px; border-top: 1px solid rgba(255,255,255,.1); 
  }
`;
