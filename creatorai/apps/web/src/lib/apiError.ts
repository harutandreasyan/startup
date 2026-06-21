interface ApiErrorShape {
  response?: {
    status?: number;
    data?: { message?: string };
  };
}

function asApiError(err: unknown): ApiErrorShape {
  return (err && typeof err === 'object' ? err : {}) as ApiErrorShape;
}

export function apiErrorStatus(err: unknown): number | undefined {
  return asApiError(err).response?.status;
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  return asApiError(err).response?.data?.message || fallback;
}
