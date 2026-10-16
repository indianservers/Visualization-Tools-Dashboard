const { test } = require('node:test');
const assert = require('node:assert/strict');
test('plain-text Vercel crashes produce a readable error', async () => {
  const { readSessionResponse } = await import('../dist/session-response.mjs');
  await assert.rejects(readSessionResponse(new Response('A server error has occurred\nFUNCTION_INVOCATION_FAILED', { status: 500 })), /Login service is unavailable \(HTTP 500\)/);
});
test('JSON errors and anonymous sessions are handled correctly', async () => {
  const { readSessionResponse } = await import('../dist/session-response.mjs');
  assert.equal(await readSessionResponse(new Response('{"user":null}')), null);
  await assert.rejects(readSessionResponse(new Response('{"error":"Please sign in again."}', { status: 401 })), /Please sign in again/);
  await assert.rejects(readSessionResponse(new Response('null')), /unexpected response/);
});
