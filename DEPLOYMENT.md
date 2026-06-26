# Deployment Guide

LendFlow is a two-service app:

- **Backend** (Express + TypeScript API) → **Render**
- **Frontend** (Next.js) → **Vercel**
- **Database** → **MongoDB Atlas**
- **File storage** → **Cloudflare R2**

Because the frontend and backend live on different domains, authentication uses
a `SameSite=None; Secure` cookie. This is handled automatically when
`COOKIE_SECURE=true` is set on the backend (see below).

---

## 1. Prerequisites

1. A **MongoDB Atlas** cluster and its connection string.
   - Under *Network Access*, allow `0.0.0.0/0` (Render egress IPs are dynamic on the free tier).
2. A **Cloudflare R2** bucket with an S3 API token (account id, access key, secret, bucket, endpoint).
3. The repository pushed to **GitHub**.

---

## 2. Backend → Render

The repo ships a [`render.yaml`](./render.yaml) Blueprint.

### Option A — Blueprint (recommended)

1. Render Dashboard → **New** → **Blueprint** → select this repository.
2. Render reads `render.yaml` and provisions the `lms-backend` web service.
3. Fill in the environment variables marked `sync: false`:

   | Variable | Value |
   |---|---|
   | `MONGODB_URI` | Your Atlas connection string |
   | `CLIENT_ORIGIN` | Vercel URL (set after step 3, e.g. `https://lendflow.vercel.app`) |
   | `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_ENDPOINT` | From Cloudflare R2 |
   | `SEED_PASSWORD` | Password for seeded executive accounts |

   `NODE_ENV=production`, `COOKIE_SECURE=true`, and `JWT_SECRET` (auto-generated) are set by the Blueprint.

4. Deploy. Health check: `GET /api/health` should return `{ "status": "ok" }`.

### Option B — Manual web service

- **Root Directory:** `backend`
- **Build Command:** `npm install --include=dev && npm run build`
  (the `--include=dev` flag is required because `NODE_ENV=production` otherwise
  skips the TypeScript compiler and `@types/*` packages needed to build)
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- Add all env vars from [`backend/.env.example`](./backend/.env.example), with
  `NODE_ENV=production` and `COOKIE_SECURE=true`.

### Seed the executive accounts (one-time)

The public signup only creates borrowers. Seed the Admin/Sales/Sanction/
Disbursement/Collection accounts once against the production DB:

```bash
# Locally, pointing at the production Atlas URI:
cd backend
MONGODB_URI="<atlas-uri>" SEED_PASSWORD="<your-password>" npm run seed
```

(or run `npm run seed` from the Render **Shell** tab.)

---

## 3. Frontend → Vercel

1. Vercel → **Add New** → **Project** → import this repository.
2. **Root Directory:** `frontend` (important — this is a monorepo).
3. Framework preset auto-detects **Next.js**. Leave build/output defaults.
4. Add environment variables:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `/api` (the browser calls the app's own origin) |
   | `BACKEND_ORIGIN` | `https://<your-render-service>.onrender.com` |

   The frontend never calls Render directly from the browser. Next proxies
   `/api/*` to `BACKEND_ORIGIN` (see `frontend/next.config.mjs`), which keeps the
   auth cookie **first-party** with the Vercel domain — so the Edge middleware can
   read it and there are no cross-site cookie/CORS problems.

5. Deploy. Copy the resulting URL (e.g. `https://lendflow.vercel.app`).

---

## 4. Wire the two together

1. On Vercel, confirm `BACKEND_ORIGIN` points at your Render service URL and
   `NEXT_PUBLIC_API_URL` is `/api`. Redeploy the frontend if you changed them.
2. On Render, keep `COOKIE_SECURE=true` so the auth cookie is `Secure` (required
   over HTTPS). Because the browser only ever talks to the Vercel origin (Next
   proxies to Render server-side), the cookie is first-party and `CLIENT_ORIGIN`
   CORS config is no longer on the critical path — but it's still good to set it
   to the Vercel URL for any direct API access.
3. Visit the Vercel URL and log in. The cookie is stored for the Vercel domain,
   so it survives refresh and the middleware-based route guards work.

---

## 5. Post-deploy checklist

- [ ] `GET https://<render>.onrender.com/api/health` returns `ok`.
- [ ] Login works and survives a page refresh (cookie is persisted).
- [ ] A borrower can apply and upload a salary slip (R2 reachable).
- [ ] An executive can move a loan through Sanction → Disburse → Collection.
- [ ] No CORS errors in the browser console (means `CLIENT_ORIGIN` matches).

### Common gotchas

- **Logged out after refresh / 401s:** `COOKIE_SECURE` is not `true`, or
  `CLIENT_ORIGIN` doesn't exactly match the Vercel origin.
- **CORS error in console:** add the exact frontend origin to `CLIENT_ORIGIN`.
- **Render free tier cold starts:** the first request after idling can take
  ~30s while the service wakes up.
