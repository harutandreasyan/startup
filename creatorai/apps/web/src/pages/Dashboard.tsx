import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listGenerations, getStats } from '@creatorai/api-client';
import { useAuthStore } from '../stores/auth.store';

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({
    queryKey: ['generations'],
    queryFn: () => listGenerations({ limit: 8 }),
  });
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getStats });
  const recent = (data?.data ?? []).filter((g) => g.status === 'COMPLETED' && g.thumbnailUrl);

  const statCards = [
    { label: 'Credits', value: user?.creditBalance ?? 0, icon: '💎' },
    { label: 'Creations', value: stats?.completedGenerations ?? 0, icon: '🖼️' },
    { label: 'Credits used', value: stats?.creditsSpent ?? 0, icon: '⚡' },
    { label: 'Total runs', value: stats?.totalGenerations ?? 0, icon: '📊' },
  ];

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-2">
        Welcome back{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="text-gray-400 mb-8">What would you like to create today?</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="p-5 bg-gray-900 rounded-xl border border-gray-800">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {[
          { to: '/generate?type=TEXT_TO_IMAGE', label: 'Text to Image', icon: '🎨', desc: 'Generate images from text prompts' },
          { to: '/generate?type=TEXT_TO_VIDEO', label: 'Text to Video', icon: '🎬', desc: 'Create video clips from descriptions' },
          { to: '/generate?type=TEXT_TO_3D', label: 'Text to 3D', icon: '📦', desc: 'Generate 3D models from text' },
          { to: '/generate?type=BACKGROUND_REMOVAL', label: 'Remove Background', icon: '✂️', desc: 'Remove image backgrounds instantly' },
          { to: '/generate?type=UPSCALE', label: 'Upscale', icon: '🔍', desc: 'Enhance image resolution' },
          { to: '/generate?type=INPAINT', label: 'Inpaint / Edit', icon: '🖌️', desc: 'Edit parts of an image with AI' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-colors group"
          >
            <span className="text-3xl mb-3 block">{item.icon}</span>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors">
              {item.label}
            </h3>
            <p className="text-xs text-gray-400">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Generations</h2>
          <Link to="/gallery" className="text-sm text-indigo-400 hover:text-indigo-300">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-500">No generations yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recent.map((g) => (
              <Link
                key={g.id}
                to="/gallery"
                className="aspect-square bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-indigo-500/50 transition-colors"
              >
                <img src={g.thumbnailUrl!} alt={g.prompt || ''} className="w-full h-full object-cover" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
