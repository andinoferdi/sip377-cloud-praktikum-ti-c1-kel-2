"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import Select from "@/components/ui/select";
import StyledQr from "@/components/ui/styled-qr";
import { getAuthSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { normalizeStopSessionErrorMessage } from "@/lib/home/qr-stop-errors";
import { attendanceGasService } from "@/services/attendance-gas-service";
import {
  buildAttendanceSessionIdByMeeting,
  parseMeetingNoFromSessionId,
  isExpiredTimestamp,
  serializeAttendanceQrPayload,
} from "@/utils/home/attendance-qr";
import type { AttendanceQrPayload } from "@/utils/home/attendance-types";
import {
  readLecturerQrSessionState,
  saveLecturerQrSessionState,
} from "@/utils/home/lecturer-qr-session";
import { QrCode, RefreshCw } from "lucide-react";

const QR_TOTAL_SECONDS = 120;
const QR_RETRY_MS = 5_000;
const DEFAULT_TOTAL_MEETINGS = 14;

const createQrSchema = z.object({
  course_id: z.string().trim().min(1, "course_id wajib diisi"),
  meeting_no: z.string().trim().min(1, "meeting_no wajib dipilih"),
});

type CreateQrForm = z.infer<typeof createQrSchema>;
type GenerateQrParams = {
  values: NormalizedCreateQrForm;
  fixedSessionId?: string;
  meetingKey?: string;
};
type NormalizedCreateQrForm = {
  course_id: string;
  meeting_no: number;
};

function normalizeCourseId(value: string) {
  return value.trim().toLowerCase();
}

function normalizeMeetingNo(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

function normalizeCreateQrForm(values: CreateQrForm): NormalizedCreateQrForm {
  return {
    course_id: normalizeCourseId(values.course_id),
    meeting_no: normalizeMeetingNo(values.meeting_no),
  };
}

const DEFAULT_VALUES: CreateQrForm = {
  course_id: "cloud-101",
  meeting_no: "1",
};

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

function ActiveQrContent({
  activePayload,
  encodedQrValue,
  isActiveQr,
  nextRotationAt,
}: {
  activePayload: AttendanceQrPayload;
  encodedQrValue: string;
  isActiveQr: boolean;
  nextRotationAt: string | null;
}) {
  const [countdown, setCountdown] = useState<number | null>(null);

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

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="shrink-0">
        <StyledQr
          value={encodedQrValue}
          size={280}
          renderMode="stable"
          secondsLeft={countdown ?? undefined}
          totalSeconds={QR_TOTAL_SECONDS}
          isExpired={!isActiveQr}
        />
      </div>

      <div className="w-full min-w-0 space-y-2">
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

        <div className="grid grid-cols-1 gap-2">
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
      course_id: persistedQrState?.form_values?.course_id ?? DEFAULT_VALUES.course_id,
      meeting_no: String(
        persistedQrState?.form_values?.meeting_no ?? DEFAULT_VALUES.meeting_no,
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
  const [rotationError, setRotationError] = useState<string | null>(null);

  const rotationTimerRef = useRef<number | null>(null);
  const watchedCourseId = useWatch({ control: form.control, name: "course_id" });
  const watchedMeetingNo = useWatch({ control: form.control, name: "meeting_no" });
  const normalizedWatchedCourseId = normalizeCourseId(watchedCourseId ?? "");

  const courseConfigQuery = useQuery({
    queryKey: ["course-config", normalizedWatchedCourseId],
    enabled: normalizedWatchedCourseId.length > 0,
    queryFn: async () => {
      const response = await attendanceGasService.getCourseMeetingConfig({
        course_id: normalizedWatchedCourseId,
      });
      if (!response.ok) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  const totalMeetings = courseConfigQuery.data?.total_meetings ?? DEFAULT_TOTAL_MEETINGS;
  const meetingOptions = useMemo(
    () =>
      Array.from({ length: totalMeetings }, (_, index) => ({
        value: String(index + 1),
        label: `Pertemuan ${index + 1}`,
      })),
    [totalMeetings],
  );

  useEffect(() => {
    const currentMeetingNo = normalizeMeetingNo(watchedMeetingNo ?? "1");
    if (currentMeetingNo > totalMeetings) {
      form.setValue("meeting_no", String(totalMeetings), { shouldValidate: true });
    }
  }, [form, totalMeetings, watchedMeetingNo]);

  const generateMutation = useMutation({
    mutationFn: async (params: GenerateQrParams) => {
      const normalizedValues = params.values;
      const sessionId = params.fixedSessionId
        ?? buildAttendanceSessionIdByMeeting({
          courseId: normalizedValues.course_id,
          meetingNo: normalizedValues.meeting_no,
        });

      const response = await attendanceGasService.generateToken({
        course_id: normalizedValues.course_id,
        session_id: sessionId,
        meeting_no: normalizedValues.meeting_no,
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
    onSuccess: (payload, params) => {
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
        formValues: params.values,
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
          setRotationError(
            normalizeStopSessionErrorMessage(getErrorMessage(error)),
          );
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
            values: normalizeCreateQrForm(form.getValues()),
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

  const encodedQrValue = useMemo(() => {
    if (!activePayload) return "";
    return serializeAttendanceQrPayload(activePayload);
  }, [activePayload]);

  const browserTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Browser local timezone",
    [],
  );

  const sessionPreview = buildAttendanceSessionIdByMeeting({
    courseId: normalizedWatchedCourseId || DEFAULT_VALUES.course_id,
    meetingNo: normalizeMeetingNo(watchedMeetingNo ?? DEFAULT_VALUES.meeting_no),
  });
  const previewMeetingNo = parseMeetingNoFromSessionId(sessionPreview)
    ?? normalizeMeetingNo(watchedMeetingNo ?? DEFAULT_VALUES.meeting_no);

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
              form.setValue("meeting_no", String(normalizedValues.meeting_no), {
                shouldValidate: true,
              });
              setIsStopped(false);
              generateMutation.mutate({ values: normalizedValues });
            })}
          >
            <div>
              <label className={LABEL_CLASS}>Course ID</label>
              <input
                {...form.register("course_id")}
                type="text"
                placeholder="cloud-101"
                className={INPUT_CLASS}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {form.formState.errors.course_id?.message && (
                <p className="mt-1 text-xs text-red-500">
                  {form.formState.errors.course_id.message}
                </p>
              )}
            </div>

            <div>
              <label className={LABEL_CLASS}>Pertemuan</label>
              <Select
                value={watchedMeetingNo ?? "1"}
                onChange={(value) =>
                  form.setValue("meeting_no", value, { shouldValidate: true })
                }
                options={meetingOptions}
                hasSearch
                searchPlaceholder="Cari pertemuan..."
                placeholder="Pilih pertemuan"
              />
              <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
                Total pertemuan course ini: {totalMeetings}
              </p>
              {form.formState.errors.meeting_no?.message && (
                <p className="mt-1 text-xs text-red-500">
                  {form.formState.errors.meeting_no.message}
                </p>
              )}
            </div>

            {/* Session preview */}
            <div className="rounded-lg border border-soft bg-(--token-gray-50) px-3 py-2.5 dark:bg-(--token-white-5)">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                session_id preview
              </p>
              <p className="break-all font-mono text-xs text-(--token-gray-700) dark:text-(--token-gray-300)">
                {sessionPreview}
              </p>
              <p className="mt-1 text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                Pertemuan {previewMeetingNo} / {totalMeetings}
              </p>
            </div>

            {courseConfigQuery.isError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                Gagal mengambil konfigurasi total pertemuan. Menggunakan default {DEFAULT_TOTAL_MEETINGS}.
              </div>
            )}

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
              <ActiveQrContent
                activePayload={activePayload}
                encodedQrValue={encodedQrValue}
                isActiveQr={isActiveQr}
                nextRotationAt={nextRotationAt}
              />
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
