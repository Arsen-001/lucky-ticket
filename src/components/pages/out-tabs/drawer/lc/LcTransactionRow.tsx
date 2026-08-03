'use client';

import {
  ArrowDownUp,
  Clapperboard,
  Coins,
  Cpu,
  Crown,
  Gift,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  Trophy,
  Users,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { LcTransactionDirection, LcTransactionType } from '@/types/enums/lc.enums';
import { formatRelativeTime } from '@/utils/pages/wallet.utils';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { formatNumber } from '@/utils/global/number.utils';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { LcTransaction } from '@/types/interfaces/lc.interfaces';

export interface LcTransactionRowProps {
  transaction?: LcTransaction;
  loading?: boolean;
  style?: CSSProperties;
  className?: string;
}

interface TypeMeta {
  Icon: LucideIcon;
  iconClass: string;
  iconBg: string;
}

const TYPE_META: Record<LcTransactionType, TypeMeta> = {
  [LcTransactionType.TOURNAMENT_PRIZE]: {
    Icon: Trophy,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  [LcTransactionType.STAKE_REWARD]: {
    Icon: Gift,
    iconClass: 'text-electric-pink',
    iconBg: 'bg-electric-pink/15',
  },
  [LcTransactionType.TASK_REWARD]: {
    Icon: Sparkles,
    iconClass: 'text-teal',
    iconBg: 'bg-teal/15',
  },
  [LcTransactionType.REFERRAL]: {
    Icon: Users,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [LcTransactionType.MARKET_PURCHASE]: {
    Icon: ShoppingCart,
    iconClass: 'text-electric-pink',
    iconBg: 'bg-electric-pink/15',
  },
  [LcTransactionType.MARKET_SALE]: {
    Icon: Store,
    iconClass: 'text-success',
    iconBg: 'bg-success/15',
  },
  [LcTransactionType.ENGINE_UPGRADE]: {
    Icon: Cpu,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [LcTransactionType.CONVERT_FROM_STARS]: {
    Icon: ArrowDownUp,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  [LcTransactionType.CONVERT_TO_STARS]: {
    Icon: ArrowDownUp,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  [LcTransactionType.CONVERT_TO_TON]: {
    Icon: ArrowDownUp,
    iconClass: 'text-teal',
    iconBg: 'bg-teal/15',
  },
  [LcTransactionType.JACKPOT]: {
    Icon: Crown,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  [LcTransactionType.PROMO]: {
    Icon: Tag,
    iconClass: 'text-teal',
    iconBg: 'bg-teal/15',
  },
  [LcTransactionType.AVATAR_REWARD]: {
    Icon: Gift,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  // Same glyph the AP source list gives "watch video" — a bought view is that
  // activity, so it should not read as a different thing in the ledger.
  [LcTransactionType.AD_EXTRA_VIEWS]: {
    Icon: Clapperboard,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [LcTransactionType.ADMIN_ADJUST]: {
    Icon: SlidersHorizontal,
    iconClass: 'text-white/70',
    iconBg: 'bg-white/10',
  },
};

// A transaction type the client doesn't know yet (backend enum grew) must
// degrade to a generic coin row — never crash the whole page (that is exactly
// what happened when JACKPOT/PROMO/ADMIN_ADJUST appeared server-side).
const FALLBACK_META: TypeMeta = {
  Icon: Coins,
  iconClass: 'text-gold',
  iconBg: 'bg-gold/15',
};

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
          <Skeleton variant="line" textSize="xs" className="h-3 w-1/3" />
        </div>
        <Skeleton variant="line" textSize="sm" className="h-4 w-16" />
      </div>
    );
  }

  const meta = TYPE_META[transaction.type] ?? FALLBACK_META;
  const isCredit = transaction.direction === LcTransactionDirection.CREDIT;
  const amountClass = isCredit ? 'text-success' : 'text-error-text';
  const sign = isCredit ? '+' : '−';

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
        <span className="truncate text-[13px] font-bold text-white">{transaction.description}</span>
        <span className="text-pink-secondary text-[11px]">
          {formatRelativeTime(transaction.createdAt, t)}
        </span>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
        <span
          className={twMerge(
            'inline-flex items-center gap-1 text-sm font-extrabold tabular-nums',
            amountClass
          )}
        >
          {sign}
          {formatNumber(transaction.amount)}
          <LcLabel size={12} />
        </span>
        <span className="text-pink-secondary text-[10px] font-semibold tabular-nums">
          {t('balance')}: {formatNumber(transaction.balanceAfter)}
        </span>
      </div>
    </div>
  );
}
