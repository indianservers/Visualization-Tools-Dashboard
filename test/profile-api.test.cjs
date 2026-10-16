const {test, mock} = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const originalLoad = Module._load;
const calls = [];
let versionConflict = false;
mock.method(Module, '_load', function(name, ...args) {
  if(name === '../lib/account') return {...originalLoad.call(this,name,...args),identity:async req=>req.headers.cookie==='valid-session'?{uid:'verified-alice'}:null};
  if(name === '@neondatabase/serverless') return {neon:()=>async (strings,...values)=>{
    const sql=strings.join('?'); calls.push({sql,values});
    if(sql.includes('UPDATE') && sql.includes('learning_version'))return versionConflict?[]:[{firebase_uid:'verified-alice'}];
    return [{firebase_uid:'verified-alice',email:'alice@example.com',display_name:'Alice',interests:[],learning:{favorites:[],pinned:[],recent:[]},learning_version:1}];
  }};
  return originalLoad.call(this,name,...args);
});
const handler=require('../api/profile');
async function request(method,body,headers={}) {
  const res={headers:{},code:200,setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},json(body){this.body=body;return this},end(){}};
  await handler({method,body,headers:{origin:'https://tools.aimersociety.com','content-type':'application/json',...headers}},res);return res;
}
test('private profiles and edits require a verified session', async()=>{
  calls.length=0;
  assert.equal((await request('GET')).code,401);
  assert.equal((await request('PATCH',{displayName:'Mallory'})).code,401);
  assert.equal(calls.length,0);
});
test('profile reads are scoped to session UID, never caller query', async()=>{
  calls.length=0;
  const res=await request('GET',{uid:'victim'},{cookie:'valid-session'});
  assert.equal(res.code,200);assert.equal(res.body.profile.uid,'verified-alice');
  assert.deepEqual(calls[0].values,['verified-alice']);
  assert.match(res.headers['Cache-Control'],/no-store/);
});
test('account switching and ownership-field tampering are rejected', async()=>{
  assert.equal((await request('PATCH',{displayName:'Mallory'},{cookie:'valid-session','x-aimer-account':'victim'})).code,409);
  assert.equal((await request('PATCH',{uid:'victim',displayName:'Mallory'},{cookie:'valid-session','x-aimer-account':'verified-alice'})).code,400);
});
test('learning conflicts do not overwrite another device', async()=>{
  versionConflict=true;
  const res=await request('PATCH',{learning:{favorites:[],pinned:[],recent:[]},version:0},{cookie:'valid-session','x-aimer-account':'verified-alice'});
  assert.equal(res.code,409);versionConflict=false;
});
test('profile mutation parameterizes untrusted names and scopes update', async()=>{
  calls.length=0;
  const res=await request('PATCH',{displayName:"<img src=x onerror=alert(1)>"},{cookie:'valid-session','x-aimer-account':'verified-alice'});
  assert.equal(res.code,200);assert.equal(calls[0].values.at(-1),'verified-alice');assert.ok(!calls[0].sql.includes('<img'));
});
test('profile page redirects guests and serves only a generic shell to verified users',async()=>{
  const page=require('../api/profile-page');
  function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},send(body){this.body=body;return this},end(){return this}}}
  const guest=response();await page({method:'GET',headers:{}},guest);
  assert.equal(guest.code,303);assert.equal(guest.headers.Location,'/?returnTo=%2Fprofile&login=1');
  const signedIn=response();await page({method:'GET',headers:{cookie:'valid-session'}},signedIn);
  assert.equal(signedIn.code,200);assert.match(signedIn.body,/id="profile-content" hidden/);assert.doesNotMatch(signedIn.body,/alice@example/);
  assert.match(signedIn.headers['Cache-Control'],/no-store/);
});
test('mobile number updates are normalized, private, and can be cleared',async()=>{
  calls.length=0;
  assert.equal((await request('PATCH',{mobileNumber:'+91 98765 43210'},{cookie:'valid-session','x-aimer-account':'verified-alice'})).code,200);
  assert.ok(calls[0].values.includes('+919876543210'));assert.equal(calls[0].values.at(-1),'verified-alice');
  assert.equal((await request('PATCH',{mobileNumber:''},{cookie:'valid-session','x-aimer-account':'verified-alice'})).code,200);
  assert.equal((await request('PATCH',{mobileNumber:'+919876543210'})).code,401);
});
