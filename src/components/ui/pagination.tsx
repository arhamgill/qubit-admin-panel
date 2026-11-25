"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [10, 20, 50];

/** Returns page numbers with `null` marking an ellipsis, e.g. [1, null, 4, 5, 6, null, 12]. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push(null);
    result.push(p);
  });
  return result;
}

const navButton =
  "inline-flex size-8 items-center justify-center rounded-lg font-mono text-[12.5px] tabular-nums transition-colors duration-200 " +
  "disabled:pointer-events-none disabled:opacity-35";

export function Pagination({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-center gap-3 text-[13px] text-muted">
        <span>
          Showing <span className="font-mono font-medium text-foreground tabular-nums">{formatNumber(from)}</span>–
          <span className="font-mono font-medium text-foreground tabular-nums">{formatNumber(to)}</span> of{" "}
          <span className="font-mono font-medium text-foreground tabular-nums">{formatNumber(total)}</span>
        </span>
        <label className="flex items-center gap-2">
          <span className="eyebrow sr-only sm:not-sr-only">Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg bg-surface px-2 font-mono text-[12.5px] text-foreground shadow-sm ring-1 ring-line-strong ring-inset"
            aria-label="Rows per page"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          className={cn(navButton, "text-muted hover:bg-foreground/5 hover:text-foreground")}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        {pageWindow(page, totalPages).map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-muted" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={cn(
                navButton,
                p === page
                  ? "bg-primary font-medium text-primary-foreground shadow-sm"
                  : "text-ink-2 hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className={cn(navButton, "text-muted hover:bg-foreground/5 hover:text-foreground")}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </nav>
    </div>
  );
}
