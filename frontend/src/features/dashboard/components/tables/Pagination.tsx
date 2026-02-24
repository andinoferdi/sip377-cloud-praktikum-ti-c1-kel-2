type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pagesAroundCurrent = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => i + Math.max(currentPage - 1, 1)
  );

  return (
    <div className="flex items-center ">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="surface-elevated surface-interactive mr-2.5 flex h-10 items-center justify-center rounded-lg border border-strong px-3.5 py-2.5 text-sm text-[var(--token-gray-700)] shadow-theme-xs disabled:opacity-50 dark:text-[var(--token-gray-400)]"
      >
        Previous
      </button>
      <div className="flex items-center gap-2">
        {currentPage > 3 && <span className="px-2">...</span>}
        {pagesAroundCurrent.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded ${
              currentPage === page
                ? "bg-brand-500 text-[var(--token-white)]"
                : "text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)]"
            } flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/12 dark:hover:text-brand-400`}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="surface-elevated surface-interactive ml-2.5 flex h-10 items-center justify-center rounded-lg border border-strong px-3.5 py-2.5 text-sm text-[var(--token-gray-700)] shadow-theme-xs disabled:opacity-50 dark:text-[var(--token-gray-400)]"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
