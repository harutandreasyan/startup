export const heroSceneStyles = {
  faceIcon: (app: boolean) => (app ? 'h-12 w-12 text-white' : 'h-10 w-10 text-white/90'),
  container: 'relative w-full h-full flex items-center justify-center',
  glow: 'absolute h-56 w-56 rounded-full bg-gradient-to-br from-primary to-accent blur-3xl opacity-40 animate-float',
  float: 'animate-float',
};
