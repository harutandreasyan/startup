import { cx } from '../../../lib/useStyles';

const TRANSITION = 'transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]';

export const makeSidebarStyles = (collapsed: boolean) => ({
  aside: cx(
    'hidden lg:flex shrink-0 flex-col h-screen sticky top-0 z-10 border-r border-border bg-surface backdrop-blur-2xl overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
    collapsed ? 'w-[76px] cursor-pointer' : 'w-64',
  ),
  header: 'h-16 flex items-center px-4 shrink-0',
  logoLink: 'rounded-xl shrink-0',
  collapseBtn:
    'ml-auto h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors',
  collapseIcon: 'h-[18px] w-[18px]',
  nav: 'flex-1 py-3 px-3 space-y-1',
  navLink: (isActive: boolean) =>
    cx(
      'group relative flex items-center gap-3 h-11 px-[15px] rounded-xl text-sm font-medium transition-colors',
      isActive
        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
        : 'text-muted hover:text-foreground hover:bg-surface-2',
    ),
  navIcon: 'h-[18px] w-[18px] shrink-0',
  // span that fades + clips during the width transition (paired with inline style transform)
  label: cx('whitespace-nowrap', TRANSITION),
  footer: 'p-3 space-y-3 shrink-0',
  footerRow: 'flex items-center h-9',
  themeToggleWrap: 'shrink-0 flex transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
  appearanceLabel: cx('ml-2 text-xs font-medium text-muted leading-none whitespace-nowrap', TRANSITION),
  avatarRow: 'flex items-center gap-3 h-9',
  avatarWrap: 'shrink-0 flex transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
  userInfo: cx('flex-1 min-w-0 whitespace-nowrap', TRANSITION),
  userName: 'text-sm font-medium text-foreground truncate',
  userCredits: 'text-xs text-muted flex items-center gap-1',
  gemIcon: 'h-3 w-3 text-primary',
  signOutBtn:
    'h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-[opacity,color,background-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0',
  signOutIcon: 'h-4 w-4',
});
