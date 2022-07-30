async function checkAuth() {
  const res = await fetch('/api/me');
  if (res.status === 401) {
    window.location.pathname = '/login';
  }
  return await res.json();
}

async function checkAuthLoginPage() {
  const res = await fetch('/api/me');
  if (res.status === 200) {
    window.location.pathname = '/';
  }
}

export {
  checkAuth,
  checkAuthLoginPage,
}
