import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, type Variants } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MoreVertical,
  Download,
  ExternalLink,
  Trash2,
  Info,
  X,
  Images as ImagesIcon,
  Loader2,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { listGenerations, deleteGeneration } from '@creatorai/api-client';
import type { Generation } from '@creatorai/shared';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Modal } from '../components/common/Modal';
import { toast } from '../stores/toast.store';

const gridContainer: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const gridItem: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 24 } },
};

async function downloadImage(url: string, id: string) {
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
    toast.success('Image downloaded');
  } catch {
    window.open(url, '_blank', 'noopener');
    toast.info('Opened image in a new tab');
  }
}

export function Gallery() {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<Generation | null>(null);
  const [details, setDetails] = useState<Generation | null>(null);
  const [confirmDeleteGen, setConfirmDeleteGen] = useState<Generation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [menu, setMenu] = useState<{ gen: Generation; top: number; right: number } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['generations'],
    queryFn: () => listGenerations({ limit: 50 }),
  });
  // Failed generations are never shown (the user is notified via toast instead).
  const generations = (data?.data ?? []).filter((g) => g.status !== 'FAILED');

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menu]);

  const openMenu = (e: React.MouseEvent, gen: Generation) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ gen, top: rect.bottom + 6, right: window.innerWidth - rect.right });
  };

  const handleDelete = async () => {
    if (!confirmDeleteGen) return;
    setDeleting(true);
    try {
      await deleteGeneration(confirmDeleteGen.id);
      await queryClient.invalidateQueries({ queryKey: ['generations'] });
      if (preview?.id === confirmDeleteGen.id) setPreview(null);
      setConfirmDeleteGen(null);
      toast.success('Creation deleted');
    } catch {
      toast.error('Could not delete creation');
    } finally {
      setDeleting(false);
    }
  };

  const menuItems = (gen: Generation) => [
    { label: 'Open', icon: ImagesIcon, action: () => setPreview(gen) },
    { label: 'Download', icon: Download, action: () => downloadImage(gen.outputUrls[0], gen.id) },
    { label: 'Details', icon: Info, action: () => setDetails(gen) },
    { label: 'Delete', icon: Trash2, action: () => setConfirmDeleteGen(gen), danger: true },
  ];

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
            className="mt-4 btn-glow inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Create something
            </span>
          </Link>
        </Card>
      )}

      {!isLoading && generations.length > 0 && (
        <motion.div
          variants={gridContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {generations.map((g) => {
            const ready = g.status === 'COMPLETED' && !!g.thumbnailUrl;
            return (
              <motion.div
                key={g.id}
                variants={gridItem}
                whileHover={{ y: -4 }}
                onClick={() => ready && setPreview(g)}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-surface-2 cursor-pointer transition-colors hover:border-primary/40"
              >
                {ready ? (
                  <img
                    src={g.thumbnailUrl!}
                    alt={g.prompt || ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-xs text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing
                  </div>
                )}

                {ready && (
                  <>
                    <button
                      onClick={(e) => openMenu(e, g)}
                      aria-label="More options"
                      className="absolute top-2 right-2 h-8 w-8 inline-flex items-center justify-center rounded-lg bg-black/45 backdrop-blur text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-black/65"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(g.outputUrls[0], g.id);
                      }}
                      aria-label="Download"
                      title="Download"
                      className="absolute bottom-2 right-2 h-8 w-8 inline-flex items-center justify-center rounded-lg bg-black/45 backdrop-blur text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-black/65"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Dropdown menu */}
      {menu &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setMenu(null)} />
            <div
              className="fixed z-[91] w-44 rounded-xl p-1.5 bg-surface-solid border border-border shadow-2xl backdrop-blur-xl animate-scale-in"
              style={{ top: menu.top, right: menu.right }}
            >
              {menuItems(menu.gen).map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setMenu(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    item.danger ? 'text-danger hover:bg-danger/10' : 'text-foreground hover:bg-foreground/[0.06]'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}

      {/* Full-image preview — no scroll */}
      {preview &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col p-4 animate-fade-in"
            onClick={() => setPreview(null)}
          >
            <div className="flex justify-end shrink-0">
              <button
                onClick={() => setPreview(null)}
                aria-label="Close"
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              className="flex-1 min-h-0 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={preview.outputUrls[0]}
                alt={preview.prompt || ''}
                className="max-h-full max-w-full object-contain rounded-2xl animate-scale-in"
              />
            </div>
            <div className="shrink-0 flex items-center justify-center gap-2 sm:gap-2.5 pt-4" onClick={(e) => e.stopPropagation()}>
              <Button onClick={() => downloadImage(preview.outputUrls[0], preview.id)} leftIcon={<Download className="h-4 w-4" />}>
                <span className="hidden sm:inline">Download</span>
              </Button>
              <a href={preview.outputUrls[0]} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" leftIcon={<ExternalLink className="h-4 w-4" />}>
                  <span className="hidden sm:inline">Open</span>
                </Button>
              </a>
              <Button variant="secondary" onClick={() => setDetails(preview)} leftIcon={<Info className="h-4 w-4" />}>
                <span className="hidden sm:inline">Details</span>
              </Button>
              <Button variant="danger" onClick={() => setConfirmDeleteGen(preview)} leftIcon={<Trash2 className="h-4 w-4" />}>
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>,
          document.body,
        )}

      {/* Details modal */}
      <Modal open={!!details} onClose={() => setDetails(null)} title="Details">
        {details && (
          <div className="px-5 pb-5 pt-2 space-y-4">
            {details.prompt && <Detail label="Prompt" value={details.prompt} copyable />}
            {details.negativePrompt && <Detail label="Negative prompt" value={details.negativePrompt} copyable />}
            <div className="h-px bg-border" />
            <Detail label="Type" value={details.type.replaceAll('_', ' ').toLowerCase()} />
            <Detail label="Model" value={details.model} />
            <Detail label="Cost" value={`${details.creditsCost} credits`} />
            <Detail label="Created" value={new Date(details.createdAt).toLocaleString()} />
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmDeleteGen}
        title="Delete this creation?"
        description="This permanently removes the image from your gallery. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteGen(null)}
      />
    </div>
  );
}

function Detail({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
        {copyable && (
          <button
            onClick={copy}
            aria-label={`Copy ${label.toLowerCase()}`}
            title="Copy"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <p className="text-sm break-words">{value}</p>
    </div>
  );
}
