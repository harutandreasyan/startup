# CreatorAI — AI-Powered Creative Platform

## Vision
A multi-platform (web + iOS + Android) creative suite that lets users generate and edit images, videos, and 3D models using state-of-the-art AI models. Monetized through credits and subscriptions.

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Web Frontend | React + TypeScript + Vite |
| Mobile Frontend | React Native + Expo |
| Monorepo | Turborepo |
| Shared Styling | Tailwind CSS (web) + NativeWind (mobile) |
| State Management | Zustand |
| Backend | Node.js + NestJS + TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| Cache/Queue | Redis + BullMQ |
| Auth | Supabase Auth |
| File Storage | Cloudflare R2 |
| AI Providers | Replicate, Fal.ai, OpenAI |
| Web Payments | Stripe |
| Mobile Payments | RevenueCat |
| Hosting | Railway (backend), Vercel (web), Expo EAS (mobile) |
| Monitoring | Sentry |

## Project Structure

```
startup/
├── PROJECT_OVERVIEW.md          # This file
├── docs/
│   ├── 01-ENVIRONMENT-SETUP.md
│   ├── 02-MONOREPO-STRUCTURE.md
│   ├── 03-BACKEND-API.md
│   ├── 04-DATABASE-SCHEMA.md
│   ├── 05-AUTH-SYSTEM.md
│   ├── 06-AI-INTEGRATION.md
│   ├── 07-PAYMENTS-CREDITS.md
│   ├── 08-WEB-APP.md
│   ├── 09-MOBILE-APP.md
│   ├── 10-DEPLOYMENT.md
│   ├── 11-SECURITY.md
│   ├── 12-LEGAL-ARMENIA.md
│   └── 13-GROWTH-MARKETING.md
├── apps/
│   ├── web/                     # React + Vite
│   ├── mobile/                  # React Native + Expo
│   └── api/                     # NestJS backend
├── packages/
│   ├── shared/                  # Shared types, utils, constants
│   ├── api-client/              # Generated API client (shared)
│   └── ui/                      # Shared UI logic (not components)
├── prisma/                      # Database schema & migrations
├── turbo.json
├── package.json
└── .env.example
```

## Implementation Phases

| Phase | Weeks | Goal | Status |
|-------|-------|------|--------|
| Phase 1: Foundation | 1-3 | Monorepo, backend skeleton, auth, DB | [ ] Not Started |
| Phase 2: Core Feature | 4-6 | Image generation end-to-end | [ ] Not Started |
| Phase 3: Payments | 7-8 | Credits system, Stripe integration | [ ] Not Started |
| Phase 4: Expand Features | 9-12 | Video, 3D, editing features | [ ] Not Started |
| Phase 5: Mobile | 13-16 | React Native app, App Store submission | [ ] Not Started |
| Phase 6: Launch | 17-20 | Polish, marketing site, soft launch | [ ] Not Started |
| Phase 7: Growth | 21-24 | Social features, referrals, scaling | [ ] Not Started |
