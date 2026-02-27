"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { attendanceGasService } from "@/services/attendance-gas-service";
import { BarChart3, Search, Users } from "lucide-react";

const monitorSchema = z.object({
  course_id: z.string().trim().min(1, "course_id wajib diisi"),
  session_id: z.string().trim().min(1, "session_id wajib diisi"),
  limit: z
    .string()
    .trim()
    .regex(/^[0-9]+$/, "limit harus angka")
    .refine((value) => Number(value) >= 1 && Number(value) <= 500, {
      message: "limit harus 1 sampai 500",
    }),
});

type MonitorForm = z.infer<typeof monitorSchema>;
type MonitorQuery = {
  course_id: string;
  session_id: string;
  limit: number;
};

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)";

export default function DosenMonitorPage() {
  const form = useForm<MonitorForm>({
    resolver: zodResolver(monitorSchema),
    defaultValues: {
      course_id: "cloud-101",
      session_id: "",
      limit: "200",
    },
  });

  const [activeFilter, setActiveFilter] = useState<MonitorQuery | null>(null);

  const listQuery = useQuery({
    queryKey: ["presence-list", activeFilter],
    enabled: activeFilter !== null,
    refetchInterval: 5000,
    queryFn: async () => {
      if (!activeFilter) {
        return null;
      }

      const response = await attendanceGasService.listAttendanceBySession(activeFilter);
      if (!response.ok) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          <BarChart3 size={14} />
          Dosen — Modul Presensi
        </div>
        <h1 className="mt-1 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white) sm:text-2xl">
          Monitor Status Presensi
        </h1>
        <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
          Pantau daftar mahasiswa yang sudah check-in. Data diperbarui otomatis setiap 5 detik.
        </p>
      </div>

      <div className="grid gap-5">
        {/* Filter form */}
        <Card variant="default" size="md" className="rounded-2xl">
          <form
            className="grid gap-4 sm:grid-cols-3"
            onSubmit={form.handleSubmit((values) =>
              setActiveFilter({
                course_id: values.course_id,
                session_id: values.session_id,
                limit: Number(values.limit),
              }),
            )}
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-(--token-gray-700) dark:text-(--token-gray-200)">
                Course ID
              </label>
              <input {...form.register("course_id")} className={INPUT_CLASS} />
              {form.formState.errors.course_id?.message && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.course_id.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-(--token-gray-700) dark:text-(--token-gray-200)">
                Session ID
              </label>
              <input
                {...form.register("session_id")}
                placeholder="Masukkan session_id aktif"
                className={INPUT_CLASS}
              />
              {form.formState.errors.session_id?.message && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.session_id.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-(--token-gray-700) dark:text-(--token-gray-200)">
                Limit
              </label>
              <input {...form.register("limit")} className={INPUT_CLASS} />
              {form.formState.errors.limit?.message && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.limit.message}</p>
              )}
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="gradient-btn inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/15 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Search size={14} />
                Mulai Monitor
              </button>
            </div>
          </form>
        </Card>

        {/* Results */}
        <Card variant="default" size="md" className="rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
              Daftar Check-in
            </h2>
            {listQuery.data && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                <Users size={12} />
                {listQuery.data.total}
              </span>
            )}
          </div>

          {listQuery.isPending && (
            <div className="mt-6 flex items-center justify-center gap-2 py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              <p className="text-sm text-(--token-gray-500)">Memuat data…</p>
            </div>
          )}

          {listQuery.isError && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {listQuery.error instanceof Error ? listQuery.error.message : "Gagal mengambil data."}
            </div>
          )}

          {listQuery.data && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-soft">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-soft bg-(--token-gray-50) dark:bg-(--token-white-5)">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">Presence ID</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">User ID</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">Device ID</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">Timestamp</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--token-gray-500) dark:text-(--token-gray-400)">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft">
                  {listQuery.data.items.map((item) => (
                    <tr key={item.presence_id} className="transition-colors hover:bg-(--token-gray-50) dark:hover:bg-(--token-white-5)">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-(--token-gray-900) dark:text-(--token-white)">{item.presence_id}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-(--token-gray-700) dark:text-(--token-gray-300)">{item.user_id}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">{item.device_id}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-(--token-gray-500) dark:text-(--token-gray-400)">{item.ts}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-(--token-gray-500) dark:text-(--token-gray-400)">{item.recorded_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!listQuery.data && !listQuery.isPending && !listQuery.isError && (
            <div className="mt-4 flex flex-col items-center rounded-xl border-2 border-dashed border-(--token-gray-200) px-6 py-10 text-center dark:border-(--color-marketing-dark-border)">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-(--token-gray-100) dark:bg-(--token-white-5)">
                <BarChart3 size={24} className="text-(--token-gray-400)" />
              </div>
              <p className="text-sm font-medium text-(--token-gray-500) dark:text-(--token-gray-400)">
                Belum ada data
              </p>
              <p className="mt-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
                Masukkan course_id dan session_id untuk mulai monitor
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
