"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  MapPin,
  Navigation,
  Play,
  RefreshCw,
  ShieldAlert,
  Square,
} from "lucide-react";
import { gpsService } from "@/services/gps-service";
import { hasGasBaseUrl } from "@/services/gas-client";
import { getOrCreateTelemetryDeviceId } from "@/utils/telemetry-device-id";

const CARD_CLASS =
  "overflow-hidden rounded-2xl border border-soft surface-elevated";
const LABEL_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

type TrackingStatus =
  | "idle"
  | "requesting"
  | "live"
  | "stopping"
  | "stopped"
  | "denied"
  | "unsupported";

type GpsState = {
  status: TrackingStatus;
  statusMessage: string;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  altitude: number | null;
  sentCount: number;
  failCount: number;
  lastSentAt: string | null;
  lastError: string | null;
};

function createInitialState(): GpsState {
  return {
    status: "idle",
    statusMessage: "Tekan Start untuk mulai kirim GPS ke backend.",
    lat: null,
    lng: null,
    accuracy: null,
    altitude: null,
    sentCount: 0,
    failCount: 0,
    lastSentAt: null,
    lastError: null,
  };
}

const STATUS_BADGE: Record<
  TrackingStatus,
  { label: string; className: string }
> = {
  idle: {
    label: "Idle",
    className:
      "border-(--token-gray-200) text-(--token-gray-500) dark:border-(--token-white-10) dark:text-(--token-gray-400)",
  },
  requesting: {
    label: "Requesting",
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
  stopped: {
    label: "Stopped",
    className:
      "border-emerald-200 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300",
  },
  denied: {
    label: "Denied",
    className:
      "border-rose-200 text-rose-700 dark:border-rose-500/30 dark:text-rose-300",
  },
  unsupported: {
    label: "Unsupported",
    className:
      "border-rose-200 text-rose-700 dark:border-rose-500/30 dark:text-rose-300",
  },
};

const SEND_INTERVAL_MS = 5000;

function formatCoord(value: number | null) {
  if (value === null) return "--";
  return value.toFixed(6);
}

function formatMeter(value: number | null) {
  if (value === null) return "--";
  return `${value.toFixed(1)} m`;
}

function StatusBadge({ status }: { status: TrackingStatus }) {
  const item = STATUS_BADGE[status];
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

export default function GpsSenderClient() {
  const [deviceId, setDeviceId] = useState("telemetry-loading");
  const [gpsState, setGpsState] = useState<GpsState>(createInitialState);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPosRef = useRef<GeolocationPosition | null>(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    setDeviceId(getOrCreateTelemetryDeviceId());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator.geolocation) {
      setGpsState((prev) => ({
        ...prev,
        status: "unsupported",
        statusMessage: "Geolocation API tidak didukung browser ini.",
      }));
    }
  }, []);

  function clearTimers() {
    if (sendTimerRef.current !== null) {
      clearTimeout(sendTimerRef.current);
      sendTimerRef.current = null;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }

  async function sendCurrentPosition() {
    const pos = latestPosRef.current;
    if (!pos || isSendingRef.current || !hasGasBaseUrl()) return;

    isSendingRef.current = true;
    const { latitude: lat, longitude: lng, accuracy, altitude } = pos.coords;

    try {
      const response = await gpsService.logGpsPoint({
        device_id: deviceId,
        ts: new Date().toISOString(),
        lat,
        lng,
        accuracy_m: accuracy ?? null,
        altitude_m: altitude ?? null,
      });

      if (!response.ok) throw new Error(response.error ?? "log GPS gagal");

      setGpsState((prev) => ({
        ...prev,
        sentCount: prev.sentCount + 1,
        lastSentAt: new Date().toLocaleTimeString("id-ID"),
        lastError: null,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal kirim GPS.";
      setGpsState((prev) => ({
        ...prev,
        failCount: prev.failCount + 1,
        lastError: msg,
      }));
    } finally {
      isSendingRef.current = false;
    }
  }

  function scheduleNext() {
    sendTimerRef.current = setTimeout(async () => {
      await sendCurrentPosition();
      scheduleNext();
    }, SEND_INTERVAL_MS);
  }

  function handleStart() {
    if (!navigator.geolocation) return;

    setGpsState((prev) => ({
      ...prev,
      status: "requesting",
      statusMessage: "Meminta izin akses lokasi dari browser...",
    }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        latestPosRef.current = pos;
        const { latitude, longitude, accuracy, altitude } = pos.coords;

        setGpsState((prev) => ({
          ...prev,
          status: "live",
          statusMessage: "GPS aktif. Titik lokasi dikirim setiap 5 detik.",
          lat: latitude,
          lng: longitude,
          accuracy: accuracy ?? null,
          altitude: altitude ?? null,
        }));
      },
      (err) => {
        clearTimers();
        setGpsState((prev) => ({
          ...prev,
          status: "denied",
          statusMessage: `Akses GPS ditolak: ${err.message}`,
        }));
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );

    scheduleNext();
  }

  function handleStop() {
    setGpsState((prev) => ({
      ...prev,
      status: "stopping",
      statusMessage: "Menghentikan tracking GPS...",
    }));
    clearTimers();
    setGpsState((prev) => ({
      ...prev,
      status: "stopped",
      statusMessage: `Tracking dihentikan. Total terkirim: ${prev.sentCount} titik.`,
    }));
  }

  async function handleCopyDeviceId() {
    if (typeof window === "undefined" || deviceId === "telemetry-loading")
      return;
    try {
      await window.navigator.clipboard.writeText(deviceId);
      setCopyStatus("device_id disalin");
    } catch {
      setCopyStatus("gagal menyalin device_id");
    }
  }

  const isRunning =
    gpsState.status === "requesting" ||
    gpsState.status === "live" ||
    gpsState.status === "stopping";

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
                  Modul 03 - Sender
                </p>
                <h1 className="mt-2 text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white) md:text-3xl">
                  GPS Sender
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Halaman ini membaca GPS perangkat dan mengirim titik lokasi ke
                  backend GAS setiap 5 detik. Untuk melihat peta, gunakan
                  halaman Map.
                </p>
                <div className="mt-2">
                  <Link
                    href="/gps/map"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Buka Map →
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-soft surface-elevated px-4 py-3 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
              <p className="font-semibold text-(--token-gray-800) dark:text-(--token-gray-100)">
                device_id
              </p>
              <p className="mt-1 font-mono text-xs">{deviceId}</p>
              <button
                type="button"
                onClick={() => void handleCopyDeviceId()}
                className="mt-2 inline-flex items-center gap-1 rounded-md border border-soft px-2 py-1 text-xs font-semibold hover:bg-(--token-gray-100) dark:hover:bg-(--token-white-5)"
              >
                <Copy size={12} />
                Copy
              </button>
              {copyStatus ? (
                <p className="mt-2 text-xs">{copyStatus}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={`${CARD_CLASS} p-5`}>
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-primary-500" />
                <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Status GPS
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-(--token-gray-500) dark:text-(--token-gray-400)">
                {typeof window !== "undefined" && navigator.geolocation
                  ? "Geolocation API tersedia. Klik Start untuk meminta izin lokasi."
                  : "Geolocation API tidak didukung di browser ini."}
              </p>
            </div>

            <div className={`${CARD_CLASS} p-5`}>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary-500" />
                <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Backend GAS
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-(--token-gray-500) dark:text-(--token-gray-400)">
                {hasGasBaseUrl()
                  ? "Titik GPS dikirim setiap 5 detik ke POST /telemetry/gps."
                  : "Env backend belum diatur. GPS tetap bisa dibaca, tetapi pengiriman akan gagal."}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <div className={`${CARD_CLASS} p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Navigation size={16} className="text-primary-500" />
                    <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                      Sesi Tracking GPS
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
                    Tekan Start untuk mulai kirim lokasi. Tekan Stop untuk
                    menghentikan tracking.
                  </p>
                </div>
                <StatusBadge status={gpsState.status} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isRunning}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play size={16} />
                  {gpsState.status === "requesting" ? "Starting..." : "Start"}
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  disabled={!isRunning}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border border-soft px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    gpsState.status === "stopping"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
                      : "text-(--token-gray-700) hover:bg-(--token-gray-100) dark:text-(--token-gray-200) dark:hover:bg-(--token-white-5)"
                  }`}
                >
                  {gpsState.status === "stopping" ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Square size={16} />
                  )}
                  {gpsState.status === "stopping" ? "Stopping..." : "Stop"}
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
                      {gpsState.statusMessage}
                    </p>
                    {gpsState.lastError ? (
                      <p className="mt-1 text-xs text-rose-500">
                        {gpsState.lastError}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Latitude"
                  value={formatCoord(gpsState.lat)}
                  accent="text-sky-500"
                />
                <MetricCard
                  label="Longitude"
                  value={formatCoord(gpsState.lng)}
                  accent="text-emerald-500"
                />
                <MetricCard
                  label="Accuracy"
                  value={formatMeter(gpsState.accuracy)}
                  accent="text-amber-500"
                />
                <MetricCard
                  label="Altitude"
                  value={formatMeter(gpsState.altitude)}
                  accent="text-violet-500"
                />
              </div>
            </div>

            <div className="grid gap-6">
              <div className={`${CARD_CLASS} p-6`}>
                <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Ringkasan Sender
                </h2>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <MetricCard
                    label="Terkirim"
                    value={String(gpsState.sentCount)}
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                  <MetricCard
                    label="Gagal"
                    value={String(gpsState.failCount)}
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                  <MetricCard
                    label="Interval"
                    value="5 Detik"
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                  <MetricCard
                    label="Last Sent"
                    value={gpsState.lastSentAt ?? "--"}
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                </div>
              </div>

              <div className={`${CARD_CLASS} p-6`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-500" />
                  <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                    Catatan Flow
                  </h2>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-(--token-gray-600) dark:text-(--token-gray-300)">
                  <li>Sender hanya kirim titik GPS ke backend.</li>
                  <li>Map membaca latest & history dari backend.</li>
                  <li>Endpoint kirim: POST /telemetry/gps.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}