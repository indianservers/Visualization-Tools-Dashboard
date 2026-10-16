const { identity, guardOrigin, validateUpdate } = require('../lib/account');
module.exports = async (req, res) => {
  if (!guardOrigin(req, res)) return;
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Aimer-Account'); return res.status(204).end();
  }
  if (!['GET', 'PATCH'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed.' });
  const user = await identity(req);
  if (!user) return res.status(401).json({ error: 'Your session has expired. Sign in again to continue.' });
  try {
    const sql = require('@neondatabase/serverless').neon(process.env.DATABASE_URL);
    if (req.method === 'PATCH') {
      if (req.headers['x-aimer-account'] !== user.uid) return res.status(409).json({ error: 'Your signed-in account changed. Reload before saving.' });
      if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({ error: 'JSON required.' });
      if (Buffer.byteLength(JSON.stringify(req.body || {})) > 12000) return res.status(413).json({ error: 'Update is too large.' });
      let update;
      try { update = validateUpdate(req.body); } catch (error) { return res.status(400).json({ error: error.message }); }
      if (update.learning) {
        const rows = await sql`UPDATE aimer_users SET learning = ${JSON.stringify(update.learning)}::jsonb, learning_version = learning_version + 1
          WHERE firebase_uid = ${user.uid} AND learning_version = ${update.version} RETURNING firebase_uid`;
        if (!rows.length) return res.status(409).json({ error: 'Your learning space changed on another device. Reload before saving.' });
      }
      if (update.displayName !== undefined || update.mobileNumber !== undefined || update.interests !== undefined || update.onboardingComplete !== undefined) {
        await sql`UPDATE aimer_users SET display_name = COALESCE(${update.displayName ?? null}, display_name),
          interests = COALESCE(${update.interests === undefined ? null : JSON.stringify(update.interests)}::jsonb, interests),
          mobile_number = CASE WHEN ${Object.hasOwn(update, 'mobileNumber')} THEN ${update.mobileNumber ?? null} ELSE mobile_number END,
          onboarding_complete = COALESCE(${update.onboardingComplete ?? null}, onboarding_complete) WHERE firebase_uid = ${user.uid}`;
      }
    }
    const rows = await sql`SELECT firebase_uid, email, display_name, photo_url, mobile_number, created_at, last_login_at, interests, onboarding_complete, learning, learning_version FROM aimer_users WHERE firebase_uid = ${user.uid}`;
    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'Profile not found. Please sign out and sign in again.' });
    return res.status(200).json({ profile: {
      uid: row.firebase_uid, email: row.email, name: row.display_name, picture: row.photo_url,
      mobileNumber: row.mobile_number || null, mobileVerified: false, signInMethod: user.firebase?.sign_in_provider || null,
      createdAt: row.created_at, lastLoginAt: row.last_login_at, interests: row.interests,
      onboardingComplete: row.onboarding_complete, learning: row.learning, version: row.learning_version
    } });
  } catch (error) {
    console.error('Profile request failed', { code: error.code || 'unknown' });
    return res.status(503).json({ error: 'Your profile could not be loaded or saved. Please try again.' });
  }
};
