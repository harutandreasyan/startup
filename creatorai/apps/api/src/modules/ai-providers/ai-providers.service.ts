import { Injectable } from '@nestjs/common';
import { ReplicateProvider } from './replicate.provider';
import { PollinationsProvider } from './pollinations.provider';
import type { AiProvider, ProviderResult, ProviderRunInput } from './provider.interface';

@Injectable()
export class AiProvidersService {
  private providers: Record<string, AiProvider>;

  constructor(
    private replicate: ReplicateProvider,
    private pollinations: PollinationsProvider,
  ) {
    this.providers = {
      [this.replicate.name]: this.replicate,
      [this.pollinations.name]: this.pollinations,
    };
  }

  private getProvider(name: string): AiProvider {
    const provider = this.providers[name];
    if (!provider) throw new Error(`Unknown AI provider: ${name}`);
    return provider;
  }

  run(providerName: string, input: ProviderRunInput): Promise<ProviderResult> {
    return this.getProvider(providerName).run(input);
  }

  checkStatus(providerName: string, jobId: string): Promise<ProviderResult> {
    return this.getProvider(providerName).checkStatus(jobId);
  }
}
