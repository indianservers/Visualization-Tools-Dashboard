import { getProfile, updateProfile, accountRequest, photo } from './account-client.mjs';
const $ = s => document.querySelector(s);
let accountUid;
function render(p) {
  accountUid = p.uid;
  $('#display-name').value = p.name || ''; $('#email').value = p.email || ''; photo($('#user-avatar'), p);
  $('#mobile-number').value = p.mobileNumber || '';
  $('#sign-in-provider').textContent = p.signInMethod === 'phone' ? `✓ Connected with phone (${p.verifiedPhone || ''})` : p.signInMethod === 'password' ? '✓ Connected with email & password' : '✓ Connected with Google';
  for (const input of document.querySelectorAll('.interest-options input')) input.checked = p.interests.includes(input.value);
  for (const key of ['favorites', 'pinned', 'recent']) $('#stat-' + key).textContent = p.learning[key].length;
  const date = value => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
  $('#member-since').textContent = date(p.createdAt); $('#last-login').textContent = date(p.lastLoginAt);
  $('#profile-content').hidden = false;
}
async function load() {
  $('#profile-error').hidden = true; $('#profile-loading').hidden = false;
  try { render(await getProfile()); }
  catch (error) {
    $('#profile-content').hidden = true;
    if (error.status === 401) { location.replace('/?returnTo=%2Fprofile&login=1'); return; }
    $('#profile-error').hidden = false; $('#profile-error-text').textContent = error.message;
  } finally { $('#profile-loading').hidden = true; }
}
$('#profile-form').addEventListener('submit', async e => {
  e.preventDefault(); $('#save-profile').disabled = true; $('#profile-status').textContent = 'Saving…';
  try {
    render(await updateProfile({ displayName: $('#display-name').value, mobileNumber: $('#mobile-number').value, interests: [...document.querySelectorAll('.interest-options input:checked')].map(x => x.value), onboardingComplete: true }, accountUid));
    $('#profile-status').textContent = 'Your profile is up to date.';
  } catch (error) { $('#profile-status').textContent = error.message; if (error.status === 401) location.replace('/?returnTo=%2Fprofile&login=1'); }
  finally { $('#save-profile').disabled = false; }
});
$('#profile-signout').addEventListener('click', async () => {
  $('#profile-signout').disabled = true;
  try { await accountRequest('/api/session', { method: 'DELETE' }); location.replace('/'); }
  catch (error) { $('#signout-status').textContent = error.message; $('#profile-signout').disabled = false; }
});
$('#profile-retry').addEventListener('click', load);
window.addEventListener('pageshow', load);
window.addEventListener('focus', () => { if (!document.querySelector('#profile-form :focus')) load(); });
