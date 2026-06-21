import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listGenerations, deleteGeneration } from '@creatorai/api-client';
import type { Generation } from '@creatorai/shared';

export function Gallery() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Generation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['generations'],
    queryFn: () => listGenerations({ limit: 50 }),
  });

  const generations = data?.data ?? [];

  const handleDownload = async (url: string, id: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `creatorai-${id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank', 'noopener');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteGeneration(id);
      await queryClient.invalidateQueries({ queryKey: ['generations'] });
      setSelected(null);
    } finally {
      setDeleting(false);
    }
  };

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
            <button
              key={g.id}
              onClick={() => g.status === 'COMPLETED' && g.thumbnailUrl && setSelected(g)}
              className="aspect-square bg-gray-900 rounded-xl border border-gray-800 overflow-hidden relative group text-left"
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
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-gray-900 rounded-xl border border-gray-800 max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="font-semibold">Generation</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {selected.outputUrls[0] && (
              <img src={selected.outputUrls[0]} alt={selected.prompt || ''} className="w-full" />
            )}

            <div className="p-4 space-y-3">
              {selected.prompt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Prompt</p>
                  <p className="text-sm text-gray-200">{selected.prompt}</p>
                </div>
              )}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Model: {selected.model}</span>
                <span>Cost: {selected.creditsCost} credits</span>
                <span>{new Date(selected.createdAt).toLocaleString()}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleDownload(selected.outputUrls[0], selected.id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Download
                </button>
                <a
                  href={selected.outputUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Open full size
                </a>
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50 rounded-lg text-sm transition-colors ml-auto"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
