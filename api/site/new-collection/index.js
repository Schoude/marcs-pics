import { checkAuth } from '../js/auth.js';
import { getPhotoBoxById } from '../js/photo-box.js';
import { generateCollectionImage } from '../js/collection-image.js';
import { proxRender } from '../js/reactivity.js';
import { generateHash } from '../js/utils.js';
import { createCollection } from "../js/collection.js";
import '../js/components/index.js';

await checkAuth();

const queries = new URLSearchParams(window.location.search);
const photoBoxId = queries.get('id');
if (photoBoxId == null) {
  window.location.pathname = '/';
}
const photoBox = await getPhotoBoxById(photoBoxId);
let requestLoading = false;

// Elements
const tagsContainer = document.querySelector('mp-tags-container');
const lightBox = document.querySelector('mp-light-box');
const sourceImagesContainer = document.querySelector('.source-images-inner');
const sharedImagesContainer = document.querySelector('.shared-images-inner');
const descriptionEl = document.querySelector('#description');
const passwordEl = document.querySelector('#password');
const formEl = document.querySelector('#form-shared-collection');

tagsContainer.tags = photoBox.tags;

const urls = proxRender([...photoBox.urls], sourceImagesContainer, (value, el) => {
  sourceImagesContainer.innerHTML = '';
  value.forEach(url => {
    const imageSwitcher = document.createElement('mp-image-switcher');
    imageSwitcher.data = { url, type: 'insert' };
    el.appendChild(imageSwitcher);
  });
});

// SharedCollection
const sharedCollection = {
  // delete from object if null
  password: null,
  photo_box_id: photoBox._id.$oid,
  hash: generateHash(25),
  description: null,
  images: [],
};

// Images for the SharedCollection
const collectionImages = proxRender([], sharedImagesContainer, (value, el) => {
  sharedImagesContainer.innerHTML = '';

  if (value.length === 0) {
    return;
  }

  value.forEach((collectionImage, index) => {
    const imageSwitcher = document.createElement('mp-image-switcher');
    const data = {
      url: collectionImage.url,
      type: 'remove',
      order: index,
      maxCount: value.length,
    };

    if (collectionImage.description != null) {
      data.description = collectionImage.description;
    }

    imageSwitcher.data = data;

    el.appendChild(imageSwitcher);
  });
});

// Listeners for insert, remove and comment add / remove custom events
window.addEventListener('image:inserted', (e) => {
  let tempUrls = [...urls.value];

  tempUrls.splice(tempUrls.indexOf(e.detail), 1);
  urls.value = tempUrls;

  let tempCollectionImages = [...collectionImages.value];
  const collectionImage = generateCollectionImage(
    e.detail,
    photoBox.tags,
  );
  tempCollectionImages.push(collectionImage);
  collectionImages.value = tempCollectionImages;
});

window.addEventListener('image:removed', (e) => {
  let tempCollectionImages = [...collectionImages.value];
  tempCollectionImages.splice(
    tempCollectionImages
      .findIndex(collectionImage => collectionImage.url === e.detail),
    1);
  collectionImages.value = tempCollectionImages;

  let tempUrls = [...urls.value];
  tempUrls.push(e.detail);
  urls.value = tempUrls;
});

window.addEventListener('description:added', (e) => {
  let tempCollectionImages = [...collectionImages.value];
  tempCollectionImages.find(img => img.url === e.detail.url).description = e.detail.description;
  collectionImages.value = tempCollectionImages;
});

window.addEventListener('description:removed', (e) => {
  let tempCollectionImages = [...collectionImages.value];
  tempCollectionImages.find(img => img.url === e.detail.url).description = null;
  collectionImages.value = tempCollectionImages;
});

window.addEventListener('order:up', (e) => {
  let tempCollectionImages = [...collectionImages.value];
  const foundImage = tempCollectionImages[e.detail.order];
  tempCollectionImages.splice(e.detail.order - 1, 0, foundImage);
  tempCollectionImages.splice(e.detail.order + 1, 1);
  collectionImages.value = tempCollectionImages;
});

window.addEventListener('order:down', (e) => {
  let tempCollectionImages = [...collectionImages.value];
  const foundImage = tempCollectionImages[e.detail.order];
  tempCollectionImages.splice(e.detail.order + 2, 0, foundImage);
  tempCollectionImages.splice(e.detail.order, 1);
  collectionImages.value = tempCollectionImages;
});

window.addEventListener('image:enlarge', (e) => {
  lightBox.images = [e.detail];
});

descriptionEl.addEventListener('input', (e) => {
  sharedCollection.description = e.target.value;
});

passwordEl.addEventListener('input', (e) => {
  sharedCollection.password = e.target.value;
});

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (requestLoading) return;
  requestLoading = true;

  if (collectionImages.value.length === 0 || sharedCollection.description === '') {
    return;
  }

  if (sharedCollection.password == null) {
    delete sharedCollection.password;
  }

  sharedCollection.images = collectionImages.value.map((img, index) => {
    if (img.description == null) {
      delete img.description;
    }

    img.order = index;

    return img;
  });

  try {
    await createCollection(sharedCollection);
  } catch (error) {
    console.log(error);
  } finally {
    requestLoading = false;
  }
});
