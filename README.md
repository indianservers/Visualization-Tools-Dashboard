# AIMER Society Visualizations Dashboard

Mobile-first, buildless dashboard based on the supplied visual reference. Exact subject artwork is displayed from the supplied image using CSS sprite positions. Includes search, category filters, responsive navigation, a saved color theme, accessible dialogs, and external learning/app links.

Run `node server.cjs` and open http://localhost:4173. Deploy the `dist` folder to any static hosting service.

Subjects without a dedicated URL in the request use the relevant supplied ML, IQ Labs, DBMS, digital, or OS destination. Update the subject data in `dist/app.js` when dedicated destinations become available.
