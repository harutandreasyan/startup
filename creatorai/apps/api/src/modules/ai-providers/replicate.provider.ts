import { Injectable, Logger } from '@nestjs/common';
import Replicate from 'replicate';
import type { AiProvider, ProviderResult, ProviderRunInput, ProviderStatus } from './provider.interface';

@Injectable()
export class ReplicateProvider implements AiProvider {
  readonly name = 'replicate';
  private readonly logger = new Logger(ReplicateProvider.name);
  private client = new Replicate({ auth: process.env.REPLICATE_API_TOKEN || '' });

  async run({ providerModelId, input }: ProviderRunInput): Promise<ProviderResult> {
    // providerModelId may be "owner/name" or "owner/name:version"
    const [model, version] = providerModelId.split(':');

    const prediction = version
      ? await this.client.predictions.create({ version, input })
      : await this.client.predictions.create({ model, input });

    return {
      providerJobId: prediction.id,
      status: this.mapStatus(prediction.status),
    };
  }

  async checkStatus(jobId: string): Promise<ProviderResult> {
    const prediction = await this.client.predictions.get(jobId);
    return {
      providerJobId: jobId,
      status: this.mapStatus(prediction.status),
      outputUrls: this.normalizeOutput(prediction.output),
      error: prediction.error ? String(prediction.error) : undefined,
    };
  }

  private mapStatus(status: string): ProviderStatus {
    switch (status) {
      case 'starting':
        return 'starting';
      case 'processing':
        return 'processing';
      case 'succeeded':
        return 'completed';
      case 'failed':
      case 'canceled':
        return 'failed';
      default:
        return 'processing';
    }
  }

  private normalizeOutput(output: unknown): string[] | undefined {
    if (!output) return undefined;
    if (typeof output === 'string') return [output];
    if (Array.isArray(output)) return output.filter((o) => typeof o === 'string');
    return undefined;
  }
}
