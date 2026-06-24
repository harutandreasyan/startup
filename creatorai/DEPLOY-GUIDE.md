# Deploy CreatorAI to Production (step-by-step)

Plain-English guide to put CreatorAI online. Stack: **Vercel** (web) + **Railway** (API,
via Docker) + **Supabase** (Postgres + Auth) + **Upstash** (Redis). Cost at launch: ~$5/mo
(Railway) — everything else has a free tier.

> Everything in the code is already prepared: `Dockerfile`, `railway.json`,
> `apps/web/vercel.json`, a `/health` check, a production start command
> (`npm run start:prod` → runs DB migrations then boots), and env templates
> (`apps/api/.env.production.example`, `apps/web/.env.production.example`).

Do the steps **in this order** — each one produces a value the next step needs.

---

## 0. Prerequisites
- Push this repo to **GitHub** (Railway and Vercel deploy from GitHub).
- Create free accounts: [supabase.com](https://supabase.com), [upstash.com](https://upstash.com),
  [railway.app](https://railway.app), [vercel.com](https://vercel.com).

---

## 1. Production database — Supabase
1. Create a Supabase project. Pick a strong DB password and save it.
2. **Project Settings → Database → Connection string → URI.** Use the **direct**
   connection (host `db.<ref>.supabase.co`, port **5432**) — this becomes `DATABASE_URL`.
   (The pooled `:6543` string can't run migrations.)
3. **Project Settings → API** → copy `URL`, `anon` key, and `service_role` key.
4. **Authentication → Providers** → enable **Email** (and Google later if you want).

> Migrations run **automatically** on every API deploy (`prisma migrate deploy` is part
> of `start:prod`). You only need to seed the catalog once — see step 6.

---

## 2. Redis — Upstash
1. Create a Redis database (pick the region closest to your Railway region).
2. Copy the **`rediss://…` TLS URL** → this becomes `REDIS_URL`.

---

## 3. Deploy the API — Railway
1. **New Project → Deploy from GitHub repo** → pick this repo.
2. Railway auto-detects the root **`Dockerfile`** + **`railway.json`** (Docker build,
   health check at `/health`). No build settings to configure.
3. **Variables tab** → add everything from **`apps/api/.env.production.example`**
   (DATABASE_URL, REDIS_URL, the three SUPABASE_* keys, STRIPE_*, etc.).
   **Do not set `PORT`** — Railway injects it.
4. Deploy. When it's green, **Settings → Networking → Generate Domain** → copy the public
   URL, e.g. `https://creatorai-api.up.railway.app`. Test it: open `…/health` → should
   return `{"status":"ok","db":true}`.

---

## 4. Deploy the web app — Vercel
1. **Add New → Project** → import this repo.
2. **Root Directory: `apps/web`** (important for the monorepo).
3. Framework preset: **Vite**. (Install/build/output are already set in
   `apps/web/vercel.json`.)
4. **Environment Variables** → add from **`apps/web/.env.production.example`**:
   - `VITE_API_URL` = your Railway API URL (from step 3, no trailing slash)
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. Deploy → copy your web URL, e.g. `https://creatorai.vercel.app`.

---

## 5. Connect the two (CORS)
Back in **Railway → Variables**, set these to your Vercel URL and redeploy:
```
WEB_URL=https://creatorai.vercel.app
CORS_ORIGINS=https://creatorai.vercel.app
```
(`CORS_ORIGINS` accepts a comma-separated list if you add a custom domain later.)

---

## 6. Seed the catalog (credit packs + AI models) — once
The app needs the credit packs and model rows. From your machine, run the seed against
**production** (use the same direct `DATABASE_URL` from step 1):
```bash
cd creatorai/apps/api
DATABASE_URL="postgresql://postgres:…@db.<ref>.supabase.co:5432/postgres" npm run prisma:seed
```

---

## 7. Stripe in LIVE mode (when you're ready to charge real money)
Until then you can launch with your **test** keys and the app works (test payments only).
To go live:
1. Activate your Stripe account (business details + bank account for payouts).
2. In the Stripe Dashboard (Live mode) → **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR-API-DOMAIN/payments/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
   - Copy the endpoint's **Signing secret** (`whsec_…`).
3. In **Railway → Variables**: set `STRIPE_SECRET_KEY=sk_live_…` and
   `STRIPE_WEBHOOK_SECRET=whsec_…` (the dashboard one — *not* the CLI one). Redeploy.

(Local testing stays on test keys + `stripe listen` — see `PAYMENTS-TESTING.md`.)

---

## 8. Smoke test (do this after every first deploy)
- [ ] `https://API/health` → `{"status":"ok","db":true}`
- [ ] Register a new account on the web app → lands on dashboard with 20 credits
- [ ] Generate a Text-to-Image → completes, appears in Gallery
- [ ] Credits page loads plans + usage
- [ ] (Stripe) Buy a pack with test card `4242 4242 4242 4242` → credits land

---

## 9. Custom domain (optional)
Point a domain via Cloudflare: `app.yourdomain.com` → Vercel (web),
`api.yourdomain.com` → Railway. Then update `VITE_API_URL` (Vercel) and
`WEB_URL`/`CORS_ORIGINS` (Railway) to the custom domains and redeploy both.

---

## 10. What it costs at launch
| Service | Plan | Cost |
|---|---|---|
| Railway (API) | Starter | ~$5/mo |
| Vercel (web) | Hobby | $0 |
| Supabase (DB+Auth) | Free | $0 |
| Upstash (Redis) | Free | $0 |
| **Total** | | **~$5/mo** |

Premium AI tools (video/3D/upscale/bg-removal) stay gated as "coming soon" until you add
a Replicate token + billing — they cost per generation, so enable them when you have
revenue.
