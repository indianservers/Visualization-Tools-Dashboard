const {test}=require('node:test');
const assert=require('node:assert/strict');
global.location={origin:'https://tools.aimersociety.com'};
test('login return destinations only allow trusted HTTPS websites',async()=>{
  const {safeReturnTo}=await import('../dist/account-client.mjs');
  assert.equal(safeReturnTo('/profile'),'https://tools.aimersociety.com/profile');
  assert.equal(safeReturnTo('https://ml.aimersociety.com/lesson?id=1'),'https://ml.aimersociety.com/lesson?id=1');
  for(const url of ['javascript:alert(1)','https://evil.com','//evil.com','https://aimersociety.com.evil.com','https://evil.aimersociety.com','http://ml.aimersociety.com','https://user:pass@ml.aimersociety.com','https://ml.aimersociety.com:8443','/?returnTo=/profile'])assert.equal(safeReturnTo(url),null,url);
});
