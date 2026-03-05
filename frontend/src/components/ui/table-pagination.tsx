"use client";

import { useMemo } from "react";
import Select from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TablePaginationProps = {
  totalItems: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextSize: number) => void;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function TablePagination({
  totalItems,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = clamp(page, 1, totalPages);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    return Array.from(pages)
      .filter((value) => value >= 1 && value <= totalPages)
      .sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
        Menampilkan {start}-{end} dari {totalItems}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
            Per halaman
          </span>
          <div className="w-24">
            <Select
              value={String(pageSize)}
              onChange={(value) => onPageSizeChange(Number.parseInt(value, 10))}
              options={pageSizeOptions.map((option) => ({
                value: String(option),
                label: String(option),
              }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isPrevDisabled}
            className="rounded-md border border-soft px-2.5 py-1.5 text-xs font-medium text-(--token-gray-700) transition-colors hover:bg-(--token-gray-100) disabled:cursor-not-allowed disabled:opacity-50 dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)"
          >
            Sebelumnya
          </button>

          {pageNumbers.map((pageNumber, index) => {
            const previous = pageNumbers[index - 1];
            const showEllipsis = previous !== undefined && pageNumber - previous > 1;

            return (
              <div key={pageNumber} className="flex items-center gap-1">
                {showEllipsis && (
                  <span className="px-1 text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
                    ...
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    pageNumber === currentPage
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-soft text-(--token-gray-700) hover:bg-(--token-gray-100) dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)",
                  )}
                >
                  {pageNumber}
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isNextDisabled}
            className="rounded-md border border-soft px-2.5 py-1.5 text-xs font-medium text-(--token-gray-700) transition-colors hover:bg-(--token-gray-100) disabled:cursor-not-allowed disabled:opacity-50 dark:text-(--token-gray-300) dark:hover:bg-(--token-white-5)"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}
