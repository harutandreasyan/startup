# 07 — Payments & Credits System

## Two Payment Systems

| Platform | Provider | Why |
|----------|----------|-----|
| Web | Stripe | Direct payment, lower fees (2.9% + $0.30) |
| iOS | App Store via RevenueCat | Apple requires IAP for digital goods (30% cut, 15% after year 1) |
| Android | Play Store via RevenueCat | Google requires IAP for digital goods (15-30% cut) |

**Important:** Apple and Google require ALL digital goods purchases to go through their IAP system. You cannot use Stripe for in-app purchases on mobile. RevenueCat wraps both stores into one API.

## Credit System Design

### Credit Packs (one-time purchase)

| Pack | Credits | Web Price (Stripe) | Mobile Price (IAP) | Your AI Cost | Your Margin |
|------|---------|-------------------|-------------------|-------------|------------|
| Starter | 100 | $4.99 | $4.99 | ~$1.50 | ~55-70% |
| Pro | 400 | $14.99 | $14.99 | ~$5.00 | ~52-67% |
| Ultra | 1200 | $39.99 | $39.99 | ~$12.00 | ~55-70% |

Mobile margin is lower due to store fees (15-30%).

### Subscription Plans

| Plan | Price/mo | Credits/mo | Queue Priority | Watermark |
|------|----------|-----------|---------------|-----------|
| Free | $0 | 20 (signup bonus) | Low | Yes |
| Pro | $9.99 | 500 | Medium | No |
| Business | $29.99 | 2000 | High | No |

### Credit Costs Per Operation

| Operation | Credits | Approx AI Cost |
|-----------|---------|----------------|
| Image gen (fast model) | 2 | $0.003 |
| Image gen (quality model) | 4 | $0.02 |
| Image gen (DALL-E 3) | 8 | $0.04 |
| Video gen (short) | 20 | $0.10 |
| Video gen (long) | 40 | $0.30 |
| 3D model | 10 | $0.05 |
| Background removal | 1 | $0.01 |
| Upscale | 2 | $0.02 |
| Inpainting | 4 | $0.02 |

## Stripe Integration (Web)

### Checkout Flow
```
1. User clicks "Buy 400 Credits"
2. Frontend → POST /credits/purchase { packId: 'pro' }
3. Backend creates Stripe Checkout Session
4. Backend returns session URL
5. Frontend redirects to Stripe Checkout page
6. User pays → Stripe redirects to success URL
7. Stripe sends webhook → POST /payments/stripe/webhook
8. Backend verifies webhook signature
9. Backend creates Payment + CreditTransaction + updates balance
```

### Implementation
```typescript
// payments.service.ts — Stripe checkout
async createCheckoutSession(userId: string, packId: string) {
  const pack = await this.prisma.creditPack.findUniqueOrThrow({
    where: { id: packId },
  });

  const session = await this.stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `${pack.name} — ${pack.credits} Credits` },
        unit_amount: pack.priceUsd,
      },
      quantity: 1,
    }],
    metadata: { userId, packId, credits: pack.credits.toString() },
    success_url: `${process.env.WEB_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.WEB_URL}/credits`,
  });

  return { url: session.url };
}
```

### Stripe Webhook Handler
```typescript
// stripe.webhook.ts
async handleWebhook(rawBody: Buffer, signature: string) {
  const event = this.stripe.webhooks.constructEvent(
    rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET,
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, packId, credits } = session.metadata;

    await this.prisma.$transaction(async (tx) => {
      // 1. Create payment record
      await tx.payment.create({ data: {
        userId,
        amount: session.amount_total,
        status: 'COMPLETED',
        provider: 'STRIPE',
        providerPaymentId: session.payment_intent,
        productType: 'CREDIT_PACK',
        productId: packId,
        creditsGranted: parseInt(credits),
        completedAt: new Date(),
      }});

      // 2. Add credits
      const user = await tx.user.update({
        where: { id: userId },
        data: { creditBalance: { increment: parseInt(credits) } },
      });

      // 3. Record transaction
      await tx.creditTransaction.create({ data: {
        userId,
        amount: parseInt(credits),
        type: 'PURCHASE',
        description: `Purchased ${credits} credits`,
        balanceAfter: user.creditBalance,
      }});
    });
  }
}
```

## RevenueCat Integration (Mobile)

RevenueCat wraps App Store and Play Store subscriptions/purchases into one API.

### Setup
1. Create RevenueCat account
2. Connect App Store Connect and Google Play Console
3. Create Products in each store matching your credit packs
4. Map products in RevenueCat dashboard

### Mobile Purchase Flow
```
1. User taps "Buy 400 Credits"
2. App calls RevenueCat SDK → shows native purchase sheet
3. User confirms with Face ID / fingerprint
4. RevenueCat processes purchase
5. RevenueCat sends webhook → POST /payments/revenuecat/webhook
6. Backend verifies, grants credits
```

### React Native Implementation
```typescript
// mobile — purchase flow
import Purchases from 'react-native-purchases';

// Initialize on app start
Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });

// Fetch available products
const offerings = await Purchases.getOfferings();
const packages = offerings.current?.availablePackages;

// Purchase
const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
// RevenueCat webhook handles the rest server-side
```

### RevenueCat Webhook Handler
```typescript
// revenuecat.webhook.ts
async handleWebhook(body: any) {
  const event = body.event;
  
  if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
    const userId = event.app_user_id;
    const productId = event.product_id;
    
    // Map product_id to credit pack
    const pack = await this.prisma.creditPack.findFirst({
      where: {
        OR: [
          { appStoreProductId: productId },
          { playStoreProductId: productId },
        ],
      },
    });
    
    if (pack) {
      // Same credit granting logic as Stripe
      await this.grantCredits(userId, pack);
    }
  }
}
```

## Credit Deduction (Guard)

```typescript
// credits.guard.ts — used on generation endpoints
@Injectable()
export class CreditsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;
    
    // Look up model's credit cost
    const model = await this.prisma.aiModel.findUnique({
      where: { slug: body.model },
    });
    
    if (user.creditBalance < model.creditCost) {
      throw new HttpException('Insufficient credits', 402);
    }
    
    // Attach cost to request for the controller
    request.creditCost = model.creditCost;
    return true;
  }
}
```

## Steps

- [ ] Set up Stripe account + get API keys
- [ ] Create credit packs as Stripe Products
- [ ] Implement Stripe Checkout Session creation
- [ ] Implement Stripe webhook handler (with signature verification)
- [ ] Implement credit balance check guard
- [ ] Implement credit deduction on generation
- [ ] Implement credit refund on generation failure
- [ ] Set up RevenueCat account
- [ ] Create IAP products in App Store Connect
- [ ] Create IAP products in Google Play Console
- [ ] Map products in RevenueCat dashboard
- [ ] Implement RevenueCat webhook handler
- [ ] Implement subscription management (upgrade, cancel)
- [ ] Build credits purchase UI (web)
- [ ] Build credits purchase UI (mobile)
- [ ] Test full purchase → credit grant flow (both platforms)
- [ ] Set up Stripe test mode for development

## Next Step
Proceed to [08-WEB-APP.md](./08-WEB-APP.md)
