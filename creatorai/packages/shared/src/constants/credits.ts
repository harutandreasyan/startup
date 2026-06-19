import type { CreditPack } from '../types';

export const CREDIT_PACKS: Omit<CreditPack, 'id'>[] = [
  { name: 'Starter', credits: 100, priceUsd: 499, active: true },
  { name: 'Pro', credits: 400, priceUsd: 1499, active: true },
  { name: 'Ultra', credits: 1200, priceUsd: 3999, active: true },
];

export const SIGNUP_BONUS_CREDITS = 20;
