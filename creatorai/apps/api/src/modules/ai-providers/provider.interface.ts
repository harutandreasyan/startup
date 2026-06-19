export type ProviderStatus = 'starting' | 'processing' | 'completed' | 'failed';

export interface ProviderRunInput {
  providerModelId: string;
  input: Record<string, unknown>;
}

export interface ProviderResult {
  providerJobId: string;
  status: ProviderStatus;
  outputUrls?: string[];
  error?: string;
}

export interface AiProvider {
  readonly name: string;
  run(input: ProviderRunInput): Promise<ProviderResult>;
  checkStatus(jobId: string): Promise<ProviderResult>;
}
