export class MpPreviewImage extends HTMLElement {
  #data = {};

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  set data(value) {
    this.#data = value;

    this.render();
  }

  get style() {
    return `
      <style>
      :host {
        display: block;
      }

      li {
        list-style: none;
        display: flex;
        align-items: center;
        gap: .5rem;
      }

      img {
        display: block;
        block-size: 120px;
        inline-size: 120px;
        object-fit: cover;
      }
      </style>
    `;
  }

  get template() {
    return `
      ${this.style}
      <li>
        <img src="${this.#data.src}" loading="lazy" />
        <span>${this.#data.name}</span>
        <button type="button" title="Klicken, zum Entfernen">❌</button>
      </li>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = this.template;
    const btn = this.shadowRoot.querySelector('button');
    btn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('image:removed', {
        detail: {
          index: this.#data.index,
        },
        bubbles: true,
      }));
    });
  }
}

customElements.define('mp-preview-image', MpPreviewImage);
