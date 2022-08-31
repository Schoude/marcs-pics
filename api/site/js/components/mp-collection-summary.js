export class MpCollectionSummary extends HTMLElement {
  /**
   * description
   * images
   * photo_box_display_name
   * photo_box_description
   * password (hashed)
   * and more...
   */
  #data;

  constructor() {
    super();

    this.attachShadow({
      mode: 'open',
    });
  }

  set data(value) {
    this.#data = value;
    this.#render();
  }

  get #passwordProtected() {
    return this.#data.password != null;
  }

  get #style() {
    return `
      <style>
        :host(:hover) {
            background-color: #243b3b;
        }

        :host {
            border-radius: 4px;
            background-color: #1f3333;
            padding: 1.25rem 1.5rem;
            transition: background-color 300ms ease;
            box-shadow: 0 4px 4px -2px rgb(0 0 0 / 35%), 0 4px 6px -2px rgb(0 0 0 / 25%);
        }

        h3 {
          margin: 0;
          display: flex;
          justify-content: space-between;
        }

        a {
          displat: block;
          margin-block-end: 1rem;
          color: white;
          text-decoration: underline;
        }
      </style>
    `;
  }

  get #collectionLink() {
    return `
      <a href="${window.location}collection?hash=${this.#data.hash}" target="_blank" rel="noopener">
        Kollektion anschauen
      </a>
    `;
  }

  get #template() {
    return `
      ${this.#style}
      <h3>
        <span>
          ${this.#data.description}
        </span>
        <span>
          ${this.#data.images.length} Fotos
        </span>
      </h3>

      <p>
        Erstellt aus Fotobox: <i>${this.#data.photo_box_display_name}</i>
      </p>

      <p>
        Passwortgeschützt? &#8210; ${this.#passwordProtected ? '<b>ja</b>' : '<b>nein</b>'}
      </p>

      ${this.#passwordProtected ? '' : this.#collectionLink}
    `;
  }

  #render() {
    this.shadowRoot.innerHTML = this.#template;
  }
}

customElements.define('mp-collection-summary', MpCollectionSummary);
