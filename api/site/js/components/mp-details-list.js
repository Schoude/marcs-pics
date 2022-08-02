export class MpDetailsList extends HTMLElement {
  #items = [];

  constructor() {
    super();

    this.classList.add('mp-details-list');
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  /**
   * @param {unknown[]} value
   */
  set items(value) {
    this.#items = value;
    this.render();
  }

  get style() {
    return `
      <style>
      :host {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 1.5rem;
      }
      </style>
    `
  }

  render() {
    this.shadow.innerHTML = `
      ${this.style}
      ${this.#items.map(item => {
      const tagStrings = JSON.stringify(item.tags);
      return `
          <mp-details
            id='${item._id.$oid}'
            name='${item.display_name}'
            description='${item.description}'
            folder-name='${item.folder_name}'
            tags='${tagStrings}'
          /></mp-details>
      `}).join('')
      }
    `;
  }
}

customElements.define('mp-details-list', MpDetailsList);
