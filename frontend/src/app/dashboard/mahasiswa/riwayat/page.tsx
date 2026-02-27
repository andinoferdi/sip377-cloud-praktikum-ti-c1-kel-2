"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import {
  readAttendanceHistory,
  type AttendanceHistoryItem,
} from "@/utils/home/attendance-history";
import { History, Inbox } from "lucide-react";

export default function MahasiswaHistoryPage() {
  const session = useAuthSession();
  const [historyItems, setHistoryItems] = useState<AttendanceHistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(readAttendanceHistory());
  }, []);

  const myHistory = useMemo(() => {
    if (!session) {
      return [];
    }
    return historyItems.filter((item) => item.user_id === session.identifier);
  }, [historyItems, session]);

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          <History size={14} />
          Mahasiswa — Modul Presensi
        </div>
        <h1 className="mt-1 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white) sm:text-2xl">
          Riwayat Presensi Saya
        </h1>
        <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          Menampilkan hasil check-in terakhir dari browser ini.
        </p>
      </div>

      <Card variant="default" size="md" className="rounded-2xl">
        {myHistory.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-(--token-gray-200) px-6 py-10 text-center dark:border-(--color-marketing-dark-border)">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-(--token-gray-100) dark:bg-(--token-white-5)">
              <Inbox size={24} className="text-(--token-gray-400)" />
            </div>
            <p className="text-sm font-medium text-(--token-gray-500) dark:text-(--token-gray-400)">
              Belum ada riwayat check-in
            </p>
            <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
              Riwayat akan muncul setelah Anda melakukan check-in
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                Riwayat
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                {myHistory.length} entri
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-soft">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">Presence ID</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">Course ID</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">Session ID</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">QR Token</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft">
                  {myHistory.map((item) => (
                    <tr
                      key={`${item.presence_id}-${item.ts}`}
                      className="transition-colors hover:bg-(--token-gray-50) dark:hover:bg-(--token-white-5)"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-(--token-gray-900) dark:text-(--token-white)">{item.presence_id}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-(--token-gray-700) dark:text-(--token-gray-300)">{item.course_id}</td>
                      <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">{item.session_id}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">{item.qr_token}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {item.result}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">{item.ts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
