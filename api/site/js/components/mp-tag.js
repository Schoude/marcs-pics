export class MpTag extends HTMLElement {
  #tag = '';
  #index = '';

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['tag', 'index'];
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    switch (name) {
      case 'tag':
        this.#tag = newVal;
        break;
      case 'index':
        this.#index = newVal;
        break;
    }

    this.render();
  }

  get style() {
    return `
      <style>
        li {
          background-color: #3e7d68;
          border-radius: 4rem;
          padding: .25rem .75rem;
        }
      </style>
    `;
  }

  get template() {
    return `
      ${this.style}
      <li>
        ${this.#tag}
      </li>
    `;
  }

  render() {
    this.shadow.innerHTML = this.template;

    const liEl = this.shadow.querySelector('li');
    liEl.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('tag:removed', {
        detail: {
          tag: this.#tag, index: +this.#index
        },
        bubbles: true,
        composed: true,
      }));
    })
  }
}

customElements.define('mp-tag', MpTag);
