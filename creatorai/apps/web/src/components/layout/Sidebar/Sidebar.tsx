import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Gem, LogOut, PanelLeftClose } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { useSidebarStore } from '../../../stores/sidebar.store';
import { useAuth } from '../../../hooks/useAuth';
import { useStyles } from '../../../lib/useStyles';
import Logo from '../../common/Logo';
import ThemeToggle from '../../common/ThemeToggle';
import Avatar from '../../common/Avatar';
import ConfirmModal from '../../common/ConfirmModal';
import { NAV_ITEMS } from '../navItems';
import { makeSidebarStyles } from './styles';

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();
  const { collapsed, toggle } = useSidebarStore();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const styles = useStyles(() => makeSidebarStyles(collapsed), [collapsed]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  // A collapsed sidebar expands when its empty area is clicked.
  const expandIfCollapsed = () => {
    if (collapsed) toggle();
  };

  // Label that fades + clips smoothly during the width transition.
  const label = (text: string) => (
    <span
      className={styles.label}
      style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-6px)' : 'none' }}
    >
      {text}
    </span>
  );

  return (
    <aside onClick={expandIfCollapsed} className={styles.aside}>
      <div className={styles.header}>
        <Link to="/dashboard" aria-label="Go to dashboard" onClick={stop} className={styles.logoLink}>
          <Logo showText={!collapsed} />
        </Link>
        {!collapsed && (
          <button
            onClick={(e) => {
              stop(e);
              toggle();
            }}
            aria-label="Collapse sidebar"
            className={styles.collapseBtn}
          >
            <PanelLeftClose className={styles.collapseIcon} />
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={stop}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => styles.navLink(isActive)}
          >
            {({ isActive }) => (
              <>
                <item.icon className={styles.navIcon} strokeWidth={isActive ? 2.5 : 2} />
                {label(item.label)}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Avatar & toggle glide to center when collapsed (transitioned), labels fade — fully fluid */}
      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <span
            onClick={stop}
            className={styles.themeToggleWrap}
            style={{ transform: collapsed ? 'translateX(8px)' : 'none' }}
          >
            <ThemeToggle />
          </span>
          <span
            className={styles.appearanceLabel}
            style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-6px)' : 'none' }}
          >
            Appearance
          </span>
        </div>

        <div className={styles.avatarRow}>
          <span
            className={styles.avatarWrap}
            style={{ transform: collapsed ? 'translateX(8px)' : 'none' }}
          >
            <Avatar name={user?.name} username={user?.username} email={user?.email} src={user?.avatarUrl} size={36} />
          </span>
          <div
            className={styles.userInfo}
            style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-6px)' : 'none', pointerEvents: collapsed ? 'none' : 'auto' }}
          >
            <p className={styles.userName}>{user?.name || user?.username || 'User'}</p>
            <p className={styles.userCredits}>
              <Gem className={styles.gemIcon} />
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
            className={styles.signOutBtn}
            style={{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }}
          >
            <LogOut className={styles.signOutIcon} />
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
