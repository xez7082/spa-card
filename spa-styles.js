import { css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export const sharedStyles = css`
  .editor-wrap { padding: 10px; font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif); color: var(--primary-text-color); }
  .acc { border: 1px solid var(--divider-color, rgba(0,0,0,.12)); border-radius: 12px; margin-bottom: 8px; overflow: hidden; background: var(--card-background-color, white); }
  .ach { display: flex; align-items: center; gap: 10px; padding: 11px 13px; cursor: pointer; background: var(--secondary-background-color, rgba(0,0,0,.03)); }
  .aibox { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; }
  .acbi { padding: 12px; }
  
  .chem-advice-box { margin: 10px; padding: 12px; border-radius: 10px; text-align: center; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px; }
  
  .prog-action-btn { 
    padding: 8px; border-radius: 8px; border: 1px solid var(--divider-color); 
    cursor: pointer; transition: all .2s; background: var(--secondary-background-color); color: var(--primary-text-color);
    width: 100%; font-weight: 700;
  }
  .pab-on { background: rgba(251,146,60,.15); border-color: rgba(251,146,60,.5); color: #fb923c; }
  .nav { display: flex; justify-content: space-around; padding-top: 16px; border-top: 1px solid var(--divider-color); }
`;
