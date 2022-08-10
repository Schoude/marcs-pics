export class MpCurrentImage extends HTMLElement {
  #url = '';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  /**
   * @param {{
   *  url: string;
   * }} value
   */
  set url(value) {
    this.#url = value;

    this.render();
  }

  get style() {
    return `
    <style>
    img {
      display: block;
      block-size: 100px
    }

    button {
      inline-size: 100%;
      cursor: pointer;
    }
    </style>
    `;
  }

  get template() {
    return `
      ${this.style}
      <img class="current-image" loading="lazy" src="${this.#url}">
      <button title="Foto löschen" type="button">
        💥
      </button>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = this.template;
    const btn = this.shadowRoot.querySelector('button');
    btn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('image:deleted', {
        detail: {
          url: this.#url,
        },
        bubbles: true,
      }));
    });
  }

}

customElements.define('mp-current-image', MpCurrentImage);
