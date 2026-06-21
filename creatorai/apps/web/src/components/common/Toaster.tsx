import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from '../../stores/toast.store';
import { useStyles } from '../../lib/useStyles';
import { toasterStyles } from './Toaster.styles';

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  const s = useStyles(toasterStyles);

  return createPortal(
    <div className={s.container}>
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={s.toast(t.type)}
              role="status"
            >
              <Icon className={s.icon} />
              <span className={s.message}>{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className={s.dismissBtn}
              >
                <X className={s.dismissIcon} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
