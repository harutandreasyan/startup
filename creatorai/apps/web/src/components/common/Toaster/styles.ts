import { cx } from '../../../lib/useStyles';
import type { ToastType } from '../../../stores/toast.store';

const TONE: Record<ToastType, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-primary text-white',
};

export const toasterStyles = {
  container:
    'fixed z-[200] top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 px-4 w-full max-w-sm pointer-events-none',
  toast: (type: ToastType) =>
    cx('pointer-events-auto w-full rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3', TONE[type]),
  icon: 'h-5 w-5 shrink-0',
  message: 'text-sm font-medium flex-1',
  dismissBtn:
    'h-6 w-6 inline-flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors shrink-0',
  dismissIcon: 'h-3.5 w-3.5',
};
