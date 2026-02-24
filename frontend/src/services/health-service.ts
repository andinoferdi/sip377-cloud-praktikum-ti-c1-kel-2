import { fetcher } from '@/services/fetcher';

export type HealthResponse = {
  status: 'ok';
  timestamp: string;
};

type HealthOptions = {
  signal?: AbortSignal;
};

export const healthService = {
  getHealth(options: HealthOptions = {}) {
    return fetcher<HealthResponse>('/api/health', {
      signal: options.signal,
    });
  },
};
