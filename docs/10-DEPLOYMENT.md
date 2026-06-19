# 10 — Deployment & Infrastructure

## Deployment Architecture

```
                    ┌─────────────┐
                    │ Cloudflare  │ ← DNS + CDN + DDoS protection
                    │   (free)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼────┐ ┌─────▼─────┐
        │  Vercel   │ │Railway │ │Cloudflare │
        │  (web)    │ │ (API)  │ │   R2      │
        │  FREE     │ │ $5-20  │ │  (files)  │
        └───────────┘ └───┬────┘ └───────────┘
                          │
                    ┌─────┼─────┐
                    │           │
              ┌─────▼───┐ ┌────▼────┐
              │Supabase │ │ Upstash │
              │(Postgres│ │ (Redis) │
              │ + Auth) │ │  FREE   │
              │  FREE   │ └─────────┘
              └─────────┘
```

## Services & Costs

### Phase 1: MVP (0-1K users)

| Service | Provider | Plan | Monthly Cost |
|---------|----------|------|-------------|
| Web hosting | Vercel | Free (Hobby) | $0 |
| API hosting | Railway | Starter | $5 |
| Database | Supabase | Free (500MB, 50K MAU) | $0 |
| Redis | Upstash | Free (10K commands/day) | $0 |
| File storage | Cloudflare R2 | Free (10GB, 1M Class B) | $0 |
| DNS + CDN | Cloudflare | Free | $0 |
| Email | Resend | Free (100/day) | $0 |
| Monitoring | Sentry | Free (5K events) | $0 |
| Mobile builds | Expo EAS | Free (30 builds/mo) | $0 |
| **Total** | | | **~$5/mo** |

### Phase 2: Growth (1K-10K users)

| Service | Provider | Plan | Monthly Cost |
|---------|----------|------|-------------|
| Web hosting | Vercel | Pro | $20 |
| API hosting | Railway | Pro (2 instances) | $20-50 |
| Database | Supabase | Pro (8GB) | $25 |
| Redis | Upstash | Pay-as-you-go | $10-30 |
| File storage | Cloudflare R2 | Pay-as-you-go | $5-30 |
| DNS + CDN | Cloudflare | Free | $0 |
| Email | Resend | Pro | $20 |
| Monitoring | Sentry | Team | $26 |
| Mobile builds | Expo EAS | Production | $99 |
| **Total** | | | **~$225-300/mo** |

## Railway Setup (Backend)

```toml
# railway.toml (in apps/api/)
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node dist/main.js"
healthcheckPath = "/health"
healthcheckTimeout = 100

[service]
internalPort = 3000
```

### Environment Variables (Railway Dashboard)
Set all env vars from the .env.example in Railway's dashboard. Never commit secrets.

### Deploy Process
```bash
# Connect repo to Railway
# Railway auto-deploys on push to main branch

# Or manual deploy:
railway up
```

## Vercel Setup (Web Frontend)

```json
// apps/web/vercel.json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web",
  "outputDirectory": "dist",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "vite"
}
```

Deploy: Connect GitHub repo → Vercel auto-deploys on push.

## Cloudflare R2 Setup

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Create bucket
wrangler r2 bucket create creatorai-uploads

# Set up custom domain for public access
# In Cloudflare dashboard: R2 → creatorai-uploads → Settings → Public access
# Connect to: cdn.yourdomain.com
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
      # API tests
      - run: pnpm --filter api test

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/cli-action@v1
        with:
          command: up --service api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  # Vercel auto-deploys via GitHub integration — no action needed

  deploy-mobile:
    needs: test
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, '[mobile]')
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: cd apps/mobile && eas build --platform all --non-interactive
```

## Database Migrations (Production)

```bash
# Generate migration from schema changes
pnpm --filter api prisma migrate dev --name add_feature_x

# Apply to production (Railway runs this on deploy)
pnpm --filter api prisma migrate deploy
```

## Monitoring & Alerts

### Sentry (error tracking)
```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});
```

### Health Check Endpoint
```typescript
// apps/api/src/health.controller.ts
@Get('/health')
async check() {
  const dbOk = await this.prisma.$queryRaw`SELECT 1`;
  const redisOk = await this.redis.ping();
  return { status: 'ok', db: !!dbOk, redis: redisOk === 'PONG' };
}
```

### Uptime Monitoring
- Use BetterUptime (free tier) or UptimeRobot to ping /health every 60s
- Alert via email/Telegram on downtime

## Steps

- [ ] Set up Cloudflare account + add domain
- [ ] Create R2 bucket for file storage
- [ ] Set up Railway project + connect GitHub repo
- [ ] Configure Railway env variables
- [ ] Set up Vercel project for web app
- [ ] Create GitHub Actions CI/CD workflow
- [ ] Set up Sentry for error tracking
- [ ] Set up uptime monitoring
- [ ] Configure custom domain (Cloudflare → Vercel + Railway)
- [ ] Set up SSL certificates (Cloudflare handles this)
- [ ] Test full deployment pipeline (push → test → deploy)
- [ ] Set up database backup schedule (Supabase handles this)

## Next Step
Proceed to [11-SECURITY.md](./11-SECURITY.md)
