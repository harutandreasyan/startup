import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
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

  @Post('payments/stripe/webhook')
  async stripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    // rawBody is captured by the raw body middleware in main.ts
    const rawBody = req.rawBody || Buffer.from('');
    return this.paymentsService.handleWebhook(rawBody, signature);
  }
}
