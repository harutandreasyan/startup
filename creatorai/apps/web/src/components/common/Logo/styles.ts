export const logoStyles = {
  root: (className: string) => `group flex items-center gap-2.5 ${className}`,
  iconWrap: 'relative h-8 w-8',
  glow: 'absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent blur-md opacity-60 group-hover:opacity-90 transition-opacity',
  iconBox:
    'relative h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/40 group-hover:scale-105 transition-transform',
  icon: 'h-[18px] w-[18px] text-white',
  text: 'text-lg font-bold tracking-tight text-foreground',
  textAccent: 'text-gradient',
};
