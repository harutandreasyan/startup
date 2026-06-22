import { Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { useStyles } from '../../../lib/useStyles';
import { Logo } from '../../common/Logo';
import { ThemeToggle } from '../../common/ThemeToggle';
import { topbarStyles } from './styles';

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const s = useStyles(topbarStyles);

  return (
    <header className={s.header}>
      <Link to="/dashboard" aria-label="Go to dashboard">
        <Logo />
      </Link>
      <div className={s.actions}>
        <span className={s.credits}>
          <Gem className={s.gemIcon} />
          {user?.creditBalance ?? 0}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
