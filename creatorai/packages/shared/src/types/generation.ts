export type GenerationType =
  | 'TEXT_TO_IMAGE'
  | 'IMAGE_TO_IMAGE'
  | 'TEXT_TO_VIDEO'
  | 'IMAGE_TO_VIDEO'
  | 'TEXT_TO_3D'
  | 'BACKGROUND_REMOVAL'
  | 'UPSCALE'
  | 'INPAINT'
  | 'STYLE_TRANSFER';

export type GenerationStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface GenerationRequest {
  type: GenerationType;
  model: string;
  prompt?: string;
  negativePrompt?: string;
  inputImageUrl?: string;
  params?: Record<string, unknown>;
}

export interface Generation {
  id: string;
  userId: string;
  type: GenerationType;
  status: GenerationStatus;
  prompt: string | null;
  negativePrompt: string | null;
  inputImageUrl: string | null;
  model: string;
  params: Record<string, unknown>;
  outputUrls: string[];
  thumbnailUrl: string | null;
  creditsCost: number;
  errorMessage: string | null;
  processingMs: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface GenerationProgress {
  generationId: string;
  status: GenerationStatus;
  progress?: number;
  outputUrls?: string[];
  error?: string;
}
