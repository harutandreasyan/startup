import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Download,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Gem,
  AlertCircle,
} from 'lucide-react';
import { createGeneration, getGeneration, getMe } from '@creatorai/api-client';
import type { Generation, GenerationType } from '@creatorai/shared';
import { useAuthStore } from '../../stores/auth.store';
import { useModels } from '../../hooks/useModels';
import { connectWebSocket, onProgress } from '../../lib/websocket';
import { apiErrorMessage, apiErrorStatus } from '../../lib/apiError';
import { toast } from '../../stores/toast.store';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import { useStyles } from '../../lib/useStyles';
import { generateStyles } from './styles';

const TYPE_LABELS: Record<string, string> = {
  TEXT_TO_IMAGE: 'Text to Image',
  TEXT_TO_VIDEO: 'Text to Video',
  TEXT_TO_3D: 'Text to 3D',
  BACKGROUND_REMOVAL: 'Remove Background',
  UPSCALE: 'Upscale',
  INPAINT: 'Inpaint / Edit',
};

const PROMPTLESS_TYPES = new Set(['BACKGROUND_REMOVAL', 'UPSCALE']);

const SIZES = [
  { value: '1024x1024', label: 'Square · 1024' },
  { value: '768x1024', label: 'Portrait · 768×1024' },
  { value: '1024x768', label: 'Landscape · 1024×768' },
  { value: '512x512', label: 'Small · 512' },
];

export default function Generate() {
  const [searchParams] = useSearchParams();
  const type = (searchParams.get('type') || 'TEXT_TO_IMAGE') as GenerationType;
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const s = useStyles(generateStyles);

  const { data: models, isLoading: modelsLoading } = useModels(type);

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  const [size, setSize] = useState('1024x1024');
  const [seed, setSeed] = useState('');
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [error, setError] = useState('');

  const needsPrompt = !PROMPTLESS_TYPES.has(type);
  const effectiveModelSlug = selectedModel || models?.[0]?.slug || '';
  const currentModel = useMemo(
    () => models?.find((m) => m.slug === effectiveModelSlug) || models?.[0],
    [models, effectiveModelSlug],
  );

  const refreshBalance = async () => {
    try {
      setUser(await getMe());
    } catch {
      /* ignore */
    }
  };

  const onTerminal = (status?: string) => {
    refreshBalance();
    queryClient.invalidateQueries({ queryKey: ['generations'] });
    if (status === 'COMPLETED') toast.success('Your creation is ready');
    else if (status === 'FAILED') toast.error('Generation failed — credits refunded');
  };

  useEffect(() => {
    connectWebSocket();
    const unsub = onProgress((p) => {
      let becameTerminal = false;
      setGeneration((prev) => {
        if (!prev || p.generationId !== prev.id) return prev;
        if (p.status === 'COMPLETED' || p.status === 'FAILED') becameTerminal = true;
        return {
          ...prev,
          status: p.status,
          outputUrls: p.outputUrls ?? prev.outputUrls,
          errorMessage: p.error ?? prev.errorMessage,
        };
      });
      if (becameTerminal) onTerminal(p.status);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = generation?.id;
    const status = generation?.status;
    if (!id || (status !== 'QUEUED' && status !== 'PROCESSING')) return;
    const interval = setInterval(async () => {
      try {
        const fresh = await getGeneration(id);
        setGeneration(fresh);
        if (fresh.status === 'COMPLETED' || fresh.status === 'FAILED') {
          clearInterval(interval);
          onTerminal(fresh.status);
        }
      } catch {
        /* keep polling */
      }
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation?.id, generation?.status]);

  const isBusy = generation?.status === 'QUEUED' || generation?.status === 'PROCESSING';

  const handleGenerate = async () => {
    if (!currentModel) return;
    if (needsPrompt && !prompt.trim()) return;
    setError('');
    try {
      const [width, height] = size.split('x').map(Number);
      const params: Record<string, unknown> = {};
      if (needsPrompt) {
        params.width = width;
        params.height = height;
        if (seed.trim()) params.seed = Number(seed);
      }
      const result = await createGeneration({
        type,
        model: currentModel.slug,
        prompt: needsPrompt ? prompt : undefined,
        negativePrompt: negativePrompt || undefined,
        params,
      });
      setGeneration(result);
      refreshBalance();
    } catch (err) {
      if (apiErrorStatus(err) === 402) setError('Not enough credits. Top up to keep creating.');
      else setError(apiErrorMessage(err, 'Generation failed to start.'));
    }
  };

  const handleDownload = async () => {
    const url = generation?.outputUrls[0];
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `creatorai-${generation?.id || 'image'}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success('Image downloaded');
    } catch {
      window.open(url, '_blank', 'noopener');
      toast.info('Opened image in a new tab');
    }
  };

  const handleUpscale = async () => {
    const url = generation?.outputUrls[0];
    if (!url) return;
    setError('');
    try {
      const result = await createGeneration({ type: 'UPSCALE', model: 'real-esrgan', inputImageUrl: url });
      setGeneration(result);
      refreshBalance();
    } catch (err) {
      if (apiErrorStatus(err) === 402) setError('Not enough credits to upscale.');
      else setError(apiErrorMessage(err, 'Upscale failed to start.'));
    }
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>{TYPE_LABELS[type] || 'Generate'}</h1>
          <p className={s.subtitle}>Describe it, tune it, create it.</p>
        </div>
        <span className={s.creditPill}>
          <Gem className={s.creditIcon} />
          {user?.creditBalance ?? 0}
        </span>
      </div>

      <Card glow className={s.card}>
        {/* Model */}
        <div>
          <label className={s.fieldLabel}>Model</label>
          <Select
            value={effectiveModelSlug}
            onChange={setSelectedModel}
            disabled={modelsLoading || !models?.length}
            placeholder={modelsLoading ? 'Loading models…' : 'No models available'}
            options={(models ?? []).map((m) => ({ value: m.slug, label: m.name, hint: `${m.creditCost} credits` }))}
          />
        </div>

        {needsPrompt && (
          <div>
            <label className={s.fieldLabel}>Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A red fox in a snowy pine forest, cinematic lighting…"
              rows={4}
              className={s.textarea}
            />
          </div>
        )}

        {needsPrompt && !showNegative && (
          <button
            onClick={() => setShowNegative(true)}
            className={s.negativeToggle}
          >
            + Add negative prompt
          </button>
        )}
        {needsPrompt && showNegative && (
          <div>
            <label className={s.fieldLabel}>Negative prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, low quality, distorted…"
              rows={2}
              className={s.textarea}
            />
          </div>
        )}

        {needsPrompt && (
          <div className={s.grid}>
            <div>
              <label className={s.fieldLabel}>Size</label>
              <Select value={size} onChange={setSize} options={SIZES.map((sz) => ({ value: sz.value, label: sz.label }))} />
            </div>
            <div>
              <label className={s.fieldLabel}>Seed</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Random"
                className={s.input}
              />
            </div>
          </div>
        )}

        {error && (
          <div className={s.errorBox}>
            <AlertCircle className={s.errorIcon} />
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          loading={isBusy}
          leftIcon={!isBusy && <Sparkles className={s.generateIcon} />}
          size="lg"
          fullWidth
          disabled={isBusy || !currentModel || (needsPrompt && !prompt.trim())}
        >
          {isBusy
            ? generation?.status === 'QUEUED'
              ? 'Queued…'
              : 'Generating…'
            : `Generate${currentModel ? ` · ${currentModel.creditCost} credits` : ''}`}
        </Button>
      </Card>

      {/* Result */}
      {generation?.status === 'COMPLETED' && generation.outputUrls[0] && (
        <Card glow className={s.resultCard}>
          <img src={generation.outputUrls[0]} alt="Generated result" className={s.resultImage} />
          <div className={s.resultActions}>
            <Button onClick={handleDownload} leftIcon={<Download className={s.actionIcon} />}>
              Download
            </Button>
            <a href={generation.outputUrls[0]} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" leftIcon={<ExternalLink className={s.actionIcon} />}>
                Open
              </Button>
            </a>
            <Button variant="secondary" onClick={handleGenerate} disabled={isBusy} leftIcon={<RefreshCw className={s.actionIcon} />}>
              Regenerate
            </Button>
            <Button
              variant="secondary"
              onClick={handleUpscale}
              disabled={isBusy}
              leftIcon={<Maximize2 className={s.actionIcon} />}
              title="Premium model — requires Replicate billing"
              className={s.upscaleBtn}
            >
              Upscale
            </Button>
          </div>
        </Card>
      )}

      {generation?.status === 'FAILED' && (
        <Card className={s.failedCard}>
          <div className={s.failedRow}>
            <AlertCircle className={s.failedIcon} />
            <span>
              Generation failed: {generation.errorMessage || 'Unknown error'}. Your credits were refunded.
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
