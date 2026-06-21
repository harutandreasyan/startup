export const makeCardStyles = (hover: boolean, glow: boolean, className: string) => ({
  card: `glass rounded-2xl ${glow ? 'glow-border' : ''} ${
    hover ? 'transition-transform duration-300 hover:-translate-y-0.5' : ''
  } ${className}`,
});
