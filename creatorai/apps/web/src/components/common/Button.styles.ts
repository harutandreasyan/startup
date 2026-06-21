type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] select-none';

const variants: Record<Variant, string> = {
  primary: 'btn-glow text-white',
  secondary:
    'glass text-foreground hover:border-primary/40 hover:text-foreground',
  ghost: 'text-muted hover:text-foreground hover:bg-surface-2',
  danger: 'bg-danger/12 text-danger hover:bg-danger/20',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-[15px]',
};

export const makeButtonStyles = (
  variant: Variant,
  size: Size,
  fullWidth: boolean,
  className: string,
) => ({
  button: `${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`,
  content: 'relative z-10 inline-flex items-center justify-center gap-2',
  spinner: 'h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin',
});
