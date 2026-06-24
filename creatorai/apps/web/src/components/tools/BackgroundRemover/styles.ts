export const backgroundRemoverStyles = {
  card: 'p-5 sm:p-6 space-y-5',
  dropzone:
    'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface-2 px-6 py-12 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-surface-2/70',
  dropIconWrap: 'h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center',
  dropIcon: 'h-6 w-6 text-primary',
  dropTitle: 'text-sm font-medium',
  dropHint: 'text-xs text-muted',
  hiddenInput: 'hidden',
  previews: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  previewBox: 'space-y-2',
  previewLabel: 'text-xs font-medium text-muted uppercase tracking-wider',
  imageFrame: 'rounded-xl border border-border overflow-hidden aspect-square flex items-center justify-center bg-surface-2',
  // Transparent-checkerboard so a cut-out PNG is obvious.
  resultFrame:
    'rounded-xl border border-border overflow-hidden aspect-square flex items-center justify-center [background:repeating-conic-gradient(var(--color-surface-2)_0_25%,transparent_0_50%)_50%/20px_20px]',
  img: 'max-h-full max-w-full object-contain',
  processingBox: 'flex flex-col items-center justify-center gap-2 text-muted text-sm h-full',
  spinner: 'h-6 w-6 animate-spin',
  actions: 'flex flex-wrap gap-2.5',
  actionIcon: 'h-4 w-4',
  hint: 'text-xs text-muted',
  errorBox: 'flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm',
  errorIcon: 'h-4 w-4 mt-0.5 shrink-0',
};
