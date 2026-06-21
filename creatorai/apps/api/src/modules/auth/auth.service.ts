import { HttpException, Injectable, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export interface SessionTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Admin client (service role) — for creating users.
  private admin = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || '',
  );

  // Public client (anon key) — for verifying passwords via sign-in.
  private auth = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
  );

  constructor(private prisma: PrismaService) {}

  async register(input: {
    email: string;
    username: string;
    password: string;
    name?: string;
  }): Promise<SessionTokens> {
    const email = input.email.trim().toLowerCase();
    const username = input.username.trim().toLowerCase();

    if (!USERNAME_RE.test(username)) {
      throw new HttpException(
        'Username must be 3-20 characters: letters, numbers, or underscore.',
        400,
      );
    }

    const taken = await this.prisma.user.findUnique({ where: { username } });
    if (taken) throw new HttpException('That username is already taken.', 409);

    // Create the Supabase auth user (pre-confirmed so they can sign in right away).
    const { data, error } = await this.admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.name, username },
    });
    if (error || !data.user) {
      throw new HttpException(error?.message || 'Could not create account.', 400);
    }

    // Create our app user row (+ welcome bonus). Clean up the auth user if this fails.
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            id: data.user!.id,
            email,
            username,
            name: input.name || null,
            creditBalance: 20,
          },
        });
        await tx.creditTransaction.create({
          data: {
            userId: data.user!.id,
            amount: 20,
            type: 'BONUS',
            description: 'Welcome bonus credits',
            balanceAfter: 20,
          },
        });
      });
    } catch (err) {
      await this.admin.auth.admin.deleteUser(data.user.id).catch(() => undefined);
      if (typeof err === 'object' && err && (err as { code?: string }).code === 'P2002') {
        throw new HttpException('That username is already taken.', 409);
      }
      throw new HttpException('Could not create account.', 400);
    }

    return this.signIn(email, input.password);
  }

  /** Changes the account email (keeps uniqueness), syncing Supabase + our DB. */
  async changeEmail(userId: string, newEmailInput: string) {
    const email = newEmailInput.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new HttpException('Please enter a valid email address.', 400);
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      throw new HttpException('That email is already in use.', 409);
    }
    if (existing && existing.id === userId) {
      return { email }; // no change
    }

    const { error } = await this.admin.auth.admin.updateUserById(userId, {
      email,
      email_confirm: true,
    });
    if (error) throw new HttpException(error.message || 'Could not update email.', 400);

    await this.prisma.user.update({ where: { id: userId }, data: { email } });
    return { email };
  }

  /** Logs in with either an email or a username. */
  async login(loginInput: string, password: string): Promise<SessionTokens> {
    const login = loginInput.trim().toLowerCase();
    let email = login;

    if (!login.includes('@')) {
      const user = await this.prisma.user.findUnique({ where: { username: login } });
      // Generic error — never reveal whether the username exists.
      if (!user) throw new HttpException('Invalid login or password.', 401);
      email = user.email;
    }

    return this.signIn(email, password);
  }

  private async signIn(email: string, password: string): Promise<SessionTokens> {
    const { data, error } = await this.auth.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new HttpException('Invalid login or password.', 401);
    }
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }
}
