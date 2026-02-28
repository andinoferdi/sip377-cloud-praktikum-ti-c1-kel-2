"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "@/lib/errors";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { attendanceGasService } from "@/services/attendance-gas-service";
import { getOrCreateAttendanceDeviceId } from "@/utils/home/attendance-device-id";
import { appendAttendanceHistory } from "@/utils/home/attendance-history";
import { isExpiredTimestamp, parseAttendanceQrPayload } from "@/utils/home/attendance-qr";
import { Camera, CameraOff, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

const checkinSchema = z.object({
  course_id: z.string().trim().min(1, "course_id wajib diisi"),
  session_id: z.string().trim().min(1, "session_id wajib diisi"),
  qr_token: z.string().trim().min(1, "qr_token wajib diisi"),
});

type CheckinForm = z.infer<typeof checkinSchema>;

type Html5QrcodeScanner = {
  start: (
    cameraIdOrConfig: string | MediaTrackConstraints,
    configuration: {
      fps?: number;
      qrbox?: {
        width: number;
        height: number;
      };
    },
    qrCodeSuccessCallback: (decodedText: string) => void,
    qrCodeErrorCallback?: (errorMessage: string) => void,
  ) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => Promise<void>;
};

type Html5QrcodeStatic = {
  new (
    elementId: string,
    config?: {
      verbose?: boolean;
    },
  ): Html5QrcodeScanner;
  getCameras: () => Promise<
    Array<{
      id: string;
      label: string;
    }>
  >;
};

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)";

const LABEL_CLASS =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

const SCANNER_REGION_ID = "attendance-camera-scanner-region";
const SCANNER_ERROR_FLASH_MS = 1200;
const SCAN_HINT_DELAY_MS = 10000;
const SCAN_FPS = 10;
const REAR_CAMERA_LABEL_PATTERN = /back|rear|environment|traseira|belakang/i;

const FIELD_LABELS: Record<keyof CheckinForm, string> = {
  course_id: "Course ID",
  session_id: "Session ID",
  qr_token: "QR Token",
};

function normalizeCourseId(value: string) {
  return value.trim().toLowerCase();
}

function normalizeSessionId(value: string) {
  return value.trim().toLowerCase();
}

function normalizeQrToken(value: string) {
  return value.trim().toUpperCase();
}

function normalizeCheckinForm(values: CheckinForm): CheckinForm {
  return {
    course_id: normalizeCourseId(values.course_id),
    session_id: normalizeSessionId(values.session_id),
    qr_token: normalizeQrToken(values.qr_token),
  };
}

function getFriendlyCheckinErrorMessage(error: unknown) {
  const message = getErrorMessage(error);
  if (message === "already_checked_in") {
    return "Anda sudah check-in pada sesi ini.";
  }
  if (message === "session_closed") {
    return "Sesi presensi sudah ditutup dosen.";
  }
  return message;
}

function getScannerQrboxSize() {
  if (typeof window === "undefined") {
    return 220;
  }

  const shortestSide = Math.min(window.innerWidth, window.innerHeight);
  const computed = Math.floor(shortestSide * 0.55);
  return Math.max(180, Math.min(computed, 280));
}

function formatScannerStartError(error: unknown) {
  const message = getErrorMessage(error);
  const normalized = message.toLowerCase();

  if (
    normalized.includes("notallowederror") ||
    normalized.includes("permission") ||
    normalized.includes("denied")
  ) {
    return "Izin kamera ditolak. Izinkan akses kamera di browser lalu coba lagi.";
  }

  if (
    normalized.includes("notfounderror") ||
    normalized.includes("no camera") ||
    normalized.includes("kamera tidak ditemukan")
  ) {
    return "Kamera tidak ditemukan pada perangkat ini.";
  }

  if (
    normalized.includes("notreadableerror") ||
    normalized.includes("could not start video source")
  ) {
    return "Kamera sedang dipakai aplikasi lain. Tutup aplikasi lain lalu coba lagi.";
  }

  if (normalized.includes("overconstrainederror")) {
    return "Konfigurasi kamera tidak didukung perangkat. Coba ulangi pemindaian.";
  }

  if (normalized.includes("secure context")) {
    return "Akses kamera butuh secure context. Buka aplikasi lewat HTTPS.";
  }

  return `Gagal mengaktifkan kamera: ${message}`;
}

async function loadHtml5Qrcode() {
  const html5QrModule = await import("html5-qrcode");
  return html5QrModule.Html5Qrcode as unknown as Html5QrcodeStatic;
}

export default function MahasiswaScanPage() {
  const session = useAuthSession();
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerStartedRef = useRef(false);
  const errorFlashTimeoutRef = useRef<number | null>(null);
  const scanHintTimeoutRef = useRef<number | null>(null);
  const scanFlashTimeoutRef = useRef<number | null>(null);
  const isSubmittingFromScanRef = useRef(false);

  const [scannerStatus, setScannerStatus] = useState<
    "idle" | "requesting" | "active" | "error"
  >("idle");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [rawScanResult, setRawScanResult] = useState<string | null>(null);
  const [showScanHint, setShowScanHint] = useState(false);
  const [scanSubmitLoading, setScanSubmitLoading] = useState(false);
  const [scanSuccessFlash, setScanSuccessFlash] = useState(false);

  const form = useForm<CheckinForm>({
    resolver: zodResolver(checkinSchema),
    defaultValues: { course_id: "", session_id: "", qr_token: "" },
  });

  const checkinMutation = useMutation({
    mutationFn: async (values: CheckinForm) => {
      if (!session) throw new Error("Sesi mahasiswa tidak ditemukan.");
      const normalizedValues = normalizeCheckinForm(values);

      const response = await attendanceGasService.checkIn({
        user_id: session.identifier,
        device_id: getOrCreateAttendanceDeviceId(),
        course_id: normalizedValues.course_id,
        session_id: normalizedValues.session_id,
        qr_token: normalizedValues.qr_token,
        ts: new Date().toISOString(),
      });

      if (!response.ok) throw new Error(response.error);

      appendAttendanceHistory({
        user_id: session.identifier,
        course_id: normalizedValues.course_id,
        session_id: normalizedValues.session_id,
        qr_token: normalizedValues.qr_token,
        ts: new Date().toISOString(),
        result: response.data.status,
        presence_id: response.data.presence_id,
      });

      return response.data;
    },
  });

  const clearScannerTimers = useCallback(() => {
    if (errorFlashTimeoutRef.current !== null) {
      window.clearTimeout(errorFlashTimeoutRef.current);
      errorFlashTimeoutRef.current = null;
    }
    if (scanHintTimeoutRef.current !== null) {
      window.clearTimeout(scanHintTimeoutRef.current);
      scanHintTimeoutRef.current = null;
    }
    if (scanFlashTimeoutRef.current !== null) {
      window.clearTimeout(scanFlashTimeoutRef.current);
      scanFlashTimeoutRef.current = null;
    }
  }, []);

  const startScanHintTimer = useCallback(() => {
    if (scanHintTimeoutRef.current !== null) {
      window.clearTimeout(scanHintTimeoutRef.current);
    }

    setShowScanHint(false);
    scanHintTimeoutRef.current = window.setTimeout(() => {
      setShowScanHint(true);
      scanHintTimeoutRef.current = null;
    }, SCAN_HINT_DELAY_MS);
  }, []);

  const stopScanner = useCallback(async (setStatusToIdle = true) => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    scannerStartedRef.current = false;
    clearScannerTimers();
    setShowScanHint(false);

    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        // Ignore stop errors when scanner is not actively running.
      }

      try {
        await scanner.clear();
      } catch {
        // Ignore clear errors to keep stop idempotent.
      }
    }

    if (setStatusToIdle) {
      setScannerStatus("idle");
      setScannerError(null);
    }
  }, [clearScannerTimers]);

  function flashScannerError(message: string) {
    setScannerError(message);
    setScannerStatus("error");
    if (errorFlashTimeoutRef.current !== null) {
      window.clearTimeout(errorFlashTimeoutRef.current);
    }
    errorFlashTimeoutRef.current = window.setTimeout(() => {
      setScannerStatus((prev) => (prev === "idle" ? "idle" : "active"));
      errorFlashTimeoutRef.current = null;
    }, SCANNER_ERROR_FLASH_MS);
  }

  async function handleDecodedQrText(text: string) {
    if (isSubmittingFromScanRef.current) return;

    const parsedPayload = parseAttendanceQrPayload(text);
    if (!parsedPayload) {
      flashScannerError("Format QR tidak valid. Gunakan QR dari dashboard dosen.");
      return;
    }

    if (isExpiredTimestamp(parsedPayload.expires_at)) {
      flashScannerError("QR sudah expired. Minta dosen generate QR terbaru lalu scan ulang.");
      return;
    }

    const normalizedPayload = normalizeCheckinForm({
      course_id: parsedPayload.course_id,
      session_id: parsedPayload.session_id,
      qr_token: parsedPayload.qr_token,
    });

    setRawScanResult(text);
    setShowScanHint(false);
    setScanSuccessFlash(true);
    if (scanFlashTimeoutRef.current !== null) {
      window.clearTimeout(scanFlashTimeoutRef.current);
    }
    scanFlashTimeoutRef.current = window.setTimeout(() => {
      setScanSuccessFlash(false);
      scanFlashTimeoutRef.current = null;
    }, 250);

    form.setValue("course_id", normalizedPayload.course_id, { shouldValidate: true });
    form.setValue("session_id", normalizedPayload.session_id, { shouldValidate: true });
    form.setValue("qr_token", normalizedPayload.qr_token, { shouldValidate: true });

    isSubmittingFromScanRef.current = true;
    setScanSubmitLoading(true);
    checkinMutation.reset();

    await stopScanner();
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      await checkinMutation.mutateAsync(normalizedPayload);
    } catch (error) {
      setScannerError(getFriendlyCheckinErrorMessage(error));
    } finally {
      setScanSubmitLoading(false);
      setScanSuccessFlash(false);
      isSubmittingFromScanRef.current = false;
    }
  }

  async function startScanner() {
    const isMediaDevicesAvailable =
      typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined" &&
      typeof navigator.mediaDevices.getUserMedia === "function";

    if (!isMediaDevicesAvailable) {
      setScannerStatus("error");
      setScannerError(
        "Kamera tidak tersedia di browser ini. Jika akses dari HP, gunakan HTTPS.",
      );
      return;
    }

    if (!window.isSecureContext) {
      setScannerStatus("error");
      setScannerError("Akses kamera butuh secure context. Buka aplikasi lewat HTTPS.");
      return;
    }

    await stopScanner(false);
    setScannerStatus("requesting");
    setScannerError(null);
    setShowScanHint(false);

    try {
      const Html5Qrcode = await loadHtml5Qrcode();
      const scanner = new Html5Qrcode(SCANNER_REGION_ID, { verbose: false });
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      const rearCamera = cameras.find((camera) =>
        REAR_CAMERA_LABEL_PATTERN.test(camera.label),
      );
      const firstCamera = cameras[0];

      const cameraSources: Array<string | MediaTrackConstraints> = [];
      if (rearCamera?.id) {
        cameraSources.push(rearCamera.id);
      } else if (firstCamera?.id) {
        cameraSources.push(firstCamera.id);
      }
      cameraSources.push({ facingMode: { exact: "environment" } });
      cameraSources.push({ facingMode: "environment" });

      if (firstCamera?.id && !cameraSources.includes(firstCamera.id)) {
        cameraSources.push(firstCamera.id);
      }

      const qrboxSize = getScannerQrboxSize();
      const scannerConfig = {
        fps: SCAN_FPS,
        qrbox: { width: qrboxSize, height: qrboxSize },
      };

      let started = false;
      let lastError: unknown = null;

      for (const source of cameraSources) {
        try {
          await scanner.start(
            source,
            scannerConfig,
            (decodedText) => {
              void handleDecodedQrText(decodedText);
            },
            () => {
              // Ignore per-frame decode errors; scanner should keep running.
            },
          );
          started = true;
          scannerStartedRef.current = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!started) {
        throw lastError ?? new Error("Kamera tidak tersedia.");
      }

      setScannerStatus("active");
      startScanHintTimer();
    } catch (error) {
      await stopScanner(false);
      setScannerStatus("error");
      setScannerError(formatScannerStartError(error));
    }
  }

  useEffect(() => {
    return () => {
      void stopScanner(false);
      isSubmittingFromScanRef.current = false;
    };
  }, [stopScanner]);

  const scannerInfo = useMemo(() => {
    if (scannerStatus === "requesting")
      return {
        text: "Meminta izin kamera...",
        color: "text-amber-500 dark:text-amber-400",
      };
    if (scannerStatus === "active")
      return {
        text: "Scanner aktif - arahkan ke QR presensi",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    if (scannerStatus === "error")
      return {
        text: scannerError ?? "Scanner gagal diinisialisasi.",
        color: "text-red-500 dark:text-red-400",
      };
    return {
      text: "Scanner belum aktif",
      color: "text-(--token-gray-400) dark:text-(--token-gray-500)",
    };
  }, [scannerError, scannerStatus]);

  const showLiveScannerOverlay =
    scannerStatus === "active" || scannerStatus === "requesting";

  return (
    <div className="space-y-5">
      <style jsx global>{`
        #${SCANNER_REGION_ID},
        #${SCANNER_REGION_ID}__scan_region {
          width: 100%;
          height: 100%;
        }

        #${SCANNER_REGION_ID}__scan_region video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }

        #${SCANNER_REGION_ID}__dashboard_section,
        #${SCANNER_REGION_ID}__header_message {
          display: none !important;
        }
      `}</style>

      <style jsx>{`
        @keyframes scan-line {
          0% {
            transform: translateY(-120px);
            opacity: 0.2;
          }
          50% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(120px);
            opacity: 0.2;
          }
        }
      `}</style>

      {/* Page header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Mahasiswa - Modul Presensi
        </p>
        <h1 className="mt-1 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white) sm:text-2xl">
          Scan QR Presensi
        </h1>
        <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          Gunakan kamera untuk memindai QR dosen, atau isi token secara manual.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        {/* Scanner card */}
        <div className="overflow-hidden rounded-2xl border border-soft surface-elevated">
          <div className="border-b border-soft px-5 py-4">
            <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
              Kamera Scanner
            </h2>
          </div>

          <div className="space-y-4 p-5">
            {/* Viewfinder */}
            <div className="relative overflow-hidden rounded-xl border border-soft bg-black">
              <div
                id={SCANNER_REGION_ID}
                className="h-[280px] w-full sm:h-[320px]"
              />

              {scanSuccessFlash && (
                <div className="pointer-events-none absolute inset-0 border-2 border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.7)]" />
              )}

              {showLiveScannerOverlay && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cyan-300/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]">
                    <span className="absolute -left-px -top-px h-5 w-5 rounded-tl-xl border-l-2 border-t-2 border-cyan-300" />
                    <span className="absolute -right-px -top-px h-5 w-5 rounded-tr-xl border-r-2 border-t-2 border-cyan-300" />
                    <span className="absolute -bottom-px -left-px h-5 w-5 rounded-bl-xl border-b-2 border-l-2 border-cyan-300" />
                    <span className="absolute -bottom-px -right-px h-5 w-5 rounded-br-xl border-b-2 border-r-2 border-cyan-300" />
                    {scannerStatus === "active" && (
                      <span
                        className="absolute left-2 right-2 top-1/2 h-px rounded-full bg-cyan-300/90 shadow-[0_0_10px_rgba(103,232,249,0.8)]"
                        style={{ animation: "scan-line 1.8s ease-in-out infinite alternate" }}
                      />
                    )}
                  </div>
                </div>
              )}

              {scannerStatus === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75">
                  <Camera size={28} className="text-white/30" />
                  <p className="text-xs text-white/40">
                    Klik &quot;Aktifkan Kamera&quot; untuk mulai
                  </p>
                </div>
              )}
            </div>

            {/* Status text */}
            <p className={`text-xs font-medium ${scannerInfo.color}`}>{scannerInfo.text}</p>

            {showScanHint && scannerStatus === "active" && (
              <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                Belum terbaca? Dekatkan kamera ke QR, luruskan posisi, dan pastikan layar
                QR cukup terang.
              </p>
            )}

            {scanSubmitLoading && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <RefreshCw size={13} className="animate-spin" />
                QR terbaca. Memproses check-in...
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void startScanner()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 dark:hover:opacity-90"
              >
                <Camera size={13} />
                Aktifkan Kamera
              </button>
              <button
                type="button"
                onClick={() => void stopScanner()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-soft px-4 py-2 text-sm font-medium text-(--token-gray-600) transition-colors hover:bg-(--token-gray-100) dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)"
              >
                <CameraOff size={13} />
                Hentikan
              </button>
            </div>

            {/* Raw QR result */}
            {rawScanResult && (
              <div className="rounded-lg border border-soft bg-(--token-gray-50) p-3 dark:bg-(--token-white-5)">
                <p className={LABEL_CLASS}>Raw QR Data</p>
                <p className="mt-1 break-all font-mono text-xs text-(--token-gray-700) dark:text-(--token-gray-300)">
                  {rawScanResult}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Check-in form card */}
        <div
          ref={formCardRef}
          className="overflow-hidden rounded-2xl border border-soft surface-elevated"
        >
          <div className="border-b border-soft px-5 py-4">
            <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
              Form Check-in
            </h2>
          </div>

          <div className="p-5">
            {/* Session info */}
            <div className="mb-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 rounded-lg border border-soft bg-(--token-gray-50) px-3 py-3 text-xs dark:bg-(--token-white-5)">
              <span className={LABEL_CLASS.replace("mb-1.5 block", "self-center")}>
                user_id
              </span>
              <span className="self-center font-mono text-(--token-gray-700) dark:text-(--token-gray-300)">
                {session?.identifier ?? "-"}
              </span>
              <span className={LABEL_CLASS.replace("mb-1.5 block", "self-center")}>
                device_id
              </span>
              <span className="self-center truncate font-mono text-(--token-gray-700) dark:text-(--token-gray-300)">
                {typeof window === "undefined" ? "-" : getOrCreateAttendanceDeviceId()}
              </span>
            </div>

            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => {
                const normalizedValues = normalizeCheckinForm(values);
                form.setValue("course_id", normalizedValues.course_id, {
                  shouldValidate: true,
                });
                form.setValue("session_id", normalizedValues.session_id, {
                  shouldValidate: true,
                });
                form.setValue("qr_token", normalizedValues.qr_token, {
                  shouldValidate: true,
                });
                checkinMutation.mutate(normalizedValues);
              })}
            >
              {(["course_id", "session_id", "qr_token"] as const).map((field) => (
                <div key={field}>
                  <label className={LABEL_CLASS}>{FIELD_LABELS[field]}</label>
                  <input
                    {...form.register(field)}
                    placeholder={
                      field === "qr_token"
                        ? "Paste token jika tidak pakai kamera"
                        : undefined
                    }
                    className={INPUT_CLASS}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {form.formState.errors[field]?.message && (
                    <p className="mt-1 text-xs text-red-500">
                      {form.formState.errors[field]!.message}
                    </p>
                  )}
                </div>
              ))}

              <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                Input otomatis dinormalisasi. course_id dan session_id menjadi lowercase,
                qr_token menjadi uppercase.
              </p>

              <button
                type="submit"
                disabled={checkinMutation.isPending}
                className="mt-1 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:hover:opacity-90"
              >
                {checkinMutation.isPending ? "Memproses..." : "Check-in Sekarang"}
              </button>

              {checkinMutation.isError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {getFriendlyCheckinErrorMessage(checkinMutation.error)}
                </div>
              )}

              {checkinMutation.data && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Check-in berhasil.</p>
                    <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-500">
                      presence_id:{" "}
                      <span className="font-mono">{checkinMutation.data.presence_id}</span>
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
