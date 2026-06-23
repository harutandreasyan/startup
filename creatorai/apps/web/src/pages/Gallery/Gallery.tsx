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
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import Modal from '../../components/common/Modal';
import { toast } from '../../stores/toast.store';
import { useStyles } from '../../lib/useStyles';
import { galleryStyles } from './styles';

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

export default function Gallery() {
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

  const styles = useStyles(galleryStyles);

  return (
    <div className={styles.root}>
      <div>
        <h1 className={styles.title}>Gallery</h1>
        <p className={styles.subtitle}>Everything you've created, in one place.</p>
      </div>

      {isLoading && (
        <div className={styles.loadingWrap}>
          <Loader2 className={styles.loadingIcon} />
        </div>
      )}

      {!isLoading && generations.length === 0 && (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyIconWrap}>
            <ImagesIcon className={styles.emptyIcon} />
          </div>
          <p className={styles.emptyText}>Your generations will appear here.</p>
          <Link
            to="/generate"
            className={styles.emptyLink}
          >
            <span className={styles.emptyLinkInner}>
              <Sparkles className={styles.emptyLinkIcon} /> Create something
            </span>
          </Link>
        </Card>
      )}

      {!isLoading && generations.length > 0 && (
        <motion.div
          variants={gridContainer}
          initial="hidden"
          animate="show"
          className={styles.grid}
        >
          {generations.map((g) => {
            const ready = g.status === 'COMPLETED' && !!g.thumbnailUrl;
            return (
              <motion.div
                key={g.id}
                variants={gridItem}
                whileHover={{ y: -4 }}
                onClick={() => ready && setPreview(g)}
                className={styles.gridItem}
              >
                {ready ? (
                  <img
                    src={g.thumbnailUrl!}
                    alt={g.prompt || ''}
                    className={styles.gridImg}
                  />
                ) : (
                  <div className={styles.processing}>
                    <Loader2 className={styles.processingIcon} />
                    Processing
                  </div>
                )}

                {ready && (
                  <>
                    <button
                      onClick={(e) => openMenu(e, g)}
                      aria-label="More options"
                      className={styles.menuBtn}
                    >
                      <MoreVertical className={styles.menuBtnIcon} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(g.outputUrls[0], g.id);
                      }}
                      aria-label="Download"
                      title="Download"
                      className={styles.downloadBtn}
                    >
                      <Download className={styles.downloadBtnIcon} />
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
            <div className={styles.dropdownOverlay} onClick={() => setMenu(null)} />
            <div
              className={styles.dropdown}
              style={{ top: menu.top, right: menu.right }}
            >
              {menuItems(menu.gen).map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setMenu(null);
                  }}
                  className={styles.dropdownItem(item.danger)}
                >
                  <item.icon className={styles.dropdownItemIcon} />
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
            className={styles.previewOverlay}
            onClick={() => setPreview(null)}
          >
            <div className={styles.previewClose}>
              <button
                onClick={() => setPreview(null)}
                aria-label="Close"
                className={styles.previewCloseBtn}
              >
                <X className={styles.previewCloseIcon} />
              </button>
            </div>
            <div
              className={styles.previewImgWrap}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={preview.outputUrls[0]}
                alt={preview.prompt || ''}
                className={styles.previewImg}
              />
            </div>
            <div className={styles.previewActions} onClick={(e) => e.stopPropagation()}>
              <Button onClick={() => downloadImage(preview.outputUrls[0], preview.id)} leftIcon={<Download className={styles.previewActionIcon} />}>
                <span className={styles.previewActionInline}>Download</span>
              </Button>
              <a href={preview.outputUrls[0]} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" leftIcon={<ExternalLink className={styles.previewActionIcon} />}>
                  <span className={styles.previewActionInline}>Open</span>
                </Button>
              </a>
              <Button variant="secondary" onClick={() => setDetails(preview)} leftIcon={<Info className={styles.previewActionIcon} />}>
                <span className={styles.previewActionInline}>Details</span>
              </Button>
              <Button variant="danger" onClick={() => setConfirmDeleteGen(preview)} leftIcon={<Trash2 className={styles.previewActionIcon} />}>
                <span className={styles.previewActionInline}>Delete</span>
              </Button>
            </div>
          </div>,
          document.body,
        )}

      {/* Details modal */}
      <Modal open={!!details} onClose={() => setDetails(null)} title="Details">
        {details && (
          <div className={styles.modalBody}>
            {details.prompt && <Detail label="Prompt" value={details.prompt} copyable />}
            {details.negativePrompt && <Detail label="Negative prompt" value={details.negativePrompt} copyable />}
            <div className={styles.modalDivider} />
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
  const styles = useStyles(galleryStyles);

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
      <div className={styles.detailHeader}>
        <p className={styles.detailLabel}>{label}</p>
        {copyable && (
          <button
            onClick={copy}
            aria-label={`Copy ${label.toLowerCase()}`}
            title="Copy"
            className={styles.detailCopyBtn}
          >
            {copied ? <Check className={styles.detailCheckIcon} /> : <Copy className={styles.detailCopyIcon} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <p className={styles.detailValue}>{value}</p>
    </div>
  );
}
