import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../../stores/theme.store';
import { useStyles } from '../../../lib/useStyles';
import { makeThemeToggleStyles } from './styles';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === 'dark';
  const styles = useStyles(() => makeThemeToggleStyles(isDark, className), [isDark, className]);

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={styles.button}
    >
      <Sun className={styles.sun} />
      <Moon className={styles.moon} />
    </button>
  );
}
