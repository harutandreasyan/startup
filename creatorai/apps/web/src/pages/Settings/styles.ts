const inputBase =
  'w-full max-w-sm px-3.5 py-2.5 rounded-xl bg-surface-2 border text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-4 transition-all duration-200';

export const settingsStyles = {
  page: 'max-w-2xl space-y-6 animate-fade-in-up',
  title: 'text-2xl sm:text-3xl font-bold tracking-tight',
  card: 'p-6',
  cardHeading: 'font-semibold mb-5',
  avatarRow: 'flex items-center gap-4 mb-6',
  avatarWrap: 'relative',
  avatarBtn:
    'absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors ring-2 ring-[var(--background)]',
  cameraIcon: 'h-4 w-4',
  avatarTitle: 'text-sm font-medium',
  avatarHint: 'text-xs text-muted mb-2',
  avatarBtnRow: 'flex gap-2',
  hiddenInput: 'hidden',
  fields: 'space-y-5',
  usernameValue: 'text-sm',
  fieldRow: 'flex flex-wrap items-center gap-2',
  inputClass: (error = false) =>
    `${inputBase} ${error ? 'border-danger/60 focus:border-danger/70 focus:ring-danger/20' : 'border-border focus:border-primary/60 focus:ring-primary/15'}`,
  fieldError: 'mt-1.5 flex items-center gap-1.5 text-xs text-danger',
  fieldErrorIcon: 'h-3.5 w-3.5 shrink-0',
  fieldLabel: 'block text-xs font-medium text-muted uppercase tracking-wider mb-1.5',
  subHeading: 'font-semibold mb-5 flex items-center gap-2',
  crownIcon: 'h-4 w-4 text-primary',
  subContent: 'space-y-3',
  subRow: 'flex flex-wrap gap-x-6 gap-y-1 text-sm',
  subMuted: 'text-muted',
  subPlan: 'font-medium',
  freeText: 'text-sm text-muted',
  upgradeLink: 'text-primary hover:text-primary-hover font-medium inline-flex items-center gap-0.5',
  upgradeIcon: 'h-3.5 w-3.5',
  accountHeading: 'font-semibold mb-4',
  signOutIcon: 'h-4 w-4',
  divider: 'h-px bg-border my-5',
  deleteRow: 'flex flex-wrap items-center justify-between gap-3',
  deleteTitle: 'text-sm font-medium',
  deleteHint: 'text-xs text-muted',
  deleteBtn:
    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors',
  trashIcon: 'h-4 w-4',
};
