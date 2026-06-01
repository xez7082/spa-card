import { css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export const sharedStyles = css`

  :host {
    display: block;
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .editor-wrap {
    padding: 10px;
    font-family: var(
      --paper-font-body1_-_font-family,
      Roboto,
      sans-serif
    );
    color: var(--primary-text-color);
  }

  .acc {
    border: 1px solid var(
      --divider-color,
      rgba(0, 0, 0, 0.12)
    );
    border-radius: 12px;
    margin-bottom: 8px;
    overflow: hidden;
    background: var(
      --card-background-color,
      white
    );
  }

  .ach {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 13px;
    cursor: pointer;
    user-select: none;
    background: var(
      --secondary-background-color,
      rgba(0, 0, 0, 0.03)
    );
  }

  .ach:hover {
    filter: brightness(1.05);
  }

  .aibox {
    width: 32px;
    height: 32px;
    min-width: 32px;

    border-radius: 9px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: 700;
    font-size: 11px;

    background: var(--primary-color);
    color: white;
  }

  .acbi {
    padding: 12px;
  }

  .chem-advice-box {
    margin: 10px;
    padding: 12px;

    border-radius: 10px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    text-align: center;
    font-weight: 500;

    background: var(
      --secondary-background-color
    );
  }

  .prog-action-btn {
    width: 100%;

    padding: 10px;

    border: 1px solid var(
      --divider-color
    );

    border-radius: 8px;

    background: var(
      --secondary-background-color
    );

    color: var(
      --primary-text-color
    );

    font-weight: 700;
    cursor: pointer;

    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.15s ease;
  }

  .prog-action-btn:hover {
    transform: translateY(-1px);
  }

  .prog-action-btn:active {
    transform: translateY(0);
  }

  .pab-on {
    background: rgba(
      251,
      146,
      60,
      0.15
    );

    border-color: rgba(
      251,
      146,
      60,
      0.5
    );

    color: #fb923c;
  }

  .nav {
    display: flex;
    justify-content: space-around;
    align-items: center;

    padding-top: 16px;
    margin-top: 16px;

    border-top: 1px solid var(
      --divider-color
    );
  }

  .nav > * {
    flex: 1;
  }

  ha-icon {
    color: var(--secondary-text-color);
  }

`;
