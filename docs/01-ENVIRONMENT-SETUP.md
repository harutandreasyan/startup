# 01 — Environment Setup

## Prerequisites

### Install Required Software

```bash
# 1. Node.js (v20 LTS recommended)
# Install via nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20

# 2. Package manager — npm (included with Node.js)
# Already installed with Node.js, no extra step needed

# 3. Expo CLI (for React Native)
npm install -g expo-cli eas-cli

# 4. Git
# Should already be installed on macOS. Verify:
git --version

# 5. Docker (for local PostgreSQL + Redis)
# Download Docker Desktop: https://www.docker.com/products/docker-desktop/

# 6. IDE
# VS Code recommended with extensions:
# - ESLint
# - Prettier
# - Prisma
# - Tailwind CSS IntelliSense
# - ES7+ React/Redux/React-Native snippets
```

### Create Accounts (Free Tiers)

| Service | URL | Purpose | Cost |
|---------|-----|---------|------|
| GitHub | github.com | Code hosting | Free |
| Supabase | supabase.com | Auth + DB (dev) | Free tier |
| Replicate | replicate.com | AI model APIs | Pay per use |
| Fal.ai | fal.ai | AI model APIs | Pay per use |
| Cloudflare | cloudflare.com | R2 storage + CDN + DNS | Free tier |
| Stripe | stripe.com | Web payments | Free (2.9% per tx) |
| RevenueCat | revenuecat.com | Mobile IAP | Free <$2.5K MRR |
| Railway | railway.app | Backend hosting | $5/mo |
| Vercel | vercel.com | Web hosting | Free tier |
| Sentry | sentry.io | Error monitoring | Free tier |
| Resend | resend.com | Transactional email | Free (100/day) |
| Apple Developer | developer.apple.com | iOS App Store | $99/year |
| Google Play | play.google.com/console | Play Store | $25 one-time |

### Total Initial Cost: ~$130

## Steps

- [ ] Install Node.js 20 via nvm
- [ ] Install pnpm globally
- [ ] Install Expo CLI and EAS CLI
- [ ] Install Docker Desktop
- [ ] Set up VS Code with recommended extensions
- [ ] Create GitHub account and repository
- [ ] Create Supabase project
- [ ] Create Replicate account + get API key
- [ ] Create Cloudflare account
- [ ] Create Stripe account (can be done later in Phase 3)
- [ ] Set up `.env` file with API keys (never commit this)

## Local Development Services (Docker Compose)

We'll use Docker Compose for local PostgreSQL and Redis:

```yaml
# docker-compose.yml (created in Phase 1)
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: creator
      POSTGRES_PASSWORD: creator_dev
      POSTGRES_DB: creatorai
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

## Next Step
Once environment is ready, proceed to [02-MONOREPO-STRUCTURE.md](./02-MONOREPO-STRUCTURE.md)
