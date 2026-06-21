import { cx } from '../../lib/useStyles';

export const makeSelectStyles = (open: boolean, disabled: boolean | undefined, selected: boolean) => ({
  trigger: cx(
    'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-surface-2 border text-sm text-left transition-all duration-200',
    open ? 'border-primary/60 ring-4 ring-primary/15' : 'border-border',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
  ),
  triggerLabel: selected ? 'text-foreground' : 'text-muted',
  chevron: cx('h-4 w-4 text-muted shrink-0 transition-transform', open ? 'rotate-180' : ''),
  backdrop: 'fixed inset-0 z-[120]',
  menu: 'fixed z-[121] max-h-64 overflow-auto rounded-xl bg-surface-solid border border-border shadow-2xl backdrop-blur-xl p-1.5 animate-scale-in',
  option: (active: boolean) =>
    cx(
      'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
      active ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-foreground/[0.06]',
    ),
  optionText: 'flex flex-col items-start',
  optionHint: 'text-xs text-muted',
  checkIcon: 'h-4 w-4 shrink-0',
});
