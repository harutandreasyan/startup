import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Download, ExternalLink, Trash2, Images as ImagesIcon, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listGenerations, deleteGeneration } from '@creatorai/api-client';
import type { Generation } from '@creatorai/shared';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gallery</h1>
        <p className="text-muted mt-1">Everything you've created, in one place.</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!isLoading && generations.length === 0 && (
        <Card className="p-10 sm:p-16 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-surface-2 flex items-center justify-center mb-3">
            <ImagesIcon className="h-6 w-6 text-muted" />
          </div>
          <p className="text-muted text-sm">Your generations will appear here.</p>
          <Link
            to="/generate"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Sparkles className="h-4 w-4" /> Create something
          </Link>
        </Card>
      )}

      {!isLoading && generations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {generations.map((g) => (
            <button
              key={g.id}
              onClick={() => g.status === 'COMPLETED' && g.thumbnailUrl && setSelected(g)}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-surface-2 text-left transition-all hover:border-primary/40"
            >
              {g.status === 'COMPLETED' && g.thumbnailUrl ? (
                <img
                  src={g.thumbnailUrl}
                  alt={g.prompt || ''}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-xs text-muted">
                  {g.status === 'FAILED' ? (
                    <span className="text-danger">Failed</span>
                  ) : (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing
                    </>
                  )}
                </div>
              )}
              {g.prompt && g.status === 'COMPLETED' && (
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[11px] text-white/90 line-clamp-2">{g.prompt}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <Card
            className="max-w-3xl w-full max-h-[90vh] overflow-auto p-0 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
              <h2 className="font-semibold">Creation</h2>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selected.outputUrls[0] && (
              <img src={selected.outputUrls[0]} alt={selected.prompt || ''} className="w-full" />
            )}

            <div className="p-4 space-y-4">
              {selected.prompt && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Prompt</p>
                  <p className="text-sm">{selected.prompt}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span>Model: {selected.model}</span>
                <span>Cost: {selected.creditsCost} credits</span>
                <span>{new Date(selected.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <Button onClick={() => handleDownload(selected.outputUrls[0], selected.id)} leftIcon={<Download className="h-4 w-4" />}>
                  Download
                </Button>
                <a href={selected.outputUrls[0]} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" leftIcon={<ExternalLink className="h-4 w-4" />}>Open</Button>
                </a>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(selected.id)}
                  loading={deleting}
                  leftIcon={!deleting && <Trash2 className="h-4 w-4" />}
                  className="ml-auto"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
