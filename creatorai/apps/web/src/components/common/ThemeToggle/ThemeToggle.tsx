import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../../stores/theme.store';
import { useStyles } from '../../../lib/useStyles';
import { makeThemeToggleStyles } from './styles';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === 'dark';
  const s = useStyles(() => makeThemeToggleStyles(isDark, className), [isDark, className]);

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={s.button}
    >
      <Sun className={s.sun} />
      <Moon className={s.moon} />
    </button>
  );
}
