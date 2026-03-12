"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Database, RefreshCw, Waves } from "lucide-react";
import {
  accelerometerService,
  type AccelerometerSample,
} from "@/services/accelerometer-service";
import { hasGasBaseUrl } from "@/services/gas-client";
import { getOrCreateTelemetryDeviceId } from "@/utils/telemetry-device-id";
import {
  applyReceiverDeviceSelection,
  createInitialReceiverBindingState,
} from "@/utils/accelerometer-receiver";
import TelemetryChart from "./telemetry-chart";

const CARD_CLASS = "overflow-hidden rounded-2xl border border-soft surface-elevated";
const LABEL_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }
  return value.toFixed(3);
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-soft bg-(--token-gray-50) p-4 dark:bg-(--token-white-5)">
      <p className={LABEL_CLASS}>{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function buildHistoryWindow(limit: number) {
  const now = Date.now();
  const from = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const to = new Date(now).toISOString();
  return { from, to, limit };
}

export default function AccelerometerReceiverClient() {
  const [binding, setBinding] = useState(createInitialReceiverBindingState);
  const [historyLimit] = useState(200);
  const hasBackend = hasGasBaseUrl();

  useEffect(() => {
    const localDeviceId = getOrCreateTelemetryDeviceId();
    setBinding({
      draftDeviceId: localDeviceId,
      activeDeviceId: localDeviceId,
    });
  }, []);

  const latestQuery = useQuery({
    queryKey: ["accelerometer-receiver-latest", binding.activeDeviceId],
    enabled: hasBackend && !!binding.activeDeviceId,
    queryFn: async () => {
      const response = await accelerometerService.getLatestTelemetry(
        binding.activeDeviceId,
      );
      if (!response.ok) {
        throw new Error(response.error ?? "latest telemetry gagal");
      }
      return response.data;
    },
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const historyQuery = useQuery({
    queryKey: [
      "accelerometer-receiver-history",
      binding.activeDeviceId,
      historyLimit,
    ],
    enabled: hasBackend && !!binding.activeDeviceId,
    queryFn: async () => {
      const window = buildHistoryWindow(historyLimit);
      const response = await accelerometerService.getTelemetryHistory({
        deviceId: binding.activeDeviceId,
        limit: window.limit,
        from: window.from,
        to: window.to,
      });
      if (!response.ok) {
        throw new Error(response.error ?? "history telemetry gagal");
      }
      return response.data;
    },
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const history = useMemo<AccelerometerSample[]>(
    () => historyQuery.data?.items ?? [],
    [historyQuery.data],
  );
  const latestFromHistory = history.length > 0 ? history[history.length - 1] : null;
  const latestSample = latestQuery.data ?? latestFromHistory ?? null;

  const activeDeviceEmpty = !binding.activeDeviceId;
  const activeAndDraftMatch = binding.activeDeviceId === binding.draftDeviceId.trim();

  return (
    <section className="py-10 md:py-14">
      <div className="wrapper">
        <div className="grid gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-500 dark:text-primary-400"
              >
                <ArrowLeft size={16} />
                Kembali ke Home
              </Link>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                  Modul 02 - Receiver
                </p>
                <h1 className="mt-2 text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white) md:text-3xl">
                  Accelerometer Receiver
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Halaman ini tidak membaca sensor lokal. Data chart dan nilai
                  X, Y, Z hanya dari backend GAS untuk device_id terpilih.
                </p>
                <div className="mt-2">
                  <Link
                    href="/accelerometer/sender"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Buka Sender
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-soft surface-elevated px-4 py-3 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
              <p className="font-semibold text-(--token-gray-800) dark:text-(--token-gray-100)">
                active device_id
              </p>
              <p className="mt-1 font-mono text-xs">
                {binding.activeDeviceId || "-- belum di-set --"}
              </p>
            </div>
          </div>

          <div className={`${CARD_CLASS} p-5`}>
            <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
              Device Binding Receiver
            </p>
            <p className="mt-2 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
              Paste device_id dari sender lalu tekan Apply agar receiver membaca
              stream backend yang benar.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input
                value={binding.draftDeviceId}
                onChange={(event) =>
                  setBinding((previous) => ({
                    ...previous,
                    draftDeviceId: event.target.value,
                  }))
                }
                placeholder="telemetry-web-xxxxxx"
                className="h-10 rounded-lg border border-soft bg-transparent px-3 text-sm outline-none ring-primary-500 focus:ring-2"
              />
              <button
                type="button"
                onClick={() =>
                  setBinding((previous) => ({
                    ...previous,
                    activeDeviceId: applyReceiverDeviceSelection(
                      previous.draftDeviceId,
                    ),
                  }))
                }
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  const localDeviceId = getOrCreateTelemetryDeviceId();
                  setBinding({
                    draftDeviceId: localDeviceId,
                    activeDeviceId: localDeviceId,
                  });
                }}
                className="inline-flex items-center justify-center rounded-lg border border-soft px-4 py-2 text-sm font-semibold text-(--token-gray-700) hover:bg-(--token-gray-100) dark:text-(--token-gray-200) dark:hover:bg-(--token-white-5)"
              >
                Reset Local
              </button>
            </div>
            {!activeAndDraftMatch ? (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
                Perubahan device_id belum aktif. Klik Apply.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={`${CARD_CLASS} p-5`}>
              <div className="flex items-center gap-2">
                <Database size={16} className="text-primary-500" />
                <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Sumber Data
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-(--token-gray-500) dark:text-(--token-gray-400)">
                {hasBackend
                  ? "Polling latest dan history berjalan setiap 2 detik dari backend GAS."
                  : "NEXT_PUBLIC_GAS_BASE_URL belum diatur. Receiver tidak dapat memuat data."}
              </p>
            </div>

            <div className={`${CARD_CLASS} p-5`}>
              <div className="flex items-center gap-2">
                <Waves size={16} className="text-primary-500" />
                <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Status Receiver
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-(--token-gray-500) dark:text-(--token-gray-400)">
                {activeDeviceEmpty
                  ? "Set device_id terlebih dahulu untuk mulai membaca backend."
                  : historyQuery.isFetching || latestQuery.isFetching
                    ? "Memperbarui data backend..."
                    : "Data backend sinkron untuk device_id terpilih."}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <div className={`${CARD_CLASS} p-6`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                    Grafik Telemetry Backend
                  </p>
                  <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
                    Data backend untuk device_id terpilih (GET /telemetry/accel/history).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void historyQuery.refetch();
                    void latestQuery.refetch();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-soft px-3 py-2 text-sm font-medium text-(--token-gray-600) hover:bg-(--token-gray-100) dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              <TelemetryChart
                history={history}
                isLive
                isMobileOptimized={false}
                isPerformanceCapped={false}
                lockYAxis
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="X"
                  value={formatNumber(latestSample?.x)}
                  accent="text-sky-500"
                />
                <MetricCard
                  label="Y"
                  value={formatNumber(latestSample?.y)}
                  accent="text-emerald-500"
                />
                <MetricCard
                  label="Z"
                  value={formatNumber(latestSample?.z)}
                  accent="text-amber-500"
                />
              </div>
            </div>

            <div className="grid gap-6">
              <div className={`${CARD_CLASS} p-6`}>
                <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Ringkasan Backend
                </h2>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <MetricCard
                    label="History Points"
                    value={String(history.length)}
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                  <MetricCard
                    label="Window"
                    value="24 Jam"
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                  <MetricCard
                    label="Polling"
                    value="2 Detik"
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                  <MetricCard
                    label="Last Sample"
                    value={formatTime(latestSample?.t)}
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                </div>

                {(historyQuery.isError || latestQuery.isError) && (
                  <p className="mt-4 text-sm text-rose-500">
                    {historyQuery.error instanceof Error
                      ? historyQuery.error.message
                      : latestQuery.error instanceof Error
                        ? latestQuery.error.message
                        : "Gagal mengambil telemetry dari backend."}
                  </p>
                )}
                {!historyQuery.isFetching &&
                !latestQuery.isFetching &&
                history.length === 0 &&
                !historyQuery.isError &&
                !activeDeviceEmpty ? (
                  <p className="mt-4 text-sm text-amber-600 dark:text-amber-300">
                    History kosong. Pastikan device_id receiver sama dengan device_id sender.
                  </p>
                ) : null}
              </div>

              <div className={`${CARD_CLASS} p-6`}>
                <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Kontrak Receiver
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-(--token-gray-600) dark:text-(--token-gray-300)">
                  <li>Latest: GET /telemetry/accel/latest</li>
                  <li>History: GET /telemetry/accel/history</li>
                  <li>Sender terpisah di route /accelerometer/sender</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
