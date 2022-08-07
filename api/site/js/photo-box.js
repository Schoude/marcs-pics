async function getAllPhotoBoxes() {
  return await (await fetch('/api/photo-boxes')).json();
}

async function getPhotoBoxById(id) {
  return await (await fetch(`api/photo-box/${id}`)).json();
}

async function createNewPhotoBox(payload) {
  const res = await fetch('/api/photo-box', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (res.status === 201) {
    window.location.pathname = '/';
  }
}

async function updatePhotoBox(id, payload) {
  const res = await fetch(`/api/photo-box/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return await res.json();
}

async function uploadImage(formdata) {
  await fetch('/api/image-upload', {
    method: 'POST',
    body: formdata
  });
}

async function deleteImage(id, url) {
  await fetch(`/api/image-delete?id=${id}&url=${url}`, {
    method: 'DELETE',
  });
}

export {
  getAllPhotoBoxes,
  getPhotoBoxById,
  createNewPhotoBox,
  updatePhotoBox,
  uploadImage,
  deleteImage,
}
