export class MpTagsContainer extends HTMLElement {
  #tags = [0, 1, 2, 3, 4];
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  set tags(value) {
    this.#tags = value;
    this.render();
  }

  get style() {
    return `
      <style>
        :host * {
          box-sizing: border-box;
        }

        ul {
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          list-style: none;
        }
      </style>
    `;
  }

  get template() {
    return `
      ${this.style}
      <ul>
        ${this.#tags.map((tag, index) => `<mp-tag tag="${tag}" index="${index}"></mp-tag>`).join('')}
      </ul>
    `;
  }

  render() {
    this.shadow.innerHTML = this.template;
  }
}

customElements.define('mp-tags-container', MpTagsContainer);
