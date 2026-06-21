import type { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} showClose>
      <div className="px-5 pt-3 pb-5">
        {description && <p className="text-sm text-muted leading-relaxed">{description}</p>}
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" fullWidth onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          {variant === 'danger' ? (
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-danger text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity active:scale-[0.97]"
            >
              {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {confirmLabel}
            </button>
          ) : (
            <Button fullWidth onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
