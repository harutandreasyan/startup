import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useStyles } from '../../lib/useStyles';
import { inputStyles, passwordInputStyles } from './Input.styles';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const s = useStyles(inputStyles);
  return <input className={s.input(className)} {...props} />;
}

export function PasswordInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const s = useStyles(passwordInputStyles);
  return (
    <div className={s.wrap}>
      <input type={show ? 'text' : 'password'} className={s.input(className)} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        className={s.toggle}
        tabIndex={-1}
      >
        {show ? <EyeOff className={s.icon} /> : <Eye className={s.icon} />}
      </button>
    </div>
  );
}
