import { getCollectionByHash } from "../js/collection.js";

const queries = new URLSearchParams(window.location.search);
const hash = queries.get('hash');

if (!hash) {
  window.history.pushState({}, document.title, '/');
  window.location.pathname = '/';
}

const contentEl = document.querySelector('.content');

// 1) data fetching and password check
const res = await getCollectionByHash(hash);

let collection;
if (res.status === 200) {
  collection = await res.json();
  contentEl.classList.add('viewer');
  renderCollectionViewer()
} else if (res.status === 401) {
  renderPasswordInput();
} else if (res.status === 400) {
  renderErrorMessage({msg: 'Bitte gebe das Passwort für diese Kollektion ein.'});
  renderPasswordInput({clearHtml: false});
}

function renderCollectionViewer() {
  contentEl.innerHTML = '';

  const collectionViewer = document.createElement('mp-collection-viewer');
  collectionViewer.collection = collection;
  contentEl.appendChild(collectionViewer);
}

function renderPasswordInput({clearHtml = true}) {
  if (clearHtml) {
    contentEl.innerHTML = '';
  }

  const passwordInput = document.createElement('input');
  passwordInput.setAttribute('type', 'password');
  const buttonEl = document.createElement('button');
  buttonEl.setAttribute('type', 'button');
  buttonEl.innerText = 'Abschicken';
  contentEl.appendChild(passwordInput);
  contentEl.appendChild(buttonEl);

  buttonEl.addEventListener('click', async () => {
    const password = passwordInput.value;
    if (password === '') {
      return;
    }

    const res = await getCollectionByHash(hash, password);

    if (res.status === 200) {
      collection = await res.json();
      contentEl.classList.add('viewer');
      renderCollectionViewer()
    } else if (res.status === 401) {
      const pwErrorEl = document.querySelector('.error-pw');
      if (pwErrorEl) {
        return
      }

      renderErrorMessage({
        msg: 'Das angegebene Password war falsch!',
        clearHtml: false,
        className: 'error-pw'
      });
    }
  });
}

function renderErrorMessage({msg, clearHtml = true, className}) {
  if (clearHtml) {
    contentEl.innerHTML = '';
  }

  const errorMessage = document.createElement('p');
  if (className) {
    errorMessage.classList.add(className);
  }
  errorMessage.innerText = msg;
  contentEl.appendChild(errorMessage);
}
