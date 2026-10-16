const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { neon } = require('@neondatabase/serverless');
const cookieName = '__Secure-aimer_session';
const expiresIn = 5 * 24 * 60 * 60 * 1000;

function auth() {
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
  }
  return getAuth();
}
function cookie(value, age, shared) {
  return `${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}${shared ? '; Domain=aimersociety.com' : ''}`;
}
function profile(user) {
  return { uid: user.uid, email: user.email || null, name: user.name || null, picture: user.picture || null };
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const allowed = (process.env.AUTH_ALLOWED_ORIGINS || 'https://tools.aimersociety.com').split(',').map(s => s.trim());
  const origin = req.headers.origin;
  if (origin && !allowed.includes(origin)) return res.status(403).json({ error: 'Origin not allowed.' });
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  const shared = req.headers.host?.split(':')[0] === 'tools.aimersociety.com';
  if (!['GET', 'POST', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed.' });
  if (req.method !== 'GET' && (!origin || !allowed.includes(origin))) return res.status(403).json({ error: 'An approved Origin is required.' });
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', cookie('', 0, shared));
    return res.status(200).json({ user: null });
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return res.status(503).json({ error: 'Google login is awaiting server configuration.' });
  try {
    if (req.method === 'GET') {
      const cookies = (req.headers.cookie || '').split(';').map(c => c.trim());
      const token = cookies.find(c => c.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
      if (!token) return res.status(200).json({ user: null });
      try { return res.status(200).json({ user: profile(await auth().verifySessionCookie(token, true)) }); }
      catch { res.setHeader('Set-Cookie', cookie('', 0, shared)); return res.status(401).json({ error: 'Please sign in again.' }); }
    }
    if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({ error: 'JSON required.' });
    const { idToken } = req.body || {};
    if (typeof idToken !== 'string' || idToken.length > 16000) return res.status(400).json({ error: 'Invalid login token.' });
    let user;
    try { user = await auth().verifyIdToken(idToken, true); }
    catch { return res.status(401).json({ error: 'Please sign in again.' }); }
    if (Date.now() / 1000 - user.auth_time > 300 || user.firebase?.sign_in_provider !== 'google.com' || !user.email_verified) return res.status(401).json({ error: 'A recent verified Google sign-in is required.' });
    if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Profile storage is awaiting server configuration.' });
    const sql = neon(process.env.DATABASE_URL);
    await sql`INSERT INTO aimer_users (firebase_uid, email, display_name, photo_url)
      VALUES (${user.uid}, ${user.email}, ${user.name || null}, ${user.picture || null})
      ON CONFLICT (firebase_uid) DO UPDATE SET email = EXCLUDED.email,
      display_name = EXCLUDED.display_name, photo_url = EXCLUDED.photo_url, last_login_at = NOW()`;
    const session = await auth().createSessionCookie(idToken, { expiresIn });
    res.setHeader('Set-Cookie', cookie(session, expiresIn / 1000, shared));
    return res.status(200).json({ user: profile(user) });
  } catch {
    return res.status(500).json({ error: 'Login could not complete. Please try again or contact support.' });
  }
};
