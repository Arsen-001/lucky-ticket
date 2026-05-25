'use client';

import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';

export interface StakesWalletPillProps {
  balance: number;
  locked?: number;
}

export function StakesWalletPill({ balance, locked = 0 }: StakesWalletPillProps) {
  const t = useAppTranslations();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-back-button-background/60 px-3 py-1.5">
      <LcLabel size={28} />
      <div className="flex flex-col leading-tight">
        <span className="text-gold text-[13px] font-extrabold tabular-nums">
          {formatCompact(balance)}
        </span>
        {locked > 0 && (
          <span className="text-pink-secondary text-[9px] font-bold tracking-wider">
            {t('{amount} locked', { amount: formatCompact(locked) })}
          </span>
        )}
      </div>
    </div>
  );
}
