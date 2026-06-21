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
import { useAuthStore } from '../stores/auth.store';
import { useModels } from '../hooks/useModels';
import { connectWebSocket, onProgress } from '../lib/websocket';
import { apiErrorMessage, apiErrorStatus } from '../lib/apiError';
import { toast } from '../stores/toast.store';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Select } from '../components/common/Select';

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

export function Generate() {
  const [searchParams] = useSearchParams();
  const type = (searchParams.get('type') || 'TEXT_TO_IMAGE') as GenerationType;
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

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

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/15 transition-all duration-200';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{TYPE_LABELS[type] || 'Generate'}</h1>
          <p className="text-muted text-sm mt-0.5">Describe it, tune it, create it.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-sm font-medium">
          <Gem className="h-4 w-4 text-primary" />
          {user?.creditBalance ?? 0}
        </span>
      </div>

      <Card glow className="p-5 sm:p-6 space-y-5">
        {/* Model */}
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Model</label>
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
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A red fox in a snowy pine forest, cinematic lighting…"
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
        )}

        {needsPrompt && !showNegative && (
          <button
            onClick={() => setShowNegative(true)}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            + Add negative prompt
          </button>
        )}
        {needsPrompt && showNegative && (
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Negative prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, low quality, distorted…"
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        )}

        {needsPrompt && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Size</label>
              <Select value={size} onChange={setSize} options={SIZES.map((s) => ({ value: s.value, label: s.label }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Seed</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Random"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          loading={isBusy}
          leftIcon={!isBusy && <Sparkles className="h-4 w-4" />}
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
        <Card glow className="overflow-hidden animate-scale-in">
          <img src={generation.outputUrls[0]} alt="Generated result" className="w-full" />
          <div className="p-4 flex flex-wrap gap-2.5">
            <Button onClick={handleDownload} leftIcon={<Download className="h-4 w-4" />}>
              Download
            </Button>
            <a href={generation.outputUrls[0]} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" leftIcon={<ExternalLink className="h-4 w-4" />}>
                Open
              </Button>
            </a>
            <Button variant="secondary" onClick={handleGenerate} disabled={isBusy} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Regenerate
            </Button>
            <Button
              variant="secondary"
              onClick={handleUpscale}
              disabled={isBusy}
              leftIcon={<Maximize2 className="h-4 w-4" />}
              title="Premium model — requires Replicate billing"
              className="ml-auto"
            >
              Upscale
            </Button>
          </div>
        </Card>
      )}

      {generation?.status === 'FAILED' && (
        <Card className="p-4 border-danger/30 animate-fade-in-up">
          <div className="flex items-start gap-2 text-danger text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Generation failed: {generation.errorMessage || 'Unknown error'}. Your credits were refunded.
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
