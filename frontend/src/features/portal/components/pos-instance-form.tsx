"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Select from "@/features/dashboard/components/form/Select";
import {
  createPOSInstanceSchema,
  updatePOSInstanceSchema,
  type CreatePOSInstanceInput,
  type UpdatePOSInstanceInput,
} from "../schemas/pos-instance.schema";
import {
  useCreatePOSInstance,
  useUpdatePOSInstance,
} from "../hooks/use-pos-instances";
import type { POSInstanceResponse } from "../types";

type POSInstanceFormProps = {
  instance?: POSInstanceResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
  redirectOnSuccess?: boolean;
};

export default function POSInstanceForm({
  instance,
  onSuccess,
  onCancel,
  redirectOnSuccess = true,
}: POSInstanceFormProps) {
  const router = useRouter();
  const isEdit = !!instance;

  const createMutation = useCreatePOSInstance();
  const updateMutation = useUpdatePOSInstance(instance?.id ?? "");

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePOSInstanceInput | UpdatePOSInstanceInput>({
    resolver: zodResolver(isEdit ? updatePOSInstanceSchema : createPOSInstanceSchema),
    defaultValues: isEdit
      ? { name: instance.name, totalTable: instance.totalTable || undefined }
      : { name: "", type: "TABLE_SERVICE", totalTable: 1 },
  });

  const watchType = useWatch({ control, name: "type" as never }) as unknown as
    | CreatePOSInstanceInput["type"]
    | undefined;

  const onSubmit = async (data: CreatePOSInstanceInput | UpdatePOSInstanceInput) => {
    try {
      if (isEdit) {
        const updateData: UpdatePOSInstanceInput = {};
        if (data.name) updateData.name = data.name;
        if ("totalTable" in data && data.totalTable !== undefined) {
          updateData.totalTable = data.totalTable;
        }
        await updateMutation.mutateAsync(updateData);
        toast.success("POS Instance berhasil diperbarui");
      } else {
        const createData = data as CreatePOSInstanceInput;
        if (createData.type === "TAB_SERVICE") {
          delete (createData as Record<string, unknown>).totalTable;
        }
        await createMutation.mutateAsync(createData);
        toast.success("POS Instance berhasil dibuat");
      }

      if (redirectOnSuccess) {
        router.push("/portal");
        router.refresh();
      } else {
        onSuccess?.();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan";
      toast.error(message);
    }
  };

  const handleToggleActive = async () => {
    if (!isEdit || !instance) return;

    try {
      await updateMutation.mutateAsync({ isActive: !instance.isActive });
      toast.success(
        instance.isActive
          ? "POS Instance berhasil dinonaktifkan"
          : "POS Instance berhasil diaktifkan"
      );
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui status";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-6">
      <div>
        <label
          htmlFor="pos-name"
          className="mb-1.5 block text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300)"
        >
          Nama POS Instance
        </label>
        <input
          id="pos-name"
          type="text"
          {...register("name")}
          placeholder="Contoh: Outlet Lantai 1"
          className="surface-elevated block w-full rounded-lg border border-strong px-4 py-2.5 text-sm text-(--token-gray-900) placeholder:text-(--token-gray-400) focus:border-(--token-brand-500) focus:ring-2 focus:ring-(--token-brand-500)/20 dark:text-(--token-white)"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-[var(--token-red-500)] dark:text-[var(--token-red-400)]">
            {errors.name.message}
          </p>
        )}
      </div>

      {!isEdit && (
        <div>
          <label
            htmlFor="pos-type"
            className="mb-1.5 block text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300)"
          >
            Tipe Layanan
          </label>
          <Controller
            control={control}
            name={"type" as never}
            render={({ field }) => (
              <Select
                id="pos-type"
                options={[
                  { value: "TABLE_SERVICE", label: "Table Service" },
                  { value: "TAB_SERVICE", label: "Tab Service" },
                ]}
                value={field.value as string}
                onChange={(nextValue) => {
                  if (typeof nextValue === "string") {
                    field.onChange(nextValue);
                  }
                }}
                placeholder="Pilih tipe layanan"
                isSearchable={false}
                isClearable={false}
              />
            )}
          />
          {"type" in errors && errors.type && (
            <p className="mt-1 text-sm text-[var(--token-red-500)] dark:text-[var(--token-red-400)]">
              {(errors.type as { message?: string }).message}
            </p>
          )}
        </div>
      )}

      {isEdit && instance && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300)">
            Tipe Layanan
          </label>
          <p className="surface-subtle rounded-lg border border-soft px-4 py-2.5 text-sm text-(--token-gray-600) dark:text-(--token-gray-400)">
            {instance.type === "TABLE_SERVICE" ? "Table Service" : "Tab Service"}
          </p>
        </div>
      )}

      {isEdit && instance && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300)">
            Status Outlet
          </label>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                instance.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {instance.isActive ? "Active" : "Inactive"}
            </span>
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={updateMutation.isPending || isSubmitting}
              className={`inline-flex cursor-pointer items-center rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-px hover:shadow-sm active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none ${
                instance.isActive
                  ? "border-[var(--token-red-400)] text-[var(--token-red-500)] hover:bg-[var(--token-error-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--token-red-500) dark:border-[var(--token-red-500)] dark:text-[var(--token-red-400)] dark:hover:bg-[var(--token-red-500)]/20"
                  : "border-[var(--token-green-600)] text-[var(--token-green-600)] hover:bg-[var(--token-success-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--token-green-600) dark:border-[var(--token-green-600)] dark:text-[var(--token-green-100)] dark:hover:bg-[var(--token-green-600)]/20"
              }`}
            >
              {instance.isActive ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </div>
      )}

      {((!isEdit && watchType === "TABLE_SERVICE") ||
        (isEdit && instance?.type === "TABLE_SERVICE")) && (
        <div>
          <label
            htmlFor="pos-total-table"
            className="mb-1.5 block text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300)"
          >
            Jumlah Meja
          </label>
          <input
            id="pos-total-table"
            type="number"
            min={1}
            max={200}
            {...register("totalTable", { valueAsNumber: true })}
            className="surface-elevated block w-full rounded-lg border border-strong px-4 py-2.5 text-sm text-(--token-gray-900) focus:border-(--token-brand-500) focus:ring-2 focus:ring-(--token-brand-500)/20 dark:text-(--token-white)"
          />
          {errors.totalTable && (
            <p className="mt-1 text-sm text-[var(--token-red-500)] dark:text-[var(--token-red-400)]">
              {errors.totalTable.message}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-[var(--token-white)] shadow-sm transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {isSubmitting
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Buat POS Instance"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel();
              return;
            }

            router.back();
          }}
          className="surface-elevated surface-interactive inline-flex items-center rounded-lg border border-strong px-5 py-2.5 text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300)"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
