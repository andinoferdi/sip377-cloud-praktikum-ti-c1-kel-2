"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import StyledQr from "@/components/ui/styled-qr";
import {
  formatRemainingSeconds,
  getNextRefreshAt,
  isTokenExpired,
} from "@/lib/home/attendance-token-timing";
import { createAttendanceSimulationEngine } from "@/lib/home/mock-attendance-engine";
import { attendanceGasService } from "@/services/attendance-gas-service";
import type {
  ApiResponse,
  CheckInRequest,
  AttendanceQrRequest,
  AttendanceStatusRequest,
} from "@/utils/home/attendance-types";
import { getErrorMessage } from "@/lib/errors";
import { hasGasBaseUrl } from "@/services/gas-client";

/* ── Types ──────────────────────────────────────────────────────────────── */

type SummaryState = {
  qr_token: string | null;
  expires_at: string | null;
  presence_id: string | null;
  status: string | null;
  last_ts: string | null;
};

type QrState = {
  qrToken: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  autoRefreshEnabled: boolean;
  nextRefreshAt: string | null;
};

type SimulatorMode = "mock" | "gas";
type GenerateReason = "manual" | "auto";

/* ── Helpers ────────────────────────────────────────────────────────────── */

function getCurrentIsoTimestamp() {
  return new Date().toISOString();
}

const DEFAULT_GENERATE_FORM: AttendanceQrRequest = {
  course_id: "cloud-101",
  session_id: "sesi-02",
  ts: getCurrentIsoTimestamp(),
};

const DEFAULT_CHECKIN_FORM: CheckInRequest = {
  user_id: "2023xxxx",
  device_id: "dev-001",
  course_id: "cloud-101",
  session_id: "sesi-02",
  qr_token: "",
  ts: getCurrentIsoTimestamp(),
};

const DEFAULT_STATUS_FORM: AttendanceStatusRequest = {
  user_id: "2023xxxx",
  course_id: "cloud-101",
  session_id: "sesi-02",
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

/* ── Sub-components ─────────────────────────────────────────────────────── */

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

function SummaryRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5"
      style={{
        background: "rgba(148,163,184,0.06)",
        border: "1px solid rgba(148,163,184,0.13)",
      }}
    >
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
        {label}
      </dt>
      <dd
        className={`text-sm font-semibold break-all text-(--token-gray-800) dark:text-(--token-white) ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function SimulatorSection() {
  const engine = useRef(createAttendanceSimulationEngine());
  const autoRefreshRunningRef = useRef(false);
  const gasEnabled = hasGasBaseUrl();

  const [generateForm, setGenerateForm] = useState(DEFAULT_GENERATE_FORM);
  const [checkInForm, setCheckInForm] = useState(DEFAULT_CHECKIN_FORM);
  const [statusForm, setStatusForm] = useState(DEFAULT_STATUS_FORM);
  const [mode, setMode] = useState<SimulatorMode>("mock");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<SummaryState>({
    qr_token: null,
    expires_at: null,
    presence_id: null,
    status: null,
    last_ts: null,
  });
  const [qrState, setQrState] = useState<QrState>({
    qrToken: null,
    expiresAt: null,
    isExpired: false,
    autoRefreshEnabled: true,
    nextRefreshAt: null,
  });
  const [lastResponse, setLastResponse] = useState<ApiResponse<unknown> | null>(null);

  const formattedResponse = useMemo(() => {
    if (!lastResponse) return JSON.stringify({ ok: true, data: {} }, null, 2);
    return JSON.stringify(lastResponse, null, 2);
  }, [lastResponse]);

  const setQrFromGenerateResponse = (token: string, expiresAt: string) => {
    setQrState((previous) => {
      const expired = isTokenExpired(expiresAt);
      return {
        ...previous,
        qrToken: token,
        expiresAt,
        isExpired: expired,
        nextRefreshAt: getNextRefreshAt(expiresAt, previous.autoRefreshEnabled),
      };
    });
  };

  const generateToken = useCallback(
    async (reason: GenerateReason = "manual") => {
      if (isSubmitting) return;

      const payload: AttendanceQrRequest = {
        ...generateForm,
        ts: getCurrentIsoTimestamp(),
      };

      if (reason === "auto") autoRefreshRunningRef.current = true;

      setGenerateForm((previous) => ({ ...previous, ts: payload.ts }));
      setIsSubmitting(true);

      try {
        const response =
          mode === "gas"
            ? await attendanceGasService.generateToken(payload)
            : engine.current.generateToken(payload);

        setLastResponse(response);
        if (!response.ok) return;

        setSummary((previous) => ({
          ...previous,
          qr_token: response.data.qr_token,
          expires_at: response.data.expires_at,
        }));

        setQrFromGenerateResponse(response.data.qr_token, response.data.expires_at);

        setCheckInForm((previous) => ({
          ...previous,
          course_id: payload.course_id,
          session_id: payload.session_id,
          qr_token: response.data.qr_token,
          ts: getCurrentIsoTimestamp(),
        }));

        setStatusForm((previous) => ({
          ...previous,
          course_id: payload.course_id,
          session_id: payload.session_id,
        }));
      } catch (error) {
        setLastResponse({ ok: false, error: getErrorMessage(error) });
      } finally {
        setIsSubmitting(false);
        if (reason === "auto") autoRefreshRunningRef.current = false;
      }
    },
    [generateForm, isSubmitting, mode],
  );

  const handleGenerateToken = async () => generateToken("manual");

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    try {
      const response =
        mode === "gas"
          ? await attendanceGasService.checkIn(checkInForm)
          : engine.current.checkIn(checkInForm);
      setLastResponse(response);
      if (!response.ok) return;

      setSummary((previous) => ({
        ...previous,
        presence_id: response.data.presence_id,
        status: response.data.status,
        last_ts: checkInForm.ts,
      }));

      setStatusForm((previous) => ({
        ...previous,
        user_id: checkInForm.user_id,
        course_id: checkInForm.course_id,
        session_id: checkInForm.session_id,
      }));
    } catch (error) {
      setLastResponse({ ok: false, error: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsSubmitting(true);
    try {
      const response =
        mode === "gas"
          ? await attendanceGasService.checkStatus(statusForm)
          : engine.current.checkStatus(statusForm);
      setLastResponse(response);
      if (!response.ok) return;

      setSummary((previous) => ({
        ...previous,
        status: response.data.status,
        last_ts: response.data.last_ts,
      }));
    } catch (error) {
      setLastResponse({ ok: false, error: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Token expiry watcher */
  useEffect(() => {
    if (!qrState.expiresAt) return;

    const updateStatus = () => {
      const expired = isTokenExpired(qrState.expiresAt);
      setQrState((previous) => {
        if (
          previous.expiresAt !== qrState.expiresAt ||
          previous.isExpired === expired
        ) {
          return previous;
        }
        return { ...previous, isExpired: expired };
      });
    };

    updateStatus();
    const intervalId = window.setInterval(updateStatus, 1000);
    return () => window.clearInterval(intervalId);
  }, [qrState.expiresAt]);

  /* Auto-refresh on expiry */
  useEffect(() => {
    if (!qrState.autoRefreshEnabled || !qrState.expiresAt || !qrState.qrToken)
      return;

    const expiresAtMs = Date.parse(qrState.expiresAt);
    if (Number.isNaN(expiresAtMs)) return;

    const timeoutMs = Math.max(expiresAtMs - Date.now(), 0);
    const timeoutId = window.setTimeout(() => {
      if (autoRefreshRunningRef.current) return;
      void generateToken("auto");
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [
    qrState.autoRefreshEnabled,
    qrState.expiresAt,
    qrState.qrToken,
    generateToken,
  ]);

  const remainingSeconds = formatRemainingSeconds(qrState.expiresAt);
  // Estimate total token lifetime (~120s = 2 min as per "Auto refresh tiap 2 menit")
  const QR_TOKEN_TOTAL_SECONDS = 120;

  return (
    <section id="simulasi" className="scroll-mt-28 py-10 md:py-14">
      <div className="wrapper">
        {/* ── Section header ─────────────────────────────────────────── */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white)">
            Simulasi Interaktif
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
            Gunakan mode mock untuk simulasi lokal, atau mode GAS untuk request
            langsung ke backend deployment. Data mode mock akan hilang saat
            halaman dimuat ulang.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={mode === "mock" ? "primary" : "outline"}
              className="rounded-full"
              onClick={() => setMode("mock")}
              disabled={isSubmitting}
            >
              Mode Mock
            </Button>
            <Button
              size="sm"
              variant={mode === "gas" ? "primary" : "outline"}
              className="rounded-full"
              onClick={() => setMode("gas")}
              disabled={!gasEnabled || isSubmitting}
            >
              Mode GAS
            </Button>
            <span className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
              {gasEnabled
                ? "Mode GAS tersedia melalui NEXT_PUBLIC_GAS_BASE_URL."
                : "Mode GAS nonaktif. Atur NEXT_PUBLIC_GAS_BASE_URL untuk mengaktifkan."}
            </span>
          </div>
        </div>

        {/* ── Three-column cards ─────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Generate QR Token */}
          <Card
            variant="default"
            size="md"
            className="rounded-2xl"
            header={
              <div>
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  POST /presence/qr/generate
                </p>
                <h3 className="mt-1 text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Generate QR Token
                </h3>
              </div>
            }
          >
            <div className="space-y-3">
              {/* Form fields */}
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  course_id
                </label>
                <Input
                  value={generateForm.course_id}
                  onChange={(event) =>
                    setGenerateForm((previous) => ({
                      ...previous,
                      course_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  session_id
                </label>
                <Input
                  value={generateForm.session_id}
                  onChange={(event) =>
                    setGenerateForm((previous) => ({
                      ...previous,
                      session_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  ts
                </label>
                <Input
                  value={generateForm.ts}
                  onChange={(event) =>
                    setGenerateForm((previous) => ({
                      ...previous,
                      ts: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    setGenerateForm((previous) => ({
                      ...previous,
                      ts: getCurrentIsoTimestamp(),
                    }))
                  }
                >
                  Isi ts saat ini
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={handleGenerateToken}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses..." : "Generate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => void generateToken("manual")}
                  disabled={isSubmitting || !qrState.qrToken}
                >
                  Refresh sekarang
                </Button>
              </div>

              {/* ── Premium QR panel ───────────────────────────────── */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(148,163,184,0.06)",
                  border: "1px solid rgba(148,163,184,0.14)",
                }}
              >
                {/* Panel header */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-(--token-gray-600) dark:text-(--token-gray-300)">
                    QR Presensi
                    <span className="ml-1.5 rounded px-1 py-0.5 text-[10px] font-medium bg-black/[0.05] dark:bg-white/[0.08] text-(--token-gray-400)">
                      token-only
                    </span>
                  </p>
                  {qrState.qrToken && (
                    <StatusBadge active={!qrState.isExpired} />
                  )}
                </div>

                {qrState.qrToken ? (
                  <div className="space-y-3">
                    {/* Centered QR with countdown ring */}
                    <div className="flex justify-center py-1">
                      <StyledQr
                        value={qrState.qrToken}
                        size={172}
                        variant="compact"
                        isExpired={qrState.isExpired}
                        secondsLeft={
                          qrState.isExpired
                            ? 0
                            : typeof remainingSeconds === "number"
                              ? remainingSeconds
                              : Number(remainingSeconds)
                        }
                        totalSeconds={QR_TOKEN_TOTAL_SECONDS}
                      />
                    </div>

                    {/* Token value */}
                    <div
                      className="rounded-lg px-3 py-2"
                      style={{
                        background: "rgba(15,23,42,0.04)",
                        border: "1px solid rgba(15,23,42,0.07)",
                      }}
                    >
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400)">
                        qr_token
                      </p>
                      <p className="break-all font-mono text-xs font-semibold text-(--token-gray-800) dark:text-(--token-white)">
                        {qrState.qrToken}
                      </p>
                    </div>

                    {/* Meta row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className="rounded-lg px-2.5 py-2"
                        style={{
                          background: "rgba(148,163,184,0.06)",
                          border: "1px solid rgba(148,163,184,0.12)",
                        }}
                      >
                        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-(--token-gray-400)">
                          expires_at
                        </p>
                        <p className="font-mono text-[11px] font-medium text-(--token-gray-700) dark:text-(--token-gray-300)">
                          {qrState.expiresAt
                            ? new Date(qrState.expiresAt).toLocaleTimeString("id-ID")
                            : "-"}
                        </p>
                      </div>
                      <div
                        className="rounded-lg px-2.5 py-2"
                        style={{
                          background:
                            qrState.autoRefreshEnabled
                              ? "rgba(16,185,129,0.07)"
                              : "rgba(148,163,184,0.06)",
                          border:
                            qrState.autoRefreshEnabled
                              ? "1px solid rgba(16,185,129,0.18)"
                              : "1px solid rgba(148,163,184,0.12)",
                        }}
                      >
                        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-(--token-gray-400)">
                          auto-refresh
                        </p>
                        <p
                          className="text-[11px] font-semibold"
                          style={{
                            color: qrState.autoRefreshEnabled
                              ? "#059669"
                              : "#6b7280",
                          }}
                        >
                          {qrState.autoRefreshEnabled ? "Aktif" : "Nonaktif"}
                        </p>
                      </div>
                    </div>

                    {/* Next refresh */}
                    {qrState.nextRefreshAt && (
                      <p className="text-center text-[11px] text-(--token-gray-400) dark:text-(--token-gray-500)">
                        Refresh berikutnya:{" "}
                        <span className="font-mono font-medium text-(--token-gray-600) dark:text-(--token-gray-400)">
                          {new Date(qrState.nextRefreshAt).toLocaleTimeString(
                            "id-ID",
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl"
                      style={{
                        background: "rgba(148,163,184,0.08)",
                        border: "1.5px dashed rgba(148,163,184,0.3)",
                      }}
                    >
                      <span className="text-xl opacity-30">⬛</span>
                    </div>
                    <p className="text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
                      QR belum tersedia.
                      <br />
                      Klik <span className="font-semibold">Generate</span> untuk
                      membuat token baru.
                    </p>
                  </div>
                )}
              </div>
              {/* ── End QR panel ───────────────────────────────────── */}
            </div>
          </Card>

          {/* Check-in */}
          <Card
            variant="default"
            size="md"
            className="rounded-2xl"
            header={
              <div>
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  POST /presence/checkin
                </p>
                <h3 className="mt-1 text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Check-in
                </h3>
              </div>
            }
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  user_id
                </label>
                <Input
                  value={checkInForm.user_id}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      user_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  device_id
                </label>
                <Input
                  value={checkInForm.device_id}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      device_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  course_id
                </label>
                <Input
                  value={checkInForm.course_id}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      course_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  session_id
                </label>
                <Input
                  value={checkInForm.session_id}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      session_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  qr_token
                </label>
                <Input
                  value={checkInForm.qr_token}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      qr_token: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  ts
                </label>
                <Input
                  value={checkInForm.ts}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      ts: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      ts: getCurrentIsoTimestamp(),
                    }))
                  }
                >
                  Isi ts saat ini
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses..." : "Check-in"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Cek Status */}
          <Card
            variant="default"
            size="md"
            className="rounded-2xl"
            header={
              <div>
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  GET /presence/status
                </p>
                <h3 className="mt-1 text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Cek Status
                </h3>
              </div>
            }
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  user_id
                </label>
                <Input
                  value={statusForm.user_id}
                  onChange={(event) =>
                    setStatusForm((previous) => ({
                      ...previous,
                      user_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  course_id
                </label>
                <Input
                  value={statusForm.course_id}
                  onChange={(event) =>
                    setStatusForm((previous) => ({
                      ...previous,
                      course_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  session_id
                </label>
                <Input
                  value={statusForm.session_id}
                  onChange={(event) =>
                    setStatusForm((previous) => ({
                      ...previous,
                      session_id: event.target.value,
                    }))
                  }
                />
              </div>
              <Button
                size="sm"
                className="rounded-full"
                onClick={handleCheckStatus}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Cek status"}
              </Button>
            </div>
          </Card>
        </div>

        {/* ── Bottom row: Ringkasan + JSON preview ───────────────────── */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          {/* Ringkasan */}
          <Card variant="default" size="md" className="rounded-2xl">
            <h3 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
              Ringkasan Simulasi
            </h3>
            <dl className="mt-4 grid gap-2.5 text-sm">
              <SummaryRow
                label="Token aktif"
                value={summary.qr_token ?? "-"}
                mono
              />
              <SummaryRow
                label="Batas berlaku token"
                value={summary.expires_at ?? "-"}
                mono
              />
              <SummaryRow
                label="Presence ID"
                value={summary.presence_id ?? "-"}
                mono
              />
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5"
                  style={
                    summary.status === "hadir"
                      ? {
                          background: "rgba(16,185,129,0.07)",
                          border: "1px solid rgba(16,185,129,0.18)",
                        }
                      : summary.status
                        ? {
                            background: "rgba(239,68,68,0.06)",
                            border: "1px solid rgba(239,68,68,0.16)",
                          }
                        : {
                            background: "rgba(148,163,184,0.06)",
                            border: "1px solid rgba(148,163,184,0.13)",
                          }
                  }
                >
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                    Status terakhir
                  </dt>
                  <dd
                    className="text-sm font-semibold"
                    style={{
                      color:
                        summary.status === "hadir"
                          ? "#059669"
                          : summary.status
                            ? "#dc2626"
                            : undefined,
                    }}
                  >
                    {summary.status ?? "-"}
                  </dd>
                </div>
                <SummaryRow
                  label="Timestamp status"
                  value={summary.last_ts ?? "-"}
                  mono
                />
              </div>
            </dl>
          </Card>

          {/* JSON Preview */}
          <Card variant="dark" size="md" className="rounded-2xl">
            <h3 className="text-base font-semibold text-(--token-white)">
              Preview JSON Response
            </h3>
            <p className="mt-2 text-xs text-(--token-white-70)">
              Format sukses: {"{ \"ok\": true, \"data\": { } }"}
              <br />
              Format gagal: {"{ \"ok\": false, \"error\": \"pesan\" }"}
            </p>
            <pre className="mt-4 max-h-[340px] overflow-auto rounded-xl bg-[var(--token-white-10)] p-3 text-xs leading-6 text-(--token-white) custom-scrollbar">
              {formattedResponse}
            </pre>
          </Card>
        </div>
      </div>
    </section>
  );
}
