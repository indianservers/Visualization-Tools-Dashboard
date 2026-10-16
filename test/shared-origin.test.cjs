const { test } = require('node:test');
const assert = require('node:assert/strict');
const session = require('../api/session');
const profile = require('../api/profile');
const ml = 'https://ml.aimersociety.com';
function response() {
  return { headers: {}, code: 200, setHeader(k,v) { this.headers[k]=v; }, status(v) { this.code=v; return this; }, json(v) { this.body=v; return this; }, end() { return this; } };
}
test('ML credentialed session and profile preflights preserve exact CORS on errors', async () => {
  const previous = process.env.AUTH_ALLOWED_ORIGINS;
  process.env.AUTH_ALLOWED_ORIGINS = `https://tools.aimersociety.com,${ml}`;
  try {
    for (const [handler, method, expected] of [[session,'GET',200],[session,'OPTIONS',204],[profile,'OPTIONS',204],[profile,'GET',401]]) {
      const res=response();
      await handler({method, headers:{origin:ml,host:'tools.aimersociety.com'}},res);
      assert.equal(res.code,expected);
      assert.equal(res.headers['Access-Control-Allow-Origin'],ml);
      assert.equal(res.headers['Access-Control-Allow-Credentials'],'true');
      assert.equal(res.headers.Vary,'Origin');
      assert.match(res.headers['Cache-Control'],/no-store/);
      if(method==='OPTIONS') {
        assert.match(res.headers['Access-Control-Allow-Headers'],/Content-Type/);
        assert.match(res.headers['Access-Control-Allow-Methods'],handler===session?/POST, DELETE/:/PATCH/);
        if(handler===profile) assert.match(res.headers['Access-Control-Allow-Headers'],/X-Aimer-Account/);
      }
    }
    for(const origin of ['https://evil.aimersociety.com','https://ml.aimersociety.com.evil.example']) {
      const res=response();await session({method:'OPTIONS',headers:{origin}},res);
      assert.equal(res.code,403);assert.equal(res.headers['Access-Control-Allow-Origin'],undefined);
    }
  } finally {
    if(previous===undefined) delete process.env.AUTH_ALLOWED_ORIGINS; else process.env.AUTH_ALLOWED_ORIGINS=previous;
  }
});
