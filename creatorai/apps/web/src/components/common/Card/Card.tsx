import type { HTMLAttributes } from 'react';
import { useStyles } from '../../../lib/useStyles';
import { makeCardStyles } from './styles';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

/** Glassmorphic surface. `glow` adds a gradient border that lights on hover. */
export default function Card({ hover = false, glow = false, className = '', children, ...props }: CardProps) {
  const styles = useStyles(() => makeCardStyles(hover, glow, className), [hover, glow, className]);
  return (
    <div
      className={styles.card}
      {...props}
    >
      {children}
    </div>
  );
}
