export class MpImageSwticher extends HTMLElement {
  /**
   * type: 'insert' | 'remove'
   * url: string;
   * comment?: string;
   */
  #data;
  #commentInputTemplateStatic = `
    <div class="comment-wrapper">
      <input class="input-comment" type="text" placeholder="Dein Kommentar zum Foto" />
      <button class="btn-comment-add" type="button" title="Kommentar hinzufügen">➕</button>
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

  get #commentDisplayTemplate() {
    return `
      <p>
        <i>
          ${this.#data?.comment}
        </i>
        <button class="btn-comment-remove" type="button" title="Kommentar entfernen">➖</button>
      </p>
    `;
  }

  get #commentTemplate() {
    if (this.#data.type === 'remove') {
      if (this.#data.comment) {
        return this.#commentDisplayTemplate;
      } else {
        return this.#commentInputTemplateStatic;
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
          ${this.#commentTemplate}
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

      // Comment input and buttons
      const commentInput = this.shadowRoot.querySelector('.input-comment');

      const btnCommentAdd = this.shadowRoot.querySelector('.btn-comment-add');
      btnCommentAdd?.addEventListener('click', () => {
        if (commentInput.value) {
          this.dispatchEvent(new CustomEvent('comment:added', {
            detail: {
              url: this.#data.url,
              comment: commentInput.value
            },
            bubbles: true,
          }))
          commentInput.value = '';
        }
      });

      const btnCommentRemove = this.shadowRoot.querySelector('.btn-comment-remove');
      btnCommentRemove?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('comment:removed', {
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
