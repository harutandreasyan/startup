# 04 — Database Schema (Prisma)

## Entity Relationship Diagram

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐
│  User    │────<│  Generation   │     │  CreditPack  │
│          │     │               │     │  (catalog)   │
└────┬─────┘     └───────────────┘     └──────────────┘
     │
     ├────<┌───────────────┐
     │     │ CreditTx      │  (credit transactions)
     │     └───────────────┘
     │
     ├────<┌───────────────┐
     │     │ Subscription  │
     │     └───────────────┘
     │
     └────<┌───────────────┐
           │ Payment       │
           └───────────────┘
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USERS ──────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  avatarUrl     String?
  provider      AuthProvider @default(EMAIL)
  providerId    String?
  
  creditBalance Int       @default(0)
  
  role          UserRole  @default(USER)
  status        UserStatus @default(ACTIVE)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  generations   Generation[]
  creditTxs     CreditTransaction[]
  subscriptions Subscription[]
  payments      Payment[]
  
  @@index([email])
  @@index([provider, providerId])
}

enum AuthProvider {
  EMAIL
  GOOGLE
  APPLE
}

enum UserRole {
  USER
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

// ─── GENERATIONS ────────────────────────────────────

model Generation {
  id            String           @id @default(cuid())
  userId        String
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type          GenerationType
  status        GenerationStatus @default(QUEUED)
  
  // Input
  prompt        String?
  negativePrompt String?
  inputImageUrl String?
  model         String           // e.g. "stability-ai/sdxl"
  params        Json             // model-specific parameters
  
  // Output
  outputUrls    String[]         @default([])
  thumbnailUrl  String?
  
  // Metadata
  creditsCost   Int
  provider      String           // "replicate", "fal", "openai"
  providerJobId String?          // external job ID for polling
  errorMessage  String?
  processingMs  Int?             // how long it took
  
  // Moderation
  flagged       Boolean          @default(false)
  
  createdAt     DateTime         @default(now())
  completedAt   DateTime?
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([status])
  @@index([providerJobId])
}

enum GenerationType {
  TEXT_TO_IMAGE
  IMAGE_TO_IMAGE
  TEXT_TO_VIDEO
  IMAGE_TO_VIDEO
  TEXT_TO_3D
  BACKGROUND_REMOVAL
  UPSCALE
  INPAINT
  STYLE_TRANSFER
}

enum GenerationStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

// ─── CREDITS ────────────────────────────────────────

model CreditTransaction {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  amount      Int             // positive = add, negative = deduct
  type        CreditTxType
  description String
  
  // References
  generationId String?
  paymentId    String?
  
  balanceAfter Int            // snapshot of balance after this tx
  
  createdAt   DateTime        @default(now())
  
  @@index([userId, createdAt(sort: Desc)])
}

enum CreditTxType {
  PURCHASE          // bought credits
  SUBSCRIPTION      // monthly credit grant
  GENERATION_DEBIT  // used for generation
  GENERATION_REFUND // refund on failed generation
  BONUS             // free credits (signup, referral)
  ADMIN_ADJUSTMENT  // manual adjustment
}

// ─── PAYMENTS ───────────────────────────────────────

model Payment {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  amount          Int           // in cents (e.g., 499 = $4.99)
  currency        String        @default("USD")
  status          PaymentStatus @default(PENDING)
  
  provider        PaymentProvider
  providerPaymentId String?     @unique // Stripe payment_intent ID or RevenueCat tx ID
  
  // What was purchased
  productType     ProductType
  productId       String?       // credit_pack_id or plan_id
  creditsGranted  Int?
  
  metadata        Json?
  
  createdAt       DateTime      @default(now())
  completedAt     DateTime?
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([providerPaymentId])
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum PaymentProvider {
  STRIPE
  APP_STORE
  PLAY_STORE
}

enum ProductType {
  CREDIT_PACK
  SUBSCRIPTION
}

// ─── SUBSCRIPTIONS ──────────────────────────────────

model Subscription {
  id              String             @id @default(cuid())
  userId          String
  user            User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  plan            SubscriptionPlan
  status          SubscriptionStatus @default(ACTIVE)
  
  provider        PaymentProvider
  providerSubId   String?            @unique // Stripe sub ID or RevenueCat
  
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelledAt        DateTime?
  
  monthlyCredits  Int                // credits granted per period
  
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  
  @@index([userId])
  @@index([status, currentPeriodEnd])
}

enum SubscriptionPlan {
  FREE
  PRO
  BUSINESS
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
  EXPIRED
}

// ─── CATALOG (credit packs) ────────────────────────

model CreditPack {
  id          String  @id @default(cuid())
  name        String  // "Starter", "Pro", "Ultra"
  credits     Int     // 100, 400, 1200
  priceUsd    Int     // in cents: 499, 1499, 3999
  active      Boolean @default(true)
  sortOrder   Int     @default(0)
  
  // Store-specific product IDs
  stripeProductId    String?
  appStoreProductId  String?
  playStoreProductId String?
}

// ─── AI MODELS CATALOG ─────────────────────────────

model AiModel {
  id          String         @id @default(cuid())
  slug        String         @unique  // "sdxl-turbo"
  name        String         // "SDXL Turbo"
  provider    String         // "replicate"
  providerModelId String     // "stability-ai/sdxl:abc123"
  type        GenerationType
  creditCost  Int            // credits per generation
  active      Boolean        @default(true)
  
  // Display
  description String?
  thumbnailUrl String?
  tags        String[]       @default([])
  
  // Params schema (JSON Schema for frontend form generation)
  paramsSchema Json?
  
  sortOrder   Int            @default(0)
  createdAt   DateTime       @default(now())
  
  @@index([type, active])
}
```

## Seed Data

```typescript
// prisma/seed.ts — initial data for credit packs and AI models
const creditPacks = [
  { name: 'Starter', credits: 100, priceUsd: 499 },
  { name: 'Pro',     credits: 400, priceUsd: 1499 },
  { name: 'Ultra',   credits: 1200, priceUsd: 3999 },
];

const aiModels = [
  {
    slug: 'flux-schnell',
    name: 'Flux Schnell',
    provider: 'replicate',
    providerModelId: 'black-forest-labs/flux-schnell',
    type: 'TEXT_TO_IMAGE',
    creditCost: 2,
  },
  {
    slug: 'sdxl',
    name: 'Stable Diffusion XL',
    provider: 'replicate',
    providerModelId: 'stability-ai/sdxl',
    type: 'TEXT_TO_IMAGE',
    creditCost: 3,
  },
  // ... more models
];
```

## Key Design Decisions

1. **Credits stored on User row** — denormalized for fast reads. CreditTransaction table is the source of truth for auditing.
2. **Generation params as JSON** — different models have different parameters. JSON column keeps schema flexible.
3. **Separate Payment from CreditTransaction** — payments track money, credit transactions track credits. A single payment may result in multiple credit transactions (e.g., bonus credits on first purchase).
4. **AiModel catalog in DB** — allows adding/removing models without deployments. Frontend fetches available models dynamically.
5. **Soft delete via status** — Users are marked DELETED, not removed. Generations cascade delete is fine (user data deletion for GDPR).

## Steps

- [ ] Create prisma/schema.prisma with all models
- [ ] Run `prisma migrate dev --name init` to create initial migration
- [ ] Create seed script for credit packs and AI models
- [ ] Run `prisma db seed`
- [ ] Verify with `prisma studio`

## Next Step
Proceed to [05-AUTH-SYSTEM.md](./05-AUTH-SYSTEM.md)
