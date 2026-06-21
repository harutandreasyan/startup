import { HttpException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PLANS, type SubscriptionPlan } from '@creatorai/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

  constructor(private prisma: PrismaService) {}

  /** Creates a Stripe Checkout session for a credit pack purchase. */
  async createCheckoutSession(userId: string, packId: string, userEmail: string) {
    const pack = await this.prisma.creditPack.findUnique({ where: { id: packId } });
    if (!pack || !pack.active) throw new HttpException('Credit pack not found', 404);

    const webUrl = process.env.WEB_URL || 'http://localhost:5180';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${pack.name} — ${pack.credits} Credits` },
            unit_amount: pack.priceUsd,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        packId: pack.id,
        credits: String(pack.credits),
      },
      success_url: `${webUrl}/credits?status=success`,
      cancel_url: `${webUrl}/credits?status=cancelled`,
    });

    return { url: session.url };
  }

  /** Creates a Stripe Checkout session for a monthly subscription. */
  async createSubscriptionCheckout(userId: string, plan: SubscriptionPlan, userEmail: string) {
    const planInfo = PLANS[plan];
    if (!planInfo || plan === 'FREE') throw new HttpException('Invalid plan', 400);

    const webUrl = process.env.WEB_URL || 'http://localhost:5180';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `CreatorAI ${planInfo.name} — ${planInfo.monthlyCredits} credits/mo` },
            unit_amount: planInfo.priceUsd,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        plan,
        monthlyCredits: String(planInfo.monthlyCredits),
      },
      success_url: `${webUrl}/credits?status=subscribed`,
      cancel_url: `${webUrl}/credits?status=cancelled`,
    });

    return { url: session.url };
  }

  /** Verifies and processes a Stripe webhook event. */
  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      throw new HttpException(`Webhook signature verification failed: ${message}`, 400);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') {
        await this.activateSubscription(session);
      } else {
        await this.grantCreditsFromSession(session);
      }
    } else if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice & {
        billing_reason?: string;
        subscription?: string;
      };
      // Only renewals — the first invoice is handled by checkout.session.completed
      if (invoice.billing_reason === 'subscription_cycle' && invoice.subscription) {
        await this.renewSubscription(String(invoice.subscription));
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      await this.markSubscriptionCancelled(sub.id);
    }

    return { received: true };
  }

  /** Returns the user's active (non-expired) subscription, or null. */
  async getActiveSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } },
      orderBy: { currentPeriodEnd: 'desc' },
    });
  }

  /** Cancels the user's active subscription at period end via Stripe. */
  async cancelActiveSubscription(userId: string) {
    const sub = await this.getActiveSubscription(userId);
    if (!sub) throw new HttpException('No active subscription', 404);

    if (sub.providerSubId) {
      try {
        await this.stripe.subscriptions.update(sub.providerSubId, { cancel_at_period_end: true });
      } catch (err) {
        this.logger.warn(`Stripe cancel failed for ${sub.providerSubId}: ${err}`);
      }
    }

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    return { cancelled: true, accessUntil: sub.currentPeriodEnd };
  }

  private async renewSubscription(providerSubId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { providerSubId } });
    if (!sub) return;

    const periodEnd = new Date(sub.currentPeriodEnd);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { providerSubId },
        data: { status: 'ACTIVE', currentPeriodStart: sub.currentPeriodEnd, currentPeriodEnd: periodEnd },
      });
      if (sub.monthlyCredits > 0) {
        const user = await tx.user.update({
          where: { id: sub.userId },
          data: { creditBalance: { increment: sub.monthlyCredits } },
        });
        await tx.creditTransaction.create({
          data: {
            userId: sub.userId,
            amount: sub.monthlyCredits,
            type: 'SUBSCRIPTION',
            description: `${sub.plan} subscription — monthly renewal`,
            balanceAfter: user.creditBalance,
          },
        });
      }
    });
    this.logger.log(`Renewed subscription ${providerSubId}`);
  }

  private async markSubscriptionCancelled(providerSubId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { providerSubId } });
    if (!sub) return;
    await this.prisma.subscription.update({
      where: { providerSubId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
    this.logger.log(`Cancelled subscription ${providerSubId}`);
  }

  private async activateSubscription(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as SubscriptionPlan | undefined;
    const monthlyCredits = parseInt(session.metadata?.monthlyCredits || '0', 10);
    const providerSubId = String(session.subscription || session.id);

    if (!userId || !plan) {
      this.logger.warn('Subscription session missing metadata, skipping');
      return;
    }

    // Idempotency: skip if we already recorded this subscription
    const existing = await this.prisma.subscription.findUnique({ where: { providerSubId } });
    if (existing) {
      this.logger.log(`Subscription ${providerSubId} already active, skipping`);
      return;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.$transaction(async (tx) => {
      await tx.subscription.create({
        data: {
          userId,
          plan,
          status: 'ACTIVE',
          provider: 'STRIPE',
          providerSubId,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          monthlyCredits,
        },
      });

      if (monthlyCredits > 0) {
        const user = await tx.user.update({
          where: { id: userId },
          data: { creditBalance: { increment: monthlyCredits } },
        });
        await tx.creditTransaction.create({
          data: {
            userId,
            amount: monthlyCredits,
            type: 'SUBSCRIPTION',
            description: `${plan} subscription — monthly credits`,
            balanceAfter: user.creditBalance,
          },
        });
      }
    });

    this.logger.log(`Activated ${plan} subscription for user ${userId}`);
    // NOTE: renewals (invoice.paid for subsequent periods) are a follow-up —
    // see docs/07. First period is granted here.
  }

  private async grantCreditsFromSession(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const packId = session.metadata?.packId;
    const credits = parseInt(session.metadata?.credits || '0', 10);
    const paymentIntentId = String(session.payment_intent || session.id);

    if (!userId || !credits) {
      this.logger.warn('Webhook session missing metadata, skipping');
      return;
    }

    // Idempotency: skip if this payment was already processed
    const existing = await this.prisma.payment.findUnique({
      where: { providerPaymentId: paymentIntentId },
    });
    if (existing) {
      this.logger.log(`Payment ${paymentIntentId} already processed, skipping`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          userId,
          amount: session.amount_total || 0,
          currency: (session.currency || 'usd').toUpperCase(),
          status: 'COMPLETED',
          provider: 'STRIPE',
          providerPaymentId: paymentIntentId,
          productType: 'CREDIT_PACK',
          productId: packId,
          creditsGranted: credits,
          completedAt: new Date(),
        },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: { creditBalance: { increment: credits } },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: credits,
          type: 'PURCHASE',
          description: `Purchased ${credits} credits`,
          balanceAfter: user.creditBalance,
        },
      });
    });

    this.logger.log(`Granted ${credits} credits to user ${userId}`);
  }
}
