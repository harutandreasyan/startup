import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { AuroraBackground } from '../../components/common/AuroraBackground';
import { Cube3D } from '../../components/three/Cube3D';
import { Logo } from '../../components/common/Logo';
import { useStyles } from '../../lib/useStyles';
import { notFoundStyles } from './styles';

export function NotFound() {
  const s = useStyles(notFoundStyles);
  const faces = Array.from({ length: 6 }, () => <Compass className={s.faceIcon} strokeWidth={1.8} />);

  return (
    <div className={s.root}>
      <AuroraBackground />

      <div className={s.logoWrap}>
        <Link to="/">
          <Logo />
        </Link>
      </div>

      <div className={s.content}>
        <div className={s.cubeWrap}>
          <Cube3D size={150} faces={faces} spin={20} />
        </div>

        <h1 className={s.title}>404</h1>
        <h2 className={s.subtitle}>This page drifted into the void</h2>
        <p className={s.description}>
          The page you're looking for doesn't exist or may have moved.
        </p>

        <Link
          to="/dashboard"
          className={s.link}
        >
          <span className={s.linkInner}>
            <Home className={s.homeIcon} /> Back to safety
          </span>
        </Link>
      </div>
    </div>
  );
}
