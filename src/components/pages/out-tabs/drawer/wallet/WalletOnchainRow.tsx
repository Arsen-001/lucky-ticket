'use client';

import { ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  formatTon,
  formatRelativeTime,
  tonScanUrl,
  truncateAddress,
} from '@/utils/pages/wallet.utils';
import type { CSSProperties } from 'react';
import type { OnchainTransaction } from '@/types/interfaces/wallet.interfaces';

export interface WalletOnchainRowProps {
  transaction?: OnchainTransaction;
  loading?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function WalletOnchainRow({
  transaction,
  loading,
  style,
  className,
}: WalletOnchainRowProps) {
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
          <Skeleton variant="line" textSize="xs" className="h-3 w-1/3" />
        </div>
        <Skeleton variant="line" textSize="sm" className="h-4 w-16" />
      </div>
    );
  }

  const isIn = transaction.direction === 'in';
  const Icon = isIn ? ArrowDownLeft : ArrowUpRight;

  return (
    <div
      style={style}
      className="bg-background-overlay/40 hover:bg-background-overlay/70 flex items-center gap-3 rounded-xl border border-white/5 p-3 transition-colors"
      role="listitem"
    >
      <div
        className={twMerge(
          'flex-center h-9 w-9 flex-shrink-0 rounded-xl',
          isIn ? 'bg-success/15' : 'bg-error/15'
        )}
      >
        <Icon size={16} className={isIn ? 'text-success' : 'text-error'} strokeWidth={2.4} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-bold text-white">
          {isIn ? t('received') : t('sent')}
          {transaction.counterparty && (
            <span className="text-pink-secondary font-mono text-[11px] font-semibold">
              {' · '}
              {truncateAddress(transaction.counterparty)}
            </span>
          )}
        </span>
        <span className="text-pink-secondary truncate text-[11px]">
          {formatRelativeTime(transaction.createdAt, t)}
          {transaction.comment && <span> · {transaction.comment}</span>}
        </span>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span
          className={twMerge(
            'text-sm font-extrabold tabular-nums',
            isIn ? 'text-success' : 'text-error'
          )}
        >
          {isIn ? '+' : '-'}
          {formatTon(Number(transaction.amount), 4)}
          <span className="text-pink-secondary ml-1 text-[10px] font-bold uppercase">TON</span>
        </span>
        <a
          href={tonScanUrl(transaction.hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-secondary hover:text-white inline-flex items-center gap-0.5 text-[10px] font-semibold transition-colors"
        >
          {t('tonscan')}
          <ExternalLink size={9} strokeWidth={2.6} />
        </a>
      </div>
    </div>
  );
}
