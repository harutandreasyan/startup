# CreatorAI — Complete Setup Guide (Zero to Running)

This guide takes you from nothing to a fully running app. Follow each step in order.
Estimated time: **45–60 minutes**. No prior DevOps knowledge needed.

> 💡 You only do this ONCE. After setup, starting the app is just `npm run dev`.

---

## PART 1 — Install Docker Desktop (10 min)

Docker runs your local database (Postgres) and queue (Redis) without you installing them manually.

### Steps
1. Go to **https://www.docker.com/products/docker-desktop/**
2. Click **"Download for Mac"**. Pick the right chip:
   - **Apple Silicon** (M1/M2/M3/M4) — most recent Macs
   - **Intel chip** — older Macs
   - *To check: Apple menu  → "About This Mac" → look at "Chip" or "Processor"*
3. Open the downloaded `Docker.dmg` file
4. Drag the **Docker** icon into the **Applications** folder
5. Open **Docker** from Applications (Launchpad → Docker)
6. Accept the service agreement. It may ask for your Mac password — that's normal
7. Wait until the Docker whale icon 🐳 in your top menu bar stops animating (means it's running)

### Verify it works
Open Terminal and run:
```bash
docker --version
```
You should see something like `Docker version 27.x.x`. ✅

---

## PART 2 — Create a Supabase Project (10 min)

Supabase handles user login/signup (email + Google) for free.

### Steps
1. Go to **https://supabase.com** → click **"Start your project"**
2. Sign in with GitHub (create a GitHub account first if needed at github.com)
3. Click **"New project"**
4. Fill in:
   - **Name:** `creatorai`
   - **Database Password:** click "Generate a password" → **COPY AND SAVE IT** somewhere safe
   - **Region:** choose **Europe (Frankfurt)** or **Europe (London)** — closest to Armenia
5. Click **"Create new project"** → wait ~2 minutes while it provisions

### Get your keys
1. In your project, click the **gear icon ⚙️ (Project Settings)** in the bottom-left
2. Click **"API keys"** in the settings menu (or "Data API")
3. You'll see three things you need — keep this tab open:

| Label in Supabase | Where it goes |
|-------------------|---------------|
| **Project URL** (e.g. `https://abcd.supabase.co`) | `SUPABASE_URL` and `VITE_SUPABASE_URL` |
| **anon / public** key (long string) | `VITE_SUPABASE_ANON_KEY` |
| **service_role** key (long string, marked secret) | `SUPABASE_SERVICE_KEY` |

> ⚠️ The **service_role** key is a master key — never put it in frontend code or commit it.
> It only goes in `apps/api/.env`.

### Enable Email login
1. In the left sidebar, click **Authentication**
2. Click **"Sign In / Providers"** (or "Providers")
3. Make sure **Email** is **enabled** (it usually is by default)
4. For easier testing: click Email → scroll to **"Confirm email"** → toggle it **OFF**
   (so you don't need to verify email every time during development. Turn it back on before launch.)

---

## PART 3 — Create a Replicate Account (5 min)

Replicate runs the AI image/video models. Pay-per-use, very cheap to start.

### Steps
1. Go to **https://replicate.com** → click **"Sign in"** → sign in with GitHub
2. Click your avatar (top-right) → **"API tokens"** (or go to replicate.com/account/api-tokens)
3. You'll see a **default token** starting with `r8_...` → click the copy icon
4. Save it — this goes in `SUPABASE`... no — `REPLICATE_API_TOKEN`

> 💳 To actually run generations, Replicate asks for a card under **Billing**.
> A test image costs ~$0.003. You can set a spend limit. You can do this step later —
> the app will run, generations will just fail until billing is set up.

---

## PART 4 — Fill in Your Environment Files (5 min)

Now we put all those keys into the project. I've created template files; you copy and fill them.

### Open Terminal and run:
```bash
cd /Users/harut/Desktop/startup/creatorai
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Edit `apps/api/.env`
Open it in VS Code (or any editor):
```bash
open -a TextEdit apps/api/.env
```
Replace the placeholder values:
```env
DATABASE_URL=postgresql://creator:creator_dev@localhost:5432/creatorai
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://YOUR-PROJECT.supabase.co        ← from Part 2
SUPABASE_SERVICE_KEY=YOUR-SERVICE-ROLE-KEY           ← from Part 2 (service_role)
REPLICATE_API_TOKEN=r8_YOUR-TOKEN                     ← from Part 3
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=creatorai-uploads
R2_PUBLIC_URL=
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5180
```
Leave the R2_* values empty for now — the app falls back to Replicate's URLs.
Save and close.

### Edit `apps/web/.env`
```bash
open -a TextEdit apps/web/.env
```
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co   ← same Project URL as above
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY                  ← from Part 2 (anon/public)
```
Save and close.

---

## PART 5 — Start the Database (2 min)

Make sure Docker Desktop is running (whale icon 🐳 in menu bar), then:
```bash
cd /Users/harut/Desktop/startup/creatorai
docker compose up -d
```
You should see it start `postgres` and `redis`. Verify:
```bash
docker compose ps
```
Both should say "running" or "Up". ✅

---

## PART 6 — Set Up the Database Tables (3 min)

This creates all your tables and loads the starter data (credit packs, AI models):
```bash
cd /Users/harut/Desktop/startup/creatorai/apps/api
npx prisma migrate dev --name init
npx prisma db seed
```

Want to SEE your database? Run:
```bash
npx prisma studio
```
A browser tab opens at localhost:5555 showing all your tables. Close it when done (Ctrl+C in terminal).

---

## PART 7 — Run the App! (1 min)

```bash
cd /Users/harut/Desktop/startup/creatorai
npm run dev
```
This starts BOTH the backend (port 3000) and frontend (port 5180).

Open **http://localhost:5180** in your browser. 🎉

---

## PART 8 — Test It End-to-End

1. Click **"Get Started Free"**
2. Register with a **username** + email + password (8+ chars)
3. You land on the **Dashboard** with **20 free credits** 💎
   - You can sign in later with **either your username or your email**
4. Click **Generate** → select **"Flux (Free)"** → type a prompt like *"a fox in a snowy forest, cinematic"*
5. Click **Generate** → watch it go Queued → Processing → Result appears
   - ✅ Uses **Pollinations.ai** — free, no billing needed
   - Premium models (marked "Premium") need Replicate billing — see Part 10

---

## PART 9 — (Optional, future) Enable Stripe Payments — TEST mode

This lets users buy credits. You can test it for free with Stripe's test mode — no real money.

1. Create a free account at **https://stripe.com** (no business details needed for test mode)
2. In the Stripe Dashboard, make sure the **"Test mode"** toggle (top-right) is **ON**
3. Go to **Developers → API keys** → copy the **Secret key** (`sk_test_...`)
4. Put it in `apps/api/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_YOUR-KEY
   ```
5. **Set up the webhook** (so credits are granted after payment). For local testing,
   install the Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   stripe login
   stripe listen --forward-to localhost:3000/payments/stripe/webhook
   ```
   The CLI prints a webhook signing secret (`whsec_...`) — put it in `apps/api/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_FROM-CLI
   ```
6. Restart the API. Go to **Credits** page → **Buy** → you'll be sent to Stripe Checkout.
   Pay with the test card: **`4242 4242 4242 4242`**, any future expiry, any CVC.
7. Credits get added to your account automatically via the webhook. ✅

## PART 10 — (Optional, future) Enable Premium AI models (Replicate)

For higher-quality images, video, and 3D (these have no free option):
1. Add billing at **https://replicate.com/account/billing** → purchase $5–10 credit
2. Wait ~3–5 min
3. Premium models (Flux Dev, and any future video/3D models) will work
4. See [docs/06-AI-INTEGRATION.md](../../docs/06-AI-INTEGRATION.md) for details

---

## Daily Use (after setup)

Every time you want to work on the app:
```bash
# 1. Make sure Docker Desktop is open
# 2. Start services (if not already running)
cd /Users/harut/Desktop/startup/creatorai && docker compose up -d
# 3. Start the app
npm run dev
```
To stop: press `Ctrl+C` in the terminal, and `docker compose stop` to stop the database.

---

## If Something Goes Wrong

| Symptom | Cause & Fix |
|---------|-------------|
| `docker: command not found` | Docker Desktop not installed or not in PATH. Reopen Terminal after install. |
| `Cannot connect to the Docker daemon` | Docker Desktop app isn't running. Open it, wait for whale icon. |
| `prisma migrate` hangs/fails | Postgres not up. Run `docker compose ps`. If empty, `docker compose up -d`. |
| Login says "Invalid API key" | Supabase keys wrong/swapped. anon→web, service_role→api. Check both .env files. |
| Generation stuck on "Queued" | Redis down, or `REPLICATE_API_TOKEN` missing/invalid. Check API terminal logs. |
| Generation fails instantly | Replicate billing not set up. Add a card at replicate.com/account/billing. |
| Port 3000 or 5180 "in use" | Another app uses it. Find & close it, or change the port in config. |
| Web loads but API calls fail | Is the API running? Check the terminal shows "API running on http://localhost:3000". |

---

## What costs money here?

| Item | Cost during dev |
|------|-----------------|
| Docker, Postgres, Redis (local) | **Free** |
| Supabase (free tier) | **Free** (up to 50K users) |
| Replicate | **Pay per generation** (~$0.003/image). Set a spend limit. |

You can develop everything for **~$0–5** until you have real users.
