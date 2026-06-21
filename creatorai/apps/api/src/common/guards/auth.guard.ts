import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || '',
  );

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();

    const { data: { user: supabaseUser }, error } = await this.supabase.auth.getUser(token);
    if (error || !supabaseUser) throw new UnauthorizedException();

    let user = await this.prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.full_name || null,
          avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
          provider: this.mapProvider(supabaseUser.app_metadata?.provider),
          creditBalance: 20,
        },
      });

      await this.prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: 20,
          type: 'BONUS',
          description: 'Welcome bonus credits',
          balanceAfter: 20,
        },
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    request.user = user;
    return true;
  }

  private extractToken(request: any): string | null {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.substring(7);
  }

  private mapProvider(provider?: string): 'EMAIL' | 'GOOGLE' | 'APPLE' {
    if (provider === 'google') return 'GOOGLE';
    if (provider === 'apple') return 'APPLE';
    return 'EMAIL';
  }
}
