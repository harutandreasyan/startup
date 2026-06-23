const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/15 transition-all duration-200';

export const generateStyles = {
  page: 'max-w-3xl mx-auto space-y-6 animate-fade-in-up',
  header: 'flex items-center justify-between',
  title: 'text-2xl sm:text-3xl font-bold tracking-tight',
  subtitle: 'text-muted text-sm mt-0.5',
  creditPill: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-sm font-medium',
  creditIcon: 'h-4 w-4 text-primary',
  card: 'p-5 sm:p-6 space-y-5',
  fieldLabel: 'block text-xs font-medium text-muted uppercase tracking-wider mb-2',
  textarea: `${inputClass} resize-none`,
  negativeToggle: 'text-sm text-muted hover:text-foreground transition-colors',
  styleRow: 'flex flex-wrap gap-2',
  styleChip: (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
      active
        ? 'bg-primary text-white border-primary'
        : 'bg-surface-2 text-muted border-border hover:text-foreground hover:border-primary/40'
    }`,
  grid: 'grid grid-cols-2 gap-3',
  input: inputClass,
  errorBox: 'flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm',
  errorIcon: 'h-4 w-4 mt-0.5 shrink-0',
  generateIcon: 'h-4 w-4',
  resultCard: 'overflow-hidden animate-scale-in',
  resultImage: 'w-full',
  resultActions: 'p-4 flex flex-wrap gap-2.5',
  actionIcon: 'h-4 w-4',
  failedCard: 'p-4 border-danger/30 animate-fade-in-up',
  failedRow: 'flex items-start gap-2 text-danger text-sm',
  failedIcon: 'h-4 w-4 mt-0.5 shrink-0',
  comingSoonCard: 'p-10 sm:p-14 flex flex-col items-center text-center',
  comingSoonIconWrap: 'h-14 w-14 rounded-2xl bg-surface-2 flex items-center justify-center mb-4',
  comingSoonIcon: 'h-7 w-7 text-primary',
  comingSoonTitle: 'text-lg font-semibold',
  comingSoonText: 'text-sm text-muted mt-2 max-w-sm',
  comingSoonActions: 'flex flex-wrap items-center justify-center gap-2.5 mt-6',
};
