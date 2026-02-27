"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { IScannerControls } from "@zxing/browser";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useMutation } from "@tanstack/react-query";
import { forwardRef, useEffect, useMemo, useRef, useState, type InputHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/Button";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { attendanceGasService } from "@/services/attendance-gas-service";
import { getOrCreateAttendanceDeviceId } from "@/utils/home/attendance-device-id";
import { appendAttendanceHistory } from "@/utils/home/attendance-history";
import { parseAttendanceQrPayload } from "@/utils/home/attendance-qr";

const checkinSchema = z.object({
  course_id: z.string().trim().min(1, "course_id wajib diisi"),
  session_id: z.string().trim().min(1, "session_id wajib diisi"),
  qr_token: z.string().trim().min(1, "qr_token wajib diisi"),
});

type CheckinForm = z.infer<typeof checkinSchema>;

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  ),
);

Input.displayName = "Input";

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
      return "Meminta izin kamera...";
    }
    if (scannerStatus === "active") {
      return "Scanner aktif. Arahkan kamera ke QR presensi.";
    }
    if (scannerStatus === "error") {
      return scannerError ?? "Scanner gagal diinisialisasi.";
    }
    return "Scanner belum aktif.";
  }, [scannerError, scannerStatus]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <Card variant="default" size="md" className="rounded-2xl">
        <h1 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
          Scan QR Presensi Mahasiswa
        </h1>
        <p className="mt-2 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
          Gunakan kamera untuk memindai QR dosen. Jika kamera tidak tersedia, isi token secara
          manual.
        </p>

        <div className="mt-4 space-y-3">
          <div className="overflow-hidden rounded-xl border border-soft bg-black/70">
            <video ref={videoRef} className="h-[320px] w-full object-cover" muted playsInline />
          </div>

          <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
            {scannerInfo}
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="rounded-full" onClick={() => void startScanner()}>
              Aktifkan Kamera
            </Button>
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={stopScanner}>
              Hentikan Kamera
            </Button>
          </div>

          {rawScanResult && (
            <p className="break-all rounded-xl border border-soft p-3 text-xs text-(--token-gray-600) dark:text-(--token-gray-300)">
              raw_qr: {rawScanResult}
            </p>
          )}
        </div>
      </Card>

      <Card variant="default" size="md" className="rounded-2xl">
        <h2 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
          Form Check-in
        </h2>
        <p className="mt-2 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
          user_id: {session?.identifier ?? "-"}
          <br />
          device_id: {typeof window === "undefined" ? "-" : getOrCreateAttendanceDeviceId()}
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={form.handleSubmit((values) => checkinMutation.mutate(values))}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
              course_id
            </label>
            <Input {...form.register("course_id")} />
            {form.formState.errors.course_id?.message && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.course_id.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
              session_id
            </label>
            <Input {...form.register("session_id")} />
            {form.formState.errors.session_id?.message && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.session_id.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
              qr_token
            </label>
            <Input {...form.register("qr_token")} placeholder="Paste token jika tidak pakai kamera" />
            {form.formState.errors.qr_token?.message && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.qr_token.message}</p>
            )}
          </div>

          <Button type="submit" size="sm" className="rounded-full" disabled={checkinMutation.isPending}>
            {checkinMutation.isPending ? "Memproses..." : "Check-in Sekarang"}
          </Button>

          {checkinMutation.isError && (
            <p className="text-sm text-red-600">
              {checkinMutation.error instanceof Error
                ? checkinMutation.error.message
                : "Check-in gagal."}
            </p>
          )}

          {checkinMutation.data && (
            <div className="rounded-xl border border-soft p-3 text-sm">
              <p>
                <span className="font-semibold">presence_id:</span> {checkinMutation.data.presence_id}
              </p>
              <p>
                <span className="font-semibold">status:</span> {checkinMutation.data.status}
              </p>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
