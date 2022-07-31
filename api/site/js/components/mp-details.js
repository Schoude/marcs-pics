export class MpDetails extends HTMLElement {
  id = '';
  name = '';
  description = ''
  folder_name = ''
  tags = [];

  constructor() {
    super()

    this.attachShadow({
      mode: 'open',
      // delegatesFocus: true,
    });

    this.classList.add('mp-details');
    this.render();
  }

  // 1) mounted
  // connectedCallback() {
  //   this.render();
  // }

  // like unmounted
  // disconnectedCallback() { }

  // needed to trigger the attributeChangedCallback
  static get observedAttributes() {
    return ['id', 'name', 'description', 'folder-name', 'tags'];
  }

  // like watch on a variable
  // needs the observedAttributes getter to be there
  // observing attrs is only opt-in.
  // can only be user for string values
  attributeChangedCallback(name, _oldVal, newVal) {
    switch (name) {
      case 'name':
        this.name = newVal || '';
        break;
      case 'id':
        this.id = newVal || '';
        break;
      case 'description':
        this.description = newVal || ''
        break;
      case 'folder-name':
        this.folder_name = newVal || ''
        break;
      case 'tags':
        this.tags = JSON.parse(newVal) || [];
        break;
    }

    // re-render after attr change
    this.render();
  }

  // /**
  //  * @param {{ name: string; id: string; description: string; }} value
  //  */
  // set data(value) {
  //   console.log('--data', value);
  //   this.pEl.textContent = value.name || '';
  //   this.btnEl.textContent = value.id || '';
  //   this.linkEl.href = `/test/${value.id}`;
  //   this.smallEl.textContent = value.description || '';
  //   this.linkEl.textContent = value.description || '';
  // }

  get style() {
    return `
      <style>
        /* targets the custom element itself */
        :host {
          border-radius: 4px;
          background-color: #1f3333;
          padding: 1.25rem 1.5rem;
          transition: background-color 300ms ease;
          box-shadow: 0 4px 4px -2px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.25);
        }

        :host * {
          box-sizing: border-box;
        }

        :host(:hover) {
          background-color: #243b3b;
        }

        h3 {
          margin-top: 0;
        }

        a {
          color: white;
        }

        .tags-container {
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .tag {
          background-color: #3e7d68;
          border-radius: 4rem;
          padding: .25rem .75rem;
          list-style: none;
        }

      </style>
    `;
  }

  get template() {
    return `
      ${this.style}
      <h3>${this.name}</h3>
      <p>${this.description}</p>
      <a href="/edit-photo-box?id=${this.id}">Fotobox bearbeiten</a>
      <!-- TODO: make the ul and the li also webcomponents -->
      <ul class="tags-container">
        ${this.tags.map(tag => `<li class="tag">${tag}</li>`).join('')}
      </ul>
      <a href="/new-collection?folder=${this.folder_name}">Neue Kollektion aus dieser Fotobox erstellen</a>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = this.template;
  }
}

customElements.define('mp-details', MpDetails);
