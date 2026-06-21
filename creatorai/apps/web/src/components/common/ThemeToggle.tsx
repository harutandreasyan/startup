import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../stores/theme.store';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative h-9 w-9 inline-flex items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-surface-2 transition-colors ${className}`}
    >
      <Sun
        className={`h-[18px] w-[18px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
      <Moon
        className={`h-[18px] w-[18px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
      />
    </button>
  );
}
