import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Gem, LogOut, PanelLeftClose } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useSidebarStore } from '../../stores/sidebar.store';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Avatar } from '../common/Avatar';
import { ConfirmModal } from '../common/ConfirmModal';
import { NAV_ITEMS } from './navItems';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();
  const { collapsed, toggle } = useSidebarStore();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  // A collapsed sidebar expands when its empty area is clicked.
  const expandIfCollapsed = () => {
    if (collapsed) toggle();
  };

  // Label that fades + clips smoothly during the width transition.
  const label = (text: string) => (
    <span
      className="whitespace-nowrap transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-6px)' : 'none' }}
    >
      {text}
    </span>
  );

  return (
    <aside
      onClick={expandIfCollapsed}
      className={`hidden lg:flex shrink-0 flex-col h-screen sticky top-0 z-10 border-r border-border bg-surface backdrop-blur-2xl overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? 'w-[76px] cursor-pointer' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center px-4 shrink-0">
        <Link to="/dashboard" aria-label="Go to dashboard" onClick={stop} className="rounded-xl shrink-0">
          <Logo showText={!collapsed} />
        </Link>
        {!collapsed && (
          <button
            onClick={(e) => {
              stop(e);
              toggle();
            }}
            aria-label="Collapse sidebar"
            className="ml-auto h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <PanelLeftClose className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-3 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={stop}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 h-11 px-[15px] rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                  : 'text-muted hover:text-foreground hover:bg-surface-2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                {label(item.label)}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Avatar & toggle glide to center when collapsed (transitioned), labels fade — fully fluid */}
      <div className="p-3 space-y-3 shrink-0">
        <div className="flex items-center h-9">
          <span
            onClick={stop}
            className="shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: collapsed ? 'translateX(8px)' : 'none' }}
          >
            <ThemeToggle />
          </span>
          <span
            className="ml-2 text-xs font-medium text-muted whitespace-nowrap transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-6px)' : 'none' }}
          >
            Appearance
          </span>
        </div>

        <div className="flex items-center gap-3 h-9">
          <span
            className="shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: collapsed ? 'translateX(8px)' : 'none' }}
          >
            <Avatar name={user?.name} username={user?.username} email={user?.email} src={user?.avatarUrl} size={36} />
          </span>
          <div
            className="flex-1 min-w-0 whitespace-nowrap transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-6px)' : 'none', pointerEvents: collapsed ? 'none' : 'auto' }}
          >
            <p className="text-sm font-medium text-foreground truncate">{user?.name || user?.username || 'User'}</p>
            <p className="text-xs text-muted flex items-center gap-1">
              <Gem className="h-3 w-3 text-primary" />
              {user?.creditBalance ?? 0} credits
            </p>
          </div>
          <button
            onClick={(e) => {
              stop(e);
              setConfirmSignOut(true);
            }}
            aria-label="Sign out"
            title="Sign out"
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-[opacity,color,background-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0"
            style={{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }}
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
