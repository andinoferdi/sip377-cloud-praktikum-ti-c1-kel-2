"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { attendanceGasService } from "@/services/attendance-gas-service";
import { Search, Users, BarChart3, RefreshCw } from "lucide-react";

const monitorSchema = z.object({
  course_id: z.string().trim().min(1, "course_id wajib diisi"),
  session_id: z.string().trim().min(1, "session_id wajib diisi"),
  limit: z
    .string()
    .trim()
    .regex(/^[0-9]+$/, "limit harus angka")
    .refine((v) => Number(v) >= 1 && Number(v) <= 500, {
      message: "limit harus 1 sampai 500",
    }),
});

type MonitorForm = z.infer<typeof monitorSchema>;
type MonitorQuery = { course_id: string; session_id: string; limit: number };

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)";

const LABEL_CLASS =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

const TH_CLASS =
  "px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";

export default function DosenMonitorPage() {
  const form = useForm<MonitorForm>({
    resolver: zodResolver(monitorSchema),
    defaultValues: { course_id: "cloud-101", session_id: "", limit: "200" },
  });

  const [activeFilter, setActiveFilter] = useState<MonitorQuery | null>(null);

  const listQuery = useQuery({
    queryKey: ["presence-list", activeFilter],
    enabled: activeFilter !== null,
    refetchInterval: 5000,
    queryFn: async () => {
      if (!activeFilter) return null;
      const response =
        await attendanceGasService.listAttendanceBySession(activeFilter);
      if (!response.ok) throw new Error(response.error);
      return response.data;
    },
  });

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Dosen — Modul Presensi
        </p>
        <h1 className="mt-1 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white) sm:text-2xl">
          Monitor Status Presensi
        </h1>
        <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          Data diperbarui otomatis setiap 5 detik.
        </p>
      </div>

      {/* Filter card */}
      <div className="overflow-hidden rounded-2xl border border-soft surface-elevated">
        <div className="border-b border-soft px-5 py-4">
          <h2 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
            Filter Sesi
          </h2>
        </div>
        <form
          className="grid gap-4 p-5 sm:grid-cols-3"
          onSubmit={form.handleSubmit((values) =>
            setActiveFilter({
              course_id: values.course_id,
              session_id: values.session_id,
              limit: Number(values.limit),
            }),
          )}
        >
          <div>
            <label className={LABEL_CLASS}>Course ID</label>
            <input {...form.register("course_id")} className={INPUT_CLASS} />
            {form.formState.errors.course_id?.message && (
              <p className="mt-1 text-xs text-red-500">
                {form.formState.errors.course_id.message}
              </p>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>Session ID</label>
            <input
              {...form.register("session_id")}
              placeholder="Masukkan session_id aktif"
              className={INPUT_CLASS}
            />
            {form.formState.errors.session_id?.message && (
              <p className="mt-1 text-xs text-red-500">
                {form.formState.errors.session_id.message}
              </p>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>Limit</label>
            <input {...form.register("limit")} className={INPUT_CLASS} />
            {form.formState.errors.limit?.message && (
              <p className="mt-1 text-xs text-red-500">
                {form.formState.errors.limit.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 dark:hover:opacity-90"
            >
              <Search size={13} />
              Mulai Monitor
            </button>
          </div>
        </form>
      </div>

      {/* Results card */}
      <div className="overflow-hidden rounded-2xl border border-soft surface-elevated">
        {/* Card header */}
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
            {listQuery.isFetching && (
              <span className="inline-flex items-center gap-1 text-[11px] text-(--token-gray-400)">
                <RefreshCw size={11} className="animate-spin" />
                Memperbarui
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {listQuery.isPending && activeFilter && (
          <div className="flex items-center justify-center gap-2 py-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <p className="text-sm text-(--token-gray-400)">Memuat data…</p>
          </div>
        )}

        {/* Error */}
        {listQuery.isError && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {listQuery.error instanceof Error
              ? listQuery.error.message
              : "Gagal mengambil data."}
          </div>
        )}

        {/* Table */}
        {listQuery.data && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
                  {["Presence ID", "User ID", "Device ID", "Timestamp", "Recorded At"].map(
                    (col) => (
                      <th key={col} className={TH_CLASS}>
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-soft">
                {listQuery.data.items.map((item) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!activeFilter && !listQuery.isPending && !listQuery.isError && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
              <BarChart3 size={20} className="text-(--token-gray-400)" />
            </div>
            <p className="text-sm font-medium text-(--token-gray-500) dark:text-(--token-gray-400)">
              Belum ada data
            </p>
            <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
              Isi filter di atas dan klik Mulai Monitor
            </p>
          </div>
        )}
      </div>
    </div>
  );
}