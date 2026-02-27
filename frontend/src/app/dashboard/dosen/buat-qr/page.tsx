"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { forwardRef, useEffect, useMemo, useState, type InputHTMLAttributes } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/Button";
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

/* ── Info item used inside QR details panel ─────────────────────────────── */
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
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: "rgba(148,163,184,0.07)",
        border: "1px solid rgba(148,163,184,0.14)",
      }}
    >
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
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

/* ── Status badge ───────────────────────────────────────────────────────── */
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={
        active
          ? {
              background: "rgba(16,185,129,0.12)",
              color: "#059669",
              border: "1px solid rgba(16,185,129,0.25)",
            }
          : {
              background: "rgba(239,68,68,0.10)",
              color: "#dc2626",
              border: "1px solid rgba(239,68,68,0.20)",
            }
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: active ? "#10b981" : "#ef4444",
          boxShadow: active ? "0 0 0 2px rgba(16,185,129,0.25)" : "none",
        }}
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
    <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
      {/* ── Left: form ─────────────────────────────────────────────────── */}
      <Card
        variant="default"
        size="md"
        className="rounded-2xl"
        header={
          <div>
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
              Dosen - Modul Presensi
            </p>
            <h1 className="mt-1 text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
              Buat QR Presensi
            </h1>
          </div>
        }
      >
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((values) => generateMutation.mutate(values))}
        >
          {(["course_id", "day", "session_no", "started_at"] as const).map((field) => (
            <div key={field}>
              <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                {field}
              </label>
              <Input {...form.register(field)} />
              {form.formState.errors[field]?.message && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors[field]!.message}
                </p>
              )}
            </div>
          ))}

          <div className="rounded-xl border border-soft p-3 text-xs text-(--token-gray-600) dark:text-(--token-gray-300)">
            session_id preview:{" "}
            <span className="font-semibold">{sessionPreview}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              size="sm"
              className="rounded-full"
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? "Memproses..." : "Generate QR"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() =>
                form.setValue("started_at", new Date().toISOString(), {
                  shouldValidate: true,
                })
              }
            >
              Isi started_at sekarang
            </Button>
          </div>

          {generateMutation.isError && (
            <p className="text-sm text-red-600">
              {generateMutation.error instanceof Error
                ? generateMutation.error.message
                : "Gagal membuat QR."}
            </p>
          )}
        </form>
      </Card>

      {/* ── Right: QR display ──────────────────────────────────────────── */}
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
            <p className="mt-1 text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
              Berganti otomatis setiap 90 detik. Satu token berlaku untuk banyak
              mahasiswa.
            </p>
          </div>
          {activePayload && (
            <StatusBadge active={countdown !== null && countdown > 0} />
          )}
        </div>

        {activePayload ? (
          <div className="mt-5">
            {/* QR + meta layout */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* QR with ring */}
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

                {/* Two-column row for timestamps */}
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
                    className="flex flex-col justify-center rounded-xl px-3 py-2.5"
                    style={{
                      background:
                        countdown !== null && countdown > 0
                          ? "rgba(16,185,129,0.07)"
                          : "rgba(239,68,68,0.06)",
                      border:
                        countdown !== null && countdown > 0
                          ? "1px solid rgba(16,185,129,0.18)"
                          : "1px solid rgba(239,68,68,0.18)",
                    }}
                  >
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                      rotasi dalam
                    </p>
                    <p
                      className="text-sm font-bold tabular-nums"
                      style={{
                        color:
                          countdown !== null && countdown > 0
                            ? "#059669"
                            : "#dc2626",
                      }}
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
          <div
            className="mt-4 rounded-xl px-6 py-8 text-center text-sm text-(--token-gray-400) dark:text-(--token-gray-500)"
            style={{
              border: "1.5px dashed rgba(148,163,184,0.3)",
              background: "rgba(148,163,184,0.04)",
            }}
          >
            <div className="mb-2 text-2xl opacity-40">⬛</div>
            QR belum dibuat.
            <br />
            Isi parameter sesi lalu klik{" "}
            <span className="font-semibold">Generate QR</span>.
          </div>
        )}
      </Card>
    </div>
  );
}
