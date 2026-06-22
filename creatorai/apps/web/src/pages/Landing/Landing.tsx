import { Link } from 'react-router-dom';
import { Image as ImageIcon, Clapperboard, Box, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import AuroraBackground from '../../components/common/AuroraBackground';
import HeroScene from '../../components/three/HeroScene';
import { useStyles } from '../../lib/useStyles';
import { landingStyles } from './styles';

const FEATURES = [
  { icon: ImageIcon, title: 'Image Generation', desc: 'Text-to-image with Flux, SDXL and more. From 2 credits.' },
  { icon: Clapperboard, title: 'Video Generation', desc: 'Turn text or images into cinematic clips. From 20 credits.' },
  { icon: Box, title: '3D Models', desc: 'Generate export-ready 3D assets from text. From 10 credits.' },
];

export default function Landing() {
  const s = useStyles(landingStyles);
  return (
    <div className={s.root}>
      <AuroraBackground />

      <header className={s.header}>
        <Logo />
        <div className={s.headerActions}>
          <ThemeToggle />
          <Link to="/login" className={s.signInLink}>
            Sign in
          </Link>
          <Link
            to="/register"
            className={s.getStartedLink}
          >
            Get started
          </Link>
        </div>
      </header>

      <section className={s.hero}>
        <div className={s.heroCopy}>
          <span className={s.heroBadge}>
            <Sparkles className={s.heroBadgeIcon} /> AI-powered creative suite
          </span>
          <h1 className={s.heroTitle}>
            Create stunning visuals
            <br />
            <span className={s.heroTitleGradient}>with AI</span>
          </h1>
          <p className={s.heroDesc}>
            Generate images, videos, and 3D models — one platform, every creative tool, on all your devices.
          </p>
          <div className={s.heroCtaRow}>
            <Link
              to="/register"
              className={s.heroCta}
            >
              <span className={s.heroCtaInner}>
                Start free — 20 credits <ArrowRight className={s.heroCtaIcon} />
              </span>
            </Link>
          </div>
        </div>

        {/* 3D hero */}
        <div className={s.heroScene}>
          <HeroScene />
        </div>
      </section>

      <section className={s.features}>
        <div className={s.featureGrid}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={s.featureCard}
            >
              <div className={s.featureIconWrap}>
                <f.icon className={s.featureIcon} />
              </div>
              <h3 className={s.featureTitle}>{f.title}</h3>
              <p className={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className={s.footer}>
        © {new Date().getFullYear()} CreatorAI. All rights reserved.
      </footer>
    </div>
  );
}
