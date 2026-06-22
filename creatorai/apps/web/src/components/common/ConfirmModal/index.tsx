import type { ReactNode } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { useStyles } from '../../../lib/useStyles';
import { confirmModalStyles } from './styles';

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
  const s = useStyles(confirmModalStyles);
  return (
    <Modal open={open} onClose={onCancel} title={title} showClose>
      <div className={s.body}>
        {description && <p className={s.description}>{description}</p>}
        <div className={s.actions}>
          <Button variant="ghost" fullWidth onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          {variant === 'danger' ? (
            <button
              onClick={onConfirm}
              disabled={loading}
              className={s.dangerBtn}
            >
              {loading && <span className={s.spinner} />}
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
