import { ChevronLeft, ChevronRight } from "lucide-react";

import type { PaginationMeta } from "@/lib/pagination";

interface TablePaginationProps {
  pagination: PaginationMeta;
  itemLabel: string;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const lastPage = Math.min(totalPages, firstPage + 4);

  return Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);
}

export function TablePagination({
  pagination,
  itemLabel,
  onPageChange,
  disabled = false,
}: TablePaginationProps) {
  const activePage = Math.min(Math.max(1, pagination.page), pagination.totalPages);
  const firstItem = pagination.total === 0 ? 0 : (activePage - 1) * pagination.limit + 1;
  const lastItem = Math.min(activePage * pagination.limit, pagination.total);
  const visiblePages = getVisiblePageNumbers(activePage, pagination.totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-border/40 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Menampilkan <strong className="text-foreground">{firstItem}</strong>
        {" - "}
        <strong className="text-foreground">{lastItem}</strong> dari{" "}
        <strong className="text-foreground">{pagination.total}</strong> {itemLabel}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, activePage - 1))}
          disabled={disabled || !pagination.hasPrevPage}
          aria-label="Halaman sebelumnya"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {visiblePages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            disabled={disabled}
            aria-current={pageNumber === activePage ? "page" : undefined}
            aria-label={`Halaman ${pageNumber}`}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60 ${
              pageNumber === activePage
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pagination.totalPages, activePage + 1))}
          disabled={disabled || !pagination.hasNextPage}
          aria-label="Halaman berikutnya"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
