import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { Cube3D } from '../components/three/Cube3D';
import { Logo } from '../components/common/Logo';

export function NotFound() {
  const faces = Array.from({ length: 6 }, () => <Compass className="h-9 w-9 text-white/90" strokeWidth={1.8} />);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden text-center">
      <AuroraBackground />

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10">
        <Link to="/">
          <Logo />
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        <div className="animate-float mb-8">
          <Cube3D size={150} faces={faces} spin={20} />
        </div>

        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-gradient leading-none">404</h1>
        <h2 className="mt-4 text-xl sm:text-2xl font-bold">This page drifted into the void</h2>
        <p className="mt-2 text-muted max-w-sm">
          The page you're looking for doesn't exist or may have moved.
        </p>

        <Link
          to="/dashboard"
          className="btn-glow mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium active:scale-[0.98]"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            <Home className="h-4 w-4" /> Back to safety
          </span>
        </Link>
      </div>
    </div>
  );
}
