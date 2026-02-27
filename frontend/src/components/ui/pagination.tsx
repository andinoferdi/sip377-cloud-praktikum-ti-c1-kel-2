"use client";

import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showEdges?: boolean;
  siblingCount?: number;
};

function getPageRange(current: number, total: number, siblings: number): (number | "...")[] {
  const delta = siblings + 2;
  const range: (number | "...")[] = [];

  const rangeStart = Math.max(2, current - siblings);
  const rangeEnd = Math.min(total - 1, current + siblings);

  range.push(1);

  if (rangeStart > 2) range.push("...");

  for (let i = rangeStart; i <= rangeEnd; i++) {
    range.push(i);
  }

  if (rangeEnd < total - 1) range.push("...");

  if (total > 1) range.push(total);

  return range;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages, siblingCount);

  const buttonBase = cn(
    "inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-lg text-sm font-medium",
    "transition-colors duration-150 outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-1",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
  );

  return (
    <nav role="navigation" aria-label="Pagination">
      <ul className="flex items-center gap-1">
        <li>
          <button
            disabled={currentPage === 1}
            aria-label="Previous page"
            onClick={() => onPageChange(currentPage - 1)}
            className={cn(
              buttonBase,
              "gap-1 px-3 text-[var(--token-gray-600)] dark:text-[var(--token-gray-400)]",
              "hover:bg-[var(--token-gray-100)] dark:hover:bg-[var(--token-white-8)]"
            )}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Prev</span>
          </button>
        </li>

        {pages.map((page, i) =>
          page === "..." ? (
            <li key={`ellipsis-${i}`} aria-hidden="true">
              <span
                className={cn(
                  buttonBase,
                  "text-[var(--token-gray-400)] cursor-default"
                )}
              >
                &hellip;
              </span>
            </li>
          ) : (
            <li key={page}>
              <button
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                onClick={() => onPageChange(page)}
                className={cn(
                  buttonBase,
                  currentPage === page
                    ? "bg-[var(--token-gray-900)] text-[var(--token-white)] dark:bg-[var(--token-white)] dark:text-[var(--token-gray-900)]"
                    : "text-[var(--token-gray-700)] hover:bg-[var(--token-gray-100)] dark:text-[var(--token-gray-400)] dark:hover:bg-[var(--token-white-8)]"
                )}
              >
                {page}
              </button>
            </li>
          )
        )}

        <li>
          <button
            disabled={currentPage === totalPages}
            aria-label="Next page"
            onClick={() => onPageChange(currentPage + 1)}
            className={cn(
              buttonBase,
              "gap-1 px-3 text-[var(--token-gray-600)] dark:text-[var(--token-gray-400)]",
              "hover:bg-[var(--token-gray-100)] dark:hover:bg-[var(--token-white-8)]"
            )}
          >
            <span>Next</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 11l4-4-4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
}