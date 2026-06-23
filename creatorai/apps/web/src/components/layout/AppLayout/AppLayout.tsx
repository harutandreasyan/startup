import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import MobileNav from '../MobileNav';
import AuroraBackground from '../../common/AuroraBackground';
import { useAuthStore } from '../../../stores/auth.store';
import { useStyles } from '../../../lib/useStyles';
import { appLayoutStyles } from './styles';

export default function AppLayout() {
  const { user, loading } = useAuthStore();
  const styles = useStyles(appLayoutStyles);

  if (loading) {
    return (
      <div className={styles.loadingRoot}>
        <AuroraBackground />
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className={styles.root}>
      <AuroraBackground />
      <Sidebar />
      <div className={styles.content}>
        <Topbar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
