export class MpImageSwticher extends HTMLElement {
  /**
   * type: 'insert' | 'remove'
   * url: string;
   * description?: string;
   */
  #data;
  #descriptionInputTemplateStatic = `
    <div class="description-wrapper">
      <input class="input-description" type="text" placeholder="Deine Beschreibung zum Foto" />
      <button class="btn-description-add" type="button" title="Beschreibung hinzufügen">➕</button>
    </div>
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
        <button class="btn-description-remove" type="button" title="Beschreibung entfernen">➖</button>
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

  get #template() {
    return `
      ${this.#style}
      <div class="wrapper">
        ${this.#data.type === 'remove' ? '<button class="btn remove" type="button" title="Aus der Kollektion entfernen">⬅</button>' : ''}
        <div class="body">
          <img src="${this.#data.url}" loading="lazy" alt=""/>
          ${this.#descriptionTemplate}
        </div>
        ${this.#data.type === 'insert' ? '<button class="btn insert" type="button" title="Zur Kollektion hinzufügen">➡</button>' : ''}
      </div>
    `;
  }

  #render() {
    this.shadowRoot.innerHTML = this.#template;

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
      btnDescriptionAdd?.addEventListener('click', () => {
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
          detail: this.#data.url,
          bubbles: true,
        }))
      });
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
