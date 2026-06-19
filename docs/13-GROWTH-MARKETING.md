# 13 — Growth & Marketing

## Pre-Launch (Weeks 1-16)

### Build in Public
- [ ] Share development progress on Twitter/X
- [ ] Post demos on TikTok/Instagram Reels (AI-generated content is viral)
- [ ] Create a landing page with email waitlist (Vercel + simple form)
- [ ] Goal: 500+ waitlist emails before launch

### SEO Foundation
- [ ] Landing page optimized for: "AI image generator", "AI video generator", "free AI art"
- [ ] Blog with tutorials: "How to generate AI images", "Best AI models for X"
- [ ] Each AI model gets its own landing page (long-tail SEO)

### Community
- [ ] Discord server for early users/testers
- [ ] Subreddit presence: r/StableDiffusion, r/AIart, r/midjourney
- [ ] ProductHunt launch prep (collect hunter, prepare assets)

## Launch Strategy (Week 17-20)

### Soft Launch
1. Open to waitlist users first (beta)
2. Collect feedback, fix bugs
3. Generous free credits for beta testers (50 credits instead of 20)

### Public Launch
1. **Product Hunt launch** — aim for top 5 of the day
2. **Hacker News** — Show HN post
3. **Reddit** — posts in relevant subreddits
4. **Twitter/X** — launch thread with demos
5. **TikTok/Reels** — short videos showing the tool

## User Acquisition Channels

| Channel | Cost | Expected CAC | Volume |
|---------|------|-------------|--------|
| SEO / organic search | $0 (time) | $0 | Slow start, compounds |
| TikTok/Reels (organic) | $0 (time) | $0 | High if viral |
| ProductHunt | $0 | $0 | Spike, then drops |
| Reddit/communities | $0 (time) | $0 | Moderate |
| Google Ads | $0.50-2/click | $5-15 | Scalable |
| Facebook/Instagram Ads | $0.30-1/click | $3-10 | Scalable |
| TikTok Ads | $0.20-0.50/click | $2-8 | High volume |
| Referral program | Free credits | $1-3 | Moderate |
| YouTube tutorials | $0 (time) | $0 | Long-term |

### Recommended order:
1. Start with organic (SEO, social, communities) — $0 cost
2. Add referral program at 1K users
3. Start paid ads at 5K users when unit economics are proven

## Referral Program

```
Invite a friend:
- You get: 20 free credits
- Friend gets: 30 free credits (more than signup bonus → incentive to use referral)

Mechanics:
- Unique referral code per user
- Friend must create account + generate at least 1 image
- Credits granted after friend's first generation (prevents abuse)
- Cap: 50 referrals per user (1,000 free credits max)
```

## Retention Strategies

- **Daily free credits:** Give 2 free credits daily to free users (keeps them coming back)
- **Streak bonus:** 7 consecutive days of use → bonus 10 credits
- **Email reminders:** "Your generation of [X] is ready" + weekly inspiration
- **Push notifications:** New model added, credit sale, feature update
- **Community gallery:** See what others are creating → inspiration to create more

## Revenue Projections

### Conservative Scenario

| Month | Total Users | Paying Users (%) | MRR | AI Costs | Net Revenue |
|-------|-------------|------------------|-----|----------|-------------|
| 1 | 200 | 10 (5%) | $100 | $30 | $70 |
| 3 | 1,000 | 60 (6%) | $600 | $180 | $420 |
| 6 | 3,000 | 210 (7%) | $2,100 | $630 | $1,470 |
| 12 | 10,000 | 800 (8%) | $8,000 | $2,400 | $5,600 |
| 18 | 25,000 | 2,500 (10%) | $25,000 | $7,500 | $17,500 |
| 24 | 50,000 | 5,000 (10%) | $50,000 | $15,000 | $35,000 |

### Key Metrics to Track

| Metric | Target |
|--------|--------|
| DAU/MAU ratio | >20% (healthy engagement) |
| Free-to-paid conversion | 5-10% |
| Monthly churn (paying) | <5% |
| Average Revenue Per User (ARPU) | $8-12/mo |
| Customer Acquisition Cost (CAC) | <$10 |
| Lifetime Value (LTV) | >$50 |
| LTV/CAC ratio | >3x |

### Analytics Tools (Free Tiers)
- **Mixpanel** or **PostHog** (product analytics, funnels, retention)
- **Google Analytics 4** (web traffic)
- **Sentry** (errors)
- **Railway metrics** (API performance)

## Competitive Differentiation

You're competing with Midjourney, Leonardo.ai, RunwayML, Canva AI. Win by:

1. **Multi-modal:** Image + video + 3D in one app (most competitors specialize)
2. **Model variety:** Offer many models (Flux, SDXL, DALL-E, etc.) — users can compare
3. **Mobile-first:** Most competitors are web-only or have poor mobile apps
4. **Affordable pricing:** Undercut competitors on credits-per-dollar
5. **Speed:** Use fastest models (Flux Schnell, Fal.ai) for instant gratification
6. **Community:** User gallery, sharing, remixing other users' prompts

## Steps

- [ ] Create landing page with waitlist (can be a simple page on your web app)
- [ ] Set up social media accounts (Twitter, TikTok, Instagram, Discord)
- [ ] Start posting development progress / AI demos
- [ ] Set up PostHog or Mixpanel for analytics
- [ ] Implement referral system (referral code → bonus credits)
- [ ] Prepare ProductHunt launch assets
- [ ] Write 3-5 SEO blog posts before launch
- [ ] Set up email collection + drip campaign (Resend + react-email)
- [ ] Plan launch day timeline
- [ ] Set up daily free credits mechanism for retention
