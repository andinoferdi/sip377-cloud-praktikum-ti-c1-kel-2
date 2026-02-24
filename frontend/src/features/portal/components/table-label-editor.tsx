"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTableLabels, useUpdateTableLabel } from "../hooks/use-pos-instance-detail";
import type { TableLabelResponse } from "../types";

type TableLabelEditorProps = {
  posInstanceId: string;
};

export default function TableLabelEditor({ posInstanceId }: TableLabelEditorProps) {
  const { data: tables, isLoading } = useTableLabels(posInstanceId);
  const updateLabel = useUpdateTableLabel(posInstanceId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (table: TableLabelResponse) => {
    setEditingId(table.id);
    setEditValue(table.label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (tableId: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error("Label tidak boleh kosong");
      return;
    }
    if (trimmed.length > 10) {
      toast.error("Label maksimal 10 karakter");
      return;
    }

    try {
      await updateLabel.mutateAsync({
        tableId,
        payload: { label: trimmed },
      });
      toast.success("Label berhasil diperbarui");
      setEditingId(null);
      setEditValue("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan label";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--token-brand-600) border-t-transparent" />
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
        Tidak ada data meja.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-(--token-gray-200) dark:border-(--token-gray-700)">
      <table className="w-full text-left text-sm">
        <thead className="bg-(--token-gray-50) dark:bg-(--token-gray-800)">
          <tr>
            <th className="px-4 py-3 font-medium text-(--token-gray-600) dark:text-(--token-gray-400)">
              No
            </th>
            <th className="px-4 py-3 font-medium text-(--token-gray-600) dark:text-(--token-gray-400)">
              Label
            </th>
            <th className="px-4 py-3 text-right font-medium text-(--token-gray-600) dark:text-(--token-gray-400)">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--token-gray-200) dark:divide-(--token-gray-700)">
          {tables.map((table) => (
            <tr
              key={table.id}
              className="bg-(--token-white) dark:bg-(--token-gray-900)"
            >
              <td className="px-4 py-3 text-(--token-gray-500) dark:text-(--token-gray-400)">
                {table.position}
              </td>
              <td className="px-4 py-3">
                {editingId === table.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    maxLength={10}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(table.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="w-32 rounded border border-(--token-brand-400) bg-(--token-white) px-2 py-1 text-sm focus:ring-2 focus:ring-(--token-brand-500)/20 dark:bg-(--token-gray-800) dark:text-(--token-white)"
                  />
                ) : (
                  <span className="font-medium text-(--token-gray-900) dark:text-(--token-white)">
                    {table.label}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {editingId === table.id ? (
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(table.id)}
                      disabled={updateLabel.isPending}
                      className="text-sm font-medium text-(--token-brand-600) hover:text-(--token-brand-700) disabled:opacity-50 dark:text-(--token-brand-400)"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-sm font-medium text-(--token-gray-500) hover:text-(--token-gray-700) dark:text-(--token-gray-400)"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(table)}
                    className="text-sm font-medium text-(--token-brand-600) hover:text-(--token-brand-700) dark:text-(--token-brand-400)"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
