import { useStyles } from '../../lib/useStyles';
import { auroraBackgroundStyles } from './AuroraBackground.styles';

/** Animated aurora/mesh backdrop with fine grain. Sits behind all content. */
export function AuroraBackground() {
  const s = useStyles(auroraBackgroundStyles);
  return (
    <div className={s.aurora} aria-hidden>
      <div className={s.blob1} />
      <div className={s.blob2} />
      <div className={s.blob3} />
      <div className={s.grain} />
    </div>
  );
}
