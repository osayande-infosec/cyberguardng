Cloudflare Pages deployment notes
----------------------------------

This repository contains a Vite React app in the `react-site` folder,
deployed as Cloudflare Pages with Pages Functions (`react-site/functions/`).
Confirmed via live headers (`Server: cloudflare`) and `_routes.json`, which
restricts Functions to `/api/*` — everything else is served as static assets
with headers from `react-site/public/_headers`.

Quick deploy steps (Cloudflare Pages):

- In the Cloudflare dashboard, connect this Git repository and choose the
  branch to deploy (`main`).
- Set the "Root directory" to: `cyberguardng/react-site`
- Set the build command to: `npm run build`
- Set the build output directory to: `dist`
- Bind a D1 database as `DB` and a KV namespace as `KV` (used by
  `functions/rate-limiter.js`) in the Pages project's Settings → Functions.
- Set the environment variables / secrets below in Settings → Environment
  variables. There is no `wrangler.toml` in this repo — bindings and
  secrets are configured entirely through the dashboard.

### Required environment variables

| Variable | Used by | Notes |
|---|---|---|
| `OPENAI_API_KEY` | `functions/chat.js` | Server-side only; the frontend never sees it. |
| `SESSION_SECRET` | every authenticated route | HMAC key signing session cookies. **Must be set** — as of this pass, every auth path fails closed (returns an error rather than authenticating) if this is unset, instead of falling back to a hardcoded value. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `functions/api/auth/google/*` | Google OAuth login. |
| `WORKOS_CLIENT_ID`, `WORKOS_API_KEY` | `functions/api/auth/workos/*` | Enterprise SSO (SAML/OIDC), brokered through WorkOS — replaces the previous hand-rolled SAML implementation, which never verified IdP signatures. Get these from the WorkOS dashboard once an account exists; each customer's IdP connection is configured there, not in this repo. |
| `TURNSTILE_SECRET_KEY` | `functions/contact.js` | Bot protection on the contact form. |
| `WEB3FORMS_ACCESS_KEY` | `functions/contact.js` | Contact form delivery. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | `functions/voice-webhook.js` | Voice agent. |

Local verification:

```powershell
cd ./cyberguardng/react-site
npm ci
npm run build
# Result: `dist/` directory containing the static site
```
