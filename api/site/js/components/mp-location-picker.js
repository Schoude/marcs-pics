export class MpLocationPicker extends HTMLElement {
  #map = null;
  #position = [49.00875078131351, 8.393200635910036];
  #minZoom = 5;
  #maxZoom = 19;
  // https://wiki.openstreetmap.org/wiki/Tile_servers
  #tileURL = 'https://tile.openstreetmap.de/{z}/{x}/{y}.png';
  #nominatimURL = 'https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=';

  constructor() {
    // console.warn('Don\'t forget to include the JS and CSS files for Leaflet in the HTML head where you use this component. See the available downloads here: https://leafletjs.com/download.html');

    super();
    this.#render();
    this.#map = L.map('map').setView(this.#position, this.#maxZoom);
    L.tileLayer(this.#tileURL, {
      maxZoom: this.#maxZoom,
      minZoom: this.#minZoom,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
  }

  connectedCallback() {
    this.#map.on('click', this.#logCoords);
  }

  get #style() {
    return `
    <style>
      .map-wrapper {
        position: relative;
        inline-size: max-content;
        margin-inline: auto;
        overflow: hidden;
      }

      #map {
        aspect-ratio: 16 / 9;
        inline-size: 1200px;
      }

      #search {
        position: absolute;
        inset-block-start: 1%;
        inset-inline-start: 50%;
        translate: -50%;
        z-index: 400;
      }

      #search input {
        border: none;
        border-radius: 6px;
        padding: .5rem;
        box-shadow: 0 6px 12px -3px rgba(0, 0 ,0, .33);
        transition: box-shadow 300ms ease;
        outline: none;
      }

      #search input:focus {
        box-shadow: 0 6px 16px -3px rgba(0, 0 ,0, .63);
      }

      .search-results-container {
        position: absolute;
        inset-block: 0;
        inset-inline-end: 0;
        z-index: 400;
        inline-size: 25%;
        background-color: white;
        transition: translate 300ms ease;
      }

      .search-results-container.closed {
        translate: 100%;
      }

      .search-results-container header {
        display: flex;
        justify-content: end;
      }
    </style>
    `;
  }

  get #template() {
    return `
      ${this.#style}
      <div class="map-wrapper">
        <div id="map">
        </div>
        <form id="search">
          <input type="text" placeholder="Berlin" title="Geben Sie eine Stadt ein, nach der Sie suchen möchten." />
        </form>
        <aside class="search-results-container">
          <header>
            <button type="button" class="search-results-close" title="Suchergebnisse schließen">✖</button>
          </header>
        </aside>
      </div>
    `;
  }

  #logCoords(e) {
    console.log(e.latlng);
  }

  #render() {
    this.innerHTML = this.#template;
    const searchResultsContainer = this.querySelector('.search-results-container');
    const searchResultsCloseBtn = this.querySelector('.search-results-close');

    searchResultsCloseBtn.addEventListener('click', () => {
      searchResultsContainer.classList.add('closed');
      searchResultsContainer.setAttribute('inert', '');
    });
  }
}

customElements.define('mp-location-picker', MpLocationPicker);
