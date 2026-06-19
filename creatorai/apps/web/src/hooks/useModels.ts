import { useQuery } from '@tanstack/react-query';
import { listModels } from '@creatorai/api-client';
import type { GenerationType } from '@creatorai/shared';

export function useModels(type?: GenerationType) {
  return useQuery({
    queryKey: ['models', type],
    queryFn: () => listModels(type),
    staleTime: 5 * 60_000,
  });
}
