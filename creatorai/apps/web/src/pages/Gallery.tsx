import { useQuery } from '@tanstack/react-query';
import { listGenerations } from '@creatorai/api-client';

export function Gallery() {
  const { data, isLoading } = useQuery({
    queryKey: ['generations'],
    queryFn: () => listGenerations({ limit: 50 }),
  });

  const generations = data?.data ?? [];

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-6">Gallery</h1>

      {isLoading && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center text-gray-500">
          Loading…
        </div>
      )}

      {!isLoading && generations.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-500 mb-4">Your generations will appear here</p>
          <a
            href="/generate"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors"
          >
            Create something
          </a>
        </div>
      )}

      {!isLoading && generations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {generations.map((g) => (
            <div
              key={g.id}
              className="aspect-square bg-gray-900 rounded-xl border border-gray-800 overflow-hidden relative group"
            >
              {g.status === 'COMPLETED' && g.thumbnailUrl ? (
                <img src={g.thumbnailUrl} alt={g.prompt || ''} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                  {g.status === 'FAILED' ? 'Failed' : 'Processing…'}
                </div>
              )}
              {g.prompt && (
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-gray-200 line-clamp-2">{g.prompt}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
