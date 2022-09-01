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
    return this.#mainImage.description ? this.#mainImage.description : '';
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
        img {
          display: block;
        }

        figure {
          text-align: center;
          margin-block: 0;
        }

        figure img {
          max-block-size: 600px;
          margin-inline: auto;
          transition: transform 280ms ease, box-shadow 280ms ease;
          transform-origin: top;
          position: relative;
          z-index: 1;
        }

        figure img:hover {
          transform: scale(1.3);
          box-shadow: 0 0 24px black;
        }

        figure>figcaption {
          margin-block-start: 1rem;
        }

        aside {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: 150px;
          column-gap: 1rem;
          overflow-x: auto;
          overscroll-behavior-inline: contain;
          scroll-snap-type: inline mandatory;
          padding: 2rem;
          inline-size: 800px;
          margin-inline: auto;
        }
        
        aside button > img {
          aspect-ratio: 1/1;
          object-fit: cover;
        }

        aside img {
          inline-size: 100%;
          filter: grayscale(80%) blur(1px);
        }

        aside button {
          cursor: pointer;
        }

        aside .main img {
          filter: none;
        }

        aside > * {
          scroll-snap-align: center;
        }
      </style>
    `;
  }

  #getMainImageClass(index) {
    return this.#mainImageIndex === index ? 'main' : '';
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
        ${this.#imagesListTemplate}
      </aside>
    `;
  }

  #render() {
    this.shadowRoot.innerHTML = this.#template;
  }
}

customElements.define('mp-collection-viewer', MpCollectionViewer);