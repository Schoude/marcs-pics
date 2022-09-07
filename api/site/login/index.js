import { checkAuthLoginPage, loginUser } from '../js/auth.js';
await checkAuthLoginPage();

const emailEl = document.querySelector('input[type="email"]');
const passwordEl = document.querySelector('input[type="password"]');

async function onSubmit(e) {
  e.preventDefault();

  const credentials = {
    email: emailEl.value,
    password: passwordEl.value,
  };

  await loginUser(credentials);
}

document.querySelector('form').addEventListener('submit', onSubmit);