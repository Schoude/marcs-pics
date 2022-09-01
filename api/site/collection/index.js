import { getCollectionByHash } from "../js/collection.js";

const queries = new URLSearchParams(window.location.search);
const hash = queries.get('hash');

if (!hash) {
  window.history.pushState({}, document.title, '/');
  window.location.pathname = '/';
}

// 1) data fetching and password check
const res = await getCollectionByHash(hash);
let collection;
if (res.status === 200) {
  collection = await res.json();
} else if (res.status === 401) {
  // show pw field
} else if (res.status === 400) {
  // some kind of error
  // i.e. password missing for password protected collection
}

// Elements
const contentEl = document.querySelector('.content');

// Add the collection viewer
const collectionViewer = document.createElement('mp-collection-viewer');
collectionViewer.collection = collection;
contentEl.appendChild(collectionViewer);
