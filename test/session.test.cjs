const { test } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/session');
async function request(method, headers = {}, body) {
  const res = { headers: {}, code: 200, setHeader(k,v) { this.headers[k] = v; }, status(v) { this.code = v; return this; }, json(v) { this.body = v; return this; }, end() { return this; } };
  await handler({ method, headers: { host: 'tools.aimersociety.com', ...headers }, body }, res);
  return res;
}
test('session endpoint blocks unapproved and missing mutation origins', async () => {
  assert.equal((await request('POST')).code, 403);
  assert.equal((await request('DELETE', { origin: 'https://evil.aimersociety.com' })).code, 403);
});
test('session endpoint fails closed without server credentials', async () => {
  const saved = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  try { assert.equal((await request('GET')).code, 503); }
  finally { if (saved) process.env.FIREBASE_SERVICE_ACCOUNT_JSON = saved; }
});
test('logout clears secure shared cookie and does not cache', async () => {
  const res = await request('DELETE', { origin: 'https://tools.aimersociety.com' });
  assert.equal(res.code, 200);
  assert.match(res.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Lax; Max-Age=0; Domain=aimersociety.com/);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});
test('preview logout cannot set parent-domain cookie', async () => {
  const res = await request('DELETE', { host: 'preview.vercel.app', origin: 'https://tools.aimersociety.com' });
  assert.doesNotMatch(res.headers['Set-Cookie'], /Domain=/);
});
