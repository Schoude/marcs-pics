export class MpImageSwticher extends HTMLElement {
  /**
   * type: 'insert' | 'remove'
   * url: string;
   * description?: string;
   * order?: number;
   * maxCount?: number;
   */
  #data;
  #descriptionInputTemplateStatic = `
    <form class="description-wrapper">
      <input class="input-description" type="text" placeholder="Deine Beschreibung zum Foto" />
      <button class="btn btn-description-add" title="Beschreibung hinzufügen">➕</button>
    </form>
  `;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  set data(value) {
    this.#data = value;

    this.#render();
  }

  get #style() {
    return `
    <style>
      :host {
        display: block;
      }

      .wrapper {
        display: flex;
      }

      .btn {
        cursor: pointer;
        inline-size: 50px;
        flex: none;
      }

      img {
        display: block;
        block-size: 100px;
        transition: transform 200ms ease;
        transform-origin: top left;
        cursor: pointer;
      }

      input {
        font: inherit;
      }
    </style>
    `;
  }

  get #descriptionDisplayTemplate() {
    return `
      <p>
        <i>
          ${this.#data?.description}
        </i>
        <button class="btn btn-description-remove" type="button" title="Beschreibung entfernen">➖</button>
      </p>
    `;
  }

  get #descriptionTemplate() {
    if (this.#data.type === 'remove') {
      if (this.#data.description) {
        return this.#descriptionDisplayTemplate;
      } else {
        return this.#descriptionInputTemplateStatic;
      }
    } else {
      return '';
    }
  }

  get #orderTemplate() {
    if (this.#data.type === 'remove') {
      return `
        <div>
          ${this.#data.order !== 0 ? '<button class="btn btn-order-up" type="button" title="Eine Position nach oben">⬆</button>' : ''}
          ${this.#data.order !== this.#data.maxCount - 1 ? '<button class="btn btn-order-down" type="button" title="Eine Position nach unten">⬇</button>' : ''}
        </div>
      `;
    } else {
      return '';
    }
  }

  get #template() {
    return `
      ${this.#style}
      <div class="wrapper">
        ${this.#data.type === 'remove' ? '<button class="btn remove" type="button" title="Aus der Kollektion entfernen">⬅</button>' : ''}
        <div class="body">
          <img class="image" src="${this.#data.url}" loading="lazy" alt="" title="Klicken zum größeren Anzeigen"/>
          ${this.#descriptionTemplate}
        </div>
        ${this.#data.type === 'insert' ? '<button class="btn insert" type="button" title="Zur Kollektion hinzufügen">➡</button>' : ''}
        ${this.#orderTemplate}
      </div>
    `;
  }

  #render() {
    this.shadowRoot.innerHTML = this.#template;

    const imageEl = this.shadowRoot.querySelector('.image');
    imageEl.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('image:enlarge', {
        detail: this.#data.url,
        bubbles: true,
      }))
    });

    if (this.#data.type === 'remove') {
      const btnRemove = this.shadowRoot.querySelector('.remove');
      btnRemove?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('image:removed', {
          detail: this.#data.url,
          bubbles: true,
        }))
      });

      // Description input and buttons
      const descriptionInput = this.shadowRoot.querySelector('.input-description');

      const btnDescriptionAdd = this.shadowRoot.querySelector('.btn-description-add');
      btnDescriptionAdd?.addEventListener('click', (e) => {
        e.preventDefault();
        if (descriptionInput.value) {
          this.dispatchEvent(new CustomEvent('description:added', {
            detail: {
              url: this.#data.url,
              description: descriptionInput.value
            },
            bubbles: true,
          }))
          descriptionInput.value = '';
        }
      });

      const btnDescriptionRemove = this.shadowRoot.querySelector('.btn-description-remove');
      btnDescriptionRemove?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('description:removed', {
          detail: {
            url: this.#data.url
          },
          bubbles: true,
        }))
      });

      const btnOrderUp = this.shadowRoot.querySelector('.btn-order-up');
      if (btnOrderUp) {
        btnOrderUp.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('order:up', {
            detail: {
              order: this.#data.order,
              url: this.#data.url,
            },
            bubbles: true,
          }));
        });
      }

      const btnOrderDown = this.shadowRoot.querySelector('.btn-order-down');
      if (btnOrderDown) {
        btnOrderDown.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('order:down', {
            detail: {
              order: this.#data.order,
              url: this.#data.url,
            },
            bubbles: true,
          }));
        });
      }
    } else {
      const btnInsert = this.shadowRoot.querySelector('.insert');
      btnInsert.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('image:inserted', {
          detail: this.#data.url,
          bubbles: true,
        }))
      });
    }
  }
}

customElements.define('mp-image-switcher', MpImageSwticher);
