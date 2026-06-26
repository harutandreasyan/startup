import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UploadCloud, Download, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { importGeneration } from '@creatorai/api-client';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { toast } from '../../../stores/toast.store';
import { scaleImage } from '../../../lib/image';
import { useStyles } from '../../../lib/useStyles';
import { imageUpscalerStyles } from './styles';

interface Dims {
  w: number;
  h: number;
}

/**
 * Free, private 2× image upscaling — an ESRGAN model runs entirely in the browser via
 * UpscalerJS (TensorFlow.js). No backend, no credits, no upload. Model assets are
 * fetched (and cached) on first use; large images are tiled to limit memory.
 */
export default function ImageUpscaler() {
  const styles = useStyles(imageUpscalerStyles);
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [origDims, setOrigDims] = useState<Dims | null>(null);
  const [outDims, setOutDims] = useState<Dims | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setOriginalUrl('');
    setResultUrl('');
    setOrigDims(null);
    setOutDims(null);
    setError('');
  };

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('load failed'));
      img.src = src;
    });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    setError('');
    setResultUrl('');
    setOutDims(null);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setProcessing(true);
    try {
      const img = await loadImage(url);
      setOrigDims({ w: img.naturalWidth, h: img.naturalHeight });
      // Lazy-loaded so TensorFlow.js + the model aren't in the initial app download.
      const [{ default: Upscaler }, { default: model }] = await Promise.all([
        import('upscaler'),
        import('@upscalerjs/default-model'),
      ]);
      const upscaler = new Upscaler({ model });
      const out = await upscaler.upscale(img, { patchSize: 64, padding: 2, output: 'base64' });
      setResultUrl(out);
      setOutDims({ w: img.naturalWidth * 2, h: img.naturalHeight * 2 });
      // Save to the gallery (JPEG — no transparency, smaller). Non-fatal if it fails.
      try {
        const [image, thumbnail] = await Promise.all([
          scaleImage(out, 1600, 'image/jpeg', 0.92),
          scaleImage(out, 512, 'image/jpeg', 0.85),
        ]);
        await importGeneration({ type: 'UPSCALE', image, thumbnail });
        queryClient.invalidateQueries({ queryKey: ['generations'] });
        toast.success('Upscaled & saved to gallery');
      } catch (err) {
        console.error('Save to gallery failed:', err);
        toast.info('Done — but could not save to gallery');
      }
    } catch {
      setError('Could not upscale this image. Try a smaller one.');
      toast.error('Upscale failed');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'creatorai-upscaled.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success('Image downloaded');
  };

  const hasImage = !!originalUrl;

  return (
    <Card glow className={styles.card}>
      {!hasImage ? (
        <div
          className={styles.dropzone}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          <div className={styles.dropIconWrap}>
            <UploadCloud className={styles.dropIcon} />
          </div>
          <p className={styles.dropTitle}>Drop an image here, or click to upload</p>
          <p className={styles.dropHint}>PNG or JPG · upscaled 2× privately on your device</p>
        </div>
      ) : (
        <>
          <div className={styles.previews}>
            <div className={styles.previewBox}>
              <div className={styles.previewHead}>
                <p className={styles.previewLabel}>Original</p>
                {origDims && <span className={styles.dim}>{origDims.w}×{origDims.h}</span>}
              </div>
              <div className={styles.imageFrame}>
                <img src={originalUrl} alt="Original" className={styles.img} />
              </div>
            </div>
            <div className={styles.previewBox}>
              <div className={styles.previewHead}>
                <p className={styles.previewLabel}>Upscaled 2×</p>
                {outDims && <span className={styles.dim}>{outDims.w}×{outDims.h}</span>}
              </div>
              <div className={styles.imageFrame}>
                {processing ? (
                  <div className={styles.processingBox}>
                    <Loader2 className={styles.spinner} />
                    Upscaling…
                  </div>
                ) : resultUrl ? (
                  <img src={resultUrl} alt="Upscaled" className={styles.img} />
                ) : null}
              </div>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle className={styles.errorIcon} />
              {error}
            </div>
          )}

          {processing && (
            <p className={styles.hint}>
              First run downloads the AI model (a few MB) — it's cached after that. Larger
              images take longer.
            </p>
          )}

          <div className={styles.actions}>
            <Button onClick={download} disabled={!resultUrl || processing} leftIcon={<Download className={styles.actionIcon} />}>
              Download PNG
            </Button>
            <Button variant="secondary" onClick={reset} disabled={processing} leftIcon={<RefreshCw className={styles.actionIcon} />}>
              New image
            </Button>
          </div>
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
        className={styles.hiddenInput}
      />
    </Card>
  );
}
