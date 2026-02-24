'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { healthService } from '@/services/health-service';

export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health.status(),
    queryFn: ({ signal }) => healthService.getHealth({ signal }),
  });
}
