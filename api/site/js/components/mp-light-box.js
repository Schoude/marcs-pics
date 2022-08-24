export class MpLightBox extends HTMLElement {
  #images = [];
  #currentIndex = 0;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  /**
   * @param {any} value
   */
  set images(value) {
    this.#images = value;
    this.#currentIndex = 0;
    this.setAttribute('show', '');
    this.render();
  }

  get #currentImage() {
    return this.#images[this.#currentIndex];
  }

  get style() {
    return `
      <style>
      :host {
        position: fixed;
        inset: 0;
        background-color: rgba(123, 123, 123, 0.4);
        display: none;
        backdrop-filter: blur(2px);
      }

      :host([show]) {
        display: grid;
        place-items: center;
      }

      .top-bar {
        block-size: 50px;
        display: flex;
        justify-content: flex-end;
      }

      .top-bar > button {
        border: none;
        border-top-right-radius: 8px;
        background-color: transparent;
      }

      .inner {
        inline-size: 85vw;
        block-size: 95vh;
        background-color: #3b4351;
        display: grid;
        grid-template-rows: auto 1fr;
        border-radius: 8px;
      }

      button {
        cursor: pointer;
      }

      .image-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0px;
        max-width: 100%;
      }

      img {
        display: block;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        height: 100%;
        max-width: 100%;
      }
      </style>
    `;
  }

  get template() {
    return `
      ${this.style}
      <div class="inner">
        <header class="top-bar">
          <button type="button">
            ❌
          </button>
        </header>
        <div class="image-container">
          <img src="${this.#currentImage}" alt="" loading="lazy"/>
        </div>
      </div>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = this.template;

    const topBar = this.shadowRoot.querySelector('.top-bar > button');
    topBar.addEventListener('click', () => {
      this.removeAttribute('show');
      this.#images = [];
    });
  }
}

customElements.define('mp-light-box', MpLightBox);
