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

console.log(collection);

// TODO: put this in one ore more web components
// Elements
const mainImageFigure = document.querySelector('figure');
const asideImageContainer = document.querySelector('aside');

// 2) render the images
const mainImageEl = document.createElement('img');
const mainImage = collection.images[0];

mainImageEl.setAttribute('loading', 'lazy');
mainImageEl.setAttribute('src', mainImage.url);
mainImageFigure.appendChild(mainImageEl);

if (mainImage.description) {
  const mainImageCaption = document.createElement('figcaption');
  mainImageCaption.innerText = mainImage.description
  mainImageFigure.appendChild(mainImageCaption);
}

// 2.2) render the horizontal image list in the aside
collection.images.forEach(image => {
  const imgageEl = document.createElement('img');
  imgageEl.setAttribute('loading', 'lazy');
  imgageEl.setAttribute('src', image.url);

  if (image.description) {
    imgageEl.setAttribute('alt', image.description);
  }
  asideImageContainer.appendChild(imgageEl);
});
