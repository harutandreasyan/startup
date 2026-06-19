# 05 — Authentication System

## Strategy: Supabase Auth

We use Supabase Auth instead of building from scratch. It handles:
- Email/password with email verification
- Google OAuth
- Apple Sign-In (required for iOS App Store)
- JWT token issuance + refresh
- Password reset flow
- Rate limiting on auth endpoints

Our NestJS backend verifies Supabase JWTs and manages our own User table.

### Why Supabase Auth over rolling your own?
- Free up to 50K monthly active users
- Handles email verification, password reset, OAuth flows
- SDKs for React and React Native
- Saves 2-3 weeks of development

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  React / RN App │────>│  Supabase Auth  │
│  (Supabase SDK) │<────│  (hosted)       │
└────────┬────────┘     └─────────────────┘
         │ JWT
         ▼
┌─────────────────┐
│  NestJS API     │
│  (verify JWT)   │
│  (sync user DB) │
└─────────────────┘
```

## Backend Implementation

### Auth Guard (apps/api/src/common/guards/auth.guard.ts)
```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    
    if (!token) throw new UnauthorizedException();

    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    if (error || !user) throw new UnauthorizedException();

    // Attach user to request for downstream use
    request.user = user;
    return true;
  }

  private extractToken(request: any): string | null {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.substring(7);
  }
}
```

### User Sync (apps/api/src/modules/auth/auth.service.ts)
```typescript
// On first API call after signup, create user in our DB
async syncUser(supabaseUser: SupabaseUser): Promise<User> {
  let user = await this.prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  if (!user) {
    user = await this.prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name,
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        provider: this.mapProvider(supabaseUser.app_metadata?.provider),
        creditBalance: 20, // free signup credits
      },
    });

    // Record the bonus credits
    await this.creditsService.recordTransaction({
      userId: user.id,
      amount: 20,
      type: 'BONUS',
      description: 'Welcome bonus credits',
    });
  }

  return user;
}
```

## Frontend Implementation

### React Web (apps/web)
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

### React Native (apps/mobile)
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

## Auth Flows

### Email/Password Registration
1. User fills form → `supabase.auth.signUp({ email, password })`
2. Supabase sends verification email
3. User clicks link → redirected back to app
4. App calls our API → AuthGuard verifies → syncUser creates DB record + bonus credits

### Google OAuth
1. User clicks "Sign in with Google" → `supabase.auth.signInWithOAuth({ provider: 'google' })`
2. Redirect to Google → user approves → redirect back with tokens
3. Same sync flow as above

### Apple Sign-In (required for iOS)
1. `supabase.auth.signInWithOAuth({ provider: 'apple' })`
2. Native Apple Sign-In sheet appears
3. Same sync flow

### Token Refresh
- Supabase SDK handles automatically
- Access token expires in 1 hour
- Refresh token rotated on each use

## Steps

- [ ] Create Supabase project at supabase.com
- [ ] Enable Email + Google + Apple providers in Supabase dashboard
- [ ] Configure Google OAuth (Google Cloud Console → OAuth consent screen + credentials)
- [ ] Install `@supabase/supabase-js` in web and mobile apps
- [ ] Implement AuthGuard in NestJS
- [ ] Implement user sync service
- [ ] Build login/register screens (web)
- [ ] Build login/register screens (mobile)
- [ ] Test full signup → verify → login flow
- [ ] Test Google OAuth flow
- [ ] Implement account deletion (GDPR)

## Next Step
Proceed to [06-AI-INTEGRATION.md](./06-AI-INTEGRATION.md)
