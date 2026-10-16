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
const persistence = setPersistence(auth, inMemoryPersistence);
function render(user) {
  currentUser = user;
  button.textContent = user ? user.name || user.email || 'Signed in' : 'Continue with Google';
  button.disabled = Boolean(user);
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
  button.disabled = true;
  status.textContent = 'Opening Google sign-in…';
  try {
    await persistence;
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    render(await session('POST', await result.user.getIdToken()));
    status.textContent = 'Signed in to AIMER Society.';
  } catch (error) {
    status.textContent = ({
      'auth/popup-closed-by-user': 'Sign-in cancelled. You can try again.',
      'auth/popup-blocked': 'Allow pop-ups for this site, then try again.',
      'auth/operation-not-allowed': 'Google sign-in must be enabled in Firebase.',
      'auth/unauthorized-domain': 'This website needs to be authorized in Firebase.'
    })[error.code] || error.message;
  } finally { await signOut(auth); button.disabled = Boolean(currentUser); }
});
logout.addEventListener('click', async () => {
  logout.disabled = true;
  try { await session('DELETE'); await signOut(auth); render(null); status.textContent = 'Signed out.'; }
  catch (error) { status.textContent = error.message; }
  finally { logout.disabled = false; }
});
async function refresh() {
  try { render(await session()); status.textContent = ''; }
  catch (error) { render(null); status.textContent = error.message; }
}
await refresh();
window.addEventListener('focus', refresh);
