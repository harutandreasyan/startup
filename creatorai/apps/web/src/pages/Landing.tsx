import { Link } from 'react-router-dom';
import { Image as ImageIcon, Clapperboard, Box, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { HeroScene } from '../components/three/HeroScene';

const FEATURES = [
  { icon: ImageIcon, title: 'Image Generation', desc: 'Text-to-image with Flux, SDXL and more. From 2 credits.' },
  { icon: Clapperboard, title: 'Video Generation', desc: 'Turn text or images into cinematic clips. From 20 credits.' },
  { icon: Box, title: '3D Models', desc: 'Generate export-ready 3D assets from text. From 10 credits.' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <AuroraBackground />

      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 h-16 max-w-6xl mx-auto">
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

      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-12 lg:pt-20 pb-16 grid lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left animate-fade-in-up order-last lg:order-first">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs font-medium text-muted mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered creative suite
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Create stunning visuals
            <br />
            <span className="text-gradient">with AI</span>
          </h1>
          <p className="mt-6 text-lg text-muted max-w-xl mx-auto lg:mx-0">
            Generate images, videos, and 3D models — one platform, every creative tool, on all your devices.
          </p>
          <div className="mt-9 flex items-center justify-center lg:justify-start gap-3">
            <Link
              to="/register"
              className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium active:scale-[0.98]"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Start free — 20 credits <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        {/* 3D hero */}
        <div className="h-64 sm:h-80 lg:h-[420px] order-first lg:order-last animate-fade-in">
          <HeroScene />
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass glow-border p-6 rounded-2xl transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 ring-1 ring-inset ring-primary/15 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8 text-center text-muted text-sm">
        © {new Date().getFullYear()} CreatorAI. All rights reserved.
      </footer>
    </div>
  );
}
