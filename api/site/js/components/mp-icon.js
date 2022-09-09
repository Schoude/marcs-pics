export class MpIcon extends HTMLElement {
  #iconName;
  #width = '24px';

  constructor() {
    super();
    this.attachShadow({
      mode: 'open',
    });
  }

  static get observedAttributes() {
    return ['icon-name', 'width'];
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    switch (name) {
      case 'icon-name':
        this.#iconName = newVal;
        break;
      case 'width':
        this.#width = newVal;
        break;
    }

    this.#render();
  }

  get #search() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="m16.325 14.899l5.38 5.38a1.008 1.008 0 0 1-1.427 1.426l-5.38-5.38a8 8 0 1 1 1.426-1.426ZM10 16a6 6 0 1 0 0-12a6 6 0 0 0 0 12Z"></path></svg>
    `;
  }

  get #style() {
    return `
      <style>
          :host {
            inline-size: ${this.#width};
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          svg {
            inline-size: inherit;
          }
        </style>
    `;
  }

  get #template() {
    return `
      ${this.#style}
      ${eval(`this.#${this.#iconName}`)}
    `;
  }

  #render() {
    this.shadowRoot.innerHTML = this.#template;
  }
}

customElements.define('mp-icon', MpIcon);
