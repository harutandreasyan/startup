import { Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { useStyles } from '../../../lib/useStyles';
import Logo from '../../common/Logo';
import ThemeToggle from '../../common/ThemeToggle';
import { topbarStyles } from './styles';

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const styles = useStyles(topbarStyles);

  return (
    <header className={styles.header}>
      <Link to="/dashboard" aria-label="Go to dashboard">
        <Logo />
      </Link>
      <div className={styles.actions}>
        <span className={styles.credits}>
          <Gem className={styles.gemIcon} />
          {user?.creditBalance ?? 0}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
