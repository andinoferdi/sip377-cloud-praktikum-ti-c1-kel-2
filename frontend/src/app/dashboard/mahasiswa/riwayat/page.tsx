"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import {
  readAttendanceHistory,
  type AttendanceHistoryItem,
} from "@/utils/home/attendance-history";
import { Inbox } from "lucide-react";

const TH_CLASS =
  "px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

export default function MahasiswaHistoryPage() {
  const session = useAuthSession();
  const [historyItems, setHistoryItems] = useState<AttendanceHistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(readAttendanceHistory());
  }, []);

  const myHistory = useMemo(() => {
    if (!session) return [];
    return historyItems.filter((item) => item.user_id === session.identifier);
  }, [historyItems, session]);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Mahasiswa — Modul Presensi
        </p>
        <h1 className="mt-1 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white) sm:text-2xl">
          Riwayat Presensi Saya
        </h1>
        <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          Menampilkan hasil check-in terakhir dari browser ini.
        </p>
      </div>

      {/* Content card */}
      <div className="overflow-hidden rounded-2xl border border-soft surface-elevated">
        {/* Card header */}
        <div className="flex items-center justify-between gap-3 border-b border-soft px-5 py-4">
          <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
            Riwayat
          </h2>
          {myHistory.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-soft px-2.5 py-1 text-[11px] font-semibold text-(--token-gray-600) dark:text-(--token-gray-300)">
              {myHistory.length} entri
            </span>
          )}
        </div>

        {/* Empty state */}
        {myHistory.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
              <Inbox size={20} className="text-(--token-gray-400)" />
            </div>
            <p className="text-sm font-medium text-(--token-gray-500) dark:text-(--token-gray-400)">
              Belum ada riwayat check-in
            </p>
            <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
              Riwayat akan muncul setelah Anda melakukan check-in
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
                  {[
                    "Presence ID",
                    "Course ID",
                    "Session ID",
                    "QR Token",
                    "Status",
                    "Timestamp",
                  ].map((col) => (
                    <th key={col} className={TH_CLASS}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-soft">
                {myHistory.map((item) => (
                  <tr
                    key={`${item.presence_id}-${item.ts}`}
                    className="transition-colors hover:bg-(--token-gray-50) dark:hover:bg-(--token-white-5)"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                      {item.presence_id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-(--token-gray-700) dark:text-(--token-gray-300)">
                      {item.course_id}
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                      {item.session_id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                      {item.qr_token}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                        {item.result}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                      {item.ts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}