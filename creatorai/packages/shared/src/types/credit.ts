export type CreditTxType =
  | 'PURCHASE'
  | 'SUBSCRIPTION'
  | 'GENERATION_DEBIT'
  | 'GENERATION_REFUND'
  | 'BONUS'
  | 'ADMIN_ADJUSTMENT';

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: CreditTxType;
  description: string;
  generationId: string | null;
  paymentId: string | null;
  balanceAfter: number;
  createdAt: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  active: boolean;
}

export interface CreditBalance {
  balance: number;
}
