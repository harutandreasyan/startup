# 03 — Backend API (NestJS)

## Architecture

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # JWT verification
│   │   │   └── credits.guard.ts       # Check user has enough credits
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── require-credits.decorator.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── strategies/
│   │   │       ├── jwt.strategy.ts
│   │   │       └── google.strategy.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.service.ts
│   │   ├── generations/
│   │   │   ├── generations.module.ts
│   │   │   ├── generations.controller.ts
│   │   │   ├── generations.service.ts
│   │   │   ├── generations.gateway.ts    # WebSocket for progress
│   │   │   └── processors/
│   │   │       ├── image.processor.ts
│   │   │       ├── video.processor.ts
│   │   │       └── model-3d.processor.ts
│   │   ├── credits/
│   │   │   ├── credits.module.ts
│   │   │   ├── credits.controller.ts
│   │   │   └── credits.service.ts
│   │   ├── payments/
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   └── webhooks/
│   │   │       ├── stripe.webhook.ts
│   │   │       └── revenuecat.webhook.ts
│   │   ├── storage/
│   │   │   ├── storage.module.ts
│   │   │   └── storage.service.ts        # R2/S3 upload/download
│   │   ├── ai-providers/
│   │   │   ├── ai-providers.module.ts
│   │   │   ├── ai-providers.service.ts   # Provider abstraction
│   │   │   ├── replicate.provider.ts
│   │   │   ├── fal.provider.ts
│   │   │   └── openai.provider.ts
│   │   └── moderation/
│   │       ├── moderation.module.ts
│   │       └── moderation.service.ts     # NSFW check
│   └── config/
│       ├── database.config.ts
│       ├── redis.config.ts
│       ├── storage.config.ts
│       └── ai.config.ts
├── prisma/
│   └── schema.prisma
├── test/
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Register with email/password | No |
| POST | /auth/login | Login, returns JWT | No |
| POST | /auth/refresh | Refresh access token | Refresh token |
| POST | /auth/google | Google OAuth login | No |
| POST | /auth/apple | Apple Sign-In | No |
| POST | /auth/forgot-password | Send reset email | No |
| POST | /auth/reset-password | Reset with token | No |
| DELETE | /auth/account | Delete account (GDPR) | Yes |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /users/me | Get current user profile | Yes |
| PATCH | /users/me | Update profile | Yes |
| GET | /users/me/stats | Generation stats | Yes |

### Generations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /generations | Create new generation | Yes |
| GET | /generations | List user's generations | Yes |
| GET | /generations/:id | Get generation status/result | Yes |
| DELETE | /generations/:id | Delete a generation | Yes |
| POST | /generations/:id/upscale | Upscale a result | Yes |
| WebSocket | /generations/ws | Real-time progress updates | Yes |

### Credits
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /credits/balance | Get credit balance | Yes |
| GET | /credits/history | Transaction history | Yes |
| GET | /credits/pricing | Credit pack prices | No |
| POST | /credits/purchase | Init credit purchase | Yes |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /payments/stripe/checkout | Create Stripe checkout session | Yes |
| POST | /payments/stripe/webhook | Stripe webhook handler | Webhook sig |
| POST | /payments/revenuecat/webhook | RevenueCat webhook | Webhook sig |
| GET | /payments/subscriptions | User's subscriptions | Yes |

### Models (public)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /models | List available AI models | No |
| GET | /models/:id | Model details + credit cost | No |

## Job Queue Architecture (BullMQ)

AI generations are async — they take 5-120 seconds. Flow:

```
1. User POST /generations
   → Validate input
   → Check credits (guard)
   → Deduct credits (hold)
   → Add job to BullMQ queue
   → Return { id, status: 'queued' }

2. Worker picks up job
   → Call AI provider (Replicate/Fal.ai)
   → Poll provider for completion
   → Upload result to R2
   → Update DB status
   → Emit WebSocket event to user

3. On failure:
   → Refund held credits
   → Update status to 'failed'
   → Notify user via WebSocket
```

### Queue Configuration
```typescript
// Separate queues for different generation types
// Allows independent scaling and prioritization
const QUEUES = {
  'image-generation': { concurrency: 10 },
  'video-generation': { concurrency: 3 },   // more expensive
  '3d-generation':    { concurrency: 3 },
  'image-editing':    { concurrency: 10 },
};
```

## Rate Limiting

```typescript
// Per user, per endpoint
const RATE_LIMITS = {
  'POST /generations': { points: 20, duration: 60 },    // 20 per minute
  'POST /auth/login':  { points: 5, duration: 300 },    // 5 per 5 min
  'GET /generations':  { points: 60, duration: 60 },     // 60 per minute
  global:              { points: 100, duration: 60 },    // 100 req/min total
};
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://creator:creator_dev@localhost:5432/creatorai

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-here
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Supabase Auth (alternative to self-managed JWT)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx

# AI Providers
REPLICATE_API_TOKEN=r8_xxx
FAL_KEY=xxx
OPENAI_API_KEY=sk-xxx

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=creatorai-uploads
R2_PUBLIC_URL=https://cdn.yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# RevenueCat
REVENUECAT_API_KEY=xxx
REVENUECAT_WEBHOOK_SECRET=xxx

# App
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,exp://localhost:19000
```

## Steps

- [ ] Initialize NestJS project in apps/api
- [ ] Set up module structure (auth, users, generations, credits, payments)
- [ ] Configure Prisma with PostgreSQL
- [ ] Set up BullMQ with Redis
- [ ] Implement auth module (JWT + Google OAuth)
- [ ] Implement generations module with queue
- [ ] Implement credits module
- [ ] Add rate limiting
- [ ] Add WebSocket gateway for real-time updates
- [ ] Set up request validation (class-validator)
- [ ] Add Swagger/OpenAPI documentation
- [ ] Write integration tests for critical endpoints

## Next Step
Proceed to [04-DATABASE-SCHEMA.md](./04-DATABASE-SCHEMA.md)
