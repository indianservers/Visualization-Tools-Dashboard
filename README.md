# AIMER Society Visualizations Dashboard

## Google login and shared sessions

### Profiles and learning sync

Mobile numbers are optional contact fields in Neon (`db/003-mobile.sql`), normalized
to international +countrycode format. They are not phone-login credentials or
SMS-verified. Owners can add, change or clear their number from their profile.

Google and email/password authentication both exchange recent, verified Firebase
ID tokens for the same shared server session. Enable Email/Password in Firebase
Authentication. The browser supports signup, verification resend/check, and
password reset using Firebase's hosted email action handler. Passwords never go
to this application's API or Neon. Unverified users remain signed in only in
the browser SDK's memory until verification; no AIMER session/profile is issued.
After a verification link is used in another tab/device, return and choose
“I've verified my email”, or sign in again. Sessions require authentication in
the last five minutes, so older verification flows require another sign-in.

Apply `db/002-profile.sql` after `db/001-users.sql`. `/profile` is served through
an authenticated Vercel function and redirects guests to sign-in. The HTML shell
contains no personal information. `/api/profile` verifies the Firebase session
with revocation checks on every request, scopes all SQL to the verified UID, and
uses exact origin checks for mutations. PATCH also requires X-Aimer-Account to
match that UID so a stale page cannot save into a different signed-in account.
Email, UID and Google photo are not editable through profile requests.

Learning state uses versioned writes and a three-way merge after concurrent edits.
Guest saves and each account use separate browser storage. Existing guest saves
can be imported with “Bring this device’s saves”; signing out restores guest saves.
The dashboard syncs favorites, pins and eight recent resources, not progress
inside external learning websites. Those sites require their own integration.

To return users after sign-in, link to
`https://tools.aimersociety.com/?login=1&returnTo=` plus an encoded HTTPS URL.
The client only accepts the explicit trusted AIMER hostname list in
`dist/account-client.mjs`. Update it and AUTH_ALLOWED_ORIGINS when integrating
another website. Google branding is still managed in Google Auth Platform.

Privacy and service-use pages are available at `/privacy.html` and `/terms.html`.

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
