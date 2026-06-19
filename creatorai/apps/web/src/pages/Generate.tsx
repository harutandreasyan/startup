import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

const MODEL_OPTIONS = [
  { slug: 'flux-schnell', name: 'Flux Schnell', credits: 2, type: 'TEXT_TO_IMAGE' },
  { slug: 'flux-dev', name: 'Flux Dev', credits: 4, type: 'TEXT_TO_IMAGE' },
  { slug: 'sdxl', name: 'Stable Diffusion XL', credits: 3, type: 'TEXT_TO_IMAGE' },
];

export function Generate() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TEXT_TO_IMAGE';
  const user = useAuthStore((s) => s.user);

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].slug);
  const [showNegative, setShowNegative] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const currentModel = MODEL_OPTIONS.find((m) => m.slug === selectedModel) || MODEL_OPTIONS[0];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setResult(null);

    // TODO: Replace with actual API call
    // const generation = await createGeneration({
    //   type: type as GenerationType,
    //   model: selectedModel,
    //   prompt,
    //   negativePrompt: negativePrompt || undefined,
    // });

    // Simulate for now
    await new Promise((r) => setTimeout(r, 2000));
    setResult('https://placehold.co/1024x1024/1a1a2e/8b5cf6?text=AI+Generated');
    setGenerating(false);
  };

  return (
    <div className="text-white max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Generate</h1>
        <span className="text-sm text-gray-400">
          💎 {user?.creditBalance ?? 0} credits
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {MODEL_OPTIONS.filter((m) => m.type === type).map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name} — {m.credits} credits
              </option>
            ))}
          </select>
        </div>

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

        {!showNegative ? (
          <button
            onClick={() => setShowNegative(true)}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            + Negative prompt
          </button>
        ) : (
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

        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Generating...
            </span>
          ) : (
            `Generate — ${currentModel.credits} credits`
          )}
        </button>
      </div>

      {result && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Result</h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <img src={result} alt="Generated" className="w-full" />
            <div className="p-4 flex gap-3">
              <a
                href={result}
                download
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                Download
              </a>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                Upscale
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                Remix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
