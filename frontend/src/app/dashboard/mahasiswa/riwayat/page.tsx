"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import {
  readAttendanceHistory,
  type AttendanceHistoryItem,
} from "@/utils/home/attendance-history";

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
    <Card variant="default" size="md" className="rounded-2xl">
      <h1 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
        Riwayat Presensi Saya
      </h1>
      <p className="mt-2 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
        Menampilkan hasil check-in terakhir dari browser ini.
      </p>

      {myHistory.length === 0 ? (
        <p className="mt-4 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          Belum ada riwayat check-in.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full rounded-xl border border-soft text-left text-sm">
            <thead>
              <tr className="border-b border-soft bg-[var(--token-gray-100)] dark:bg-[var(--token-white-5)]">
                <th className="px-3 py-2">presence_id</th>
                <th className="px-3 py-2">course_id</th>
                <th className="px-3 py-2">session_id</th>
                <th className="px-3 py-2">qr_token</th>
                <th className="px-3 py-2">status</th>
                <th className="px-3 py-2">ts</th>
              </tr>
            </thead>
            <tbody>
              {myHistory.map((item) => (
                <tr
                  key={`${item.presence_id}-${item.ts}`}
                  className="border-b border-soft last:border-b-0"
                >
                  <td className="px-3 py-2">{item.presence_id}</td>
                  <td className="px-3 py-2">{item.course_id}</td>
                  <td className="px-3 py-2">{item.session_id}</td>
                  <td className="px-3 py-2">{item.qr_token}</td>
                  <td className="px-3 py-2">{item.result}</td>
                  <td className="px-3 py-2">{item.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
