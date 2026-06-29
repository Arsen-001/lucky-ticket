'use client';

import type { HTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

type PageItem = number | 'ellipsis';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** 1-based current page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current page (default 1). */
  siblingCount?: number;
  classNames?: {
    button?: string;
    active?: string;
    ellipsis?: string;
  };
}

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

/**
 * Build the displayed page sequence with first/last anchors and ellipsis gaps,
 * e.g. `[1, 'ellipsis', 4, 5, 6, 'ellipsis', 12]`. Falls back to a plain range
 * while the page count is small enough to show every page.
 */
function getPageItems(page: number, pageCount: number, siblingCount: number): PageItem[] {
  // first + last + current + 2 ellipsis slots + a sibling on each side
  const total = siblingCount * 2 + 5;
  if (pageCount <= total) return range(1, pageCount);

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showLeftDots = left > 2;
  const showRightDots = right < pageCount - 1;
  const edgeCount = 3 + siblingCount * 2;

  if (!showLeftDots && showRightDots) return [...range(1, edgeCount), 'ellipsis', pageCount];
  if (showLeftDots && !showRightDots)
    return [1, 'ellipsis', ...range(pageCount - edgeCount + 1, pageCount)];
  return [1, 'ellipsis', ...range(left, right), 'ellipsis', pageCount];
}

/**
 * Numbered page navigation (‹ 1 … 4 5 6 … 12 ›) with first/last anchors and
 * ellipsis collapsing. Renders nothing for a single page. Tap targets are 40px
 * tall to stay thumb-friendly on mobile.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  className,
  classNames,
  ...rest
}: PaginationProps) {
  const t = useAppTranslations();

  if (pageCount <= 1) return null;

  const items = getPageItems(page, pageCount, siblingCount);
  const cell =
    'flex-center h-10 min-w-10 rounded-lg text-sm font-bold tabular-nums transition focus-outline';
  const stepClass =
    'text-white-secondary bg-white/5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5';

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), pageCount);
    if (clamped !== page) onPageChange(clamped);
  };

  return (
    <nav
      aria-label={t('pagination')}
      className={twMerge('flex items-center justify-center gap-1.5', className)}
      {...rest}
    >
      <button
        type="button"
        aria-label={t('previous page')}
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        className={twMerge(cell, stepClass, classNames?.button)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden
            className={twMerge(cell, 'text-white-secondary/40', classNames?.ellipsis)}
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={t('go to page {num}', { num: item })}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => goTo(item)}
            className={twMerge(
              cell,
              item === page
                ? twMerge('bg-pink-gradient text-white', classNames?.active)
                : twMerge('text-white-secondary bg-white/5 hover:bg-white/10', classNames?.button)
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        aria-label={t('next page')}
        disabled={page >= pageCount}
        onClick={() => goTo(page + 1)}
        className={twMerge(cell, stepClass, classNames?.button)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
