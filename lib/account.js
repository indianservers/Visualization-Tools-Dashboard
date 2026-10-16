const COOKIE = '__Secure-aimer_session';
function firebaseAuth() {
  const { initializeApp, getApps, cert } = require('firebase-admin/app');
  if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
  return require('firebase-admin/auth').getAuth();
}
async function identity(req) {
  const tokens = (req.headers.cookie || '').split(';').map(s => s.trim()).filter(s => s.startsWith(COOKIE + '='));
  if (tokens.length !== 1) return null;
  try { return await firebaseAuth().verifySessionCookie(tokens[0].slice(COOKIE.length + 1), true); }
  catch { return null; }
}
function guardOrigin(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const allowed = (process.env.AUTH_ALLOWED_ORIGINS || 'https://tools.aimersociety.com').split(',').map(s => s.trim());
  const origin = req.headers.origin;
  if ((origin && !allowed.includes(origin)) || (!['GET', 'HEAD'].includes(req.method) && !origin)) {
    res.status(403).json({ error: 'An approved website origin is required.' }); return false;
  }
  if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Access-Control-Allow-Credentials', 'true'); res.setHeader('Vary', 'Origin'); }
  return true;
}
const interests = ['AI', 'Science', 'Engineering', 'Computing', 'Maths'];
function validateUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid update.');
  if (Object.keys(body).some(k => !['displayName', 'interests', 'onboardingComplete', 'learning', 'version'].includes(k))) throw new Error('Unknown profile field.');
  const result = {};
  if ('displayName' in body) {
    if (typeof body.displayName !== 'string' || !body.displayName.trim() || body.displayName.length > 80 || /[\u0000-\u001f]/.test(body.displayName)) throw new Error('Use a name between 1 and 80 characters.');
    result.displayName = body.displayName.trim();
  }
  if ('interests' in body) {
    if (!Array.isArray(body.interests) || body.interests.length > 5 || body.interests.some(x => !interests.includes(x))) throw new Error('Choose interests from the available options.');
    result.interests = [...new Set(body.interests)];
  }
  if ('onboardingComplete' in body) {
    if (body.onboardingComplete !== true) throw new Error('Invalid onboarding choice.');
    result.onboardingComplete = true;
  }
  if ('learning' in body) {
    if (Object.keys(body).some(k => !['learning', 'version'].includes(k))) throw new Error('Save learning and profile changes separately.');
    if (!Number.isSafeInteger(body.version) || body.version < 0) throw new Error('A learning version is required.');
    const v = body.learning;
    const ids = x => Array.isArray(x) && x.length <= 21 && x.every(i => Number.isInteger(i) && i >= 0 && i <= 20);
    if (!v || Object.keys(v).some(k => !['favorites', 'pinned', 'recent'].includes(k)) || !ids(v.favorites) || !ids(v.pinned) || !Array.isArray(v.recent) || v.recent.length > 8) throw new Error('Invalid learning space.');
    const recent = v.recent.map(r => {
      if (!r || !Number.isSafeInteger(r.time) || r.time < 0 || r.time > Date.now() + 60000 || !(r.type === 'subject' ? Number.isInteger(r.id) && r.id >= 0 && r.id <= 20 : r.type === 'app' && ['circuits', 'maths', 'biology', 'chemistry'].includes(r.id))) throw new Error('Invalid recent activity.');
      return { type: r.type, id: r.id, time: r.time };
    });
    result.learning = { favorites: [...new Set(v.favorites)], pinned: [...new Set(v.pinned)], recent };
    result.version = body.version;
  }
  if (!Object.keys(result).length) throw new Error('No changes provided.');
  return result;
}
module.exports = { identity, guardOrigin, validateUpdate, firebaseAuth };
