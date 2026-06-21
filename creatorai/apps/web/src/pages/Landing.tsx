import { Link } from 'react-router-dom';
import { Image as ImageIcon, Clapperboard, Box, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';

const FEATURES = [
  { icon: ImageIcon, title: 'Image Generation', desc: 'Text-to-image with Flux, SDXL and more. From 2 credits.' },
  { icon: Clapperboard, title: 'Video Generation', desc: 'Turn text or images into cinematic clips. From 20 credits.' },
  { icon: Box, title: '3D Models', desc: 'Generate export-ready 3D assets from text. From 10 credits.' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ambient gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/20 blur-[120px] opacity-60" />
      </div>

      <header className="relative flex items-center justify-between px-5 sm:px-8 h-16 max-w-6xl mx-auto">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-sm shadow-primary/25"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-medium text-muted mb-6">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered creative suite
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
          Create stunning visuals
          <br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">with AI</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-xl mx-auto">
          Generate images, videos, and 3D models — one platform, every creative tool, on all your devices.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
          >
            Start free — 20 credits <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="relative max-w-5xl mx-auto px-5 sm:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-colors"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-border py-8 text-center text-muted text-sm">
        © {new Date().getFullYear()} CreatorAI. All rights reserved.
      </footer>
    </div>
  );
}
