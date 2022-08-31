async function getAllCollections() {
  return await (await fetch('/api/collections')).json();
}

async function createCollection(collection) {
  const res = await fetch('/api/collection', {
    method: 'POST',
    body: JSON.stringify(collection),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (res.status === 201) {
    window.history.pushState({}, document.title, '/');
    window.location.pathname = '/';
  }
}

export {
  getAllCollections,
  createCollection,
}
