import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { registerWithUsername } from '@creatorai/api-client';
import { supabase } from '../../lib/supabase';
import { apiErrorMessage } from '../../lib/apiError';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import Button from '../../components/common/Button';
import Input, { PasswordInput } from '../../components/common/Input';
import AuroraBackground from '../../components/common/AuroraBackground';
import { useStyles } from '../../lib/useStyles';
import { registerStyles } from './styles';

export default function Register() {
  const s = useStyles(registerStyles);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokens = await registerWithUsername({ email, username, password, name });
      await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create account.'));
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
    <div className={s.root}>
      <AuroraBackground />
      <div className={s.themeToggleWrap}>
        <ThemeToggle />
      </div>

      <div className={s.card}>
        <div className={s.head}>
          <Link to="/"><Logo /></Link>
          <h1 className={s.title}>Create your account</h1>
          <p className={s.subtitle}>Start free — 20 credits included</p>
        </div>

        <div className={s.panel}>
          <Button variant="secondary" fullWidth onClick={handleGoogleLogin} className={s.googleBtn} leftIcon={<GoogleMark />}>
            Continue with Google
          </Button>

          <div className={s.dividerWrap}>
            <div className={s.dividerLineWrap}><div className={s.dividerLine} /></div>
            <div className={s.dividerTextWrap}><span className={s.dividerText}>or</span></div>
          </div>

          <form onSubmit={handleRegister} className={s.form}>
            {error && (
              <div className={s.error}>
                <AlertCircle className={s.errorIcon} /> {error}
              </div>
            )}
            <div>
              <label className={s.label}>Name</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={s.label}>Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                placeholder="3-20 letters, numbers, or _"
                required
              />
            </div>
            <div>
              <label className={s.label}>Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className={s.label}>Password</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              <p className={s.passwordHint}>Minimum 8 characters</p>
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading}>Create account</Button>
          </form>

          <p className={s.footerText}>
            Already have an account?{' '}
            <Link to="/login" className={s.footerLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  const s = useStyles(registerStyles);
  return (
    <svg className={s.googleMark} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
