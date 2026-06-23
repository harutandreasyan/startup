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
  const s = useStyles(appLayoutStyles);

  if (loading) {
    return (
      <div className={s.loadingRoot}>
        <AuroraBackground />
        <div className={s.spinner} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className={s.root}>
      <AuroraBackground />
      <Sidebar />
      <div className={s.content}>
        <Topbar />
        <main className={s.main}>
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
