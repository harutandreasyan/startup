# CreatorAI — Local Development Runbook

How to run the full stack locally. Follow in order.

## Prerequisites
- Node.js 20+ (have: ✅)
- npm (have: ✅)
- Docker Desktop — **needed for local Postgres + Redis** ([download](https://www.docker.com/products/docker-desktop/))

## 1. Accounts & API Keys (one-time)

You need to create these yourself (they require credentials I can't enter for you):

| Service | What to get | Where |
|---------|-------------|-------|
| Supabase | Project URL, anon key, service_role key | supabase.com → New Project → Settings → API |
| Replicate | API token | replicate.com → Account → API tokens |

In Supabase: **Authentication → Providers → enable Email** (and Google later).

## 2. Environment Files

```bash
# From creatorai/
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Then fill in:
- `apps/api/.env` → `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `REPLICATE_API_TOKEN`
- `apps/web/.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## 3. Start Local Services (Postgres + Redis)

```bash
# From creatorai/
docker compose up -d
```

## 4. Database Setup

```bash
cd apps/api
npx prisma migrate dev --name init   # creates tables
npx prisma db seed                    # loads credit packs + AI models
```

Verify: `npx prisma studio` → opens DB browser at localhost:5555

## 5. Run the Apps

```bash
# From creatorai/ — runs web + api together
npm run dev
```

Or individually:
```bash
npm run dev:api    # API at http://localhost:3000
npm run dev:web    # Web at http://localhost:5180
```

## 6. Smoke Test

1. Open http://localhost:5180
2. Click "Get Started Free" → register with email
3. You should land on the dashboard with **20 credits**
4. Go to Generate → enter a prompt → Generate
5. Watch the result stream in via WebSocket

## Health Check
```bash
curl http://localhost:3000/health
# → {"status":"ok","db":true}
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `prisma migrate` fails | Is Docker running? `docker compose ps` |
| 401 on API calls | Check Supabase keys match in both .env files |
| Generation stuck on "Queued" | Is Redis up? Is `REPLICATE_API_TOKEN` set? Check API logs |
| WebSocket not connecting | API must be running; check `VITE_API_URL` |
| Port 5180 in use | Another project uses it — change in `apps/web/vite.config.ts` |
