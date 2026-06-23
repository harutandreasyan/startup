import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Clapperboard,
  Box,
  Scissors,
  Maximize2,
  Brush,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { listGenerations } from '@creatorai/api-client';
import { useAuthStore } from '../../stores/auth.store';
import Card from '../../components/common/Card';
import Cube3D from '../../components/three/Cube3D';
import { useStyles } from '../../lib/useStyles';
import { dashboardStyles } from './styles';

interface Action {
  to: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  tint: { c1: string; c2: string };
}

const ACTIONS: Action[] = [
  { to: '/generate?type=TEXT_TO_IMAGE', label: 'Text to Image', desc: 'Generate images from prompts', icon: ImageIcon, tint: { c1: '#7c5cff', c2: '#d946ef' } },
  { to: '/generate?type=TEXT_TO_VIDEO', label: 'Text to Video', desc: 'Create video clips from text', icon: Clapperboard, tint: { c1: '#4f7cff', c2: '#22d3ee' } },
  { to: '/generate?type=TEXT_TO_3D', label: 'Text to 3D', desc: 'Generate 3D models from text', icon: Box, tint: { c1: '#d946ef', c2: '#7c5cff' } },
  { to: '/generate?type=BACKGROUND_REMOVAL', label: 'Remove Background', desc: 'Erase backgrounds instantly', icon: Scissors, tint: { c1: '#22d3ee', c2: '#3dd68c' } },
  { to: '/generate?type=UPSCALE', label: 'Upscale', desc: 'Enhance image resolution', icon: Maximize2, tint: { c1: '#8b5cf6', c2: '#22d3ee' } },
  { to: '/generate?type=INPAINT', label: 'Inpaint / Edit', desc: 'Edit parts of an image', icon: Brush, tint: { c1: '#ec4899', c2: '#7c5cff' } },
];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({ queryKey: ['generations'], queryFn: () => listGenerations({ limit: 8 }) });
  const recent = (data?.data ?? []).filter((g) => g.status === 'COMPLETED' && g.thumbnailUrl).slice(0, 6);
  const styles = useStyles(dashboardStyles);

  return (
    <div className={styles.root}>
      <div>
        <h1 className={styles.heading}>
          Welcome back{user?.name ? <>, <span className={styles.headingName}>{user.name}</span></> : ''}
        </h1>
        <p className={styles.headingSub}>What would you like to create today?</p>
      </div>

      {/* Quick actions with 3D items */}
      <div>
        <h2 className={styles.sectionLabel}>Create</h2>
        <div className={styles.actionsGrid}>
          {ACTIONS.map((a) => {
            const faces = Array.from({ length: 6 }, () => (
              <a.icon className={styles.faceIcon} strokeWidth={1.9} />
            ));
            return (
              <motion.div key={a.to} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link to={a.to}>
                  <Card glow className={styles.card}>
                    <div className={styles.cardRow}>
                      <div className={styles.cubeWrap}>
                        <Cube3D size={46} faces={faces} spin={16} tint={a.tint} mini perspective={500} />
                      </div>
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>
                          {a.label}
                          <ArrowRight className={styles.cardArrow} />
                        </h3>
                        <p className={styles.cardDesc}>{a.desc}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent — compact */}
      <div>
        <div className={styles.recentHeader}>
          <h2 className={styles.recentLabel}>Recent creations</h2>
          <Link to="/gallery" className={styles.viewAllLink}>
            View all <ArrowRight className={styles.viewAllIcon} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card className={styles.emptyCard}>
            <div className={styles.emptyCubeWrap}>
              <Cube3D
                size={40}
                mini
                spin={14}
                perspective={500}
                faces={Array.from({ length: 6 }, () => <Sparkles className={styles.sparkleFaceIcon} />)}
              />
            </div>
            <div className={styles.emptyBody}>
              <p className={styles.emptyTitle}>Nothing here yet</p>
              <p className={styles.emptyDesc}>Your generated work will show up here.</p>
            </div>
            <Link
              to="/generate"
              className={styles.emptyLink}
            >
              <span className={styles.emptyLinkInner}>
                <Sparkles className={styles.emptyLinkIcon} /> Create
              </span>
            </Link>
          </Card>
        ) : (
          <div className={styles.recentRow}>
            {recent.map((g) => (
              <motion.div key={g.id} whileHover={{ y: -3 }}>
                <Link
                  to="/gallery"
                  className={styles.recentLink}
                >
                  <img
                    src={g.thumbnailUrl!}
                    alt={g.prompt || ''}
                    className={styles.recentImg}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
