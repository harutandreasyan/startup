import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Generate } from './pages/Generate';
import { Gallery } from './pages/Gallery';
import { Credits } from './pages/Credits';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/common/Toaster';

export function App() {
  useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}
