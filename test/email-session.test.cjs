const {test,mock}=require('node:test');
const assert=require('node:assert/strict');
const Module=require('node:module'), original=Module._load;
let user, saved=0, sessions=0;
process.env.FIREBASE_SERVICE_ACCOUNT_JSON='{}'; process.env.DATABASE_URL='test-only';
mock.method(Module,'_load',function(name,...args){
  if(name==='firebase-admin/app')return {getApps:()=>[{}]};
  if(name==='firebase-admin/auth')return {getAuth:()=>({verifyIdToken:async()=>user,createSessionCookie:async()=>{sessions++;return 'test-session'}})};
  if(name==='@neondatabase/serverless')return {neon:()=>async()=>{saved++}};
  return original.call(this,name,...args);
});
const handler=require('../api/session');
async function login(provider,verified=true,claims={}){
  user={uid:'test-uid',email:'test@example.com',email_verified:verified,auth_time:Date.now()/1000,firebase:{sign_in_provider:provider},...claims};
  const res={headers:{},code:200,setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},json(body){this.body=body;return this}};
  await handler({method:'POST',headers:{host:'tools.aimersociety.com',origin:'https://tools.aimersociety.com','content-type':'application/json'},body:{idToken:'test-token'}},res);
  return res;
}
test('verified email/password sign-in creates the same shared secure session',async()=>{
  const res=await login('password');assert.equal(res.code,200);assert.equal(res.body.user.signInMethod,'password');assert.match(res.headers['Set-Cookie'],/Domain=aimersociety.com/);assert.equal(saved,1);assert.equal(sessions,1);
});
test('unverified email cannot create a profile or shared session',async()=>{
  saved=0;sessions=0;const res=await login('password',false);assert.equal(res.code,401);assert.equal(saved,0);assert.equal(sessions,0);
});
test('Google still works and other providers fail closed',async()=>{
  assert.equal((await login('google.com')).code,200);assert.equal((await login('anonymous')).code,401);
});
test('verified phone-only identity creates a shared session without an email',async()=>{
  saved=0;sessions=0;
  const res=await login('phone',false,{email:undefined,phone_number:'+919876543210'});
  assert.equal(res.code,200);assert.equal(res.body.user.email,null);
  assert.equal(res.body.user.signInMethod,'phone');assert.equal(saved,1);assert.equal(sessions,1);
  assert.match(res.headers['Set-Cookie'],/HttpOnly; Secure/);
});
test('phone identities without valid server-verified numbers or recent authentication fail closed',async()=>{
  for(const claims of [{},{phone_number:'9876543210'},{phone_number:'+00012345678'},{phone_number:'+919876543210',auth_time:Date.now()/1000-301}]){
    saved=0;sessions=0;const res=await login('phone',false,claims);
    assert.equal(res.code,401);assert.equal(saved,0);assert.equal(sessions,0);
  }
});
