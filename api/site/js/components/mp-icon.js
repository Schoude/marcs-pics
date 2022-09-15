// https://icon-sets.iconify.design/

export class MpIcon extends HTMLElement {
  #iconName;
  #width = '24px';
  #color = 'black';

  constructor() {
    super();
    this.attachShadow({
      mode: 'open',
    });
  }

  static get observedAttributes() {
    return ['icon-name', 'width', 'color'];
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    switch (name) {
      case 'icon-name':
        this.#iconName = newVal;
        break;
      case 'width':
        this.#width = newVal;
        break;
      case 'color':
        this.#color = newVal;
        break;
    }

    this.#render();
  }

  get #search() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="${this.#color}" d="m16.325 14.899l5.38 5.38a1.008 1.008 0 0 1-1.427 1.426l-5.38-5.38a8 8 0 1 1 1.426-1.426ZM10 16a6 6 0 1 0 0-12a6 6 0 0 0 0 12Z"></path></svg>
    `;
  }

  get #delete() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20"><path fill="${this.#color}" d="M11.5 4a1.5 1.5 0 0 0-3 0h3Zm-4 0a2.5 2.5 0 0 1 5 0h5a.5.5 0 0 1 0 1h-1.054l-.485 4.196a5.48 5.48 0 0 0-.986-.176L15.44 5H4.561l1.18 10.23A2 2 0 0 0 7.728 17H9.6c.183.358.404.693.657 1H7.728a3 3 0 0 1-2.98-2.656L3.554 5H2.5a.5.5 0 0 1 0-1h5ZM19 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0Zm-2.646-1.146a.5.5 0 0 0-.708-.708L14.5 13.793l-1.146-1.147a.5.5 0 0 0-.708.708l1.147 1.146l-1.147 1.146a.5.5 0 0 0 .708.708l1.146-1.147l1.146 1.147a.5.5 0 0 0 .708-.708L15.207 14.5l1.147-1.146Z"></path></svg>
    `;
  }

  get #arrowLeftRight() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path stroke="${this.#color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 6H3m18 0l-4 4m4-4l-4-4M3 18h18M3 18l4 4m-4-4l4-4"></path></svg>
    `;
  }

  get #hamburger() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16"><path fill="none" stroke="${this.#color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.75 12.25h10.5m-10.5-4h10.5m-10.5-4h10.5"></path></svg>
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
