"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import DatePicker from "@/components/ui/date-picker";
import StyledQr from "@/components/ui/styled-qr";
import { getAuthSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { attendanceGasService } from "@/services/attendance-gas-service";
import {
  buildAttendanceSessionId,
  isExpiredTimestamp,
  serializeAttendanceQrPayload,
} from "@/utils/home/attendance-qr";
import type { AttendanceQrPayload } from "@/utils/home/attendance-types";
import {
  readLecturerQrSessionState,
  saveLecturerQrSessionState,
} from "@/utils/home/lecturer-qr-session";
import { Clock, QrCode, RefreshCw } from "lucide-react";

const QR_TOTAL_SECONDS = 120;
const QR_RETRY_MS = 5_000;

function toLocalDateTimeInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 19);
}

function normalizeStartedAtForInput(value: string | null | undefined) {
  if (!value) return toLocalDateTimeInputValue(new Date());
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.length === 16 ? `${value}:00` : value;
  }
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return toLocalDateTimeInputValue(new Date());
  return toLocalDateTimeInputValue(parsedDate);
}

const createQrSchema = z.object({
  course_id: z.string().trim().min(1, "course_id wajib diisi"),
  started_at: z.string().trim().min(1, "started_at wajib diisi"),
});

type CreateQrForm = z.infer<typeof createQrSchema>;
type GenerateQrParams = {
  values: CreateQrForm;
  fixedSessionId?: string;
  meetingKey?: string;
};

function normalizeCourseId(value: string) {
  return value.trim().toLowerCase();
}

function normalizeCreateQrForm(values: CreateQrForm): CreateQrForm {
  return {
    course_id: normalizeCourseId(values.course_id),
    started_at: values.started_at.trim(),
  };
}

const DEFAULT_VALUES: CreateQrForm = {
  course_id: "cloud-101",
  started_at: toLocalDateTimeInputValue(new Date()),
};

const FORM_FIELDS = [
  { name: "course_id" as const, label: "Course ID", placeholder: "cloud-101" },
  { name: "started_at" as const, label: "Waktu Mulai", placeholder: "Pilih waktu mulai" },
] as const;

const LABEL_CLASS =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)";

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
    <div className="rounded-lg border border-soft bg-(--token-gray-50) px-3 py-2.5 dark:bg-(--token-white-5)">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
        {label}
      </p>
      <p
        className={[
          "text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)",
          mono ? "font-mono" : "",
          truncate ? "break-all" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "expired" | "stopped" }) {
  const isActive = status === "active";
  const isStopped = status === "stopped";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          : isStopped
            ? "border-soft bg-(--token-gray-100) text-(--token-gray-600) dark:bg-(--token-white-8) dark:text-(--token-gray-300)"
            : "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          isActive
            ? "bg-emerald-500"
            : isStopped
              ? "bg-(--token-gray-400)"
              : "bg-red-500",
        ].join(" ")}
      />
      {isActive ? "Active" : isStopped ? "Stopped" : "Expired"}
    </span>
  );
}

export default function DosenCreateQrPage() {
  const sessionIdentifier = useMemo(() => getAuthSession()?.identifier ?? null, []);
  const persistedQrState = useMemo(
    () => readLecturerQrSessionState(sessionIdentifier),
    [sessionIdentifier],
  );

  const form = useForm<CreateQrForm>({
    resolver: zodResolver(createQrSchema),
    defaultValues: {
      ...(persistedQrState?.form_values ?? DEFAULT_VALUES),
      started_at: normalizeStartedAtForInput(
        persistedQrState?.form_values?.started_at ?? DEFAULT_VALUES.started_at,
      ),
    },
  });

  const [activePayload, setActivePayload] = useState<AttendanceQrPayload | null>(
    persistedQrState?.is_stopped ? null : (persistedQrState?.active_payload ?? null),
  );
  const [nextRotationAt, setNextRotationAt] = useState<string | null>(
    persistedQrState?.is_stopped
      ? null
      : (persistedQrState?.active_payload?.expires_at ??
          persistedQrState?.next_rotation_at ??
          null),
  );
  const [isStopped, setIsStopped] = useState<boolean>(persistedQrState?.is_stopped ?? false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [rotationError, setRotationError] = useState<string | null>(null);

  const rotationTimerRef = useRef<number | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (params: GenerateQrParams) => {
      const normalizedValues = normalizeCreateQrForm(params.values);
      const sessionId =
        params.fixedSessionId ??
        buildAttendanceSessionId({
          courseId: normalizedValues.course_id,
          startedAt: normalizedValues.started_at,
        });

      const response = await attendanceGasService.generateToken({
        course_id: normalizedValues.course_id,
        session_id: sessionId,
        ts: new Date().toISOString(),
        owner_identifier: sessionIdentifier ?? undefined,
        meeting_key: params.meetingKey,
      });

      if (!response.ok) throw new Error(response.error);

      const payload: AttendanceQrPayload = {
        v: 1,
        course_id: normalizedValues.course_id,
        session_id: sessionId,
        qr_token: response.data.qr_token,
        expires_at: response.data.expires_at,
        meeting_key: response.data.meeting_key,
      };

      return payload;
    },
    onSuccess: (payload) => {
      const nextRotationTimestamp = payload.expires_at;
      setIsStopped(false);
      setActivePayload(payload);
      setNextRotationAt(nextRotationTimestamp);
      setRotationError(null);
      saveLecturerQrSessionState({
        ownerIdentifier: sessionIdentifier,
        activePayload: payload,
        nextRotationAt: nextRotationTimestamp,
        isStopped: false,
        formValues: normalizeCreateQrForm(form.getValues()),
      });
    },
  });

  const stopSessionMutation = useMutation({
    mutationFn: async (payload: {
      course_id: string;
      session_id: string;
      meeting_key?: string;
    }) => {
      const response = await attendanceGasService.stopSession({
        course_id: payload.course_id,
        session_id: payload.session_id,
        ts: new Date().toISOString(),
        owner_identifier: sessionIdentifier ?? undefined,
        meeting_key: payload.meeting_key,
      });
      if (!response.ok) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  function clearRotationTimer() {
    if (rotationTimerRef.current !== null) {
      window.clearTimeout(rotationTimerRef.current);
      rotationTimerRef.current = null;
    }
  }

  function applyStoppedState() {
    clearRotationTimer();
    setIsStopped(true);
    setActivePayload(null);
    setNextRotationAt(null);
    setCountdown(null);
    setRotationError(null);
    saveLecturerQrSessionState({
      ownerIdentifier: sessionIdentifier,
      activePayload: null,
      nextRotationAt: null,
      isStopped: true,
      formValues: normalizeCreateQrForm(form.getValues()),
    });
  }

  function handleStopQr() {
    if (stopSessionMutation.isPending) {
      return;
    }

    if (!activePayload) {
      applyStoppedState();
      return;
    }

    setRotationError(null);
    stopSessionMutation.mutate(
      {
        course_id: activePayload.course_id,
        session_id: activePayload.session_id,
        meeting_key: activePayload.meeting_key,
      },
      {
        onSuccess: () => {
          applyStoppedState();
        },
        onError: (error) => {
          setRotationError(`Gagal menghentikan sesi: ${getErrorMessage(error)}`);
        },
      },
    );
  }

  useEffect(() => {
    if (!activePayload || isStopped) {
      clearRotationTimer();
      return;
    }

    let cancelled = false;

    const scheduleRetry = (delayMs: number) => {
      clearRotationTimer();
      rotationTimerRef.current = window.setTimeout(async () => {
        if (cancelled) return;
        if (generateMutation.isPending) {
          scheduleRetry(500);
          return;
        }
        try {
          await generateMutation.mutateAsync({
            values: form.getValues(),
            fixedSessionId: activePayload.session_id,
            meetingKey: activePayload.meeting_key,
          });
        } catch (error) {
          if (cancelled) return;
          setRotationError(
            `Rotasi QR gagal sementara: ${getErrorMessage(error)}. Coba lagi otomatis...`,
          );
          scheduleRetry(QR_RETRY_MS);
        }
      }, delayMs);
    };

    const expiresAtMs = Date.parse(activePayload.expires_at);
    const msUntilExpire = Number.isFinite(expiresAtMs)
      ? Math.max(0, expiresAtMs - Date.now())
      : 0;

    scheduleRetry(msUntilExpire);

    return () => {
      cancelled = true;
      clearRotationTimer();
    };
  }, [activePayload, form, generateMutation, isStopped]);

  useEffect(() => {
    if (!nextRotationAt || isStopped) {
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
  }, [isStopped, nextRotationAt]);

  const encodedQrValue = useMemo(() => {
    if (!activePayload) return "";
    return serializeAttendanceQrPayload(activePayload);
  }, [activePayload]);

  const watchedCourseId = useWatch({ control: form.control, name: "course_id" });
  const watchedStartedAt = useWatch({ control: form.control, name: "started_at" });

  const browserTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Browser local timezone",
    [],
  );

  const sessionPreview = buildAttendanceSessionId({
    courseId: normalizeCourseId(watchedCourseId ?? ""),
    startedAt: watchedStartedAt ?? "",
  });

  const isActiveQr =
    !!activePayload && !isStopped && !isExpiredTimestamp(activePayload.expires_at);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Dosen - Modul Presensi
        </p>
        <h1 className="mt-1 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white) sm:text-2xl">
          Buat QR Presensi
        </h1>
        <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          QR dinamis berganti otomatis berdasarkan waktu expired token. Satu token berlaku
          untuk banyak mahasiswa.
        </p>
        <p className="mt-0.5 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
          Zona waktu browser: {browserTimeZone}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        {/* Form card */}
        <div className="overflow-visible rounded-2xl border border-soft surface-elevated">
          <div className="border-b border-soft px-5 py-4">
            <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
              Parameter Sesi
            </h2>
          </div>

          <form
            className="space-y-4 p-5"
            onSubmit={form.handleSubmit((values) => {
              const normalizedValues = normalizeCreateQrForm(values);
              form.setValue("course_id", normalizedValues.course_id, { shouldValidate: true });
              setIsStopped(false);
              generateMutation.mutate({ values: normalizedValues });
            })}
          >
            {FORM_FIELDS.map((field) => (
              <div key={field.name}>
                <label className={LABEL_CLASS}>{field.label}</label>
                {field.name === "started_at" ? (
                  <>
                    <input type="hidden" {...form.register(field.name)} />
                    <DatePicker
                      id={`${field.name}_picker`}
                      mode="single"
                      defaultDate={watchedStartedAt || undefined}
                      placeholder={field.placeholder}
                      onChange={(selectedDates) => {
                        const selected = selectedDates?.[0];
                        if (!selected) return;
                        form.setValue(
                          field.name,
                          toLocalDateTimeInputValue(selected),
                          { shouldValidate: true },
                        );
                      }}
                    />
                  </>
                ) : (
                  <input
                    {...form.register(field.name)}
                    type="text"
                    placeholder={field.placeholder}
                    className={INPUT_CLASS}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                )}
                {form.formState.errors[field.name]?.message && (
                  <p className="mt-1 text-xs text-red-500">
                    {form.formState.errors[field.name]!.message}
                  </p>
                )}
              </div>
            ))}

            {/* Session preview */}
            <div className="rounded-lg border border-soft bg-(--token-gray-50) px-3 py-2.5 dark:bg-(--token-white-5)">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                session_id preview
              </p>
              <p className="break-all font-mono text-xs text-(--token-gray-700) dark:text-(--token-gray-300)">
                {sessionPreview}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:hover:opacity-90"
              >
                {generateMutation.isPending ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Generate QR"
                )}
              </button>

              <button
                type="button"
                onClick={handleStopQr}
                disabled={stopSessionMutation.isPending || (!activePayload && !generateMutation.isPending)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
              >
                {stopSessionMutation.isPending ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Menghentikan...
                  </>
                ) : (
                  "Stop QR"
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  form.setValue("started_at", toLocalDateTimeInputValue(new Date()), {
                    shouldValidate: true,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-soft px-4 py-2.5 text-sm font-medium text-(--token-gray-600) transition-colors hover:bg-(--token-gray-100) dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)"
              >
                <Clock size={13} />
                Waktu Sekarang
              </button>
            </div>

            {generateMutation.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {getErrorMessage(generateMutation.error)}
              </div>
            )}
          </form>
        </div>

        {/* QR display card */}
        <div className="overflow-hidden rounded-2xl border border-soft surface-elevated">
          <div className="flex items-center justify-between gap-3 border-b border-soft px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                QR Dinamis
              </h2>
              {rotationError && (
                <p className="mt-0.5 text-xs text-red-500 dark:text-red-400">
                  {rotationError}
                </p>
              )}
            </div>
            {(activePayload || isStopped) && (
              <StatusBadge
                status={isStopped ? "stopped" : isActiveQr ? "active" : "expired"}
              />
            )}
          </div>

          <div className="p-5">
            {isStopped ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
                  <QrCode size={20} className="text-(--token-gray-500)" />
                </div>
                <p className="text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300)">
                  QR dihentikan oleh dosen
                </p>
                <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
                  Klik Generate QR untuk memulai lagi.
                </p>
              </div>
            ) : activePayload ? (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  <StyledQr
                    value={encodedQrValue}
                    size={190}
                    secondsLeft={countdown ?? undefined}
                    totalSeconds={QR_TOTAL_SECONDS}
                    isExpired={!isActiveQr}
                  />
                </div>

                <div className="w-full min-w-0 flex-1 space-y-2">
                  <QrInfoItem label="course_id" value={activePayload.course_id} mono />
                  <QrInfoItem
                    label="session_id"
                    value={activePayload.session_id}
                    mono
                    truncate
                  />
                  <QrInfoItem
                    label="meeting_key"
                    value={activePayload.meeting_key ?? "-"}
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
                          ? new Date(activePayload.expires_at).toLocaleTimeString(
                              undefined,
                              { hour: "2-digit", minute: "2-digit", second: "2-digit" },
                            )
                          : "-"
                      }
                      mono
                    />
                    <div
                      className={[
                        "flex flex-col justify-center rounded-lg border px-3 py-2.5",
                        isActiveQr
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/8"
                          : "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/8",
                      ].join(" ")}
                    >
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                        rotasi dalam
                      </p>
                      <p
                        className={[
                          "text-sm font-bold tabular-nums",
                          isActiveQr
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400",
                        ].join(" ")}
                      >
                        {countdown !== null && countdown > 0 ? `${countdown}s` : "Expired"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
                  <QrCode size={20} className="text-(--token-gray-400)" />
                </div>
                <p className="text-sm font-medium text-(--token-gray-500) dark:text-(--token-gray-400)">
                  QR belum dibuat
                </p>
                <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
                  Isi parameter sesi lalu klik Generate QR.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
