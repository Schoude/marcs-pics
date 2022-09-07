import { checkAuth } from '../js/auth.js';
import { getPhotoBoxById, updatePhotoBox, uploadImage, deleteImage } from '../js/photo-box.js';
import { proxRender } from '../js/reactivity.js';
import '../js/components/index.js';
await checkAuth();

const queries = new URLSearchParams(window.location.search);
const photoBoxId = queries.get('id');

let photoBox = await getPhotoBoxById(photoBoxId);
let updatedPhotoBox = JSON.parse(JSON.stringify(photoBox));
let updatedTags = JSON.parse(JSON.stringify(photoBox.tags));
let files = [];

let requestLoading = false;

const formEl = document.querySelector('#photo-box');
const folderNameInput = document.querySelector('#folder_name');
const displayNameInput = document.querySelector('#display_name');
const descriptionInput = document.querySelector('#description');
const tagInput = document.querySelector('#tag');
const containerTags = document.querySelector('mp-tags-container');
const btnSubmitEl = document.querySelector('#btn-submit');
const btnReset = document.querySelector('#btn-reset');
const fileInput = document.querySelector('input[type="file"]');
const currentPhotos = document.querySelector('.current-photos');
const countCurrentEl = document.querySelector('#count-current');
const previewContainer = document.querySelector('.preview-container');
const btnUploadEl = document.querySelector('#btn-upload');

// Reactive variables that get re-rendered on change
const countCurrent = proxRender(photoBox.urls.length, countCurrentEl, (value, el) => {
  el.innerText = value;
});

function renderTags(tagsArr) {
  containerTags.tags = tagsArr;
}

function addTag(event) {
  if (event.target.value.trim() === '' || updatedTags.includes(event.target.value.trim()) || updatedTags.length === 10) {
    return;
  }

  if (event.key === 'Enter') {
    updatedTags.push(event.target.value.trim());
    event.target.value = '';
    renderTags(updatedTags);
  }
}

function initTextFields(box) {
  folderNameInput.value = photoBox.folder_name;
  displayNameInput.value = photoBox.display_name;
  descriptionInput.value = photoBox.description
  tagInput.value = '';
  updatedTags = JSON.parse(JSON.stringify(photoBox.tags));
  renderTags(updatedTags);
}

function renderCurrentImages(box) {
  currentPhotos.innerHTML = '';
  box.urls.forEach(url => {
    const image = document.createElement('mp-current-image');
    image.url = url;
    currentPhotos.appendChild(image);
  });
}

function renderPreviewImages(filesArray) {
  previewContainer.innerHTML = '';

  filesArray.forEach((file, index) => {
    const src = URL.createObjectURL(file);
    const data = {
      src,
      name: file.name,
      index,
    }

    const previewImage = document.createElement('mp-preview-image');
    previewImage.data = data;
    previewContainer.appendChild(previewImage);
  });
}

async function onSubmit(event) {
  event.preventDefault();
  if (requestLoading) {
    return
  }
  let data = new FormData(formEl);
  [...data.entries()].forEach(([key, value]) => {
    updatedPhotoBox[key] = value.trim();
  });

  updatedPhotoBox.tags = updatedTags;
  delete updatedPhotoBox._id;
  delete updatedPhotoBox.owner_id;
  delete updatedPhotoBox.created_at;

  try {
    btnSubmitEl.setAttribute('disabled', true);
    requestLoading = true;
    const savedPhotoBox = await updatePhotoBox(photoBox._id.$oid, updatedPhotoBox);
    btnSubmitEl.removeAttribute('disabled');
    requestLoading = false;
  } catch (e) {
    btnSubmitEl.removeAttribute('disabled');
    requestLoading = false;
    throw new Error(e.message);
  }
}

initTextFields();
renderCurrentImages(photoBox);

tagInput.addEventListener('keyup', addTag);
btnReset.addEventListener('click', () => initTextFields(photoBox));
containerTags.addEventListener('tag:removed', (e) => {
  updatedTags.splice(e.detail.index, 1);
  renderTags(updatedTags);
});
formEl.addEventListener('submit', onSubmit);
fileInput.addEventListener('change', (e) => {
  files = [...e.target.files];
  renderPreviewImages(files);
  e.target.value = null;
});
window.addEventListener('image:removed', (e) => {
  files.splice(e.detail.index, 1);
  renderPreviewImages(files);
});
btnUploadEl.addEventListener('click', async () => {
  if (files.length === 0) {
    return;
  }

  await Promise.allSettled(files.map(file => {
    const fd = new FormData();
    fd.append('dest_folder', photoBox.folder_name);
    fd.append('file', file);
    return uploadImage(fd);
  }))

  files = []
  renderPreviewImages(files);

  photoBox = await getPhotoBoxById(photoBoxId);
  countCurrent.value = photoBox.urls.length;
  renderCurrentImages(photoBox);
});
window.addEventListener('image:deleted', async (e) => {
  await deleteImage(photoBox._id.$oid, e.detail.url);
  photoBox.urls.splice(photoBox.urls.indexOf(e.detail.url), 1);
  countCurrent.value = photoBox.urls.length;
  renderCurrentImages(photoBox);
});
