"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Database,
  Play,
  Radio,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  Square,
  TimerReset,
} from "lucide-react";
import {
  accelerometerService,
  type AccelerometerSample,
} from "@/services/accelerometer-service";
import { hasGasBaseUrl } from "@/services/gas-client";
import {
  appendSampleToHistory,
  shouldCommitTelemetryChartFrame,
  TELEMETRY_CHART_MAX_POINTS,
  TELEMETRY_CHART_MOBILE_COMMIT_INTERVAL_MS,
  TELEMETRY_CHART_MOBILE_MAX_POINTS,
} from "@/utils/accelerometer-chart";
import {
  createAccelerometerSessionController,
  createInitialTelemetrySessionState,
  detectAccelerometerSupport,
  type TelemetrySessionState,
} from "@/utils/accelerometer-session";
import { getOrCreateTelemetryDeviceId } from "@/utils/telemetry-device-id";
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

function formatTime(value: string | null) {
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

function detectMobileTelemetryMode(win: Window) {
  if ("matchMedia" in win) {
    if (win.matchMedia("(max-width: 768px)").matches) {
      return true;
    }
    if (win.matchMedia("(pointer: coarse)").matches) {
      return true;
    }
  }
  return false;
}

function buildSavedStatusText(state: TelemetrySessionState) {
  if (state.lastFlushError) {
    return state.lastFlushError;
  }

  if (!hasGasBaseUrl()) {
    return "NEXT_PUBLIC_GAS_BASE_URL belum diatur. Backend flush dinonaktifkan.";
  }

  if (state.savedSample) {
    return "Backend menerima sample terbaru dari sesi realtime ini.";
  }

  return "Belum ada sample yang tersimpan ke backend.";
}

function SessionBadge({ status }: { status: TelemetrySessionState["status"] }) {
  const config: Record<
    TelemetrySessionState["status"],
    { label: string; className: string }
  > = {
    idle: {
      label: "Idle",
      className:
        "border-(--token-gray-200) text-(--token-gray-500) dark:border-(--token-white-10) dark:text-(--token-gray-400)",
    },
    starting: {
      label: "Starting",
      className:
        "border-sky-200 text-sky-700 dark:border-sky-500/30 dark:text-sky-300",
    },
    live: {
      label: "Live",
      className:
        "border-emerald-200 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300",
    },
    stopping: {
      label: "Stopping",
      className:
        "border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-300",
    },
    flushing: {
      label: "Flushing",
      className:
        "border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-300",
    },
    stopped: {
      label: "Stopped",
      className:
        "border-emerald-200 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300",
    },
    unsupported: {
      label: "Unsupported",
      className:
        "border-rose-200 text-rose-700 dark:border-rose-500/30 dark:text-rose-300",
    },
    denied: {
      label: "Denied",
      className:
        "border-rose-200 text-rose-700 dark:border-rose-500/30 dark:text-rose-300",
    },
    blocked: {
      label: "Blocked",
      className:
        "border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-300",
    },
  };

  const item = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
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

export default function AccelerometerClient() {
  const [deviceId, setDeviceId] = useState("telemetry-loading");
  const [sessionState, setSessionState] = useState(() =>
    createInitialTelemetrySessionState("telemetry-loading"),
  );
  const [supportMessage, setSupportMessage] = useState(
    "Menyiapkan diagnosis sensor browser.",
  );
  const [supportHint, setSupportHint] = useState<string | null>(null);
  const [liveHistory, setLiveHistory] = useState<AccelerometerSample[]>([]);
  const [stoppedSnapshot, setStoppedSnapshot] = useState<AccelerometerSample[]>(
    [],
  );
  const [showStoppedFeedback, setShowStoppedFeedback] = useState(false);
  const [isMobileOptimized, setIsMobileOptimized] = useState(false);
  const controllerRef = useRef<ReturnType<
    typeof createAccelerometerSessionController
  > | null>(null);
  const latestRefetchRef = useRef<() => Promise<unknown>>(async () => undefined);
  const liveHistoryRef = useRef<AccelerometerSample[]>([]);
  const pendingChartSampleRef = useRef<AccelerometerSample | null>(null);
  const chartCommitTimerRef = useRef<number | null>(null);
  const lastChartCommitMsRef = useRef<number | null>(null);

  useEffect(() => {
    const nextDeviceId = getOrCreateTelemetryDeviceId();
    setDeviceId(nextDeviceId);
    setSessionState(createInitialTelemetrySessionState(nextDeviceId));
  }, []);

  const latestQuery = useQuery({
    queryKey: ["accelerometer-latest", deviceId],
    enabled: hasGasBaseUrl() && deviceId !== "telemetry-loading",
    queryFn: async () => {
      const response = await accelerometerService.getLatestTelemetry(deviceId);
      if (!response.ok) {
        throw new Error(response.error ?? "latest telemetry gagal");
      }
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  useEffect(() => {
    latestRefetchRef.current = latestQuery.refetch;
  }, [latestQuery.refetch]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const support = detectAccelerometerSupport(window);
    setSupportMessage(support.message);
    setSupportHint(support.browserHint);
    setIsMobileOptimized(detectMobileTelemetryMode(window));
  }, []);

  useEffect(() => {
    liveHistoryRef.current = liveHistory;
  }, [liveHistory]);

  useEffect(() => {
    if (deviceId === "telemetry-loading") {
      return;
    }

    const controller = createAccelerometerSessionController({
      deviceId,
      async flushSamples(payload) {
        if (!hasGasBaseUrl()) {
          throw new Error("NEXT_PUBLIC_GAS_BASE_URL belum diatur.");
        }

        const response = await accelerometerService.flushTelemetrySamples({
          device_id: payload.deviceId,
          ts: payload.sessionStartedAt,
          samples: payload.samples,
        });

        if (!response.ok) {
          throw new Error(response.error ?? "flush telemetry gagal");
        }

        return {
          accepted: response.data.accepted,
        };
      },
      onStateChange(nextState) {
        startTransition(() => {
          setSessionState(nextState);
        });
      },
      onFlushSuccess() {
        void latestRefetchRef.current();
      },
    });

    controllerRef.current = controller;
    setSessionState(controller.getState());

    return () => {
      void controller.dispose(window);
      controllerRef.current = null;
    };
  }, [deviceId]);

  async function handleStart() {
    if (!controllerRef.current || typeof window === "undefined") {
      return;
    }
    setShowStoppedFeedback(false);
    setStoppedSnapshot([]);
    setLiveHistory([]);
    liveHistoryRef.current = [];
    pendingChartSampleRef.current = null;
    lastChartCommitMsRef.current = null;
    if (chartCommitTimerRef.current !== null) {
      window.clearTimeout(chartCommitTimerRef.current);
      chartCommitTimerRef.current = null;
    }
    try {
      await controllerRef.current.start(window);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memulai telemetry.";
      setSessionState((previous) => ({
        ...previous,
        status: "blocked",
        statusMessage: message,
      }));
    }
  }

  async function handleStop() {
    if (!controllerRef.current || typeof window === "undefined") {
      return;
    }
    await controllerRef.current.stop(window);
  }

  useEffect(() => {
    if (!sessionState.liveSample) {
      return;
    }

    const nextSample = sessionState.liveSample;
    if (!isMobileOptimized) {
      const nextHistory = appendSampleToHistory(
        liveHistoryRef.current,
        nextSample,
        TELEMETRY_CHART_MAX_POINTS,
      );
      liveHistoryRef.current = nextHistory;
      setLiveHistory(nextHistory);
      return;
    }

    pendingChartSampleRef.current = nextSample;

    if (typeof window === "undefined" || chartCommitTimerRef.current !== null) {
      return;
    }

    const nowMs = Date.now();
    const shouldCommitNow = shouldCommitTelemetryChartFrame(
      nowMs,
      lastChartCommitMsRef.current,
      TELEMETRY_CHART_MOBILE_COMMIT_INTERVAL_MS,
    );

    const delayMs =
      shouldCommitNow || lastChartCommitMsRef.current === null
        ? 0
        : Math.max(
            0,
            TELEMETRY_CHART_MOBILE_COMMIT_INTERVAL_MS -
              (nowMs - lastChartCommitMsRef.current),
          );

    chartCommitTimerRef.current = window.setTimeout(() => {
      chartCommitTimerRef.current = null;
      const pendingSample = pendingChartSampleRef.current;
      if (!pendingSample) {
        return;
      }

      const commitAt = Date.now();
      if (
        !shouldCommitTelemetryChartFrame(
          commitAt,
          lastChartCommitMsRef.current,
          TELEMETRY_CHART_MOBILE_COMMIT_INTERVAL_MS,
        )
      ) {
        return;
      }

      pendingChartSampleRef.current = null;
      lastChartCommitMsRef.current = commitAt;
      const nextHistory = appendSampleToHistory(
        liveHistoryRef.current,
        pendingSample,
        TELEMETRY_CHART_MOBILE_MAX_POINTS,
      );
      liveHistoryRef.current = nextHistory;
      setLiveHistory(nextHistory);
    }, delayMs);
  }, [isMobileOptimized, sessionState.liveSample]);

  useEffect(() => {
    if (!sessionState.lastStoppedAt || typeof window === "undefined") {
      return;
    }

    if (chartCommitTimerRef.current !== null) {
      window.clearTimeout(chartCommitTimerRef.current);
      chartCommitTimerRef.current = null;
    }

    const pendingSample = pendingChartSampleRef.current;
    if (pendingSample) {
      pendingChartSampleRef.current = null;
      const maxPoints = isMobileOptimized
        ? TELEMETRY_CHART_MOBILE_MAX_POINTS
        : TELEMETRY_CHART_MAX_POINTS;
      const nextHistory = appendSampleToHistory(
        liveHistoryRef.current,
        pendingSample,
        maxPoints,
      );
      liveHistoryRef.current = nextHistory;
      setLiveHistory(nextHistory);
    }

    setStoppedSnapshot(liveHistoryRef.current);
    setShowStoppedFeedback(true);

    const timeoutId = window.setTimeout(() => {
      setShowStoppedFeedback(false);
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isMobileOptimized, sessionState.lastStoppedAt]);

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") {
        return;
      }
      if (chartCommitTimerRef.current !== null) {
        window.clearTimeout(chartCommitTimerRef.current);
        chartCommitTimerRef.current = null;
      }
    };
  }, []);

  const liveSample = sessionState.liveSample;
  const savedSample = sessionState.savedSample;
  const savedLatest = latestQuery.data;
  const backendSample: Partial<AccelerometerSample> | null =
    savedSample ?? savedLatest ?? null;
  const chartHistory =
    sessionState.status === "stopped" && stoppedSnapshot.length > 0
      ? stoppedSnapshot
      : liveHistory;
  const isSessionRunning =
    sessionState.status === "starting" ||
    sessionState.status === "live" ||
    sessionState.status === "flushing" ||
    sessionState.status === "blocked" ||
    sessionState.status === "stopping";
  const isStopping = sessionState.status === "stopping";
  const startButtonLabel = showStoppedFeedback
    ? "Stopped"
    : sessionState.status === "starting"
      ? "Starting..."
      : "Start Telemetry";
  const stopButtonLabel = isStopping ? "Stopping..." : "Stop Telemetry";

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
                  Modul 02
                </p>
                <h1 className="mt-2 text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white) md:text-3xl">
                  Accelerometer Telemetry Realtime
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Halaman publik ini membaca sensor gerak perangkat secara live,
                  menampilkan nilai x, y, z seketika, lalu mengirim sample ke
                  backend secara buffered selama sesi aktif.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-soft surface-elevated px-4 py-3 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
              <p className="font-semibold text-(--token-gray-800) dark:text-(--token-gray-100)">
                device_id
              </p>
              <p className="mt-1 font-mono text-xs">{deviceId}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className={`${CARD_CLASS} p-5`}>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-primary-500" />
                <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Status Sensor
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-(--token-gray-500) dark:text-(--token-gray-400)">
                {supportMessage}
              </p>
              {supportHint ? (
                <p className="mt-2 text-xs leading-5 text-(--token-gray-400) dark:text-(--token-gray-500)">
                  {supportHint}
                </p>
              ) : null}
            </div>

            <div className={`${CARD_CLASS} p-5`}>
              <div className="flex items-center gap-2">
                <Database size={16} className="text-primary-500" />
                <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Backend GAS
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-(--token-gray-500) dark:text-(--token-gray-400)">
                {hasGasBaseUrl()
                  ? "Endpoint GAS aktif. Flush sample berjalan selama sesi realtime."
                  : "Env backend belum diatur. Live reading tetap bisa berjalan, tetapi data tidak dapat dikirim ke GAS."}
              </p>
            </div>

            <div className={`${CARD_CLASS} p-5`}>
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-primary-500" />
                <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Kompatibilitas
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-(--token-gray-500) dark:text-(--token-gray-400)">
                Baseline resmi adalah HP atau tablet. Di desktop, tidak
                munculnya event sensor biasanya normal karena banyak perangkat
                memang tidak mengekspos accelerometer ke browser.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <div className={`${CARD_CLASS} p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-primary-500" />
                    <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                      Sesi Telemetry Live
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
                    Tekan Start untuk membuka stream sensor. Nilai x, y, z akan
                    berubah real-time mengikuti gerakan perangkat sampai sesi
                    dihentikan.
                  </p>
                </div>
                <SessionBadge status={sessionState.status} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isSessionRunning}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    showStoppedFeedback
                      ? "bg-emerald-600 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                      : "bg-primary-600 hover:opacity-85"
                  }`}
                >
                  {showStoppedFeedback ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                  {startButtonLabel}
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  disabled={!isSessionRunning}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border border-soft px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isStopping
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
                      : "text-(--token-gray-700) hover:bg-(--token-gray-100) dark:text-(--token-gray-200) dark:hover:bg-(--token-white-5)"
                  }`}
                >
                  {isStopping ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Square size={16} />
                  )}
                  {stopButtonLabel}
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-soft bg-(--token-gray-50) p-4 dark:bg-(--token-white-5)">
                <div className="flex items-start gap-3">
                  <ShieldAlert
                    size={18}
                    className="mt-0.5 shrink-0 text-primary-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                      Status sesi
                    </p>
                    <p className="mt-1 text-sm leading-6 text-(--token-gray-600) dark:text-(--token-gray-300)">
                      {sessionState.statusMessage}
                    </p>
                    {sessionState.lastStoppedAt ? (
                      <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                        Telemetry berhenti pada {formatTime(sessionState.lastStoppedAt)}.
                        Flush terakhir menerima {sessionState.lastAcceptedCount} sampel.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                      Grafik Telemetry Realtime
                    </p>
                    <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
                      Tiga garis menampilkan perubahan sumbu X, Y, dan Z selama sesi aktif.
                      Saat stop, grafik dibekukan pada snapshot terakhir.
                    </p>
                  </div>
                  <span className="rounded-full border border-soft px-2.5 py-1 text-[11px] font-semibold text-(--token-gray-500) dark:text-(--token-gray-400)">
                    {sessionState.status === "stopped" ? "Frozen" : "Live"}
                  </span>
                </div>

                <TelemetryChart
                  history={chartHistory}
                  isLive={sessionState.status !== "stopped"}
                  isMobileOptimized={isMobileOptimized}
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="X"
                  value={formatNumber(liveSample?.x)}
                  accent="text-sky-500"
                />
                <MetricCard
                  label="Y"
                  value={formatNumber(liveSample?.y)}
                  accent="text-emerald-500"
                />
                <MetricCard
                  label="Z"
                  value={formatNumber(liveSample?.z)}
                  accent="text-amber-500"
                />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <MetricCard
                  label="Live Samples"
                  value={String(sessionState.liveSampleCount)}
                  accent="text-(--token-gray-900) dark:text-(--token-white)"
                />
                <MetricCard
                  label="Queued"
                  value={String(sessionState.queueSize)}
                  accent="text-(--token-gray-900) dark:text-(--token-white)"
                />
                <MetricCard
                  label="Accepted"
                  value={String(sessionState.acceptedSamples)}
                  accent="text-(--token-gray-900) dark:text-(--token-white)"
                />
                <MetricCard
                  label="Last Event"
                  value={formatTime(sessionState.lastEventAt)}
                  accent="text-(--token-gray-900) dark:text-(--token-white)"
                />
              </div>
            </div>

            <div className="grid gap-6">
              <div className={`${CARD_CLASS} p-6`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                      Saved Telemetry
                    </h2>
                    <p className="mt-2 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
                      Panel ini menunjukkan sampel terakhir yang berhasil
                      disimpan di backend, terpisah dari pembacaan live di
                      perangkat.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void latestQuery.refetch()}
                    className="inline-flex items-center gap-2 rounded-lg border border-soft px-3 py-2 text-sm font-medium text-(--token-gray-600) hover:bg-(--token-gray-100) dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)"
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MetricCard
                    label="X"
                    value={formatNumber(backendSample?.x)}
                    accent="text-sky-500"
                  />
                  <MetricCard
                    label="Y"
                    value={formatNumber(backendSample?.y)}
                    accent="text-emerald-500"
                  />
                  <MetricCard
                    label="Z"
                    value={formatNumber(backendSample?.z)}
                    accent="text-amber-500"
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-soft bg-(--token-gray-50) p-4 dark:bg-(--token-white-5)">
                  <p className={LABEL_CLASS}>Last Flush</p>
                  <p className="mt-2 text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                    {formatTime(sessionState.lastFlushAt)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-(--token-gray-600) dark:text-(--token-gray-300)">
                    {buildSavedStatusText(sessionState)}
                  </p>
                </div>

                {latestQuery.isError ? (
                  <p className="mt-4 text-sm text-rose-500">
                    {latestQuery.error instanceof Error
                      ? latestQuery.error.message
                      : "Gagal mengambil latest telemetry."}
                  </p>
                ) : null}
              </div>

              <div className={`${CARD_CLASS} p-6`}>
                <div className="flex items-center gap-2">
                  <TimerReset size={16} className="text-primary-500" />
                  <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                    Diagnostik Browser
                  </h2>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-(--token-gray-600) dark:text-(--token-gray-300)">
                  <li>Secure context HTTPS wajib aktif.</li>
                  <li>
                    iPhone atau browser tertentu dapat meminta izin sensor saat
                    tombol Start ditekan.
                  </li>
                  <li>
                    Jika Brave tetap tidak mengirim event, cek site settings
                    untuk motion sensors lalu bandingkan dengan Chrome mobile.
                  </li>
                  <li>
                    Pada desktop atau laptop biasa, status blocked atau
                    unsupported sering berarti memang tidak ada sensor gerak
                    yang tersedia untuk browser.
                  </li>
                  <li>
                    Endpoint backend tetap memakai kontrak batch
                    <code className="ml-1 rounded bg-(--token-gray-100) px-1.5 py-0.5 text-xs dark:bg-(--token-white-5)">
                      POST /telemetry/accel
                    </code>
                    .
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
