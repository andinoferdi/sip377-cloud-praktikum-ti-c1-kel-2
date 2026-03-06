import { useEffect, useState } from 'react';
import { getAccelLatest, AccelLatestResponse } from '@/services/accelerometer-service';

export interface UseAccelLatestOptions {
  deviceId: string;
  enabled?: boolean;
  pollingIntervalMs?: number; // default: 2000ms
}

export function useAccelLatest({
  deviceId,
  enabled = true,
  pollingIntervalMs = 2000,
}: UseAccelLatestOptions) {
  const [data, setData] = useState<AccelLatestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !deviceId) {
      return;
    }

    let mounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchLatest = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAccelLatest(deviceId);

        if (!mounted) return;

        if (response.ok && response.data) {
          setData(response.data);
        } else {
          setError(response.error || 'Gagal mengambil data');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Error tidak diketahui');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Fetch immediately
    fetchLatest();

    // Set up polling
    intervalId = setInterval(fetchLatest, pollingIntervalMs);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [deviceId, enabled, pollingIntervalMs]);

  return { data, loading, error };
}
