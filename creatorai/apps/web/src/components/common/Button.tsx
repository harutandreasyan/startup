import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useStyles } from '../../lib/useStyles';
import { makeButtonStyles } from './Button.styles';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const s = useStyles(
    () => makeButtonStyles(variant, size, fullWidth, className),
    [variant, size, fullWidth, className],
  );

  return (
    <button
      className={s.button}
      disabled={disabled || loading}
      {...props}
    >
      {/* Single centered flex group: gap only applies between real, visible children */}
      <span className={s.content}>
        {loading ? (
          <span className={s.spinner} />
        ) : (
          leftIcon
        )}
        {children}
      </span>
    </button>
  );
}
