export const landingStyles = {
  root: 'min-h-screen bg-background text-foreground overflow-hidden',
  header: 'relative z-10 flex items-center justify-between px-5 sm:px-8 h-16 max-w-6xl mx-auto',
  headerActions: 'flex items-center gap-2',
  signInLink: 'px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors',
  getStartedLink:
    'px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-sm shadow-primary/25',

  hero: 'relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-12 lg:pt-20 pb-16 grid lg:grid-cols-2 gap-8 items-center',
  heroCopy: 'text-center lg:text-left animate-fade-in-up order-last lg:order-first',
  heroBadge: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs font-medium text-muted mb-6',
  heroBadgeIcon: 'h-3.5 w-3.5 text-primary',
  heroTitle: 'text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]',
  heroTitleGradient: 'text-gradient',
  heroDesc: 'mt-6 text-lg text-muted max-w-xl mx-auto lg:mx-0',
  heroCtaRow: 'mt-9 flex items-center justify-center lg:justify-start gap-3',
  heroCta: 'btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium active:scale-[0.98]',
  heroCtaInner: 'relative z-10 inline-flex items-center gap-2',
  heroCtaIcon: 'h-4 w-4',
  heroScene: 'h-64 sm:h-80 lg:h-[420px] order-first lg:order-last animate-fade-in',

  features: 'relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pb-24',
  featureGrid: 'grid grid-cols-1 md:grid-cols-3 gap-4 stagger',
  featureCard: 'glass glow-border p-6 rounded-2xl transition-transform duration-300 hover:-translate-y-1',
  featureIconWrap:
    'h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 ring-1 ring-inset ring-primary/15 flex items-center justify-center mb-4',
  featureIcon: 'h-5 w-5 text-primary',
  featureTitle: 'font-semibold',
  featureDesc: 'text-sm text-muted mt-1.5',

  footer: 'relative z-10 border-t border-border py-8 text-center text-muted text-sm',
};
