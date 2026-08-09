'use client';

import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { LcTransactionDirection } from '@/types/enums/lc.enums';
import { lcRowTime } from '@/utils/pages/lc.utils';
import { formatNumber } from '@/utils/global/number.utils';
import { lcTypeMeta } from './lc-type-meta';
import type { CSSProperties } from 'react';
import type { LcTransaction } from '@/types/interfaces/lc.interfaces';

export interface LcTransactionRowProps {
  transaction?: LcTransaction;
  loading?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function LcTransactionRow({
  transaction,
  loading,
  style,
  className,
}: LcTransactionRowProps) {
  const t = useAppTranslations();

  if (loading || !transaction) {
    return (
      <div
        style={style}
        className={twMerge(
          'bg-background-overlay/40 flex items-center gap-3 rounded-xl border border-white/5 p-3',
          className
        )}
      >
        <Skeleton variant="round" className="h-9 w-9 flex-shrink-0" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton variant="line" textSize="sm" className="h-4 w-2/3" />
          <Skeleton variant="line" textSize="xs" className="h-3 w-1/4" />
        </div>
        <Skeleton variant="line" textSize="sm" className="h-4 w-16" />
      </div>
    );
  }

  const meta = lcTypeMeta(transaction.type);
  const isCredit = transaction.direction === LcTransactionDirection.CREDIT;

  return (
    <div
      role="listitem"
      style={style}
      className={twMerge(
        'bg-background-overlay/40 hover:bg-background-overlay/70 flex items-center gap-3 rounded-xl border border-white/5 p-3 transition-colors',
        className
      )}
    >
      <div className={twMerge('flex-center h-9 w-9 flex-shrink-0 rounded-xl', meta.iconBg)}>
        <meta.Icon size={16} className={meta.iconClass} strokeWidth={2.4} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Two lines rather than an ellipsis: "Tournament prize · Evening Gold"
            is cut mid-word by a one-line row, and the part that gets cut is the
            only part that says which tournament it was. */}
        <span className="line-clamp-2 text-[13px] font-bold leading-tight text-white">
          {transaction.description}
        </span>
        <span className="text-pink-secondary text-[11px]">
          {lcRowTime(transaction.createdAt, t)}
        </span>
      </div>

      <span
        className={twMerge(
          'inline-flex flex-shrink-0 items-center gap-1 text-sm font-extrabold tabular-nums',
          isCredit ? 'text-success' : 'text-white-secondary'
        )}
      >
        {/* No coin glyph per row: on the LC screen itself every amount is LC,
            and the ~20px it took were coming out of the description. */}
        {isCredit ? '+' : '−'}
        {formatNumber(transaction.amount)}
      </span>
    </div>
  );
}
