import { getProfile, updateProfile } from './account-client.mjs';
import { mergeLearning } from './learning-merge.mjs';
let uid = null, base = null, version = 0, ready = false, timer, saving = false, dirty = false, generation = 0;
const bridge = window.aimerLearning;
const note = document.querySelector('.local-note');
const retry = document.querySelector('#sync-retry');
const label = message => { note.textContent = message; };
function pending() {
  try {
    const value = JSON.parse(localStorage.getItem('aimers-cloud-pending-' + uid));
    return value && ['base','local'].every(k => value[k] && ['favorites','pinned','recent'].every(f => Array.isArray(value[k][f]))) ? value : null;
  } catch { return null; }
}
function keepPending() {
  try { localStorage.setItem('aimers-cloud-pending-' + uid, JSON.stringify({ base, local: bridge.snapshot() })); } catch { /* Existing scoped local saves remain available. */ }
}
function personalized(profile) {
  const first = (profile.name || 'learner').split(' ')[0];
  document.querySelector('#welcome-copy').textContent = `Welcome back, ${first}`;
  const last = profile.learning.recent.find(r => r.type === 'subject');
  const link = document.querySelector('#continue-learning');
  link.href = last ? bridge.subject(last.id).url : '#subjects';
  link.textContent = last ? `Continue ${bridge.subject(last.id).name} →` : 'Explore subjects →';
  if (last) link.dataset.open = last.id; else delete link.dataset.open;
  link.hidden = false;
}
async function load(user) {
  const current = ++generation;
  uid = user?.uid || null; ready = false; dirty = false; clearTimeout(timer); retry.hidden = true;
  bridge.setAccount(uid);
  document.querySelector('#sync-device').hidden = !uid;
  document.querySelector('#welcome-copy').textContent = '';
  document.querySelector('#continue-learning').hidden = true;
  if (!uid) { label('Saved on this device'); document.querySelector('#sync-login').hidden = false; return; }
  document.querySelector('#sync-login').hidden = true;
  label('Loading your learning space…');
  try {
    const profile = await getProfile();
    if (current !== generation) return;
    const unsynced = pending();
    version = profile.version; base = profile.learning;
    bridge.apply(unsynced ? mergeLearning(unsynced.base, unsynced.local, base) : base); ready = true;
    label('Synced to your account'); personalized(profile);
    window.dispatchEvent(new CustomEvent('aimer-profile', { detail: profile }));
    if (unsynced) { dirty = true; await save(); }
    if (!profile.onboardingComplete) window.dispatchEvent(new CustomEvent('aimer-onboarding', { detail: profile }));
  } catch (error) { if (current === generation) { label(error.message); retry.hidden = false; if (error.status === 401) window.dispatchEvent(new Event('aimer-session-expired')); } }
}
async function save() {
  if (!ready || !uid || saving || !dirty) return;
  saving = true; dirty = false;
  const current = generation, snapshot = bridge.snapshot();
  label('Saving your learning space…');
  try {
    let profile;
    try { profile = await updateProfile({ learning: snapshot, version }, uid); }
    catch (error) {
      if (error.status !== 409) throw error;
      const remote = await getProfile();
      if (current !== generation) return;
      profile = await updateProfile({ learning: mergeLearning(base, snapshot, remote.learning), version: remote.version }, uid);
    }
    if (current !== generation) return;
    version = profile.version; base = profile.learning;
    if (!dirty) {
      bridge.apply(base);
      try { localStorage.removeItem('aimers-cloud-pending-' + uid); } catch {}
    } else { bridge.apply(mergeLearning(snapshot, bridge.snapshot(), base)); keepPending(); }
    label('Synced to your account'); retry.hidden = true; personalized(profile);
  } catch (error) { if (current === generation) { dirty = true; label('Not synced. Your changes are kept on this device.'); retry.hidden = false; if (error.status === 401) window.dispatchEvent(new Event('aimer-session-expired')); } }
  finally { saving = false; if (dirty && retry.hidden) timer = setTimeout(save, 300); }
}
window.addEventListener('aimer-account', e => load(e.detail));
window.addEventListener('aimer-learning-change', () => { if (!uid || !ready) return; dirty = true; keepPending(); clearTimeout(timer); timer = setTimeout(save, 400); });
window.addEventListener('online', () => { if (uid) ready ? save() : load({uid}); });
retry.addEventListener('click', () => ready ? save() : load(uid ? { uid } : null));
document.querySelector('#sync-device').addEventListener('click', () => {
  if (!ready) return;
  const guest = bridge.guest();
  bridge.apply(mergeLearning({ favorites: [], pinned: [], recent: [] }, guest, bridge.snapshot()));
  dirty = true; keepPending(); save();
});
document.querySelector('#sync-login').addEventListener('click', () => document.querySelector('#account-trigger').click());
