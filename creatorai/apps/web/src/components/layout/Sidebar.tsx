import { NavLink } from 'react-router-dom';
import { Gem, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { NAV_ITEMS } from './navItems';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0 border-r border-border bg-surface/60 backdrop-blur-xl">
      <div className="px-6 h-16 flex items-center">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                  : 'text-muted hover:text-foreground hover:bg-surface-2'
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-muted">Appearance</span>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {(user?.name || user?.username || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || user?.username || 'User'}
            </p>
            <p className="text-xs text-muted flex items-center gap-1">
              <Gem className="h-3 w-3 text-primary" />
              {user?.creditBalance ?? 0} credits
            </p>
          </div>
          <button
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
