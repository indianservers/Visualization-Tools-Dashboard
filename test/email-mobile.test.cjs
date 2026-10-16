const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateUpdate, validLogin } = require('../lib/account');
test('mobile accepts international numbers, normalizes formatting, and supports removal', () => {
  assert.equal(validateUpdate({mobileNumber:'+91 98765-43210'}).mobileNumber,'+919876543210');
  assert.equal(validateUpdate({mobileNumber:''}).mobileNumber,null);
  for(const number of ['9876543210','+00012345678','+91abc123456','+123','+1234567890123456',12345]) assert.throws(()=>validateUpdate({mobileNumber:number}));
  assert.throws(()=>validateUpdate({mobileVerified:true}));
});
test('sessions accept only recent verified Google and email/password identities',()=>{
  const now=Date.now()/1000;
  const user={email:'test@example.com',email_verified:true,auth_time:now,firebase:{sign_in_provider:'password'}};
  assert.equal(validLogin(user,now),true);
  assert.equal(validLogin({...user,firebase:{sign_in_provider:'google.com'}},now),true);
  for(const invalid of [{...user,email_verified:false},{...user,auth_time:now-301},{...user,auth_time:NaN},{...user,firebase:{sign_in_provider:'custom'}},{...user,auth_time:now+120}])assert.equal(validLogin(invalid,now),false);
});
