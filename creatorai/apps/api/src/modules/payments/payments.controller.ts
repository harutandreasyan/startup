import { Body, Controller, Delete, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('credits/purchase')
  @UseGuards(AuthGuard)
  async purchase(@CurrentUser() user: any, @Body() body: { packId: string }) {
    return this.paymentsService.createCheckoutSession(user.id, body.packId, user.email);
  }

  @Post('payments/subscribe')
  @UseGuards(AuthGuard)
  async subscribe(@CurrentUser() user: any, @Body() body: { plan: 'PRO' | 'BUSINESS' }) {
    return this.paymentsService.createSubscriptionCheckout(user.id, body.plan, user.email);
  }

  @Get('payments/subscription')
  @UseGuards(AuthGuard)
  async getSubscription(@CurrentUser() user: any) {
    return this.paymentsService.getActiveSubscription(user.id);
  }

  @Delete('payments/subscription')
  @UseGuards(AuthGuard)
  async cancelSubscription(@CurrentUser() user: any) {
    return this.paymentsService.cancelActiveSubscription(user.id);
  }

  // Stripe may legitimately burst events — never rate-limit the webhook.
  @Post('payments/stripe/webhook')
  @SkipThrottle()
  async stripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    // rawBody is captured by the raw body middleware in main.ts
    const rawBody = req.rawBody || Buffer.from('');
    return this.paymentsService.handleWebhook(rawBody, signature);
  }
}
