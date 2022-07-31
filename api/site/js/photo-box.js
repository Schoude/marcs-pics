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

export {
  getAllPhotoBoxes,
  getPhotoBoxById,
  createNewPhotoBox,
  updatePhotoBox,
}
