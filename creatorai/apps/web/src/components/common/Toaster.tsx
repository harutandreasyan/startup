import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from '../../stores/toast.store';

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

// Full status-colored backgrounds (white content on the status color).
const TONE: Record<ToastType, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-primary text-white',
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return createPortal(
    <div className="fixed z-[200] top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 px-4 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto w-full rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3 animate-fade-in-up ${TONE[t.type]}`}
            role="status"
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="h-6 w-6 inline-flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors shrink-0"
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
