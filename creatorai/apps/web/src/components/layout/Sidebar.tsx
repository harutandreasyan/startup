import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Gem, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Avatar } from '../common/Avatar';
import { ConfirmModal } from '../common/ConfirmModal';
import { NAV_ITEMS } from './navItems';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0 z-10 border-r border-border bg-surface backdrop-blur-2xl">
      <div className="px-6 h-16 flex items-center">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                  : 'text-muted hover:text-foreground hover:bg-surface-2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-muted">Appearance</span>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border">
          <Avatar name={user?.name} username={user?.username} email={user?.email} src={user?.avatarUrl} size={36} />
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
            onClick={() => setConfirmSignOut(true)}
            aria-label="Sign out"
            title="Sign out"
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmSignOut}
        title="Sign out?"
        description="You'll need to sign in again to access your creations."
        confirmLabel="Sign out"
        onConfirm={signOut}
        onCancel={() => setConfirmSignOut(false)}
      />
    </aside>
  );
}
