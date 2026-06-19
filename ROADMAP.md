# CreatorAI — Master Roadmap & Checklist

## Phase 1: Foundation (Weeks 1-3)
> Goal: Monorepo running, backend skeleton, auth working, DB ready

- [~] **Environment** — [Guide](docs/01-ENVIRONMENT-SETUP.md)
  - [x] Install Node.js 20, npm
  - [ ] Install Docker Desktop (needed for local Postgres/Redis)
  - [ ] Create service accounts (Supabase, Replicate) — *you must do this; see RUNBOOK.md*
  - [ ] Set up VS Code with extensions

- [x] **Monorepo** — [Guide](docs/02-MONOREPO-STRUCTURE.md)
  - [x] Initialize Turborepo + npm workspaces
  - [x] Scaffold apps/web (Vite + React) — **running, verified in browser**
  - [x] Scaffold apps/api (NestJS) — **typechecks clean**
  - [x] Create packages/shared with TypeScript types
  - [x] Create packages/api-client
  - [x] Verify dev server starts (web confirmed)

- [~] **Database** — [Guide](docs/04-DATABASE-SCHEMA.md)
  - [x] Set up Docker Compose (Postgres + Redis)
  - [x] Create Prisma schema with all models
  - [x] Create seed data (credit packs, AI models)
  - [ ] Run initial migration — *needs Docker running; see RUNBOOK.md step 4*

- [~] **Auth** — [Guide](docs/05-AUTH-SYSTEM.md)
  - [ ] Configure Supabase project (Email + Google + Apple providers) — *your step*
  - [x] Implement NestJS AuthGuard (JWT verification)
  - [x] Implement user sync service (auto-creates user + 20 bonus credits)
  - [x] Build login/register pages (web) — **verified in browser**

---

## Phase 2: Core Feature (Weeks 4-6)
> Goal: Text-to-image generation working end-to-end

- [x] **AI Integration** — [Guide](docs/06-AI-INTEGRATION.md)
  - [x] Implement AI provider abstraction layer
  - [x] Implement Replicate provider (Flux Schnell + others seeded)
  - [x] Set up BullMQ job queue for async generation
  - [x] Implement generation worker (submit → poll → save result → refund on fail)
  - [x] Set up R2 storage for generated images (falls back to provider URL if unset)
  - [x] Implement WebSocket for real-time progress
  - [ ] Implement prompt moderation (OpenAI Moderation API) — *deferred to Phase 3*

- [x] **Backend API** — [Guide](docs/03-BACKEND-API.md)
  - [x] POST /generations endpoint (with credit check + deduction)
  - [x] GET /generations (list user's generations)
  - [x] GET /generations/:id (status + result)
  - [x] GET /models (available AI models)
  - [x] DELETE /generations/:id

- [x] **Web App** — [Guide](docs/08-WEB-APP.md)
  - [x] Generate page (prompt input, model selector, params)
  - [x] Real-time progress display (WebSocket)
  - [x] Gallery page (grid of past generations)
  - [x] Download generated images
  - [x] Credit balance display

> **Phase 2 status:** ✅ VERIFIED WORKING end-to-end. Registration, login, credit
> debit/refund, queue, and Replicate integration all confirmed against the live local
> stack. Free image generation now uses **Pollinations.ai** (no billing) — see
> [docs/06](docs/06-AI-INTEGRATION.md) "Provider Tiers". Replicate billing documented
> as a future task for premium/video/3D models.

---

## Phase 3: Payments (Weeks 7-8)
> Goal: Users can buy credits and use them

- [x] **Credits System** — [Guide](docs/07-PAYMENTS-CREDITS.md)
  - [x] Implement credit balance check guard (in generations.service)
  - [x] Implement credit deduction on generation — **verified in DB ledger**
  - [x] Implement credit refund on failed generation — **verified in DB ledger**
  - [x] Transaction history API + UI

- [x] **Stripe** — [Guide](docs/07-PAYMENTS-CREDITS.md)
  - [x] Implement Checkout Session creation (POST /credits/purchase)
  - [x] Implement webhook handler (POST /payments/stripe/webhook, signature-verified, idempotent)
  - [x] Build credits purchase page (web) — redirects to Stripe Checkout
  - [ ] Create Stripe account + test full purchase flow (test mode) — *your step, see SETUP-GUIDE.md Part 9*

> **Phase 3 status:** All payment code written and typechecks clean. To test, create a
> free Stripe account, add TEST-mode keys to `apps/api/.env`, and use test card
> `4242 4242 4242 4242`. Guide in [SETUP-GUIDE.md](creatorai/SETUP-GUIDE.md) Part 9.

---

## Phase 4: Expand Features (Weeks 9-12)
> Goal: Video, 3D, editing features + more image models

- [ ] **More AI Models**
  - [ ] Add Flux Dev, SDXL, DALL-E 3 for images
  - [ ] Add video generation (Kling, Wan)
  - [ ] Add 3D generation (TripoSR)
  - [ ] Add image editing (background removal, upscale, inpainting)

- [ ] **Web App Expansion**
  - [ ] Video generation UI + player
  - [ ] 3D model viewer (three.js)
  - [ ] Image editing UI (inpaint mask drawing)
  - [ ] Subscription management page
  - [ ] Settings page (profile, change password, delete account)

- [ ] **Backend Expansion**
  - [ ] Multiple queue types (image, video, 3D)
  - [ ] Subscription management endpoints
  - [ ] User statistics endpoints

---

## Phase 5: Mobile (Weeks 13-16)
> Goal: iOS + Android apps submitted to stores

- [ ] **React Native App** — [Guide](docs/09-MOBILE-APP.md)
  - [ ] Initialize Expo project with Expo Router
  - [ ] Set up NativeWind styling
  - [ ] Build auth screens
  - [ ] Build tab navigation (home, generate, gallery, profile)
  - [ ] Build generate screen
  - [ ] Build gallery screen
  - [ ] Integrate Supabase auth
  - [ ] Integrate RevenueCat for IAP

- [ ] **Store Submission** — [Guide](docs/09-MOBILE-APP.md)
  - [ ] Prepare app icons + screenshots
  - [ ] Write store descriptions
  - [ ] Create privacy policy + terms of service pages
  - [ ] Submit to TestFlight (iOS beta)
  - [ ] Submit to Google Play internal testing
  - [ ] Address review feedback
  - [ ] Publish to both stores

---

## Phase 6: Launch (Weeks 17-20)
> Goal: Polish, marketing site, public launch

- [ ] **Deployment** — [Guide](docs/10-DEPLOYMENT.md)
  - [ ] Set up production Railway deployment
  - [ ] Set up Vercel production deployment
  - [ ] Configure custom domain + SSL
  - [ ] Set up CI/CD pipeline (GitHub Actions)
  - [ ] Set up Sentry monitoring
  - [ ] Set up uptime monitoring

- [ ] **Security** — [Guide](docs/11-SECURITY.md)
  - [ ] Security audit (rate limiting, input validation, CORS)
  - [ ] Payment security verification
  - [ ] Content moderation testing

- [ ] **Legal** — [Guide](docs/12-LEGAL-ARMENIA.md)
  - [ ] Register business in Armenia
  - [ ] Apply for IT sector tax benefits
  - [ ] Publish Terms of Service + Privacy Policy
  - [ ] Open business bank account

- [ ] **Launch** — [Guide](docs/13-GROWTH-MARKETING.md)
  - [ ] Landing page with waitlist → open access
  - [ ] ProductHunt submission
  - [ ] Social media launch campaign
  - [ ] Beta user → public transition

---

## Phase 7: Growth (Weeks 21-24+)
> Goal: Scale users, revenue, features

- [ ] **Growth Features** — [Guide](docs/13-GROWTH-MARKETING.md)
  - [ ] Referral program
  - [ ] Community gallery (public sharing)
  - [ ] Daily free credits for retention
  - [ ] Email campaigns + push notifications
  - [ ] SEO blog content
  - [ ] Analytics + A/B testing

---

## Quick Reference

| What | Where |
|------|-------|
| Full project overview | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Environment setup | [docs/01](docs/01-ENVIRONMENT-SETUP.md) |
| Monorepo structure | [docs/02](docs/02-MONOREPO-STRUCTURE.md) |
| Backend API design | [docs/03](docs/03-BACKEND-API.md) |
| Database schema | [docs/04](docs/04-DATABASE-SCHEMA.md) |
| Auth system | [docs/05](docs/05-AUTH-SYSTEM.md) |
| AI integration | [docs/06](docs/06-AI-INTEGRATION.md) |
| Payments & credits | [docs/07](docs/07-PAYMENTS-CREDITS.md) |
| Web app | [docs/08](docs/08-WEB-APP.md) |
| Mobile app | [docs/09](docs/09-MOBILE-APP.md) |
| Deployment | [docs/10](docs/10-DEPLOYMENT.md) |
| Security | [docs/11](docs/11-SECURITY.md) |
| Legal (Armenia) | [docs/12](docs/12-LEGAL-ARMENIA.md) |
| Growth & marketing | [docs/13](docs/13-GROWTH-MARKETING.md) |
