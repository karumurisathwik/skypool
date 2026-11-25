# ✈ SkyPool

**Fly together. Pay less.** Strangers group-book the same flight; every member lowers everyone's fare (2.5% per member, up to 30%).

## Structure
```
index.html  login.html  signup.html  mine.html  account.html  admin.html   ← one page each
css/styles.css                                                            ← all styles
js/config.js      loads runtime config from /api/config
js/state.js       state, Firestore/localStorage store, helpers
js/ui.js          header, notifications, theme, navigation, render loop
js/views/*.js     page templates + actions (home, welcome, auth, mine, account, admin)
js/pages/*.js     tiny entry script per page
api/config.js     serves Firebase config + admin ID from env vars
api/admin-check.js  checks the default admin password server-side
```
No build step: plain static files + two Vercel serverless functions.

## Environment variables (Vercel → Settings → Environment Variables)
| Name | Purpose |
|---|---|
| `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID` | Firebase web app config (leave `FIREBASE_API_KEY` empty for browser-only demo storage) |
| `ADMIN_ID` | Admin login ID (default `admin`) |
| `ADMIN_PASSWORD` | Initial admin password (required). Change it in the app after first login |

## Deploy on Vercel
1. Push this folder to GitHub → Vercel → **Add New Project** → import it. Framework preset: **Other**; no build command; output directory empty.
2. Add the environment variables above, then deploy (redeploy after changing variables).
3. Firebase console → Firestore → **Rules**: paste `firestore.rules` (see the security note).
4. Firebase console → Authentication → Settings → Authorized domains: add your `*.vercel.app` domain.

Local: `npm i -g vercel`, copy `.env.example` to `.env.local`, run `vercel dev`.

## Security note
Firebase web config values are public by design and are visible in the browser; they are not secrets. What actually protects data is Firestore rules, and `firestore.rules` is currently **fully open** (demo only), and login checks run in the browser. Before real use, add Firebase Authentication and strict rules, and restrict the API key by HTTP referrer in Google Cloud Console.
