'use client';

import { Plus, Star } from 'lucide-react';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';

export interface StarsBalanceCardProps {
  balance?: number;
  loading?: boolean;
  onBuyMore: () => void;
  disabled?: boolean;
}

export function StarsBalanceCard({ balance, loading, onBuyMore, disabled }: StarsBalanceCardProps) {
  const t = useAppTranslations();

  return (
    <div className="card-outlined bg-background-overlay relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3">
      <span
        aria-hidden
        className="bg-electric-pink/10 pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl"
      />
      <div className="bg-electric-purple/15 flex-center relative h-9 w-9 flex-shrink-0 rounded-xl">
        <Star size={16} className="text-gold fill-gold" strokeWidth={2.2} />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
          {t('in app stars')}
        </span>
        <SkeletonSuspense
          loading={!!loading}
          skeleton={<Skeleton variant="line" className="h-5 w-16" />}
        >
          <span className="text-base font-extrabold tabular-nums text-white">
            {formatNumber(balance ?? 0)}
          </span>
        </SkeletonSuspense>
      </div>

      <button
        type="button"
        onClick={onBuyMore}
        disabled={disabled}
        className="bg-electric-purple/20 hover:bg-electric-purple/30 text-electric-purple inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
      >
        <Plus size={12} strokeWidth={3} />
        {t('buy more')}
      </button>
    </div>
  );
}
