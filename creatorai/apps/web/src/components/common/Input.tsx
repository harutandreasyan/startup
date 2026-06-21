import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const fieldClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/15 transition-all duration-200';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function PasswordInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} className={`${fieldClass} pr-11 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-[15px] w-[15px]" /> : <Eye className="h-[15px] w-[15px]" />}
      </button>
    </div>
  );
}
