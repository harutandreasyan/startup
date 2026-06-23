export const creditsStyles = {
  root: 'space-y-8 animate-fade-in-up',
  header: 'flex flex-wrap items-end justify-between gap-3',
  title: 'text-2xl sm:text-3xl font-bold tracking-tight',
  subtitle: 'text-muted mt-1',
  balancePill: 'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border',
  balanceGem: 'h-4 w-4 text-primary',
  balanceValue: 'font-semibold',
  balanceLabel: 'text-muted text-sm',

  sectionHeading: 'text-sm font-semibold text-muted uppercase tracking-wider mb-3',

  usageGrid: 'grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4',
  statCard: 'p-4 sm:p-5 flex items-center gap-3.5',
  statIconWrap: 'h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0',
  statIcon: 'h-5 w-5 text-primary',
  statValue: 'text-2xl font-bold tracking-tight tabular-nums leading-none',
  statLabel: 'text-xs text-muted mt-1',
  byTypeRow: 'flex flex-wrap gap-2 mt-3',
  byTypeChip:
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs',
  byTypeChipCount: 'font-semibold text-primary tabular-nums',

  planGrid: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  planCard: (isCurrent: boolean, featured: boolean) =>
    `p-6 relative flex flex-col ${
      isCurrent ? 'border-primary ring-1 ring-primary/30' : ''
    } ${featured && !isCurrent ? 'border-primary/30' : ''}`,
  popularBadge:
    'absolute -top-2.5 left-6 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold',
  planHead: 'flex items-center justify-between',
  planName: 'font-semibold text-lg',
  currentBadge: 'text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium',
  planPrice: 'mt-2 text-3xl font-bold tracking-tight',
  planPriceUnit: 'text-sm font-normal text-muted',
  planCredits: 'text-sm text-primary mt-1 mb-5',
  planFeatures: 'space-y-2 flex-1',
  planFeature: 'text-sm text-muted flex gap-2',
  planFeatureIcon: 'h-4 w-4 text-success shrink-0 mt-0.5',
  subscribeBtn: 'mt-6',
  currentPlanNote: 'mt-6 text-xs text-muted text-center',

  packGrid: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  packCard: 'p-6 flex flex-col',
  packIconWrap: 'h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4',
  packIcon: 'h-5 w-5 text-primary',
  packName: 'font-semibold',
  packCredits: 'mt-1 text-3xl font-bold tracking-tight',
  packCreditsUnit: 'text-sm font-normal text-muted',
  packPrice: 'text-muted text-sm mt-1 mb-5',
  buyBtn: 'mt-auto',

  historyCard: 'overflow-hidden',
  historyEmpty: 'p-10 text-center text-muted text-sm flex flex-col items-center gap-2',
  historyEmptyIcon: 'h-5 w-5',
  historyList: 'divide-y divide-border',
  historyRow: 'flex items-center justify-between px-4 py-3',
  historyInfo: 'min-w-0',
  historyDesc: 'text-sm truncate',
  historyDate: 'text-xs text-muted',
  historyAmount: (positive: boolean) =>
    `text-sm font-semibold tabular-nums ${positive ? 'text-success' : 'text-muted'}`,

  bannerTones: {
    success: 'bg-success/10 border-success/20 text-success',
    danger: 'bg-danger/10 border-danger/20 text-danger',
    muted: 'bg-surface-2 border-border text-muted',
  },
  banner: (tone: string) => `flex items-center gap-2 p-3 rounded-xl border text-sm ${tone}`,
  bannerIcon: 'h-4 w-4 shrink-0',
};
