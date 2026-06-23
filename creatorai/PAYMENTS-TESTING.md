# Payments & Subscriptions — How it works + Local testing

A plain-English guide to how CreatorAI takes money, and how to test the whole flow
**locally with zero real charges**.

---

## 1. The big picture (you never touch card numbers)

CreatorAI never sees or stores a card number. **Stripe** does all of that. The flow is
the same for one-time credit packs and for monthly subscriptions:

```
User clicks Buy / Subscribe
        │
        ▼
Your API asks Stripe: "make a Checkout Session for $X"   ← uses STRIPE_SECRET_KEY
        │
        ▼
Stripe returns a secure URL  →  app redirects user to checkout.stripe.com
        │
        ▼
User types their card on STRIPE's page (not ours) and pays
        │
        ▼
Stripe redirects the user back to /credits?status=success
        │
        ▼
Stripe sends a "webhook" event to your API  ← verified with STRIPE_WEBHOOK_SECRET
        │
        ▼
Your API grants the credits / activates the plan, and records a transaction
```

The **webhook** is the important part: the user being redirected back to your site is
*not* proof of payment (they could close the tab). The webhook is Stripe telling your
server **"this payment really happened"** — that's when credits are granted.

---

## 2. Test mode vs Live mode

Stripe has two completely separate worlds:

| | **Test mode** (now) | **Live mode** (after launch) |
|---|---|---|
| Keys | `sk_test_…` / `whsec_…` | `sk_live_…` / `whsec_…` (from a real webhook endpoint) |
| Money | **None. Nothing is ever charged.** | Real money moves to your bank |
| Cards | Only fake "test cards" like `4242…` work | Real customer cards |
| Who can pay | Only you, testing | Real users |

You are 100% in **test mode** right now. There is no way to be charged real money in
test mode, even with a real card (real cards are rejected on test pages).

---

## 3. What is `4242 4242 4242 4242`?

It's **Stripe's official test card.** It only exists in test mode and always simulates a
**successful** payment. Use:

- **Card:** `4242 4242 4242 4242`
- **Expiry:** any future date (e.g. `12 / 34`)
- **CVC:** any 3 digits (e.g. `123`)
- **ZIP:** any (e.g. `10000`)

Other handy test cards:
- `4000 0000 0000 0002` → card **declined** (test your error handling)
- `4000 0025 0000 3155` → requires **3D Secure** confirmation popup

Full list: https://stripe.com/docs/testing

---

## 4. How subscriptions work in CreatorAI

Plans (defined in `packages/shared` → `PLANS`):

| Plan | Price | Credits/month |
|------|-------|---------------|
| Free | $0 | signup bonus only |
| Pro | $10/mo | 500 |
| Business | $30/mo | 2000 |

- **Subscribe:** Credits page → *Subscribe to Pro* → Stripe Checkout → on success the
  webhook (`checkout.session.completed`, `mode=subscription`) **grants that month's
  credits immediately** and marks you on the plan.
- **Every month after:** Stripe automatically charges the card and sends an
  `invoice.paid` webhook → your API **tops up the monthly credits** again. You don't do
  anything; it's automatic.
- **Cancel:** Settings → Subscription → Cancel. You keep access until the end of the
  current paid period, then drop back to Free. (Webhook: `customer.subscription.deleted`.)

So a real user, after launch, just enters their card once and gets credits topped up
monthly until they cancel.

---

## 5. What changes for REAL users (going live)

Test mode → Live mode requires:

1. **Activate your Stripe account** — add business details + a bank account for payouts
   (Stripe holds the money and pays out to your bank on a schedule).
2. **Swap to live keys** — `sk_live_…` in the deployed API's env.
3. **A public webhook URL** — real Stripe can't reach `localhost`. Once the API is
   deployed (e.g. `https://api.yourdomain.com`), you create a webhook endpoint in the
   Stripe Dashboard pointing at `https://api.yourdomain.com/payments/stripe/webhook` and
   put *that* endpoint's signing secret (`whsec_…`) in the live env.
4. That's it — real cards now work and money flows to your bank.

(The `stripe listen` CLI trick below is **only for local testing**; in production the
deployed public URL replaces it.)

---

## 6. Test it locally (no money, ~3 minutes)

You need three things running: **docker** (Postgres+Redis), the **API**, the **web app**,
plus the **Stripe CLI** forwarding webhooks.

**Step 1 — make sure the keys are in `apps/api/.env`:**
```env
STRIPE_SECRET_KEY=sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…   # the value `stripe listen` prints (see step 2)
```

**Step 2 — forward webhooks to your local API (keep this terminal open):**
```bash
stripe listen --forward-to localhost:3000/payments/stripe/webhook
```
Copy the `whsec_…` it prints into `.env` (step 1), then **restart the API** so it loads it.

**Step 3 — run the app** (in the project root):
```bash
npm run dev        # or however you start web + api
```

**Step 4 — test a credit pack:**
1. Log in → go to **Credits** → **Buy** a pack.
2. On the Stripe page, pay with `4242 4242 4242 4242`, any future expiry, any CVC.
3. You're redirected back; within a second your **credit balance goes up** and the
   purchase appears in **Transaction history**.
4. In the `stripe listen` terminal you'll see `checkout.session.completed [200]`.

**Step 5 — test a subscription:**
1. Credits → **Subscribe to Pro** → pay with `4242…`.
2. Back on the app you're now on the **Pro** plan and got **500 credits**.
3. Cancel anytime from **Settings → Subscription** (you keep access until period end).

### Troubleshooting
- **Paid but no credits?** The `stripe listen` terminal must be running, and the API must
  have been restarted *after* you saved `STRIPE_WEBHOOK_SECRET`. Check that terminal shows
  the event being forwarded with a `200`.
- **Checkout won't open / 500 error?** Your `STRIPE_SECRET_KEY` is wrong or missing — a
  real test key is ~107 characters and starts with `sk_test_`.

### (Advanced) Testing monthly renewals without waiting a month
Real renewals fire `invoice.paid` once a month. To simulate that locally, Stripe has
**test clocks** (https://stripe.com/docs/billing/testing/test-clocks) — optional and only
needed if you specifically want to verify the auto-top-up logic before launch.

---

## TL;DR
- You're in **test mode** — `4242…` is a fake card, **nothing charges you**.
- Stripe handles the card; a **webhook** is what actually grants credits/plans.
- Subscriptions auto-charge monthly and top up credits until cancelled.
- Going live = activate Stripe + live keys + a public webhook URL on your deployed API.
