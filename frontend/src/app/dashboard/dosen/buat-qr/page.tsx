"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth/session";
import StyledQr from "@/components/ui/styled-qr";
import { attendanceGasService } from "@/services/attendance-gas-service";
import type { AttendanceQrPayload } from "@/utils/home/attendance-types";
import {
  readLecturerQrSessionState,
  saveLecturerQrSessionState,
} from "@/utils/home/lecturer-qr-session";
import {
  buildAttendanceSessionId,
  serializeAttendanceQrPayload,
} from "@/utils/home/attendance-qr";
import { QrCode, RefreshCw, Clock } from "lucide-react";

const QR_ROTATION_MS = 90_000;
const QR_TOTAL_SECONDS = 90;

const createQrSchema = z.object({
  course_id: z.string().trim().min(1, "course_id wajib diisi"),
  day: z.string().trim().min(1, "day wajib diisi"),
  session_no: z.string().trim().min(1, "session_no wajib diisi"),
  started_at: z.string().trim().min(1, "started_at wajib diisi"),
});

type CreateQrForm = z.infer<typeof createQrSchema>;

const DEFAULT_VALUES: CreateQrForm = {
  course_id: "cloud-101",
  day: "senin",
  session_no: "02",
  started_at: new Date().toISOString(),
};

const FORM_FIELDS = [
  { name: "course_id" as const, label: "Course ID", placeholder: "cloud-101" },
  { name: "day" as const, label: "Hari", placeholder: "senin" },
  { name: "session_no" as const, label: "Sesi", placeholder: "02" },
  { name: "started_at" as const, label: "Waktu Mulai", placeholder: "ISO 8601 timestamp" },
] as const;

/* ── Info item for QR details ─────────────────────────────────────────── */
function QrInfoItem({
  label,
  value,
  mono = false,
  truncate = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="rounded-xl bg-(--token-gray-50) px-3 py-2.5 dark:bg-(--token-white-5)">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-(--token-gray-400) dark:text-(--token-gray-500)">
        {label}
      </p>
      <p
        className={`text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white) ${
          mono ? "font-mono" : ""
        } ${truncate ? "break-all" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────────────────── */
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
          : "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]" : "bg-red-500"
        }`}
      />
      {active ? "Active" : "Expired"}
    </span>
  );
}

export default function DosenCreateQrPage() {
  const sessionIdentifier = useMemo(
    () => getAuthSession()?.identifier ?? null,
    [],
  );
  const persistedQrState = useMemo(
    () => readLecturerQrSessionState(sessionIdentifier),
    [sessionIdentifier],
  );

  const form = useForm<CreateQrForm>({
    resolver: zodResolver(createQrSchema),
    defaultValues: persistedQrState?.form_values ?? DEFAULT_VALUES,
  });

  const [activePayload, setActivePayload] = useState<AttendanceQrPayload | null>(
    persistedQrState?.active_payload ?? null,
  );
  const [nextRotationAt, setNextRotationAt] = useState<string | null>(
    persistedQrState?.next_rotation_at ?? null,
  );
  const [countdown, setCountdown] = useState<number | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (values: CreateQrForm) => {
      const sessionId = buildAttendanceSessionId({
        courseId: values.course_id,
        day: values.day,
        sessionNo: values.session_no,
        startedAt: values.started_at,
      });

      const response = await attendanceGasService.generateToken({
        course_id: values.course_id,
        session_id: sessionId,
        ts: new Date().toISOString(),
      });

      if (!response.ok) {
        throw new Error(response.error);
      }

      const payload: AttendanceQrPayload = {
        v: 1,
        course_id: values.course_id,
        session_id: sessionId,
        qr_token: response.data.qr_token,
        expires_at: response.data.expires_at,
      };

      return payload;
    },
    onSuccess: (payload) => {
      const nextRotationTimestamp = new Date(
        Date.now() + QR_ROTATION_MS,
      ).toISOString();
      setActivePayload(payload);
      setNextRotationAt(nextRotationTimestamp);
      saveLecturerQrSessionState({
        ownerIdentifier: sessionIdentifier,
        activePayload: payload,
        nextRotationAt: nextRotationTimestamp,
        formValues: form.getValues(),
      });
    },
  });

  /* Auto-rotate QR every 90 s */
  useEffect(() => {
    if (!activePayload) return;

    const timerId = window.setInterval(() => {
      const values = form.getValues();
      void generateMutation.mutateAsync(values);
    }, QR_ROTATION_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [activePayload, form, generateMutation]);

  /* Countdown ticker */
  useEffect(() => {
    if (!nextRotationAt) {
      setCountdown(null);
      return;
    }
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((Date.parse(nextRotationAt) - Date.now()) / 1000),
      );
      setCountdown(remaining);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [nextRotationAt]);

  const encodedQrValue = useMemo(() => {
    if (!activePayload) return "";
    return serializeAttendanceQrPayload(activePayload);
  }, [activePayload]);

  const watchedCourseId = useWatch({ control: form.control, name: "course_id" });
  const watchedDay = useWatch({ control: form.control, name: "day" });
  const watchedSessionNo = useWatch({ control: form.control, name: "session_no" });
  const watchedStartedAt = useWatch({ control: form.control, name: "started_at" });

  const sessionPreview = buildAttendanceSessionId({
    courseId: watchedCourseId ?? "",
    day: watchedDay ?? "",
    sessionNo: watchedSessionNo ?? "",
    startedAt: watchedStartedAt ?? "",
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          <QrCode size={14} />
          Dosen — Modul Presensi
        </div>
        <h1 className="mt-1 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white) sm:text-2xl">
          Buat QR Presensi
        </h1>
        <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          QR dinamis berganti otomatis setiap 90 detik. Satu token berlaku untuk banyak mahasiswa.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        {/* ── Left: form ───────────────────────────────────────────── */}
        <Card variant="default" size="md" className="rounded-2xl">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => generateMutation.mutate(values))}
          >
            {FORM_FIELDS.map((field) => (
              <div key={field.name}>
                <label className="mb-1.5 block text-xs font-semibold text-(--token-gray-700) dark:text-(--token-gray-200)">
                  {field.label}
                </label>
                <input
                  {...form.register(field.name)}
                  placeholder={field.placeholder}
                  className="h-11 w-full rounded-xl border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)"
                />
                {form.formState.errors[field.name]?.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors[field.name]!.message}
                  </p>
                )}
              </div>
            ))}

            <div className="rounded-xl border border-dashed border-(--token-gray-300) bg-(--token-gray-50) p-3 text-xs text-(--token-gray-600) dark:border-(--color-marketing-dark-border) dark:bg-(--token-white-5) dark:text-(--token-gray-300)">
              <span className="font-semibold">session_id preview: </span>
              <span className="font-mono">{sessionPreview}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="gradient-btn inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/15 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {generateMutation.isPending ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Memproses…
                  </>
                ) : (
                  "Generate QR"
                )}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-soft px-4 py-2.5 text-sm font-medium text-(--token-gray-600) transition-colors hover:bg-(--token-gray-100) dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)"
                onClick={() =>
                  form.setValue("started_at", new Date().toISOString(), {
                    shouldValidate: true,
                  })
                }
              >
                <Clock size={14} />
                Waktu Sekarang
              </button>
            </div>

            {generateMutation.isError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : "Gagal membuat QR."}
              </div>
            )}
          </form>
        </Card>

        {/* ── Right: QR display ────────────────────────────────────── */}
        <Card variant="default" size="md" className="rounded-2xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                QR Dinamis
                <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-(--token-gray-500) dark:bg-white/8 dark:text-(--token-gray-400)">
                  One-to-Many
                </span>
              </h2>
            </div>
            {activePayload && (
              <StatusBadge active={countdown !== null && countdown > 0} />
            )}
          </div>

          {activePayload ? (
            <div className="mt-5">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* QR */}
                <div className="shrink-0">
                  <StyledQr
                    value={encodedQrValue}
                    size={190}
                    secondsLeft={countdown ?? undefined}
                    totalSeconds={QR_TOTAL_SECONDS}
                    isExpired={countdown !== null && countdown <= 0}
                  />
                </div>

                {/* Info grid */}
                <div className="w-full min-w-0 flex-1 space-y-2">
                  <QrInfoItem
                    label="course_id"
                    value={activePayload.course_id}
                    mono
                  />
                  <QrInfoItem
                    label="session_id"
                    value={activePayload.session_id}
                    mono
                    truncate
                  />
                  <QrInfoItem
                    label="qr_token"
                    value={activePayload.qr_token}
                    mono
                    truncate
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <QrInfoItem
                      label="expires_at"
                      value={
                        activePayload.expires_at
                          ? new Date(activePayload.expires_at).toLocaleTimeString("id-ID")
                          : "-"
                      }
                      mono
                    />
                    <div
                      className={`flex flex-col justify-center rounded-xl px-3 py-2.5 ${
                        countdown !== null && countdown > 0
                          ? "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-500/8 dark:ring-emerald-500/20"
                          : "bg-red-50 ring-1 ring-red-200 dark:bg-red-500/8 dark:ring-red-500/20"
                      }`}
                    >
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-(--token-gray-400) dark:text-(--token-gray-500)">
                        rotasi dalam
                      </p>
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          countdown !== null && countdown > 0
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-red-700 dark:text-red-400"
                        }`}
                      >
                        {countdown !== null && countdown > 0
                          ? `${countdown}s`
                          : "Expired"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-xl border-2 border-dashed border-(--token-gray-200) px-6 py-10 text-center dark:border-(--color-marketing-dark-border)">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-(--token-gray-100) dark:bg-(--token-white-5)">
                <QrCode size={24} className="text-(--token-gray-400)" />
              </div>
              <p className="text-sm font-medium text-(--token-gray-500) dark:text-(--token-gray-400)">
                QR belum dibuat
              </p>
              <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
                Isi parameter sesi lalu klik <span className="font-semibold">Generate QR</span>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
