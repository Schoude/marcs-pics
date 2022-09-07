import { checkAuth } from '../js/auth.js';
import '../js/components/index.js';

const me = await checkAuth();

import { createNewPhotoBox } from '/js/photo-box.js';

const formEl = document.querySelector('form');
const tagInput = document.querySelector('#tag');
const btnSubmitEl = document.querySelector('#btn-submit');
const containerTags = document.querySelector('mp-tags-container');

let requestLoading = false;

let tags = [];
const payloadInit = {
  owner_id: me._id.$oid,
  folder_name: '',
  display_name: '',
  description: '',
  urls: [],
  tags: [],
};
let payload = payloadInit;

function renderTags(tagsArr) {
  containerTags.tags = tagsArr;
}

function addTag(event) {
  if (event.target.value.trim() === '' || tags.includes(event.target.value.trim()) || tags.length === 10) {
    return;
  }

  if (event.key === 'Enter') {
    tags.push(event.target.value.trim());
    event.target.value = '';
    renderTags(tags);
  }
}

async function onSubmit(event) {
  event.preventDefault();
  if (requestLoading) {
    return
  }

  let data = new FormData(formEl);
  [...data.entries()].forEach(([key, value]) => {
    payload[key] = value.trim();
  });

  payload.tags = tags;

  try {
    btnSubmitEl.setAttribute('disabled', true);
    requestLoading = true;
    await createNewPhotoBox(payload);
  } catch (e) {
    btnSubmitEl.removeAttribute('disabled');
    requestLoading = false;
    payload = payloadInit;
    formEl.reset();
    tags = [];
    renderTags(tags);
    throw new Error(e.message);
  }
}

tagInput.addEventListener('keyup', addTag);
containerTags.addEventListener('tag:removed', (e) => {
  tags.splice(e.detail.index, 1);
  renderTags(tags);
});
formEl.addEventListener('submit', onSubmit);
