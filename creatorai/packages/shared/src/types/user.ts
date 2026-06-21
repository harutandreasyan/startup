export type AuthProvider = 'EMAIL' | 'GOOGLE' | 'APPLE';
export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: AuthProvider;
  creditBalance: number;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  creditBalance: number;
  plan: SubscriptionPlan;
}

export type SubscriptionPlan = 'FREE' | 'PRO' | 'BUSINESS';

export interface UserStats {
  totalGenerations: number;
  completedGenerations: number;
  creditsSpent: number;
  byType: { type: string; count: number }[];
}
