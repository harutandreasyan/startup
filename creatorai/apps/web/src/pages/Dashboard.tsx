import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
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
import { useAuthStore } from '../stores/auth.store';
import { Card } from '../components/common/Card';
import { Cube3D } from '../components/three/Cube3D';

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

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({ queryKey: ['generations'], queryFn: () => listGenerations({ limit: 8 }) });
  const recent = (data?.data ?? []).filter((g) => g.status === 'COMPLETED' && g.thumbnailUrl).slice(0, 6);

  return (
    <div className="space-y-9">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Welcome back{user?.name ? <>, <span className="text-gradient">{user.name}</span></> : ''}
        </h1>
        <p className="text-muted mt-1.5">What would you like to create today?</p>
      </div>

      {/* Quick actions with 3D items */}
      <div>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-[0.15em] mb-3">Create</h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {ACTIONS.map((a) => {
            const faces = Array.from({ length: 6 }, () => (
              <a.icon className="h-5 w-5 text-white/90" strokeWidth={1.9} />
            ));
            return (
              <motion.div key={a.to} variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link to={a.to}>
                  <Card glow className="p-5 h-full group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Cube3D size={46} faces={faces} spin={16} tint={a.tint} mini perspective={500} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm flex items-center gap-1.5">
                          {a.label}
                          <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-xs text-muted mt-0.5">{a.desc}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Recent — compact */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-[0.15em]">Recent creations</h2>
          <Link to="/gallery" className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card className="px-6 py-7 flex items-center gap-4">
            <div className="shrink-0">
              <Cube3D
                size={40}
                mini
                spin={14}
                perspective={500}
                faces={Array.from({ length: 6 }, () => <Sparkles className="h-4 w-4 text-white/90" />)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Nothing here yet</p>
              <p className="text-xs text-muted">Your generated work will show up here.</p>
            </div>
            <Link
              to="/generate"
              className="btn-glow shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Create
              </span>
            </Link>
          </Card>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none]"
          >
            {recent.map((g) => (
              <motion.div key={g.id} variants={item} whileHover={{ y: -3 }}>
                <Link
                  to="/gallery"
                  className="group relative block h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-xl overflow-hidden border border-border bg-surface-2"
                >
                  <img
                    src={g.thumbnailUrl!}
                    alt={g.prompt || ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
