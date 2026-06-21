import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { AuroraBackground } from '../common/AuroraBackground';
import { useAuthStore } from '../../stores/auth.store';

export function AppLayout() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background relative">
        <AuroraBackground />
        <div className="relative h-9 w-9 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-background text-foreground relative">
      <AuroraBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9 pb-24 lg:pb-10 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
