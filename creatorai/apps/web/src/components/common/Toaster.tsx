import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from '../../stores/toast.store';

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONE: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-primary',
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return createPortal(
    <div className="fixed z-[200] bottom-20 lg:bottom-5 inset-x-0 lg:inset-x-auto lg:right-5 flex flex-col items-center lg:items-end gap-2 px-4 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className="pointer-events-auto bg-surface-solid border border-border rounded-xl shadow-2xl backdrop-blur-xl px-4 py-3 flex items-center gap-3 max-w-sm w-full lg:w-auto animate-fade-in-up"
            role="status"
          >
            <Icon className={`h-5 w-5 shrink-0 ${TONE[t.type]}`} />
            <span className="text-sm text-foreground flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="h-6 w-6 inline-flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
