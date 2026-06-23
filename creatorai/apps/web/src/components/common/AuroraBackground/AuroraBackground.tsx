import { useStyles } from '../../../lib/useStyles';
import { auroraBackgroundStyles } from './styles';

/** Animated aurora/mesh backdrop with fine grain. Sits behind all content. */
export default function AuroraBackground() {
  const styles = useStyles(auroraBackgroundStyles);
  return (
    <div className={styles.aurora} aria-hidden>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.grain} />
    </div>
  );
}
