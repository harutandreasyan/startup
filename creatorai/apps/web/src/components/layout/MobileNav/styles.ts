import { cx } from '../../../lib/useStyles';

export const mobileNavStyles = {
  nav: 'lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-surface/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]',
  grid: 'grid grid-cols-5',
  link: (isActive: boolean) =>
    cx(
      'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
      isActive ? 'text-primary' : 'text-muted hover:text-foreground',
    ),
  icon: 'h-5 w-5',
};
