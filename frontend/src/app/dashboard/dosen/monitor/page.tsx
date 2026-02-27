"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/Button";
import { attendanceGasService } from "@/services/attendance-gas-service";

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
    <div className="grid gap-4">
      <Card variant="default" size="md" className="rounded-2xl">
        <h1 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
          Monitor Status Presensi
        </h1>
        <p className="mt-2 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
          Pantau daftar mahasiswa yang sudah check-in untuk sesi aktif. Data diperbarui otomatis
          setiap 5 detik.
        </p>

        <form
          className="mt-4 grid gap-3 md:grid-cols-3"
          onSubmit={form.handleSubmit((values) =>
            setActiveFilter({
              course_id: values.course_id,
              session_id: values.session_id,
              limit: Number(values.limit),
            }),
          )}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
              course_id
            </label>
            <Input {...form.register("course_id")} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
              session_id
            </label>
            <Input {...form.register("session_id")} placeholder="Masukkan session_id aktif" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
              limit
            </label>
            <Input {...form.register("limit")} />
          </div>

          <div className="md:col-span-3">
            <Button type="submit" size="sm" className="rounded-full">
              Mulai Monitor
            </Button>
          </div>
        </form>
      </Card>

      <Card variant="default" size="md" className="rounded-2xl">
        <h2 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
          Daftar Check-in
        </h2>

        {listQuery.isPending && (
          <p className="mt-3 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
            Memuat data monitor...
          </p>
        )}

        {listQuery.isError && (
          <p className="mt-3 text-sm text-red-600">
            {listQuery.error instanceof Error ? listQuery.error.message : "Gagal mengambil data."}
          </p>
        )}

        {listQuery.data && (
          <>
            <p className="mt-3 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
              total check-in: <span className="font-semibold">{listQuery.data.total}</span>
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full rounded-xl border border-soft text-left text-sm">
                <thead>
                  <tr className="border-b border-soft bg-[var(--token-gray-100)] dark:bg-[var(--token-white-5)]">
                    <th className="px-3 py-2">presence_id</th>
                    <th className="px-3 py-2">user_id</th>
                    <th className="px-3 py-2">device_id</th>
                    <th className="px-3 py-2">ts</th>
                    <th className="px-3 py-2">recorded_at</th>
                  </tr>
                </thead>
                <tbody>
                  {listQuery.data.items.map((item) => (
                    <tr key={item.presence_id} className="border-b border-soft last:border-b-0">
                      <td className="px-3 py-2">{item.presence_id}</td>
                      <td className="px-3 py-2">{item.user_id}</td>
                      <td className="px-3 py-2">{item.device_id}</td>
                      <td className="px-3 py-2">{item.ts}</td>
                      <td className="px-3 py-2">{item.recorded_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!listQuery.data && !listQuery.isPending && !listQuery.isError && (
          <p className="mt-3 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
            Jalankan monitor dengan memasukkan course_id dan session_id.
          </p>
        )}
      </Card>
    </div>
  );
}
