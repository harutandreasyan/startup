import { Sparkles } from 'lucide-react';
import { useStyles } from '../../../lib/useStyles';
import { logoStyles } from './styles';

export default function Logo({ showText = true, className = '' }: { showText?: boolean; className?: string }) {
  const styles = useStyles(logoStyles);
  return (
    <div className={styles.root(className)}>
      <div className={styles.iconWrap}>
        <div className={styles.glow} />
        <div className={styles.iconBox}>
          <Sparkles className={styles.icon} strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className={styles.text}>
          Creator<span className={styles.textAccent}>AI</span>
        </span>
      )}
    </div>
  );
}
