// Minimal mock of lit-element for testing purposes
export class LitElement {
  constructor() {
    this._properties = {};
  }

  static get properties() {
    return {};
  }

  connectedCallback() {}
  disconnectedCallback() {}
  requestUpdate() {}
  updateComplete() { return Promise.resolve(); }

  dispatchEvent(event) {
    return true;
  }
}

export function html(strings, ...values) {
  return { strings, values, type: 'html' };
}

export function css(strings, ...values) {
  return { strings, values, type: 'css' };
}
