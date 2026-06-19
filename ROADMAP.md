# CreatorAI — Master Roadmap & Checklist

## Phase 1: Foundation (Weeks 1-3)
> Goal: Monorepo running, backend skeleton, auth working, DB ready

- [ ] **Environment** — [Guide](docs/01-ENVIRONMENT-SETUP.md)
  - [ ] Install Node.js 20, pnpm, Expo CLI, Docker
  - [ ] Create all service accounts (GitHub, Supabase, Replicate, Cloudflare)
  - [ ] Set up VS Code with extensions

- [ ] **Monorepo** — [Guide](docs/02-MONOREPO-STRUCTURE.md)
  - [ ] Initialize Turborepo + pnpm workspaces
  - [ ] Scaffold apps/web (Vite + React)
  - [ ] Scaffold apps/api (NestJS)
  - [ ] Create packages/shared with TypeScript types
  - [ ] Create packages/api-client
  - [ ] Verify `pnpm dev` starts all apps

- [ ] **Database** — [Guide](docs/04-DATABASE-SCHEMA.md)
  - [ ] Set up Docker Compose (Postgres + Redis)
  - [ ] Create Prisma schema with all models
  - [ ] Run initial migration
  - [ ] Create seed data (credit packs, AI models)

- [ ] **Auth** — [Guide](docs/05-AUTH-SYSTEM.md)
  - [ ] Configure Supabase project (Email + Google + Apple providers)
  - [ ] Implement NestJS AuthGuard (JWT verification)
  - [ ] Implement user sync service
  - [ ] Build login/register pages (web)

---

## Phase 2: Core Feature (Weeks 4-6)
> Goal: Text-to-image generation working end-to-end

- [ ] **AI Integration** — [Guide](docs/06-AI-INTEGRATION.md)
  - [ ] Implement AI provider abstraction layer
  - [ ] Implement Replicate provider (Flux Schnell model)
  - [ ] Set up BullMQ job queue for async generation
  - [ ] Implement generation worker (submit → poll → save result)
  - [ ] Set up R2 storage for generated images
  - [ ] Implement WebSocket for real-time progress

- [ ] **Backend API** — [Guide](docs/03-BACKEND-API.md)
  - [ ] POST /generations endpoint
  - [ ] GET /generations (list user's generations)
  - [ ] GET /generations/:id (status + result)
  - [ ] GET /models (available AI models)
  - [ ] Implement prompt moderation (OpenAI Moderation API)

- [ ] **Web App** — [Guide](docs/08-WEB-APP.md)
  - [ ] Generate page (prompt input, model selector, params)
  - [ ] Real-time progress display
  - [ ] Gallery page (grid of past generations)
  - [ ] Download generated images
  - [ ] Credit balance display

---

## Phase 3: Payments (Weeks 7-8)
> Goal: Users can buy credits and use them

- [ ] **Credits System** — [Guide](docs/07-PAYMENTS-CREDITS.md)
  - [ ] Implement credit balance check guard
  - [ ] Implement credit deduction on generation
  - [ ] Implement credit refund on failed generation
  - [ ] Transaction history API + UI

- [ ] **Stripe** — [Guide](docs/07-PAYMENTS-CREDITS.md)
  - [ ] Create Stripe products for credit packs
  - [ ] Implement Checkout Session creation
  - [ ] Implement webhook handler
  - [ ] Build credits purchase page (web)
  - [ ] Test full purchase flow (test mode)

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
