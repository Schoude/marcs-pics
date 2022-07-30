async function loginUser(credentials) {
  const res = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' }
  });

  if (res.status === 202) {
    window.location.pathname = ('/');
  } else {
    console.log('show error');
  }
}

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
  loginUser,
  logoutUser,
  checkAuth,
  checkAuthLoginPage,
}
