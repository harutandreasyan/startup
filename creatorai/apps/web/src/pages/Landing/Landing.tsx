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
  const styles = useStyles(landingStyles);
  return (
    <div className={styles.root}>
      <AuroraBackground />

      <header className={styles.header}>
        <Logo />
        <div className={styles.headerActions}>
          <ThemeToggle />
          <Link to="/login" className={styles.signInLink}>
            Sign in
          </Link>
          <Link
            to="/register"
            className={styles.getStartedLink}
          >
            Get started
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroBadge}>
            <Sparkles className={styles.heroBadgeIcon} /> AI-powered creative suite
          </span>
          <h1 className={styles.heroTitle}>
            Create stunning visuals
            <br />
            <span className={styles.heroTitleGradient}>with AI</span>
          </h1>
          <p className={styles.heroDesc}>
            Generate images, videos, and 3D models — one platform, every creative tool, on all your devices.
          </p>
          <div className={styles.heroCtaRow}>
            <Link
              to="/register"
              className={styles.heroCta}
            >
              <span className={styles.heroCtaInner}>
                Start free — 20 credits <ArrowRight className={styles.heroCtaIcon} />
              </span>
            </Link>
          </div>
        </div>

        {/* 3D hero */}
        <div className={styles.heroScene}>
          <HeroScene />
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={styles.featureCard}
            >
              <div className={styles.featureIconWrap}>
                <f.icon className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} CreatorAI. All rights reserved.
      </footer>
    </div>
  );
}
