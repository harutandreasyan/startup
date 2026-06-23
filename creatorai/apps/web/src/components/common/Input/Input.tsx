import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useStyles } from '../../../lib/useStyles';
import { inputStyles, passwordInputStyles } from './styles';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { error?: boolean };

export default function Input({ className = '', error = false, ...props }: InputProps) {
  const styles = useStyles(inputStyles);
  return <input className={styles.input(className, error)} aria-invalid={error || undefined} {...props} />;
}

export function PasswordInput({ className = '', error = false, ...props }: InputProps) {
  const [show, setShow] = useState(false);
  const styles = useStyles(passwordInputStyles);
  return (
    <div className={styles.wrap}>
      <input
        type={show ? 'text' : 'password'}
        className={styles.input(className, error)}
        aria-invalid={error || undefined}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        className={styles.toggle}
        tabIndex={-1}
      >
        {show ? <EyeOff className={styles.icon} /> : <Eye className={styles.icon} />}
      </button>
    </div>
  );
}
