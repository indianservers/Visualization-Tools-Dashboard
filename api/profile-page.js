const { identity } = require('../lib/account');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
  if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).end();
  if (!await identity(req)) { res.setHeader('Location', '/?returnTo=%2Fprofile&login=1'); return res.status(303).end(); }
  const path = require('node:path');
  const html = require('node:fs').readFileSync(path.join(process.cwd(), 'dist/profile.html'), 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(req.method === 'HEAD' ? '' : html);
};
