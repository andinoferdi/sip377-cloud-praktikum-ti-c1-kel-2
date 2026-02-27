"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { IScannerControls } from "@zxing/browser";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { attendanceGasService } from "@/services/attendance-gas-service";
import { getOrCreateAttendanceDeviceId } from "@/utils/home/attendance-device-id";
import { appendAttendanceHistory } from "@/utils/home/attendance-history";
import { parseAttendanceQrPayload } from "@/utils/home/attendance-qr";
import { ScanLine, Camera, CameraOff, CheckCircle2, AlertCircle } from "lucide-react";

const checkinSchema = z.object({
  course_id: z.string().trim().min(1, "course_id wajib diisi"),
  session_id: z.string().trim().min(1, "session_id wajib diisi"),
  qr_token: z.string().trim().min(1, "qr_token wajib diisi"),
});

type CheckinForm = z.infer<typeof checkinSchema>;

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)";

export default function MahasiswaScanPage() {
  const session = useAuthSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);

  const [scannerStatus, setScannerStatus] = useState<
    "idle" | "requesting" | "active" | "error"
  >("idle");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [rawScanResult, setRawScanResult] = useState<string | null>(null);

  const form = useForm<CheckinForm>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      course_id: "",
      session_id: "",
      qr_token: "",
    },
  });

  const checkinMutation = useMutation({
    mutationFn: async (values: CheckinForm) => {
      if (!session) {
        throw new Error("Sesi mahasiswa tidak ditemukan.");
      }

      const response = await attendanceGasService.checkIn({
        user_id: session.identifier,
        device_id: getOrCreateAttendanceDeviceId(),
        course_id: values.course_id,
        session_id: values.session_id,
        qr_token: values.qr_token,
        ts: new Date().toISOString(),
      });

      if (!response.ok) {
        throw new Error(response.error);
      }

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

  function stopScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    readerRef.current = null;
    setScannerStatus("idle");
  }

  async function startScanner() {
    if (!videoRef.current) {
      return;
    }

    const isMediaDevicesAvailable =
      typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined" &&
      typeof navigator.mediaDevices.getUserMedia === "function";

    if (!isMediaDevicesAvailable) {
      setScannerStatus("error");
      setScannerError(
        "Kamera tidak tersedia di browser ini. Jika akses dari HP, gunakan HTTPS (bukan http://IP)."
      );
      return;
    }

    if (!window.isSecureContext) {
      setScannerStatus("error");
      setScannerError(
        "Akses kamera butuh secure context. Buka aplikasi lewat HTTPS agar kamera bisa digunakan."
      );
      return;
    }

    stopScanner();
    setScannerStatus("requesting");
    setScannerError(null);

    try {
      const qrReader = new BrowserQRCodeReader();
      readerRef.current = qrReader;

      const controls = await qrReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (!result) {
            return;
          }

          const text = result.getText();
          setRawScanResult(text);
          const parsedPayload = parseAttendanceQrPayload(text);

          if (!parsedPayload) {
            setScannerError("Format QR tidak valid. Gunakan QR dari dashboard dosen.");
            return;
          }

          form.setValue("course_id", parsedPayload.course_id, { shouldValidate: true });
          form.setValue("session_id", parsedPayload.session_id, { shouldValidate: true });
          form.setValue("qr_token", parsedPayload.qr_token, { shouldValidate: true });
          stopScanner();
        },
      );

      controlsRef.current = controls;
      setScannerStatus("active");
    } catch (error) {
      setScannerStatus("error");
      setScannerError(error instanceof Error ? error.message : "Kamera tidak tersedia.");
    }
  }

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const scannerInfo = useMemo(() => {
    if (scannerStatus === "requesting") {
      return { text: "Meminta izin kamera…", color: "text-amber-600 dark:text-amber-400" };
    }
    if (scannerStatus === "active") {
      return { text: "Scanner aktif — arahkan kamera ke QR presensi", color: "text-emerald-600 dark:text-emerald-400" };
    }
    if (scannerStatus === "error") {
      return { text: scannerError ?? "Scanner gagal diinisialisasi.", color: "text-red-600 dark:text-red-400" };
    }
    return { text: "Scanner belum aktif", color: "text-(--token-gray-500) dark:text-(--token-gray-400)" };
  }, [scannerError, scannerStatus]);

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          <ScanLine size={14} />
          Mahasiswa — Modul Presensi
        </div>
        <h1 className="mt-1 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white) sm:text-2xl">
          Scan QR Presensi
        </h1>
        <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          Gunakan kamera untuk memindai QR dosen, atau isi token secara manual.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        {/* Scanner */}
        <Card variant="default" size="md" className="rounded-2xl">
          <h2 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
            Kamera Scanner
          </h2>

          <div className="mt-4 space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-soft bg-black">
              <video ref={videoRef} className="h-[280px] w-full object-cover sm:h-[320px]" muted playsInline />
              {scannerStatus === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                  <Camera size={32} className="mb-2 text-white/40" />
                  <p className="text-sm text-white/50">Klik &quot;Aktifkan Kamera&quot; untuk mulai</p>
                </div>
              )}
            </div>

            <p className={`text-xs font-medium ${scannerInfo.color}`}>
              {scannerInfo.text}
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void startScanner()}
                className="gradient-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/15 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Camera size={14} />
                Aktifkan Kamera
              </button>
              <button
                type="button"
                onClick={stopScanner}
                className="inline-flex items-center gap-1.5 rounded-full border border-soft px-4 py-2.5 text-sm font-medium text-(--token-gray-600) transition-colors hover:bg-(--token-gray-100) dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)"
              >
                <CameraOff size={14} />
                Hentikan
              </button>
            </div>

            {rawScanResult && (
              <div className="rounded-xl border border-dashed border-(--token-gray-300) bg-(--token-gray-50) p-3 dark:border-(--color-marketing-dark-border) dark:bg-(--token-white-5)">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-(--token-gray-400)">
                  Raw QR Data
                </p>
                <p className="mt-1 break-all font-mono text-xs text-(--token-gray-700) dark:text-(--token-gray-300)">
                  {rawScanResult}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Check-in form */}
        <Card variant="default" size="md" className="rounded-2xl">
          <h2 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
            Form Check-in
          </h2>

          <div className="mt-3 flex flex-col gap-1 rounded-xl bg-(--token-gray-50) px-3 py-2.5 text-xs dark:bg-(--token-white-5)">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-(--token-gray-500)">user_id:</span>
              <span className="font-mono text-(--token-gray-700) dark:text-(--token-gray-300)">
                {session?.identifier ?? "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-(--token-gray-500)">device_id:</span>
              <span className="font-mono text-(--token-gray-700) dark:text-(--token-gray-300)">
                {typeof window === "undefined" ? "-" : getOrCreateAttendanceDeviceId()}
              </span>
            </div>
          </div>

          <form
            className="mt-4 space-y-4"
            onSubmit={form.handleSubmit((values) => checkinMutation.mutate(values))}
          >
            {(["course_id", "session_id", "qr_token"] as const).map((field) => (
              <div key={field}>
                <label className="mb-1.5 block text-xs font-semibold text-(--token-gray-700) dark:text-(--token-gray-200)">
                  {field === "course_id" ? "Course ID" : field === "session_id" ? "Session ID" : "QR Token"}
                </label>
                <input
                  {...form.register(field)}
                  placeholder={field === "qr_token" ? "Paste token jika tidak pakai kamera" : undefined}
                  className={INPUT_CLASS}
                />
                {form.formState.errors[field]?.message && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors[field]!.message}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={checkinMutation.isPending}
              className="gradient-btn inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/15 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
            >
              {checkinMutation.isPending ? "Memproses…" : "Check-in Sekarang"}
            </button>

            {checkinMutation.isError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {checkinMutation.error instanceof Error
                  ? checkinMutation.error.message
                  : "Check-in gagal."}
              </div>
            )}

            {checkinMutation.data && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Check-in berhasil!</p>
                  <p className="mt-0.5 text-xs">
                    presence_id: <span className="font-mono">{checkinMutation.data.presence_id}</span>
                  </p>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
