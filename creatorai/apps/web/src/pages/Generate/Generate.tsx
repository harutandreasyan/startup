import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Download,
  ExternalLink,
  RefreshCw,
  Gem,
  AlertCircle,
  Rocket,
} from 'lucide-react';
import { createGeneration, getGeneration, getMe } from '@creatorai/api-client';
import type { Generation, GenerationType } from '@creatorai/shared';
import { useAuthStore } from '../../stores/auth.store';
import { useModels } from '../../hooks/useModels';
import { connectWebSocket, onProgress } from '../../lib/websocket';
import { apiErrorMessage, apiErrorStatus } from '../../lib/apiError';
import { toast } from '../../stores/toast.store';
import { isTypeAvailable, STYLE_PRESETS, applyStyle, TYPE_LABELS } from '../../lib/generation';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import { useStyles } from '../../lib/useStyles';
import { generateStyles } from './styles';

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

  const styles = useStyles(generateStyles);

  const { data: models, isLoading: modelsLoading } = useModels(type);

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  const [styleId, setStyleId] = useState('none');
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
      const styledPrompt = applyStyle(prompt, STYLE_PRESETS.find((p) => p.id === styleId));
      const result = await createGeneration({
        type,
        model: currentModel.slug,
        prompt: needsPrompt ? styledPrompt : undefined,
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

  if (!isTypeAvailable(type)) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{TYPE_LABELS[type] || 'Generate'}</h1>
            <p className={styles.subtitle}>Describe it, tune it, create it.</p>
          </div>
          <span className={styles.creditPill}>
            <Gem className={styles.creditIcon} />
            {user?.creditBalance ?? 0}
          </span>
        </div>

        <Card glow className={styles.comingSoonCard}>
          <div className={styles.comingSoonIconWrap}>
            <Rocket className={styles.comingSoonIcon} />
          </div>
          <h2 className={styles.comingSoonTitle}>{TYPE_LABELS[type] || 'This tool'} is coming soon</h2>
          <p className={styles.comingSoonText}>
            We're putting the finishing touches on this tool. In the meantime, Text to Image is live
            and free — give it a try.
          </p>
          <div className={styles.comingSoonActions}>
            <Link to="/generate?type=TEXT_TO_IMAGE">
              <Button leftIcon={<Sparkles className={styles.generateIcon} />}>Try Text to Image</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary">Back to dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{TYPE_LABELS[type] || 'Generate'}</h1>
          <p className={styles.subtitle}>Describe it, tune it, create it.</p>
        </div>
        <span className={styles.creditPill}>
          <Gem className={styles.creditIcon} />
          {user?.creditBalance ?? 0}
        </span>
      </div>

      <Card glow className={styles.card}>
        {/* Model */}
        <div>
          <label className={styles.fieldLabel}>Model</label>
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
            <label className={styles.fieldLabel}>Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A red fox in a snowy pine forest, cinematic lighting…"
              rows={4}
              className={styles.textarea}
            />
          </div>
        )}

        {needsPrompt && !showNegative && (
          <button
            onClick={() => setShowNegative(true)}
            className={styles.negativeToggle}
          >
            + Add negative prompt
          </button>
        )}
        {needsPrompt && showNegative && (
          <div>
            <label className={styles.fieldLabel}>Negative prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, low quality, distorted…"
              rows={2}
              className={styles.textarea}
            />
          </div>
        )}

        {needsPrompt && (
          <div>
            <label className={styles.fieldLabel}>Style</label>
            <div className={styles.styleRow}>
              {STYLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setStyleId(p.id)}
                  className={styles.styleChip(styleId === p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {needsPrompt && (
          <div className={styles.grid}>
            <div>
              <label className={styles.fieldLabel}>Size</label>
              <Select value={size} onChange={setSize} options={SIZES.map((sz) => ({ value: sz.value, label: sz.label }))} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Seed</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Random"
                className={styles.input}
              />
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle className={styles.errorIcon} />
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          loading={isBusy}
          leftIcon={!isBusy && <Sparkles className={styles.generateIcon} />}
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
        <Card glow className={styles.resultCard}>
          <img src={generation.outputUrls[0]} alt="Generated result" className={styles.resultImage} />
          <div className={styles.resultActions}>
            <Button onClick={handleDownload} leftIcon={<Download className={styles.actionIcon} />}>
              Download
            </Button>
            <a href={generation.outputUrls[0]} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" leftIcon={<ExternalLink className={styles.actionIcon} />}>
                Open
              </Button>
            </a>
            <Button variant="secondary" onClick={handleGenerate} disabled={isBusy} leftIcon={<RefreshCw className={styles.actionIcon} />}>
              Regenerate
            </Button>
          </div>
        </Card>
      )}

      {generation?.status === 'FAILED' && (
        <Card className={styles.failedCard}>
          <div className={styles.failedRow}>
            <AlertCircle className={styles.failedIcon} />
            <span>
              Generation failed: {generation.errorMessage || 'Unknown error'}. Your credits were refunded.
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
