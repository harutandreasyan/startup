export const fieldClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/15 transition-all duration-200';

export const inputStyles = {
  input: (className: string) => `${fieldClass} ${className}`,
};

export const passwordInputStyles = {
  wrap: 'relative',
  input: (className: string) => `${fieldClass} pr-11 ${className}`,
  toggle:
    'absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors',
  icon: 'h-[15px] w-[15px]',
};
