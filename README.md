# AIMER Society Visualizations Dashboard

## Google login and shared sessions

The dashboard uses the `mlvisualizationsaimersweb` Firebase project for Google sign-in.
The Vercel function at `/api/session` verifies recent Google ID tokens, upserts a
profile into Neon, and creates a five-day HttpOnly, Secure session cookie for
`aimersociety.com` on the production tools host. The Firebase browser SDK uses
memory-only persistence; the server session is the source of login state.

Deployment setup:
1. Enable Google in Firebase Authentication → Sign-in method.
2. Keep tools.aimersociety.com in Firebase authorized domains.
3. Set DATABASE_URL and FIREBASE_SERVICE_ACCOUNT_JSON in Vercel environment
   variables. Obtain the latter from Firebase Project settings → Service accounts
   → Generate new private key. Never place it in dist, Git, or browser code.
4. Apply db/001-users.sql to Neon before the first login.
5. Set AUTH_ALLOWED_ORIGINS to an explicit comma-separated list of integrated
   origins, starting with https://tools.aimersociety.com, then redeploy.

Each other website must call https://tools.aimersociety.com/api/session with
`credentials: 'include'` to display session state. Add its exact HTTPS origin to
AUTH_ALLOWED_ORIGINS. A 200 response includes `{ user: { uid, email, name, picture } }`
or `{ user: null }`. DELETE signs out of the shared browser session. Server-side
protected routes must verify the cookie with Firebase Admin's
`verifySessionCookie(cookie, true)` before returning private data. Browser UI
state alone is not authorization. Firebase SDK currentUser on other sites is
not automatically signed in by this cookie; Firebase client database access
requires a separate SDK integration. Integrate only trusted subdomains.

The basic static preview (`node server.cjs`) does not run Vercel functions.
Use Vercel deployment/preview with server environment variables to test login;
preview cookies are host-only. npm test checks endpoint origin and cookie guards.

Mobile-first, buildless dashboard based on the supplied visual reference. Exact subject artwork is displayed from the supplied image using CSS sprite positions. Includes search, category filters, responsive navigation, a saved color theme, accessible dialogs, and external learning/app links.

Run `node server.cjs` and open http://localhost:4173. Deploy the `dist` folder to any static hosting service.

For Vercel, import the repository with Root Directory left at the repository root. The included `vercel.json` selects the Other framework preset, skips the build step, and serves `dist`. Redeploy after this configuration is added. The dashboard sections use hash links (for example, `/#subjects`).

Subjects without a dedicated URL in the request use the relevant supplied ML, IQ Labs, DBMS, digital, or OS destination. Update the subject data in `dist/app.js` when dedicated destinations become available.
