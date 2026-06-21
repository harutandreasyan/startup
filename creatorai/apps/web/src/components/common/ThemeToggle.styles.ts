import { cx } from '../../lib/useStyles';

export const makeThemeToggleStyles = (isDark: boolean, className: string) => ({
  button: cx(
    'relative h-9 w-9 inline-flex items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-surface-2 transition-colors',
    className,
  ),
  sun: cx(
    'h-[18px] w-[18px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
    isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100',
  ),
  moon: cx(
    'h-[18px] w-[18px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
    isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50',
  ),
});
