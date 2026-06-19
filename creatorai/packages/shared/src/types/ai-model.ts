import type { GenerationType } from './generation';

export interface AiModel {
  id: string;
  slug: string;
  name: string;
  provider: string;
  type: GenerationType;
  creditCost: number;
  description: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  paramsSchema: Record<string, unknown> | null;
}
