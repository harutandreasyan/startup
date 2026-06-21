import { NavLink } from 'react-router-dom';
import { useStyles } from '../../lib/useStyles';
import { NAV_ITEMS } from './navItems';
import { mobileNavStyles } from './MobileNav.styles';

export function MobileNav() {
  const s = useStyles(mobileNavStyles);

  return (
    <nav className={s.nav}>
      <div className={s.grid}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => s.link(isActive)}
          >
            {({ isActive }) => (
              <>
                <item.icon className={s.icon} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
