import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-2xl transition-all duration-200 ${
        hover ? 'hover:border-primary/40 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
