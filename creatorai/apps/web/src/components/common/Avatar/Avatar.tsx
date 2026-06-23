import { useStyles } from '../../../lib/useStyles';
import { makeAvatarStyles } from './styles';

interface AvatarProps {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

export default function Avatar({ name, username, email, src, size = 36, className = '' }: AvatarProps) {
  const initial = (name || username || email || '?').trim()[0]?.toUpperCase() || '?';
  const styles = useStyles(() => makeAvatarStyles(className), [className]);
  return (
    <div
      className={styles.root}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        <img src={src} alt={name || username || 'avatar'} className={styles.img} />
      ) : (
        initial
      )}
    </div>
  );
}
