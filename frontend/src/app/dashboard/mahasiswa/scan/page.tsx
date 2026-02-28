"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { IScannerControls } from "@zxing/browser";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { attendanceGasService } from "@/services/attendance-gas-service";
import { getOrCreateAttendanceDeviceId } from "@/utils/home/attendance-device-id";
import { appendAttendanceHistory } from "@/utils/home/attendance-history";
import { isExpiredTimestamp, parseAttendanceQrPayload } from "@/utils/home/attendance-qr";
import { ScanLine, Camera, CameraOff, CheckCircle2, AlertCircle } from "lucide-react";

const checkinSchema = z.object({
  course_id: z.string().trim().min(1, "course_id wajib diisi"),
  session_id: z.string().trim().min(1, "session_id wajib diisi"),
  qr_token: z.string().trim().min(1, "qr_token wajib diisi"),
});

type CheckinForm = z.infer<typeof checkinSchema>;

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)";

const LABEL_CLASS =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

const SCANNER_ERROR_FLASH_MS = 1200;
const STOP_AFTER_SUCCESS_MS = 900;

const FIELD_LABELS: Record<keyof CheckinForm, string> = {
  course_id: "Course ID",
  session_id: "Session ID",
  qr_token: "QR Token",
};

export default function MahasiswaScanPage() {
  const session = useAuthSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const errorFlashTimeoutRef = useRef<number | null>(null);
  const stopAfterSuccessTimeoutRef = useRef<number | null>(null);
  const isSubmittingFromScanRef = useRef(false);

  const [scannerStatus, setScannerStatus] = useState<
    "idle" | "requesting" | "active" | "error"
  >("idle");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [rawScanResult, setRawScanResult] = useState<string | null>(null);

  const form = useForm<CheckinForm>({
    resolver: zodResolver(checkinSchema),
    defaultValues: { course_id: "", session_id: "", qr_token: "" },
  });

  const checkinMutation = useMutation({
    mutationFn: async (values: CheckinForm) => {
      if (!session) throw new Error("Sesi mahasiswa tidak ditemukan.");

      const response = await attendanceGasService.checkIn({
        user_id: session.identifier,
        device_id: getOrCreateAttendanceDeviceId(),
        course_id: values.course_id,
        session_id: values.session_id,
        qr_token: values.qr_token,
        ts: new Date().toISOString(),
      });

      if (!response.ok) throw new Error(response.error);

      appendAttendanceHistory({
        user_id: session.identifier,
        course_id: values.course_id,
        session_id: values.session_id,
        qr_token: values.qr_token,
        ts: new Date().toISOString(),
        result: response.data.status,
        presence_id: response.data.presence_id,
      });

      return response.data;
    },
  });

  function clearScannerTimers() {
    if (errorFlashTimeoutRef.current !== null) {
      window.clearTimeout(errorFlashTimeoutRef.current);
      errorFlashTimeoutRef.current = null;
    }
    if (stopAfterSuccessTimeoutRef.current !== null) {
      window.clearTimeout(stopAfterSuccessTimeoutRef.current);
      stopAfterSuccessTimeoutRef.current = null;
    }
  }

  function stopScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    readerRef.current = null;
    clearScannerTimers();
    setScannerStatus("idle");
  }

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

  async function pickPreferredVideoInputId() {
    try {
      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      if (!devices.length) return undefined;
      const rearCamera = devices.find((d) =>
        /back|rear|environment|traseira|belakang/i.test(d.label),
      );
      return rearCamera?.deviceId ?? devices[0].deviceId;
    } catch {
      return undefined;
    }
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

    setRawScanResult(text);
    form.setValue("course_id", parsedPayload.course_id, { shouldValidate: true });
    form.setValue("session_id", parsedPayload.session_id, { shouldValidate: true });
    form.setValue("qr_token", parsedPayload.qr_token, { shouldValidate: true });

    isSubmittingFromScanRef.current = true;

    try {
      await checkinMutation.mutateAsync({
        course_id: parsedPayload.course_id,
        session_id: parsedPayload.session_id,
        qr_token: parsedPayload.qr_token,
      });

      setScannerError(null);

      if (stopAfterSuccessTimeoutRef.current !== null) {
        window.clearTimeout(stopAfterSuccessTimeoutRef.current);
      }
      stopAfterSuccessTimeoutRef.current = window.setTimeout(() => {
        stopScanner();
      }, STOP_AFTER_SUCCESS_MS);
    } catch (error) {
      flashScannerError(
        error instanceof Error ? error.message : "Check-in gagal. Silakan scan ulang.",
      );
    } finally {
      isSubmittingFromScanRef.current = false;
    }
  }

  async function startScanner() {
    if (!videoRef.current) return;

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
      setScannerError(
        "Akses kamera butuh secure context. Buka aplikasi lewat HTTPS.",
      );
      return;
    }

    stopScanner();
    setScannerStatus("requesting");
    setScannerError(null);

    try {
      const qrReader = new BrowserQRCodeReader();
      readerRef.current = qrReader;
      const preferredDeviceId = await pickPreferredVideoInputId();

      const controls = await qrReader.decodeFromVideoDevice(
        preferredDeviceId,
        videoRef.current,
        (result) => {
          if (!result) return;
          void handleDecodedQrText(result.getText());
        },
      );

      controlsRef.current = controls;
      setScannerStatus("active");
    } catch (error) {
      setScannerStatus("error");
      setScannerError(
        error instanceof Error ? error.message : "Kamera tidak tersedia.",
      );
    }
  }

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      readerRef.current = null;
      clearScannerTimers();
      isSubmittingFromScanRef.current = false;
    };
  }, []);

  const scannerInfo = useMemo(() => {
    if (scannerStatus === "requesting")
      return { text: "Meminta izin kamera...", color: "text-amber-500 dark:text-amber-400" };
    if (scannerStatus === "active")
      return { text: "Scanner aktif — arahkan ke QR presensi", color: "text-emerald-600 dark:text-emerald-400" };
    if (scannerStatus === "error")
      return { text: scannerError ?? "Scanner gagal diinisialisasi.", color: "text-red-500 dark:text-red-400" };
    return { text: "Scanner belum aktif", color: "text-(--token-gray-400) dark:text-(--token-gray-500)" };
  }, [scannerError, scannerStatus]);

  const showLiveScannerOverlay =
    scannerStatus === "active" || scannerStatus === "requesting";

  return (
    <div className="space-y-5">
      <style jsx>{`
        @keyframes scan-line {
          0%   { transform: translateY(-120px); opacity: 0.2; }
          50%  { opacity: 0.85; }
          100% { transform: translateY(120px); opacity: 0.2; }
        }
      `}</style>

      {/* Page header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Mahasiswa — Modul Presensi
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
              <video
                ref={videoRef}
                className="h-[280px] w-full object-cover sm:h-[320px]"
                muted
                playsInline
              />

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
                  <p className="text-xs text-white/40">Klik &quot;Aktifkan Kamera&quot; untuk mulai</p>
                </div>
              )}
            </div>

            {/* Status text */}
            <p className={`text-xs font-medium ${scannerInfo.color}`}>
              {scannerInfo.text}
            </p>

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
                onClick={stopScanner}
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
        <div className="overflow-hidden rounded-2xl border border-soft surface-elevated">
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
              onSubmit={form.handleSubmit((values) => checkinMutation.mutate(values))}
            >
              {(["course_id", "session_id", "qr_token"] as const).map((field) => (
                <div key={field}>
                  <label className={LABEL_CLASS}>{FIELD_LABELS[field]}</label>
                  <input
                    {...form.register(field)}
                    placeholder={field === "qr_token" ? "Paste token jika tidak pakai kamera" : undefined}
                    className={INPUT_CLASS}
                  />
                  {form.formState.errors[field]?.message && (
                    <p className="mt-1 text-xs text-red-500">
                      {form.formState.errors[field]!.message}
                    </p>
                  )}
                </div>
              ))}

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
                  {checkinMutation.error instanceof Error
                    ? checkinMutation.error.message
                    : "Check-in gagal."}
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