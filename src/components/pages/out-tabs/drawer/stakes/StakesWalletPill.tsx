'use client';

import Image from 'next/image';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface StakesWalletPillProps {
  balance: number;
  locked?: number;
}

export function StakesWalletPill({ balance, locked = 0 }: StakesWalletPillProps) {
  const t = useAppTranslations();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-back-button-background/60 px-3 py-1.5">
      <Image src={icons.coin} alt="" width={18} height={18} className="h-[18px] w-auto" />
      <div className="flex flex-col leading-tight">
        <span className="text-gold text-[13px] font-extrabold tabular-nums">
          {balance.toLocaleString()}
        </span>
        {locked > 0 && (
          <span className="text-pink-secondary text-[9px] font-bold tracking-wider">
            {t('{amount} locked', { amount: locked.toLocaleString() })}
          </span>
        )}
      </div>
    </div>
  );
}
