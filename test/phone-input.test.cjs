const {test}=require('node:test');
const assert=require('node:assert/strict');
const library=require('libphonenumber-js/max');
const validate=import('../dist/phone-number.mjs').then(m=>m.validatePhoneNumber);
test('country and national mobile number validate separately',async()=>{
 const check=await validate;
 assert.match(check(library,'XX','9876543210').countryError,/country/);
 assert.match(check(library,'IN','').numberError,/Enter/);
 assert.match(check(library,'IN','123').numberError,/valid/);
 assert.match(check(library,'IN','+919876543210').numberError,/without/);
 assert.match(check(library,'IN','call 9876543210').numberError,/without/);
 assert.equal(check(library,'IN','98765 43210').number,'+919876543210');
 assert.equal(check(library,'GB','07400 123456').number,'+447400123456');
 assert.match(check(library,'US','020 7946 0018').numberError,/valid/);
 assert.match(check(library,'GB','020 7946 0018').numberError,/mobile/);
});
