import { Sparkles } from 'lucide-react';
import { useStyles } from '../../../lib/useStyles';
import { logoStyles } from './styles';

export default function Logo({ showText = true, className = '' }: { showText?: boolean; className?: string }) {
  const s = useStyles(logoStyles);
  return (
    <div className={s.root(className)}>
      <div className={s.iconWrap}>
        <div className={s.glow} />
        <div className={s.iconBox}>
          <Sparkles className={s.icon} strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className={s.text}>
          Creator<span className={s.textAccent}>AI</span>
        </span>
      )}
    </div>
  );
}
