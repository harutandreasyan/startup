import { cx } from '../../lib/useStyles';

export const makeModalStyles = (className: string) => ({
  overlay: 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md',
  panel: cx('glass glow-border rounded-2xl w-full max-w-md', className),
  header: 'flex items-center justify-between px-5 pt-5',
  title: 'font-semibold text-lg',
  closeBtn:
    'h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors -mr-1 ml-auto',
  closeIcon: 'h-4 w-4',
});
