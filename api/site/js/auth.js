async function logoutUser() {
  const res = await fetch('/api/logout', { method: 'POST' });
  if (res.status === 202) {
    window.location.pathname = '/login';
  }
}

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
  logoutUser,
  checkAuth,
  checkAuthLoginPage,
}
