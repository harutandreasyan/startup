import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { loginWithLogin } from '@creatorai/api-client';
import { supabase } from '../lib/supabase';
import { apiErrorMessage } from '../lib/apiError';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { Button } from '../components/common/Button';
import { Input, PasswordInput } from '../components/common/Input';
import { AuroraBackground } from '../components/common/AuroraBackground';

export function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokens = await loginWithLogin(login, password);
      await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err, 'Invalid login or password.'));
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      <AuroraBackground />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="flex flex-col items-center mb-8">
          <Link to="/"><Logo /></Link>
          <h1 className="text-2xl font-bold tracking-tight mt-5">Welcome back</h1>
          <p className="text-muted mt-1 text-sm">Sign in to continue creating</p>
        </div>

        <div className="glass glow-border rounded-2xl p-7 sm:p-8">
          <Button variant="secondary" fullWidth onClick={handleGoogleLogin} className="mb-6" leftIcon={<GoogleMark />}>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-surface-solid text-xs text-muted rounded-full">or</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email or username</label>
              <Input type="text" value={login} onChange={(e) => setLogin(e.target.value)} autoCapitalize="none" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading}>Sign in</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-hover font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
