import { HttpException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
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
      await this.grantCreditsFromSession(session);
    }

    return { received: true };
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
