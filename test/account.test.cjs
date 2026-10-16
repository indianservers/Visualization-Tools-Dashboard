const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateUpdate, identity, guardOrigin } = require('../lib/account');
test('anonymous and duplicate cookies cannot identify a profile', async () => {
  assert.equal(await identity({ headers: {} }), null);
  assert.equal(await identity({ headers: { cookie: '__Secure-aimer_session=a; __Secure-aimer_session=b' } }), null);
});
test('profile edits reject identity changes and invalid input', () => {
  for (const body of [{uid:'other'}, {email:'other@example.com'}, {displayName:''}, {interests:['Admin']}, {onboardingComplete:false}, {learning:{favorites:[99],pinned:[],recent:[]},version:0}]) assert.throws(() => validateUpdate(body));
  assert.deepEqual(validateUpdate({displayName:' Sai ',interests:['AI','AI']}), {displayName:'Sai',interests:['AI']});
});
test('learning updates require a version and bounded typed data', () => {
  const learning = {favorites:[1],pinned:[],recent:[{type:'subject',id:1,time:Date.now()}]};
  assert.throws(() => validateUpdate({learning}));
  assert.equal(validateUpdate({learning,version:0}).version,0);
  assert.throws(() => validateUpdate({learning:{...learning,recent:[{type:'subject',id:1,time:Infinity}]},version:0}));
});
test('profile mutations block missing and unapproved origins', () => {
  const response = {setHeader(){},status(code){this.code=code;return this},json(){}};
  for(const origin of [undefined,'https://evil.aimersociety.com']) {
    assert.equal(guardOrigin({method:'PATCH',headers:{origin}},response),false); assert.equal(response.code,403);
  }
});
test('three-way sync preserves remote additions and local removals', async () => {
  const {mergeLearning} = await import('../dist/learning-merge.mjs');
  const base={favorites:[1,2],pinned:[],recent:[]};
  assert.deepEqual(mergeLearning(base,{favorites:[2,3],pinned:[],recent:[]},{favorites:[1,2,4],pinned:[],recent:[]}).favorites,[2,4,3]);
});
