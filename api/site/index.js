import { checkAuth, logoutUser } from './js/auth.js';
import { getAllPhotoBoxes } from './js/photo-box.js';
import { getAllCollections } from './js/collection.js';
import "./js/components/index.js";
await checkAuth();

// Elements
const btnLogout = document.querySelector('button');
const mpDetailsList = document.querySelector('mp-details-list');
const collectionsList = document.querySelector('.collections');

async function onLogout() {
  await logoutUser();
}
btnLogout.addEventListener('click', onLogout);

mpDetailsList.items = await getAllPhotoBoxes();
const collections = await getAllCollections();

if (collections.length > 0) {
  collectionsList.innerHTML = '';

  collections.forEach(collection => {
    const collectionSummaryEl = document.createElement('mp-collection-summary');
    collectionSummaryEl.data = collection;
    collectionsList.appendChild(collectionSummaryEl);
  });
}
