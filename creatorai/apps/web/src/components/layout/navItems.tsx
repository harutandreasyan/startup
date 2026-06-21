import { LayoutDashboard, Sparkles, Images, Gem, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/generate', label: 'Generate', icon: Sparkles },
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/credits', label: 'Credits', icon: Gem },
  { to: '/settings', label: 'Settings', icon: Settings },
];
