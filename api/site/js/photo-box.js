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

export {
  getAllPhotoBoxes,
  getPhotoBoxById,
  createNewPhotoBox,
}
