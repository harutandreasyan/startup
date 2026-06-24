# 11 — Security

## Current implementation status (2026-06-24)
Implemented and verified in `apps/api`:
- **Rate limiting ENFORCED.** `ThrottlerModule.forRoot([{ttl:60000, limit:100}])` + a global
  `ThrottlerGuard` registered via `APP_GUARD` in `app.module.ts` (the module alone did NOT
  enforce — the guard is what applies it). Tighter per-route limits via `@Throttle`:
  `/auth/register` 5/min, `/auth/login` 10/min (brute-force protection). `@SkipThrottle` on
  the Stripe webhook (`/payments/stripe/webhook`) and `/health` (uptime monitors). Verified:
  11th rapid login → HTTP 429.
- **Security headers** via `helmet` in `main.ts` (HSTS, X-Frame-Options, X-Content-Type-Options,
  X-DNS-Prefetch-Control, COOP; `X-Powered-By` removed). CSP disabled (JSON API); CORP set to
  `cross-origin` so the SPA can call it.
- **Input validation:** global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`.
- **CORS:** locked to `CORS_ORIGINS` in production; any `localhost:*` allowed only in dev.
- **Auth:** Supabase JWT verified by `AuthGuard`; webhook signatures verified with `STRIPE_WEBHOOK_SECRET`.

Still open (future): OpenAI prompt moderation, automated dependency scanning, secrets rotation.

## Authentication & Authorization

- [ ] JWT tokens via Supabase Auth (short-lived: 1 hour)
- [ ] Refresh token rotation (prevents token reuse)
- [ ] Secure cookie storage for web (httpOnly, secure, sameSite)
- [ ] AsyncStorage + SecureStore for mobile (use expo-secure-store for tokens)
- [ ] Rate limit login attempts (5 per 5 minutes per IP)
- [ ] Rate limit registration (3 per hour per IP)
- [ ] Email verification required before accessing paid features

## API Security

- [ ] CORS — allow only your domains (web URL, mobile deep links)
- [ ] Helmet.js — security headers (X-Frame-Options, CSP, etc.)
- [ ] Rate limiting per user + per IP (express-rate-limit or nestjs-throttler)
- [ ] Input validation on every endpoint (class-validator + class-transformer)
- [ ] Request size limits (10MB max for image uploads)
- [ ] SQL injection prevention — Prisma ORM handles parameterized queries
- [ ] No sensitive data in URL parameters (tokens, IDs in body/headers)

## Payment Security

- [ ] Never handle raw card data — Stripe Checkout / RevenueCat handles this
- [ ] Verify Stripe webhook signatures on every webhook
- [ ] Verify RevenueCat webhook signatures
- [ ] Idempotent payment processing (handle duplicate webhooks gracefully)
- [ ] Credit operations inside database transactions (prevent race conditions)
- [ ] Log all credit mutations for audit trail

## Content Security

- [ ] Prompt moderation before generation (OpenAI Moderation API)
- [ ] Output image scanning (flag NSFW content)
- [ ] User-uploaded image scanning before processing
- [ ] Report/flag system for community content (if shared publicly)
- [ ] DMCA takedown process (required for US users)

## Infrastructure Security

- [ ] All environment variables in hosting platform (never in code)
- [ ] .env in .gitignore (and .env.example with dummy values committed)
- [ ] API keys rotated quarterly
- [ ] Database credentials via connection string (not individual fields)
- [ ] R2 bucket — private by default, public access via signed URLs only
- [ ] Signed URLs expire after 1 hour for generated content
- [ ] HTTPS everywhere (Cloudflare handles TLS termination)
- [ ] DDoS protection via Cloudflare (free plan includes basic protection)

## Data Protection & Privacy

- [ ] GDPR compliance:
  - Users can export their data (GET /users/me/export)
  - Users can delete their account + all data (DELETE /auth/account)
  - Privacy policy clearly states what data is collected and why
  - Cookie consent banner on web
- [ ] Data encryption at rest (Supabase/Railway provide this)
- [ ] No logging of sensitive fields (passwords, tokens, payment info)
- [ ] PII minimization — only collect what's needed

## Mobile Security

- [ ] Certificate pinning (prevent MITM attacks)
- [ ] Obfuscate API URLs in mobile binary (ProGuard for Android)
- [ ] Jailbreak/root detection (optional — warn users)
- [ ] Secure token storage (expo-secure-store, not plain AsyncStorage)
- [ ] App Transport Security (iOS — HTTPS only, Expo handles this)

## Rate Limits Summary

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/login | 5 | 5 min |
| POST /auth/register | 3 | 1 hour |
| POST /generations | 20 | 1 min |
| GET /generations | 60 | 1 min |
| POST /credits/purchase | 5 | 1 min |
| Global per user | 100 | 1 min |
| Global per IP (unauthed) | 30 | 1 min |

## Incident Response Plan

1. **Detection:** Sentry alerts, uptime monitoring, anomalous credit deductions
2. **Containment:** Disable affected endpoint / suspend suspicious account
3. **Investigation:** Check logs, identify scope
4. **Recovery:** Fix vulnerability, restore data if needed
5. **Post-mortem:** Document what happened, update security measures

## Dependencies Security

```bash
# Regular audit of npm packages
pnpm audit

# Auto-fix known vulnerabilities
pnpm audit --fix

# Use Dependabot or Renovate for automated dependency updates
# .github/dependabot.yml
```

## Next Step
Proceed to [12-LEGAL-ARMENIA.md](./12-LEGAL-ARMENIA.md)
