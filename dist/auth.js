import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import { readSessionResponse } from './session-response.mjs';
import { getAuth, GoogleAuthProvider, signInWithPopup, setPersistence, inMemoryPersistence, signOut } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';

const app = initializeApp({
  apiKey: 'AIzaSyDKiPMjAuHqmFFm1l6tW3YMCkF7xQlsoMw',
  authDomain: 'mlvisualizationsaimersweb.firebaseapp.com',
  projectId: 'mlvisualizationsaimersweb',
  storageBucket: 'mlvisualizationsaimersweb.firebasestorage.app',
  messagingSenderId: '593351107909',
  appId: '1:593351107909:web:e2ba110eb27a8ef6830a2c'
});
const auth = getAuth(app);
const button = document.querySelector('#google-login');
const logout = document.querySelector('#google-logout');
const status = document.querySelector('#auth-status');
let currentUser = null;
let busy = false;
const persistence = setPersistence(auth, inMemoryPersistence);
function render(user) {
  currentUser = user;
  const trigger = document.querySelector('#account-trigger');
  trigger.classList.toggle('is-signed-in', Boolean(user));
  trigger.setAttribute('aria-label', user ? `Account: ${user.name || user.email || 'Signed in'}` : 'Continue to login');
  document.querySelector('#account-label').textContent = user ? (user.name || 'My account').split(' ')[0] : 'Continue to login';
  const avatar = trigger.querySelector('.account-avatar');
  if (user) avatar.textContent = (user.name || user.email || 'A').slice(0, 1).toUpperCase();
  else avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>';
  document.querySelector('#account-title').innerHTML = user ? 'Welcome to AIMER.' : 'A little curiosity.<br>Endless possibilities.';
  document.querySelector('#account-description').textContent = user ? 'You’re signed in. Let’s explore something new.' : 'Sign in or create your account with Google. Your next discovery starts here.';
  document.querySelector('#account-profile').hidden = !user;
  document.querySelector('#profile-name').textContent = user?.name || '';
  document.querySelector('#profile-email').textContent = user?.email || '';
  document.querySelector('#profile-initial').textContent = user ? (user.name || user.email || 'A').slice(0, 1).toUpperCase() : '';
  button.hidden = Boolean(user);
  button.disabled = false;
  logout.hidden = !user;
}
async function session(method = 'GET', idToken) {
  const response = await fetch('/api/session', {
    method, credentials: 'include',
    ...(method === 'POST' ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) } : {})
  });
  return readSessionResponse(response);
}
button.addEventListener('click', async () => {
  busy = true;
  button.disabled = true;
  status.textContent = 'Opening Google sign-in…';
  try {
    await persistence;
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    render(await session('POST', await result.user.getIdToken()));
    status.textContent = 'Signed in to AIMER Society.';
    document.querySelector('#account-dialog').close();
  } catch (error) {
    status.textContent = ({
      'auth/popup-closed-by-user': 'Sign-in cancelled. You can try again.',
      'auth/popup-blocked': 'Allow pop-ups for this site, then try again.',
      'auth/operation-not-allowed': 'Google sign-in must be enabled in Firebase.',
      'auth/unauthorized-domain': 'This website needs to be authorized in Firebase.'
    })[error.code] || error.message;
  } finally { await signOut(auth); button.disabled = false; busy = false; }
});
logout.addEventListener('click', async () => {
  busy = true;
  logout.disabled = true;
  try { await session('DELETE'); await signOut(auth); render(null); status.textContent = 'Signed out.'; }
  catch (error) { status.textContent = error.message; }
  finally { logout.disabled = false; busy = false; }
});
async function refresh() {
  if (busy) return;
  try { render(await session()); status.textContent = ''; }
  catch (error) { render(null); status.textContent = error.message; }
}
await refresh();
window.addEventListener('focus', refresh);
