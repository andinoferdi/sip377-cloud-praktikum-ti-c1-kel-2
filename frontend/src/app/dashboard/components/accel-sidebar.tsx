"use client";

import { Activity } from "lucide-react";
import { useAccelLatest } from "@/hooks/use-accel-latest";

interface AccelSidebarProps {
  deviceId: string;
  title?: string;
  pollingIntervalMs?: number;
}

export function AccelSidebar({
  deviceId,
  title = "Accelerometer",
  pollingIntervalMs = 2000,
}: AccelSidebarProps) {
  const { data, loading, error } = useAccelLatest({
    deviceId,
    enabled: !!deviceId,
    pollingIntervalMs,
  });

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return "—";
    return value.toFixed(2);
  };

  const formatTimestamp = (ts: string | undefined) => {
    if (!ts) return "—";
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="rounded-lg border border-(--token-gray-300) bg-(--token-white-90) p-4 shadow-sm dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle)">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
          {title}
        </h3>
        {loading && (
          <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        )}
      </div>

      {/* Device ID Info */}
      <div className="mb-4 rounded-md bg-(--token-gray-100) p-2 dark:bg-(--color-surface-dark-muted)">
        <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
          Device ID
        </p>
        <p className="font-mono text-sm font-medium text-(--token-gray-900) dark:text-(--token-white)">
          {deviceId}
        </p>
      </div>

      {/* Error State */}
      {error && !data && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Data Grid */}
      {data ? (
        <div className="space-y-3">
          {/* Axes Values */}
          <div className="grid grid-cols-3 gap-2">
            {/* X Axis */}
            <div className="rounded-md bg-(--token-gray-100) p-2 dark:bg-(--color-surface-dark-muted)">
              <p className="text-xs font-semibold uppercase text-(--token-gray-500) dark:text-(--token-gray-400)">
                X
              </p>
              <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatValue(data.x)}
              </p>
            </div>

            {/* Y Axis */}
            <div className="rounded-md bg-(--token-gray-100) p-2 dark:bg-(--color-surface-dark-muted)">
              <p className="text-xs font-semibold uppercase text-(--token-gray-500) dark:text-(--token-gray-400)">
                Y
              </p>
              <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">
                {formatValue(data.y)}
              </p>
            </div>

            {/* Z Axis */}
            <div className="rounded-md bg-(--token-gray-100) p-2 dark:bg-(--color-surface-dark-muted)">
              <p className="text-xs font-semibold uppercase text-(--token-gray-500) dark:text-(--token-gray-400)">
                Z
              </p>
              <p className="mt-1 text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatValue(data.z)}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="rounded-md bg-(--token-gray-100) p-2 dark:bg-(--color-surface-dark-muted)">
            <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
              Last Update
            </p>
            <p className="mt-1 font-mono text-xs font-medium text-(--token-gray-900) dark:text-(--token-white)">
              {formatTimestamp(data.t)}
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400" />
        </div>
      ) : (
        <div className="rounded-md bg-(--token-gray-100) p-3 text-center text-sm text-(--token-gray-500) dark:bg-(--color-surface-dark-muted) dark:text-(--token-gray-400)">
          Tidak ada data
        </div>
      )}

      {/* Status Info */}
      {data && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
          ✓ Data sedang dipantau secara real-time
        </div>
      )}
    </div>
  );
}
