import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Gem, LogOut, PanelLeftClose } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { useSidebarStore } from '../../../stores/sidebar.store';
import { useAuth } from '../../../hooks/useAuth';
import { useStyles } from '../../../lib/useStyles';
import { Logo } from '../../common/Logo';
import { ThemeToggle } from '../../common/ThemeToggle';
import { Avatar } from '../../common/Avatar';
import { ConfirmModal } from '../../common/ConfirmModal';
import { NAV_ITEMS } from '../navItems';
import { makeSidebarStyles } from './styles';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();
  const { collapsed, toggle } = useSidebarStore();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const s = useStyles(() => makeSidebarStyles(collapsed), [collapsed]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  // A collapsed sidebar expands when its empty area is clicked.
  const expandIfCollapsed = () => {
    if (collapsed) toggle();
  };

  // Label that fades + clips smoothly during the width transition.
  const label = (text: string) => (
    <span
      className={s.label}
      style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-6px)' : 'none' }}
    >
      {text}
    </span>
  );

  return (
    <aside onClick={expandIfCollapsed} className={s.aside}>
      <div className={s.header}>
        <Link to="/dashboard" aria-label="Go to dashboard" onClick={stop} className={s.logoLink}>
          <Logo showText={!collapsed} />
        </Link>
        {!collapsed && (
          <button
            onClick={(e) => {
              stop(e);
              toggle();
            }}
            aria-label="Collapse sidebar"
            className={s.collapseBtn}
          >
            <PanelLeftClose className={s.collapseIcon} />
          </button>
        )}
      </div>

      <nav className={s.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={stop}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => s.navLink(isActive)}
          >
            {({ isActive }) => (
              <>
                <item.icon className={s.navIcon} strokeWidth={isActive ? 2.5 : 2} />
                {label(item.label)}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Avatar & toggle glide to center when collapsed (transitioned), labels fade — fully fluid */}
      <div className={s.footer}>
        <div className={s.footerRow}>
          <span
            onClick={stop}
            className={s.themeToggleWrap}
            style={{ transform: collapsed ? 'translateX(8px)' : 'none' }}
          >
            <ThemeToggle />
          </span>
          <span
            className={s.appearanceLabel}
            style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-6px)' : 'none' }}
          >
            Appearance
          </span>
        </div>

        <div className={s.avatarRow}>
          <span
            className={s.avatarWrap}
            style={{ transform: collapsed ? 'translateX(8px)' : 'none' }}
          >
            <Avatar name={user?.name} username={user?.username} email={user?.email} src={user?.avatarUrl} size={36} />
          </span>
          <div
            className={s.userInfo}
            style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-6px)' : 'none', pointerEvents: collapsed ? 'none' : 'auto' }}
          >
            <p className={s.userName}>{user?.name || user?.username || 'User'}</p>
            <p className={s.userCredits}>
              <Gem className={s.gemIcon} />
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
            className={s.signOutBtn}
            style={{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }}
          >
            <LogOut className={s.signOutIcon} />
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
