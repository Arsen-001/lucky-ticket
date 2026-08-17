'use client';

import {
  Ban,
  Clapperboard,
  Cpu,
  Gift,
  LayoutGrid,
  Lock,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { StarsTransactionDirection, StarsTransactionType } from '@/types/enums/stars.enums';
import { formatRelativeTime } from '@/utils/pages/wallet.utils';
import { formatNumber } from '@/utils/global/number.utils';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { StarsTransaction } from '@/types/interfaces/stars.interfaces';

export interface StarsTransactionRowProps {
  transaction?: StarsTransaction;
  loading?: boolean;
  style?: CSSProperties;
  className?: string;
}

interface TypeMeta {
  Icon: LucideIcon;
  iconClass: string;
  iconBg: string;
}

const TYPE_META: Record<StarsTransactionType, TypeMeta> = {
  [StarsTransactionType.PURCHASE]: { Icon: Sparkles, iconClass: 'text-gold', iconBg: 'bg-gold/15' },
  [StarsTransactionType.REFERRAL]: {
    Icon: Users,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [StarsTransactionType.TASK_REWARD]: {
    Icon: Sparkles,
    iconClass: 'text-teal',
    iconBg: 'bg-teal/15',
  },
  [StarsTransactionType.STAKE_REWARD]: {
    Icon: Gift,
    iconClass: 'text-electric-pink',
    iconBg: 'bg-electric-pink/15',
  },
  [StarsTransactionType.PROMO]: { Icon: Gift, iconClass: 'text-gold', iconBg: 'bg-gold/15' },
  [StarsTransactionType.ENGINE_SKIP]: {
    Icon: Zap,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [StarsTransactionType.ENGINE_UPGRADE]: {
    Icon: Cpu,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [StarsTransactionType.STAKE_FEE]: {
    Icon: Lock,
    iconClass: 'text-pink-secondary',
    iconBg: 'bg-white/5',
  },
  [StarsTransactionType.STAKE_CANCEL_FEE]: {
    Icon: Lock,
    iconClass: 'text-error-text',
    iconBg: 'bg-error/15',
  },
  [StarsTransactionType.SHOWCASE_SLOT]: {
    Icon: LayoutGrid,
    iconClass: 'text-electric-pink',
    iconBg: 'bg-electric-pink/15',
  },
  [StarsTransactionType.MARKET_PURCHASE]: {
    Icon: ShoppingCart,
    iconClass: 'text-electric-pink',
    iconBg: 'bg-electric-pink/15',
  },
  [StarsTransactionType.AVATAR_REWARD]: {
    Icon: Gift,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  // Same glyph the AP source list gives "watch video" — a bought view is that
  // activity, so it should not read as a different thing in the ledger.
  [StarsTransactionType.AD_EXTRA_VIEWS]: {
    Icon: Clapperboard,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [StarsTransactionType.ADMIN_ADJUST]: {
    Icon: Settings,
    iconClass: 'text-pink-secondary',
    iconBg: 'bg-white/5',
  },
  // Teal Cpu is the chip's colour everywhere else it appears (the test-quest
  // checklist, the inventory filters) — the purple Cpu above stays the engine's,
  // so the two charges are told apart at a glance in the same list.
  [StarsTransactionType.CHIP_SLOT]: {
    Icon: Cpu,
    iconClass: 'text-teal',
    iconBg: 'bg-teal/15',
  },
  // The one row in this list that is not a purchase, a reward or a fee: the
  // balance was taken because the bot was blocked. Painted with the error
  // colour for the same reason the LC list is. @see lc-type-meta.ts
  [StarsTransactionType.BOT_BLOCK_RESET]: {
    Icon: Ban,
    iconClass: 'text-error',
    iconBg: 'bg-error/15',
  },
};

const FALLBACK_META: TypeMeta = {
  Icon: Sparkles,
  iconClass: 'text-pink-secondary',
  iconBg: 'bg-white/5',
};

export function StarsTransactionRow({
  transaction,
  loading,
  style,
  className,
}: StarsTransactionRowProps) {
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
  const isCredit = transaction.direction === StarsTransactionDirection.CREDIT;
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
          <TelegramStarIcon size={12} />
        </span>
        <span className="text-pink-secondary text-[10px] font-semibold tabular-nums">
          {t('balance')}: {formatNumber(transaction.balanceAfter)}
        </span>
      </div>
    </div>
  );
}
