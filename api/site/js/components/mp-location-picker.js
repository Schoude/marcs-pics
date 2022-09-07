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
      #map {
        inline-size: 800px;
        block-size: 600px;
      }
    </style>
    `;
  }

  get #template() {
    return `
      ${this.#style}
      <div id="map">
      </div>
    `;
  }

  #logCoords(e) {
    console.log(e.latlng);
  }

  #render() {
    this.innerHTML = this.#template;
  }
}

customElements.define('mp-location-picker', MpLocationPicker);
