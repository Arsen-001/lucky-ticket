'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Star,
  XCircle,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  WalletCurrency,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types/enums/wallet.enums';
import { formatTon, formatRelativeTime, tonScanUrl } from '@/utils/pages/wallet.utils';
import { formatNumber } from '@/utils/global/number.utils';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { WalletTransaction } from '@/types/interfaces/wallet.interfaces';

export interface WalletTransactionRowProps {
  transaction?: WalletTransaction;
  loading?: boolean;
  style?: CSSProperties;
  className?: string;
}

interface TypeMeta {
  Icon: LucideIcon;
  iconClass: string;
  iconBg: string;
  amountSign: '+' | '-';
  amountClass: string;
}

const TYPE_META: Record<WalletTransactionType, TypeMeta> = {
  [WalletTransactionType.DEPOSIT_TON]: {
    Icon: ArrowDownLeft,
    iconClass: 'text-success',
    iconBg: 'bg-success/15',
    amountSign: '+',
    amountClass: 'text-success',
  },
  [WalletTransactionType.WITHDRAW_TON]: {
    Icon: ArrowUpRight,
    iconClass: 'text-error',
    iconBg: 'bg-error/15',
    amountSign: '-',
    amountClass: 'text-error',
  },
  [WalletTransactionType.BUY_STARS]: {
    Icon: Star,
    iconClass: 'text-gold',
    iconBg: 'bg-electric-purple/15',
    amountSign: '+',
    amountClass: 'text-gold',
  },
};

const STATUS_ICON: Record<WalletTransactionStatus, LucideIcon> = {
  [WalletTransactionStatus.COMPLETED]: CheckCircle2,
  [WalletTransactionStatus.PENDING]: Loader2,
  [WalletTransactionStatus.FAILED]: XCircle,
};

const STATUS_CLASS: Record<WalletTransactionStatus, string> = {
  [WalletTransactionStatus.COMPLETED]: 'text-success',
  [WalletTransactionStatus.PENDING]: 'text-warning animate-spin',
  [WalletTransactionStatus.FAILED]: 'text-error',
};

export function WalletTransactionRow({
  transaction,
  loading,
  style,
  className,
}: WalletTransactionRowProps) {
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

  const meta = TYPE_META[transaction.type];
  const StatusIcon = STATUS_ICON[transaction.status];
  const isPending = transaction.status === WalletTransactionStatus.PENDING;

  return (
    <div
      style={style}
      className={twMerge(
        'bg-background-overlay/40 hover:bg-background-overlay/70 flex items-center gap-3 rounded-xl border border-white/5 p-3 transition-colors',
        className
      )}
      role="listitem"
    >
      <div
        className={twMerge(
          'flex-center relative h-9 w-9 flex-shrink-0 rounded-xl',
          meta.iconBg,
          isPending && 'animation-blink'
        )}
      >
        <meta.Icon size={16} className={meta.iconClass} strokeWidth={2.4} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-bold text-white">{transaction.description}</span>
        <span className="text-pink-secondary inline-flex items-center gap-1.5 text-[11px]">
          {formatRelativeTime(transaction.createdAt, t)}
          <span aria-hidden>·</span>
          <StatusIcon size={11} className={STATUS_CLASS[transaction.status]} strokeWidth={2.6} />
          <span
            className={twMerge(
              'font-semibold',
              STATUS_CLASS[transaction.status].replace(' animate-spin', '')
            )}
          >
            {t(`wallet status ${transaction.status}`)}
          </span>
        </span>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <SkeletonSuspense
          loading={false}
          skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-12" />}
        >
          <span className={twMerge('text-sm font-extrabold tabular-nums', meta.amountClass)}>
            {meta.amountSign}
            {transaction.currency === WalletCurrency.TON
              ? formatTon(transaction.amount, 4)
              : formatNumber(transaction.amount)}
            <span className="text-pink-secondary ml-1 text-[10px] font-bold uppercase">
              {transaction.currency}
            </span>
          </span>
        </SkeletonSuspense>
        {transaction.txHash && (
          <a
            href={tonScanUrl(transaction.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-secondary hover:text-white inline-flex items-center gap-0.5 text-[10px] font-semibold transition-colors"
          >
            {t('tonscan')}
            <ExternalLink size={9} strokeWidth={2.6} />
          </a>
        )}
      </div>
    </div>
  );
}
