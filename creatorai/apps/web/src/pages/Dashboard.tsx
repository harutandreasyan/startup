import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Clapperboard,
  Box,
  Scissors,
  Maximize2,
  Brush,
  Gem,
  Layers,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { listGenerations, getStats } from '@creatorai/api-client';
import { useAuthStore } from '../stores/auth.store';
import { Card } from '../components/common/Card';

const ACTIONS: { to: string; label: string; desc: string; icon: LucideIcon }[] = [
  { to: '/generate?type=TEXT_TO_IMAGE', label: 'Text to Image', desc: 'Generate images from prompts', icon: ImageIcon },
  { to: '/generate?type=TEXT_TO_VIDEO', label: 'Text to Video', desc: 'Create video clips from text', icon: Clapperboard },
  { to: '/generate?type=TEXT_TO_3D', label: 'Text to 3D', desc: 'Generate 3D models from text', icon: Box },
  { to: '/generate?type=BACKGROUND_REMOVAL', label: 'Remove Background', desc: 'Erase backgrounds instantly', icon: Scissors },
  { to: '/generate?type=UPSCALE', label: 'Upscale', desc: 'Enhance image resolution', icon: Maximize2 },
  { to: '/generate?type=INPAINT', label: 'Inpaint / Edit', desc: 'Edit parts of an image', icon: Brush },
];

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({ queryKey: ['generations'], queryFn: () => listGenerations({ limit: 8 }) });
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getStats });
  const recent = (data?.data ?? []).filter((g) => g.status === 'COMPLETED' && g.thumbnailUrl);

  const statCards: { label: string; value: number; icon: LucideIcon }[] = [
    { label: 'Credits', value: user?.creditBalance ?? 0, icon: Gem },
    { label: 'Creations', value: stats?.completedGenerations ?? 0, icon: Layers },
    { label: 'Credits used', value: stats?.creditsSpent ?? 0, icon: Zap },
    { label: 'Total runs', value: stats?.totalGenerations ?? 0, icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-muted mt-1">What would you like to create today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4 sm:p-5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <s.icon className="h-[18px] w-[18px] text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{s.value}</div>
            <div className="text-xs text-muted mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Create</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ACTIONS.map((a) => (
            <Link key={a.to} to={a.to}>
              <Card hover className="p-5 h-full group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0 group-hover:from-primary/25 group-hover:to-accent/25 transition-colors">
                    <a.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm flex items-center gap-1.5">
                      {a.label}
                      <ArrowRight className="h-3.5 w-3.5 text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{a.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Recent creations</h2>
          <Link to="/gallery" className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card className="p-10 sm:p-14 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-surface-2 flex items-center justify-center mb-3">
              <ImageIcon className="h-6 w-6 text-muted" />
            </div>
            <p className="text-muted text-sm">No creations yet — your generated work will show up here.</p>
            <Link
              to="/generate"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Sparkles className="h-4 w-4" /> Create your first
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {recent.map((g) => (
              <Link
                key={g.id}
                to="/gallery"
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-surface-2"
              >
                <img
                  src={g.thumbnailUrl!}
                  alt={g.prompt || ''}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
