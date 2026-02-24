'use client';

import { useHealthQuery } from '@/hooks/use-health-query';
import { getErrorMessage } from '@/lib/errors';
import ComponentCard from '@/features/dashboard/components/common/ComponentCard';

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

export default function HealthStatusCard() {
  const { data, isLoading, isError, error, isFetching } = useHealthQuery();

  if (isLoading) {
    return (
      <ComponentCard title="API Health">
        <p className="text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">Checking API status...</p>
      </ComponentCard>
    );
  }

  if (isError) {
    return (
      <ComponentCard title="API Health">
        <p className="text-sm text-error-600 dark:text-error-400">{getErrorMessage(error)}</p>
      </ComponentCard>
    );
  }

  if (!data) {
    return (
      <ComponentCard title="API Health">
        <p className="text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">No data available.</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="API Health">
      <div className="space-y-1">
        <p className="text-sm text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
          Status: <span className="font-semibold">{data.status.toUpperCase()}</span>
        </p>
        <p className="text-xs text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
          Updated: {formatTimestamp(data.timestamp)}
        </p>
        {isFetching && <p className="text-xs text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">Refreshing...</p>}
      </div>
    </ComponentCard>
  );
}
