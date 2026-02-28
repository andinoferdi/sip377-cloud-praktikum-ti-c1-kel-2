"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAuthSession } from "@/lib/auth/session";
import Select from "@/components/ui/select";
import { getErrorMessage } from "@/lib/errors";
import { attendanceGasService } from "@/services/attendance-gas-service";
import { readLecturerQrSessionState } from "@/utils/home/lecturer-qr-session";
import { Search, Users, BarChart3, RefreshCw, QrCode, CloudOff } from "lucide-react";

type MonitorQuery = { course_id: string; session_id: string; limit: number };

type ActiveSessionOption = {
  key: string;
  course_id: string;
  session_id: string;
  meeting_key: string | null;
  label: string;
  source: "api" | "local";
};

const ACTIVE_QR_STORAGE_KEY = "ctc_dosen_active_qr";
const DEFAULT_LIMIT = 200;
const ACTIVE_SESSION_LIMIT = 20;
const MONITOR_REFRESH_MS = 5000;

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)";

const LABEL_CLASS =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

const TH_CLASS =
  "px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

function parseMonitorLimit(limitInput: string) {
  const parsed = Number.parseInt(limitInput, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(parsed, 1), 500);
}

function buildLocalSessionOptions(
  snapshot: ReturnType<typeof readLecturerQrSessionState>,
): ActiveSessionOption[] {
  if (!snapshot || snapshot.is_stopped || !snapshot.active_payload) {
    return [];
  }

  const { course_id: courseId, session_id: sessionId, meeting_key: meetingKey } =
    snapshot.active_payload;

  return [
    {
      key: `${courseId}::${sessionId}::${meetingKey ?? ""}`,
      course_id: courseId,
      session_id: sessionId,
      meeting_key: meetingKey ?? null,
      label: `${courseId} - ${sessionId}`,
      source: "local",
    },
  ];
}

export default function DosenMonitorPage() {
  const sessionIdentifier = useMemo(() => getAuthSession()?.identifier ?? null, []);
  const [sessionSnapshot, setSessionSnapshot] = useState(() =>
    readLecturerQrSessionState(sessionIdentifier),
  );
  const [selectedSessionKey, setSelectedSessionKey] = useState("");
  const [limitInput, setLimitInput] = useState(String(DEFAULT_LIMIT));

  useEffect(() => {
    setSessionSnapshot(readLecturerQrSessionState(sessionIdentifier));
  }, [sessionIdentifier]);

  useEffect(() => {
    const syncFromStorage = () => {
      setSessionSnapshot(readLecturerQrSessionState(sessionIdentifier));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== ACTIVE_QR_STORAGE_KEY) {
        return;
      }
      syncFromStorage();
    };

    syncFromStorage();
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [sessionIdentifier]);

  const activeSessionsQuery = useQuery({
    queryKey: ["active-sessions", sessionIdentifier],
    enabled: Boolean(sessionIdentifier),
    refetchInterval: MONITOR_REFRESH_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      if (!sessionIdentifier) {
        return null;
      }

      const response = await attendanceGasService.listActiveSessions({
        owner_identifier: sessionIdentifier,
        limit: ACTIVE_SESSION_LIMIT,
      });

      if (!response.ok) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });

  const apiSessionOptions = useMemo<ActiveSessionOption[]>(() => {
    const items = activeSessionsQuery.data?.items ?? [];
    return items.map((item) => ({
      key: `${item.course_id}::${item.session_id}::${item.meeting_key ?? ""}`,
      course_id: item.course_id,
      session_id: item.session_id,
      meeting_key: item.meeting_key,
      label: `${item.course_id} - ${item.session_id}`,
      source: "api",
    }));
  }, [activeSessionsQuery.data]);

  const localSessionOptions = useMemo(
    () => buildLocalSessionOptions(sessionSnapshot),
    [sessionSnapshot],
  );

  const useLocalFallback = activeSessionsQuery.isError;
  const sessionOptions = useMemo(
    () => (useLocalFallback ? localSessionOptions : apiSessionOptions),
    [apiSessionOptions, localSessionOptions, useLocalFallback],
  );

  useEffect(() => {
    if (sessionOptions.length === 0) {
      setSelectedSessionKey("");
      return;
    }

    setSelectedSessionKey((previousKey) => {
      const hasPrevious = sessionOptions.some((option) => option.key === previousKey);
      return hasPrevious ? previousKey : sessionOptions[0].key;
    });
  }, [sessionOptions]);

  const selectedSession = useMemo(
    () => sessionOptions.find((option) => option.key === selectedSessionKey) ?? null,
    [selectedSessionKey, sessionOptions],
  );

  const limit = useMemo(() => parseMonitorLimit(limitInput), [limitInput]);

  const activeFilter = useMemo<MonitorQuery | null>(() => {
    if (!selectedSession) {
      return null;
    }

    return {
      course_id: selectedSession.course_id,
      session_id: selectedSession.session_id,
      limit,
    };
  }, [limit, selectedSession]);

  const listQuery = useQuery({
    queryKey: ["presence-list", activeFilter],
    enabled: activeFilter !== null,
    refetchInterval: MONITOR_REFRESH_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      if (!activeFilter) return null;
      const response = await attendanceGasService.listAttendanceBySession(activeFilter);
      if (!response.ok) throw new Error(response.error);
      return response.data;
    },
  });

  const sourceLabel = useLocalFallback ? "Local fallback" : "Backend API";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Dosen - Modul Presensi
        </p>
        <h1 className="mt-1 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white) sm:text-2xl">
          Monitor Status Presensi
        </h1>
        <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          Data diperbarui otomatis setiap 5 detik.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-soft surface-elevated">
        <div className="flex items-center justify-between gap-3 border-b border-soft px-5 py-4">
          <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
            Sesi Aktif
          </h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-soft px-2.5 py-1 text-[11px] font-semibold text-(--token-gray-600) dark:text-(--token-gray-300)">
              {sourceLabel}
            </span>
            {activeSessionsQuery.isFetching && (
              <span className="inline-flex items-center gap-1 text-[11px] text-(--token-gray-400)">
                <RefreshCw size={11} className="animate-spin" />
                Memperbarui
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          {useLocalFallback && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
              <CloudOff size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Gagal mengambil sesi aktif dari backend.</p>
                <p className="mt-0.5">Menggunakan fallback sesi aktif dari browser ini.</p>
              </div>
            </div>
          )}

          {sessionOptions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS}>Session Aktif</label>
                <Select
                  value={selectedSessionKey || undefined}
                  onChange={setSelectedSessionKey}
                  options={sessionOptions.map((option) => ({
                    value: option.key,
                    label: option.label,
                  }))}
                  placeholder="Pilih sesi aktif"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Limit</label>
                <input
                  className={INPUT_CLASS}
                  value={limitInput}
                  onChange={(event) => setLimitInput(event.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="200"
                  inputMode="numeric"
                />
                <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
                  Rentang 1-500. Nilai aktif: {limit}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Sumber sesi aktif diprioritaskan dari backend. Fallback local hanya saat API gagal.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-soft bg-(--token-gray-50) p-4 dark:bg-(--token-white-5)">
              <div className="flex items-center gap-2 text-(--token-gray-700) dark:text-(--token-gray-300)">
                <QrCode size={16} />
                <p className="text-sm font-semibold">Belum ada sesi aktif.</p>
              </div>
              <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                Jika dosen belum generate QR, buka halaman Buat QR terlebih dahulu.
              </p>
              <Link
                href="/dashboard/dosen/buat-qr"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
              >
                <Search size={13} />
                Buka Buat QR
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-soft surface-elevated">
        <div className="flex items-center justify-between gap-3 border-b border-soft px-5 py-4">
          <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
            Daftar Check-in
          </h2>
          <div className="flex items-center gap-2">
            {listQuery.data && (
              <span className="inline-flex items-center gap-1 rounded-md border border-soft px-2.5 py-1 text-[11px] font-semibold text-(--token-gray-600) dark:text-(--token-gray-300)">
                <Users size={11} />
                {listQuery.data.total} hadir
              </span>
            )}
            {listQuery.isFetching && activeFilter && (
              <span className="inline-flex items-center gap-1 text-[11px] text-(--token-gray-400)">
                <RefreshCw size={11} className="animate-spin" />
                Memperbarui
              </span>
            )}
          </div>
        </div>

        {activeFilter && listQuery.isPending && (
          <div className="flex items-center justify-center gap-2 py-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <p className="text-sm text-(--token-gray-400)">Memuat data...</p>
          </div>
        )}

        {listQuery.isError && activeFilter && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {getErrorMessage(listQuery.error)}
          </div>
        )}

        {listQuery.data && activeFilter && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
                  {["Presence ID", "User ID", "Device ID", "Timestamp", "Recorded At"].map(
                    (column) => (
                      <th key={column} className={TH_CLASS}>
                        {column}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-soft">
                {listQuery.data.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-(--token-gray-500) dark:text-(--token-gray-400)"
                    >
                      Belum ada check-in untuk sesi ini.
                    </td>
                  </tr>
                ) : (
                  listQuery.data.items.map((item) => (
                    <tr
                      key={item.presence_id}
                      className="transition-colors hover:bg-(--token-gray-50) dark:hover:bg-(--token-white-5)"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                        {item.presence_id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-(--token-gray-700) dark:text-(--token-gray-300)">
                        {item.user_id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                        {item.device_id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                        {item.ts}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                        {item.recorded_at}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!activeFilter && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
              <BarChart3 size={20} className="text-(--token-gray-400)" />
            </div>
            <p className="text-sm font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
              Belum ada sesi aktif untuk dimonitor.
            </p>
            <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
              Pilih sesi aktif dari backend atau buat QR baru terlebih dahulu.
            </p>
            <Link
              href="/dashboard/dosen/buat-qr"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-soft px-4 py-2 text-sm font-medium text-(--token-gray-700) transition-colors hover:bg-(--token-gray-100) dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)"
            >
              Buka Buat QR
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
