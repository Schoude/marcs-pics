export class MpCollectionViewer extends HTMLElement {
  #collection;
  #mainImageIndex = 0;
  
  constructor() {
    super();
    this.attachShadow({mode:'open'});
  }

  set collection(value) {
    this.#collection = value;
    this.#render();
  }

  get #mainImage() {
    return this.#collection.images[this.#mainImageIndex]
  }

  get #mainImageDescription() {
    return this.#mainImage.description ? this.#mainImage.description : '&nbsp;';
  }

  get #mainImageSrc() {
    return this.#mainImage.url;
  }

  get #allImages() {
    return this.#collection.images;
  }

  get #style() {
    return `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        img {
          display: block;
        }

        figure {
          text-align: center;
          margin-block: 0;
        }

        figure img {
          block-size: 600px;
          max-block-size: 600px;
          margin-inline: auto;
          box-shadow: 0 0 12px black;
          transition: transform 280ms ease, box-shadow 280ms ease;
          transform-origin: top;
          position: relative;
          z-index: 1;
        }

        figure img:hover {
          transform: scale(1.3);
          box-shadow: 0 0 24px black;
        }

        figure > figcaption {
          margin-block-start: 1rem;
          font-style: italic;
        }

        .image-list {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: 120px;
          column-gap: 1rem;
          overflow-x: auto;
          overscroll-behavior-inline: contain;
          scroll-snap-type: inline mandatory;
          padding: 2rem;
          inline-size: 800px;
          margin-inline: auto;
        }

        aside {
          display: flex;
        }

        .description {
          flex: 0;
        }
        
        .image-list button > img {
          aspect-ratio: 1/1;
          object-fit: cover;
        }

        .image-list img {
          inline-size: 100%;
          filter: grayscale(80%) blur(2px);
        }

        .image-list button {
          background-color: transparent;
          cursor: pointer;
          padding: 0;
          border: none;
          outline: none;
          border-radius: 4px;
        }

        .image-list .main img {
          filter: none;
        }

        .image-list > * {
          scroll-snap-align: center;
        }
      </style>
    `;
  }

  #getMainImageClass(index) {
    return this.#mainImageIndex === index ? 'main' : '';
  }

  #switchMainImage(index) {
    if (this.#mainImageIndex === index) {
      return
    }

    this.#mainImageIndex = index;
    this.#render();
  }

  get #imagesListTemplate() {
    return this.#allImages.map((image, index) => {
      return `
        <button type="button" class="${this.#getMainImageClass(index)}">
          <img src="${image.url}" loading="lazy" alt="${image.description ? image.description : ''}"/> 
        </button>
      `;
    }).join('');
  }

  get #template() {
    return `
      ${this.#style}
      <main>
        <figure>
          <img src="${this.#mainImageSrc}" loading="lazy" alt="${this.#mainImageDescription}"/>
          <figcaption>${this.#mainImageDescription}</figcaption>
        </figure>
      </main>
      <aside>
        <div class="description">
          <h2>
            Beschreibung
          </h2>
          <p>
            ${this.#collection.description}
          </p>
        </div>
        <div class="image-list">
          ${this.#imagesListTemplate}
        <div>
      </aside>
    `;
  }

  #render() {
    this.shadowRoot.innerHTML = this.#template;
    const switchButtons = this.shadowRoot.querySelectorAll('aside button');
    [...switchButtons].forEach((btn, index) => {
      btn.addEventListener('click', () => this.#switchMainImage(index))
    });
  }
}

customElements.define('mp-collection-viewer', MpCollectionViewer);