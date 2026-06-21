import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

interface DeleteAccountModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const dangerBtn =
  'w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-danger text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity active:scale-[0.97]';

export function DeleteAccountModal({ open, loading, onConfirm, onCancel }: DeleteAccountModalProps) {
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
      <div className="px-5 pb-5 pt-2">
        {stage === 1 ? (
          <>
            <p className="text-sm text-muted leading-relaxed">
              Deleting your account permanently removes your profile, remaining credits, and every image
              you've created. This <span className="text-foreground font-medium">cannot be undone</span>.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" fullWidth onClick={close}>
                Cancel
              </Button>
              <button className={dangerBtn} onClick={() => setStage(2)}>
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted leading-relaxed">
              To confirm, type <span className="font-semibold text-foreground">delete</span> below.
            </p>
            <Input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="delete"
              className="mt-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && confirmable && !loading) onConfirm();
              }}
            />
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" fullWidth onClick={close} disabled={loading}>
                Cancel
              </Button>
              <button className={dangerBtn} disabled={!confirmable || loading} onClick={onConfirm}>
                {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Delete forever
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
