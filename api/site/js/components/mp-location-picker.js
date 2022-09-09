export class MpLocationPicker extends HTMLElement {
  #map = null;
  #position = [49.00875078131351, 8.393200635910036];
  #minZoom = 2;
  #startingZoom = 13;
  #maxZoom = 19;
  // https://wiki.openstreetmap.org/wiki/Tile_servers
  #tileURL = 'https://tile.openstreetmap.de/{z}/{x}/{y}.png';
  #nominatimURL = 'https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=';
  #searchResults = [];
  #overviewPosition = [20.13847, 1.40625];
  #currentMarkers = [];
  #selectedPosition = null;
  #selectedPositionPopup = null;

  constructor() {
    if (window.L == null) {
      console.error('Don\'t forget to include the JS and CSS files for Leaflet in the HTML head where you use this component. See the available downloads here: https://leafletjs.com/download.html');
    }

    super();
    this.#render();
    this.#map = L.map('map').setView(this.#position, this.#startingZoom);
    L.tileLayer(this.#tileURL, {
      maxZoom: this.#maxZoom,
      minZoom: this.#minZoom,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
  }

  connectedCallback() {
    this.#map.on('click', this.#updatePosition.bind(this));
  }

  #emit(evtName, payload) {
    this.dispatchEvent(new CustomEvent(evtName, {
      detail: payload,
    }));
  }

  get #style() {
    return `
    <style>
      .map-wrapper {
        position: relative;
        inline-size: max-content;
        margin-inline: auto;
        overflow: hidden;
        border-radius: var(--mp-border-radius-wrapper, 0px);
        --border-radius: 6px;
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
        z-index: 401;
      }

      #search > label {
        border-radius: var(--border-radius);
        box-shadow: 0 6px 12px -3px rgba(0, 0 ,0, .33);
        transition: box-shadow 300ms ease;
        background-color: white;
        display: flex;
        padding-inline-start: .5rem;
        cursor: text;
      }

      #search input {
        border: none;
        padding: .5rem;
        outline: none;
        background-color: transparent;
        border-start-end-radius: var(--border-radius);
        border-end-end-radius: var(--border-radius);
      }

      #search:focus-within {
        box-shadow: 0 6px 16px -3px rgba(0, 0 ,0, .63);
      }

      .search-results-container {
        position: absolute;
        inset-block: 0;
        inset-inline-end: 0;
        z-index: 400;
        inline-size: 33%;
        background-color: hsl(0deg 0% 100% / 54%);
        transition: translate 300ms ease;
        color: black;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 12px 0px rgba(0, 0 ,0, .33);
        z-index: 1000;
      }

      .search-results-container.closed {
        translate: 100%;
      }

      .search-results-container header {
        display: flex;
        justify-content: end;
        flex: 0;
        padding: 1rem;
      }

      .search-results-container .side-menu-toggle {
        position: absolute;
        inset-block-start: 5%;
        inset-inline-start: 0;
        translate: -100%;
        block-size: 50px;
      }

      .search-results {
        overflow-y: auto;
        word-break: break-word;
        flex: 1;
        min-block-size: 0;
        margin: 0;
        padding-block-start: 1rem;
        padding-block-end: 2.5rem;
        padding-inline: 1rem;
        list-style: none;
      }

      .search-results > li + li {
        margin-block-start: 1rem;
      }

      .search-results > li {
        background-color: hsl(0deg 0% 100% / 60%);
        transition: background-color 200ms ease, border-color 200ms ease;
        padding: 1rem;
        border-radius: var(--border-radius);
        border: 1px solid hsl(0 0% 85%);
        cursor: pointer;
      }

      .search-results > li:hover,
      .search-results > li.active {
        background-color: white;
        border: 1px solid hsl(0 0% 55%);
      }

      button,
      .leaflet-container {
        font-family: inherit;
      }

      .leaflet-marker-icon.active {
        filter: hue-rotate(90deg);
      }

      .leaflet-popup-content-wrapper {
        border-radius: var(--border-radius)
      }

      /* scrollbar styles */
      .styled-scrollbars {
        /* Foreground, Background */
        scrollbar-color: #999 #333;
      }
      .styled-scrollbars::-webkit-scrollbar {
        width: 10px; /* Mostly for vertical scrollbars */
        height: 10px; /* Mostly for horizontal scrollbars */
      }
      .styled-scrollbars::-webkit-scrollbar-thumb { /* Foreground */
        background: #999;
      }
      .styled-scrollbars::-webkit-scrollbar-track { /* Background */
        background: #333;
      }
    </style>
    `;
  }

  get #template() {
    return `
      ${this.#style}
      <div class="map-wrapper">
        <form id="search">
          <label>
            <mp-icon icon-name="search"></mp-icon>
            <input type="text" name="query" placeholder="Berlin" title="Geben Sie eine Stadt ein, nach der Sie suchen möchten." />
          </label>
        </form>

        <div id="map"></div>

        <aside class="search-results-container closed">
          <header>
            <button type="button" class="search-results-delete">💥Suchergebnisse löschen</button>
          </header>
          <ul class="search-results styled-scrollbars"></ul>
          <button type="button" class="side-menu-toggle">↔</button>
        </aside>
      </div>
    `;
  }

  #updatePosition(e) {
    this.#removePositionPopup();

    this.#selectedPosition = e.latlng;

    this.#selectedPositionPopup = L.popup()
      .setLatLng(this.#selectedPosition)
      .setContent(`<h3>Ausgewählte Fotoposition:</h3><div>Breite: ${this.#selectedPosition.lat}</div><div>Länge: ${this.#selectedPosition.lng}</div>`)
      .openOn(this.#map);

    this.#selectedPositionPopup.on('remove', () => {
      this.#selectedPosition = null;
      this.#emit('update:position', this.#selectedPosition);
    });

    this.#emit('update:position', this.#selectedPosition);
  }

  #removeMarkers() {
    this.#currentMarkers.forEach(marker => {
      this.#map.removeLayer(marker);
    });
    this.#currentMarkers = [];
  }

  #clearMarkerClasses() {
    this.#currentMarkers.forEach(marker => {
      marker.getElement().classList.remove('active');
    });
  }

  #removePositionPopup() {
    if (this.#selectedPositionPopup) {
      this.#map.removeLayer(this.#selectedPositionPopup);
    }
  }

  #render() {
    this.innerHTML = this.#template;

    const searchForm = this.querySelector('#search');
    const searchFormInput = this.querySelector('#search input[type="text"]');
    const searchResultsContainer = this.querySelector('.search-results-container');
    const searchResultsContainerToggle = this.querySelector('.side-menu-toggle');
    const searchResults = this.querySelector('.search-results');
    const searchResultsDeleteBtn = this.querySelector('.search-results-delete');

    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (searchForm.elements.query.value === '') {
        return;
      }
      const query = searchForm.elements.query.value.toLowerCase();
      searchForm.elements.query.setAttribute('disabled', '');
      try {
        // Clear the resulsts list
        // TODO: remove click event listeners on the list items
        searchResults.innerText = '';
        // remove the previous markers
        // TODO: remove click event listeners on the markers
        this.#removeMarkers();

        this.#searchResults = await (await fetch(`${this.#nominatimURL}${query}`)).json();
        searchResultsContainer.removeAttribute('inert');
        searchResultsContainer.classList.remove('closed');
        console.log(this.#searchResults);

        if (this.#searchResults.length === 0) {
          searchResults.innerText = 'Keine Ergebnisse gefunden...!';
          return;
        }

        this.#searchResults.forEach((res, index) => {
          const listItem = document.createElement('li');
          const position = [res.lat, res.lon];
          listItem.textContent = listItem.textContent + res.display_name;
          listItem.textContent = listItem.textContent + `; [${res.lat}, ${res.lon}]`;
          searchResults.appendChild(listItem);

          // add the markers
          const marker = new L.marker(position).addTo(this.#map);
          marker.on('click', () => {
            this.#clearMarkerClasses();
            marker.getElement().classList.add('active');

            for (const child of searchResults.children) {
              child.classList.remove('active');
            }

            const foundEl = [...searchResults.children].find((el, idx) => index === idx);
            foundEl.classList.add('active');

            if (searchResultsContainer.classList.contains('closed')) {
              searchResultsContainer.classList.toggle('closed');
              setTimeout(() => {
                foundEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 1000);
            } else {
              foundEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            foundEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            this.#map.flyTo(marker.getLatLng(), 7);
          });
          this.#currentMarkers.push(marker);

          // add the click event to fly to the location
          listItem.addEventListener('click', (e) => {
            for (const child of searchResults.children) {
              child.classList.remove('active');
            }
            e.currentTarget.classList.add('active');
            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            this.#clearMarkerClasses();
            const foundMarker = this.#currentMarkers.find((_marker, idx) => index === idx);
            foundMarker.getElement().classList.add('active');
            this.#map.flyTo(position, 13);
          });
        });

        this.#map.flyTo(this.#overviewPosition, this.#minZoom);
      } catch (error) {
        console.log(error.message);
      } finally {
        searchForm.elements.query.removeAttribute('disabled');
      }
    });

    searchResultsDeleteBtn.addEventListener('click', () => {
      searchFormInput.value = '';
      searchResults.innerText = '';
      this.#searchResults = [];
      this.#selectedPosition = null;
      this.#removeMarkers();
      this.#map.flyTo(this.#overviewPosition, this.#minZoom);
      this.#emit('update:position', this.#selectedPosition);
    });

    searchResultsContainerToggle.addEventListener('click', () => {
      searchResultsContainer.classList.toggle('closed');
    });
  }
}

customElements.define('mp-location-picker', MpLocationPicker);
