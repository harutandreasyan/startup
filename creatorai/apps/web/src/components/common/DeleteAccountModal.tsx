import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useStyles } from '../../lib/useStyles';
import { deleteAccountModalStyles } from './DeleteAccountModal.styles';

interface DeleteAccountModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAccountModal({ open, loading, onConfirm, onCancel }: DeleteAccountModalProps) {
  const s = useStyles(deleteAccountModalStyles);
  const [stage, setStage] = useState<1 | 2>(1);
  const [text, setText] = useState('');

  const confirmable = text.trim().toLowerCase() === 'delete';

  const close = () => {
    setStage(1);
    setText('');
    onCancel();
  };

  return (
    <Modal open={open} onClose={close} title="Delete account">
      <div className={s.body}>
        {stage === 1 ? (
          <>
            <p className={s.text}>
              Deleting your account permanently removes your profile, remaining credits, and every image
              you've created. This <span className={s.emphasis}>cannot be undone</span>.
            </p>
            <div className={s.actions}>
              <Button variant="ghost" fullWidth onClick={close}>
                Cancel
              </Button>
              <button className={s.dangerBtn} onClick={() => setStage(2)}>
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={s.text}>
              To confirm, type <span className={s.emphasisStrong}>delete</span> below.
            </p>
            <Input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="delete"
              className={s.input}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && confirmable && !loading) onConfirm();
              }}
            />
            <div className={s.actions}>
              <Button variant="ghost" fullWidth onClick={close} disabled={loading}>
                Cancel
              </Button>
              <button className={s.dangerBtn} disabled={!confirmable || loading} onClick={onConfirm}>
                {loading && <span className={s.spinner} />}
                Delete forever
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
