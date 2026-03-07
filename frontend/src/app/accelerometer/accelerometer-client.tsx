"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  getAccelLatest,
  sendAccelBatch,
  type AccelLatestData,
} from "@/services/accelerometer-service";
import {
  collectAccelerometerSamples,
  getAccelerometerSupport,
  type AccelerometerSupport,
} from "@/utils/accelerometer-collector";
import { getOrCreateTelemetryDeviceId } from "@/utils/telemetry-device-id";
import { hasGasBaseUrl } from "@/services/gas-client";
import { Activity, ArrowLeft, Radio, Send, Smartphone } from "lucide-react";

const CARD_CLASS =
  "overflow-hidden rounded-2xl border border-soft surface-elevated";

function isAccelLatestData(value: unknown): value is AccelLatestData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.t === "string" &&
    typeof candidate.x === "number" &&
    typeof candidate.y === "number" &&
    typeof candidate.z === "number"
  );
}

function formatAxis(value: number | null) {
  if (value === null) {
    return "--";
  }

  return value.toFixed(2);
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AccelerometerClient() {
  const queryClient = useQueryClient();
  const [deviceId, setDeviceId] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [support, setSupport] = useState<AccelerometerSupport | null>(null);
  const durationMs = 5000;

  useEffect(() => {
    setDeviceId(getOrCreateTelemetryDeviceId());
    setSupport(getAccelerometerSupport());
  }, []);

  const gasConfigured = hasGasBaseUrl();
  const shouldQueryLatest = Boolean(deviceId) && gasConfigured;

  const latestQuery = useQuery({
    queryKey: ["accelerometer-latest", deviceId],
    enabled: shouldQueryLatest,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      const response = await getAccelLatest(deviceId);
      if (!response.ok) {
        throw new Error(response.error);
      }

      return isAccelLatestData(response.data) ? response.data : null;
    },
  });

  const collectMutation = useMutation({
    mutationFn: async () => {
      const pushMessage = (message: string) => {
        setMessages((currentMessages) => [...currentMessages, message]);
      };

      setMessages([]);
      const samples = await collectAccelerometerSamples({
        durationMs,
        onMessage: pushMessage,
      });

      pushMessage("Mengirim batch accelerometer ke backend...");
      const response = await sendAccelBatch({
        device_id: deviceId,
        ts: new Date().toISOString(),
        samples,
      });

      if (!response.ok) {
        throw new Error(response.error);
      }

      pushMessage(`Backend menerima ${response.data.accepted} sampel.`);
      return response.data.accepted;
    },
    onSuccess: async (accepted) => {
      toast.success(`Accelerometer berhasil dikirim. ${accepted} sampel diterima.`);
      await queryClient.invalidateQueries({
        queryKey: ["accelerometer-latest", deviceId],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const latestData = latestQuery.data;

  return (
    <div className="wrapper py-10 md:py-14">
      <div className="space-y-6">
        <div className={CARD_CLASS}>
          <div className="border-b border-soft px-6 py-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary-600 dark:text-primary-400"
            >
              <ArrowLeft size={14} />
              Kembali ke Home
            </Link>
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                  Modul 02
                </p>
                <h1 className="mt-2 text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white)">
                  Accelerometer Telemetry
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-(--token-gray-600) dark:text-(--token-gray-300)">
                  Halaman ini bersifat publik. Fokusnya mengumpulkan data sensor
                  gerak dari perangkat yang kompatibel lalu mengirimnya ke
                  backend GAS menggunakan kontrak telemetry yang aktif.
                </p>
              </div>
              <div className="grid gap-2 text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                <p className="font-mono">device_id: {deviceId || "--"}</p>
                <p>Polling latest: 3 detik</p>
                <p>Durasi batch: {durationMs / 1000} detik</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 px-6 py-5 lg:grid-cols-3">
            <div className="rounded-xl border border-soft bg-(--token-gray-50) px-4 py-3 dark:bg-(--token-white-5)">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                <Smartphone size={16} />
                Status Sensor
              </div>
                <p className="mt-2 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
                {support?.supported
                  ? "Browser siap mencoba membaca Device Motion API."
                  : support?.reason ?? "Memeriksa dukungan sensor..."}
              </p>
            </div>
            <div className="rounded-xl border border-soft bg-(--token-gray-50) px-4 py-3 dark:bg-(--token-white-5)">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                <Send size={16} />
                Backend GAS
              </div>
              <p className="mt-2 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
                {gasConfigured
                  ? "NEXT_PUBLIC_GAS_BASE_URL aktif. Telemetry bisa dikirim langsung."
                  : "NEXT_PUBLIC_GAS_BASE_URL belum diatur. Halaman tetap bisa dibuka, tetapi pengiriman telemetry dinonaktifkan."}
              </p>
            </div>
            <div className="rounded-xl border border-soft bg-(--token-gray-50) px-4 py-3 dark:bg-(--token-white-5)">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                <Radio size={16} />
                Target Device
              </div>
              <p className="mt-2 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
                Baseline resmi adalah HP atau tablet. Laptop tetap aman dibuka,
                tetapi hanya akan berfungsi jika hardware dan browser sama-sama
                menyediakan sensor.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className={CARD_CLASS}>
            <div className="border-b border-soft px-6 py-5">
              <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                Kirim Batch Accelerometer
              </h2>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-sm leading-7 text-(--token-gray-600) dark:text-(--token-gray-300)">
                Tekan tombol di bawah untuk mengumpulkan data gerak selama{" "}
                {durationMs / 1000} detik. Pada iPhone, browser dapat meminta
                izin sensor saat tombol ditekan.
              </p>

              <button
                type="button"
                onClick={() => collectMutation.mutate()}
                disabled={!support?.supported || !gasConfigured || !deviceId || collectMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Activity size={16} />
                {collectMutation.isPending ? "Mengumpulkan dan mengirim..." : "Mulai Telemetry"}
              </button>

              <div className="rounded-xl border border-soft bg-(--token-gray-50) px-4 py-3 text-xs leading-6 text-(--token-gray-600) dark:bg-(--token-white-5) dark:text-(--token-gray-300)">
                <p>Kontrak batch:</p>
                <p className="font-mono">POST /telemetry/accel</p>
                <p className="mt-2">Field wajib per sample: t, x, y, z.</p>
              </div>

              {messages.length > 0 && (
                <div className="rounded-xl border border-soft bg-(--token-gray-950) px-4 py-3 font-mono text-xs leading-6 text-(--token-gray-100)">
                  {messages.map((message, index) => (
                    <p key={`${message}-${index}`}>{message}</p>
                  ))}
                </div>
              )}

              {collectMutation.isError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {getErrorMessage(collectMutation.error)}
                </div>
              )}
            </div>
          </div>

          <div className={CARD_CLASS}>
            <div className="border-b border-soft px-6 py-5">
              <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                Latest Telemetry
              </h2>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "x", label: "X", value: latestData?.x ?? null, tone: "text-sky-600 dark:text-sky-400" },
                  { key: "y", label: "Y", value: latestData?.y ?? null, tone: "text-emerald-600 dark:text-emerald-400" },
                  { key: "z", label: "Z", value: latestData?.z ?? null, tone: "text-amber-600 dark:text-amber-400" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="rounded-xl border border-soft bg-(--token-gray-50) px-4 py-3 dark:bg-(--token-white-5)"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                      {item.label}
                    </p>
                    <p className={`mt-2 text-2xl font-bold ${item.tone}`}>
                      {formatAxis(item.value)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-soft bg-(--token-gray-50) px-4 py-3 dark:bg-(--token-white-5)">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                  Sampel Terakhir
                </p>
                <p className="mt-2 font-mono text-sm text-(--token-gray-700) dark:text-(--token-gray-300)">
                  {formatTimestamp(latestData?.t ?? null)}
                </p>
              </div>

              {!gasConfigured && (
                <div className="rounded-xl border border-soft bg-(--token-gray-50) px-4 py-3 text-sm text-(--token-gray-600) dark:bg-(--token-white-5) dark:text-(--token-gray-300)">
                  Latest telemetry akan aktif setelah `NEXT_PUBLIC_GAS_BASE_URL`
                  dikonfigurasi.
                </div>
              )}

              {gasConfigured && !deviceId && (
                <p className="text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Menyiapkan device_id lokal...
                </p>
              )}

              {shouldQueryLatest && latestQuery.isPending && (
                <p className="text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Memuat latest telemetry...
                </p>
              )}

              {shouldQueryLatest && latestQuery.isError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {getErrorMessage(latestQuery.error)}
                </div>
              )}

              {shouldQueryLatest && !latestQuery.isPending && !latestQuery.isError && !latestData && (
                <div className="rounded-xl border border-soft bg-(--token-gray-50) px-4 py-3 text-sm text-(--token-gray-600) dark:bg-(--token-white-5) dark:text-(--token-gray-300)">
                  Belum ada data accelerometer untuk device ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
