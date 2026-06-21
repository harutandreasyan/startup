import { api } from '../client';
import type { UserProfile, UserStats } from '@creatorai/shared';

export interface SessionTokens {
  access_token: string;
  refresh_token: string;
}

export async function registerWithUsername(input: {
  email: string;
  username: string;
  password: string;
  name?: string;
}): Promise<SessionTokens> {
  const { data } = await api.post('/auth/register', input);
  return data;
}

export async function loginWithLogin(login: string, password: string): Promise<SessionTokens> {
  const { data } = await api.post('/auth/login', { login, password });
  return data;
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await api.get('/users/me');
  return data;
}

export async function updateProfile(input: { name?: string }): Promise<UserProfile> {
  const { data } = await api.patch('/users/me', input);
  return data;
}

export async function getStats(): Promise<UserStats> {
  const { data } = await api.get('/users/me/stats');
  return data;
}

export async function deleteAccount(): Promise<void> {
  await api.delete('/auth/account');
}
