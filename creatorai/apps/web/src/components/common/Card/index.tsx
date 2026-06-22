import type { HTMLAttributes } from 'react';
import { useStyles } from '../../../lib/useStyles';
import { makeCardStyles } from './styles';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

/** Glassmorphic surface. `glow` adds a gradient border that lights on hover. */
export function Card({ hover = false, glow = false, className = '', children, ...props }: CardProps) {
  const s = useStyles(() => makeCardStyles(hover, glow, className), [hover, glow, className]);
  return (
    <div
      className={s.card}
      {...props}
    >
      {children}
    </div>
  );
}
