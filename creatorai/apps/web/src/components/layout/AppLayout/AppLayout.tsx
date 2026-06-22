import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import MobileNav from '../MobileNav';
import AuroraBackground from '../../common/AuroraBackground';
import { useAuthStore } from '../../../stores/auth.store';
import { useStyles } from '../../../lib/useStyles';
import { appLayoutStyles } from './styles';

export default function AppLayout() {
  const { user, loading } = useAuthStore();
  const location = useLocation();
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
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
