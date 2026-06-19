import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createGeneration, getGeneration, getMe } from '@creatorai/api-client';
import type { Generation, GenerationType } from '@creatorai/shared';
import { useAuthStore } from '../stores/auth.store';
import { useModels } from '../hooks/useModels';
import { connectWebSocket, onProgress } from '../lib/websocket';

const TYPE_LABELS: Record<string, string> = {
  TEXT_TO_IMAGE: 'Text to Image',
  TEXT_TO_VIDEO: 'Text to Video',
  TEXT_TO_3D: 'Text to 3D',
  BACKGROUND_REMOVAL: 'Remove Background',
  UPSCALE: 'Upscale',
  INPAINT: 'Inpaint / Edit',
};

const PROMPTLESS_TYPES = new Set(['BACKGROUND_REMOVAL', 'UPSCALE']);

export function Generate() {
  const [searchParams] = useSearchParams();
  const type = (searchParams.get('type') || 'TEXT_TO_IMAGE') as GenerationType;
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: models, isLoading: modelsLoading } = useModels(type);

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [error, setError] = useState('');

  const setUser = useAuthStore((s) => s.setUser);

  const needsPrompt = !PROMPTLESS_TYPES.has(type);
  const currentModel = useMemo(
    () => models?.find((m) => m.slug === selectedModel) || models?.[0],
    [models, selectedModel],
  );

  useEffect(() => {
    if (models?.length && !selectedModel) setSelectedModel(models[0].slug);
  }, [models, selectedModel]);

  // Refetch the user profile so the credit balance shown in the UI stays current
  const refreshBalance = async () => {
    try {
      setUser(await getMe());
    } catch {
      // ignore — balance will refresh on next navigation
    }
  };

  const onTerminal = () => {
    refreshBalance();
    queryClient.invalidateQueries({ queryKey: ['generations'] });
  };

  // Subscribe to live progress updates (instant path)
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
      if (becameTerminal) onTerminal();
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling fallback — guarantees the UI resolves even if the WebSocket drops.
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
          onTerminal();
        }
      } catch {
        // keep polling
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
      const result = await createGeneration({
        type,
        model: currentModel.slug,
        prompt: needsPrompt ? prompt : undefined,
        negativePrompt: negativePrompt || undefined,
      });
      setGeneration(result);
      refreshBalance(); // credits are debited on submit
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 402) setError('Not enough credits. Top up to keep creating.');
      else setError(err?.response?.data?.message || 'Generation failed to start.');
    }
  };

  // Download the result to the user's device (works cross-origin since the
  // image host sends Access-Control-Allow-Origin: *).
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
    } catch {
      window.open(url, '_blank', 'noopener'); // fallback: open in a new tab
    }
  };

  // Re-run the same prompt with a fresh random seed (free with Pollinations).
  const handleRegenerate = () => {
    handleGenerate();
  };

  // Upscale the current result. Uses a premium (Replicate) model — requires billing.
  const handleUpscale = async () => {
    const url = generation?.outputUrls[0];
    if (!url) return;
    setError('');
    try {
      const result = await createGeneration({
        type: 'UPSCALE',
        model: 'real-esrgan',
        inputImageUrl: url,
      });
      setGeneration(result);
      refreshBalance();
    } catch (err: any) {
      if (err?.response?.status === 402) {
        setError('Not enough credits to upscale.');
      } else {
        setError(err?.response?.data?.message || 'Upscale failed to start.');
      }
    }
  };

  return (
    <div className="text-white max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{TYPE_LABELS[type] || 'Generate'}</h1>
        <span className="text-sm text-gray-400">💎 {user?.creditBalance ?? 0} credits</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={modelsLoading || !models?.length}
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {modelsLoading && <option>Loading models…</option>}
            {!modelsLoading && !models?.length && <option>No models available</option>}
            {models?.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name} — {m.creditCost} credits
              </option>
            ))}
          </select>
        </div>

        {needsPrompt && (
          <div>
            <label className="block text-sm text-gray-300 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              rows={4}
              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        )}

        {needsPrompt && !showNegative && (
          <button onClick={() => setShowNegative(true)} className="text-sm text-gray-400 hover:text-gray-300">
            + Negative prompt
          </button>
        )}
        {needsPrompt && showNegative && (
          <div>
            <label className="block text-sm text-gray-300 mb-2">Negative Prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to exclude from the generation..."
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isBusy || !currentModel || (needsPrompt && !prompt.trim())}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          {isBusy ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              {generation?.status === 'QUEUED' ? 'Queued…' : 'Generating…'}
            </span>
          ) : (
            `Generate${currentModel ? ` — ${currentModel.creditCost} credits` : ''}`
          )}
        </button>
      </div>

      {generation?.status === 'COMPLETED' && generation.outputUrls[0] && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Result</h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <img src={generation.outputUrls[0]} alt="Generated" className="w-full" />
            <div className="p-4 flex flex-wrap gap-3">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
              >
                Download
              </button>
              <a
                href={generation.outputUrls[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                Open full size
              </a>
              <button
                onClick={handleRegenerate}
                disabled={isBusy}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={handleUpscale}
                disabled={isBusy}
                title="Enhances resolution using a premium model (requires Replicate billing)"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
              >
                Upscale ✦
              </button>
            </div>
          </div>
        </div>
      )}

      {generation?.status === 'FAILED' && (
        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          Generation failed: {generation.errorMessage || 'Unknown error'}. Your credits were refunded.
        </div>
      )}
    </div>
  );
}
