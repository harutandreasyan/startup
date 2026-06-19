import { Injectable } from '@nestjs/common';
import type { AiProvider, ProviderResult, ProviderRunInput } from './provider.interface';

/**
 * Pollinations.ai — free, no-API-key image generation. The image URL itself
 * triggers generation on access, so this provider is synchronous: run()
 * returns a 'completed' result immediately with the output URL. No polling.
 *
 * Free tier only supports text-to-image. providerModelId maps to a Pollinations
 * model name (e.g. "flux", "turbo").
 */
@Injectable()
export class PollinationsProvider implements AiProvider {
  readonly name = 'pollinations';
  private readonly baseUrl = 'https://image.pollinations.ai/prompt';

  async run({ providerModelId, input }: ProviderRunInput): Promise<ProviderResult> {
    const prompt = String(input.prompt || '').trim();
    if (!prompt) {
      return { providerJobId: '', status: 'failed', error: 'Prompt is required' };
    }

    const width = Number(input.width) || 1024;
    const height = Number(input.height) || 1024;
    const seed = Number(input.seed) || Math.floor(Math.random() * 1_000_000);

    const params = new URLSearchParams({
      width: String(width),
      height: String(height),
      model: providerModelId || 'flux',
      nologo: 'true',
      seed: String(seed),
    });

    const url = `${this.baseUrl}/${encodeURIComponent(prompt)}?${params.toString()}`;

    return {
      providerJobId: `pollinations_${seed}`,
      status: 'completed',
      outputUrls: [url],
    };
  }

  async checkStatus(jobId: string): Promise<ProviderResult> {
    // Synchronous provider — there is nothing to poll. run() already returned
    // the completed result, so this is only a safety fallback.
    return { providerJobId: jobId, status: 'completed', outputUrls: [] };
  }
}
