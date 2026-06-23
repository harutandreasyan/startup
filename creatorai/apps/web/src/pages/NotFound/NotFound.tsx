import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import AuroraBackground from '../../components/common/AuroraBackground';
import Cube3D from '../../components/three/Cube3D';
import Logo from '../../components/common/Logo';
import { useStyles } from '../../lib/useStyles';
import { notFoundStyles } from './styles';

export default function NotFound() {
  const styles = useStyles(notFoundStyles);
  const faces = Array.from({ length: 6 }, () => <Compass className={styles.faceIcon} strokeWidth={1.8} />);

  return (
    <div className={styles.root}>
      <AuroraBackground />

      <div className={styles.logoWrap}>
        <Link to="/">
          <Logo />
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.cubeWrap}>
          <Cube3D size={150} faces={faces} spin={20} />
        </div>

        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>This page drifted into the void</h2>
        <p className={styles.description}>
          The page you're looking for doesn't exist or may have moved.
        </p>

        <Link
          to="/dashboard"
          className={styles.link}
        >
          <span className={styles.linkInner}>
            <Home className={styles.homeIcon} /> Back to safety
          </span>
        </Link>
      </div>
    </div>
  );
}
