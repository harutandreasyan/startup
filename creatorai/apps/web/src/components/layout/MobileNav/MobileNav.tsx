import { NavLink } from 'react-router-dom';
import { useStyles } from '../../../lib/useStyles';
import { NAV_ITEMS } from '../navItems';
import { mobileNavStyles } from './styles';

export default function MobileNav() {
  const styles = useStyles(mobileNavStyles);

  return (
    <nav className={styles.nav}>
      <div className={styles.grid}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => styles.link(isActive)}
          >
            {({ isActive }) => (
              <>
                <item.icon className={styles.icon} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
