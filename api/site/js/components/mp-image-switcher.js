export class MpImageSwticher extends HTMLElement {
  /**
   * type: 'insert' | 'remove'
   * url: string;
   */
  #data;
  #commentInputTemplate = `
    <div class="comment-wrapper">
      <input class="input-comment" type="text" placeholder="Dein Kommentar zum Foto" />
      <button class="btn-comment-add" type="button">➕</button>
    </div>
  `;
  #comment = '';

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

      .wrapper {
        display: flex;
      }

      .btn {
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

  get template() {
    return `
      ${this.style}
      <div class="wrapper">
        ${this.#data.type === 'remove' ? '<button class="btn remove" type="button">⬅</button>' : ''}
        <div class="body">
          <img src="${this.#data.url}" loading="lazy" />
          ${this.#data.type === 'remove' ? this.#commentInputTemplate : ''}
        </div>
        ${this.#data.type === 'insert' ? '<button class="btn insert" type="button">➡</button>' : ''}
      </div>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = this.template;

    if (this.#data.type === 'remove') {
      const btnRemove = this.shadowRoot.querySelector('.remove');
      btnRemove.addEventListener('click', () => {
        console.log('remove clicked', this.#data.url);
      });

      // Comment input and button
      const commentInput = this.shadowRoot.querySelector('.input-comment');

      const btnCommentAdd = this.shadowRoot.querySelector('.btn-comment-add');
      btnCommentAdd.addEventListener('click', () => {
        if (commentInput.value) {
          this.#comment = commentInput.value;
          commentInput.value = '';
        }
      });
    } else {
      const btnInsert = this.shadowRoot.querySelector('.insert');
      btnInsert.addEventListener('click', () => {
        console.log('insert clicked', this.#data.url);
      });
    }
  }
}

customElements.define('mp-image-switcher', MpImageSwticher);
