import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

/** Glassmorphic surface. `glow` adds a gradient border that lights on hover. */
export function Card({ hover = false, glow = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`glass rounded-2xl ${glow ? 'glow-border' : ''} ${
        hover ? 'transition-transform duration-300 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
