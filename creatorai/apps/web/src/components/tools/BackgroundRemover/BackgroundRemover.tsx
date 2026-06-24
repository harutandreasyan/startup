import { useRef, useState } from 'react';
import { UploadCloud, Download, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { toast } from '../../../stores/toast.store';
import { useStyles } from '../../../lib/useStyles';
import { backgroundRemoverStyles } from './styles';

/**
 * Free, private Background Removal — the AI model runs entirely in the browser via
 * @imgly/background-removal. No backend, no credits, no upload: the image never
 * leaves the device. The model assets are fetched (and cached) on first use.
 */
export default function BackgroundRemover() {
  const styles = useStyles(backgroundRemoverStyles);
  const fileRef = useRef<HTMLInputElement>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setOriginalUrl('');
    setResultUrl('');
    setError('');
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    setError('');
    setResultUrl('');
    setOriginalUrl(URL.createObjectURL(file));
    setProcessing(true);
    try {
      // Lazy-loaded so the model bundle isn't in the initial app download.
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(file);
      setResultUrl(URL.createObjectURL(blob));
      toast.success('Background removed');
    } catch {
      setError('Could not process this image. Try a different one.');
      toast.error('Background removal failed');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'creatorai-no-bg.png';
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
          <p className={styles.dropHint}>PNG or JPG · processed privately on your device</p>
        </div>
      ) : (
        <>
          <div className={styles.previews}>
            <div className={styles.previewBox}>
              <p className={styles.previewLabel}>Original</p>
              <div className={styles.imageFrame}>
                <img src={originalUrl} alt="Original" className={styles.img} />
              </div>
            </div>
            <div className={styles.previewBox}>
              <p className={styles.previewLabel}>Result</p>
              <div className={styles.resultFrame}>
                {processing ? (
                  <div className={styles.processingBox}>
                    <Loader2 className={styles.spinner} />
                    Removing background…
                  </div>
                ) : resultUrl ? (
                  <img src={resultUrl} alt="Background removed" className={styles.img} />
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
              First run downloads the AI model (a few MB) — it's cached after that.
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
