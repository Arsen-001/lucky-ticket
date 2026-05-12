'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { icons } from '@/constants/icons';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Button } from '@/components/shared/buttons/Button';

export interface StakeCancelSectionProps {
  level: number;
  lockedAmount: number;
  loading?: boolean;
  onCancel: () => void;
}

export function StakeCancelSection({
  level,
  lockedAmount,
  loading = false,
  onCancel,
}: StakeCancelSectionProps) {
  const t = useAppTranslations();
  const [confirming, setConfirming] = useState(false);
  const cancelFee = GlobalConstants.stakeCancelStarsPerLevel * level;

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="border-error/40 bg-error/15 flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-[13px] font-bold text-error/90"
      >
        <span>{t('cancel stake')}</span>
        <span className="inline-flex items-center gap-1 text-error/90 text-[12px] font-bold">
          <span>{t('costs')}</span>
          <Image src={icons.telegramStar} alt="" className="h-3 w-auto" />
          <span className="text-gold tabular-nums">{cancelFee}</span>
        </span>
      </button>
    );
  }

  return (
    <div className="border-error/40 bg-error/10 animate-fade-in rounded-2xl border p-3.5">
      <div className="flex items-start gap-2.5">
        <div className="border-error/40 bg-error/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
          <AlertTriangle size={16} className="text-error" strokeWidth={2.4} />
        </div>
        <p className="flex-1 text-[11px] leading-relaxed text-white">
          <strong className="text-error">{t('cancel forfeits all rewards')}</strong>{' '}
          {t('cancel forfeits description', {
            amount: lockedAmount.toLocaleString(),
            coin: GlobalConstants.coinName,
          })}
        </p>
      </div>

      <div className="bg-background-overlay/50 mt-3 rounded-xl border border-white/5 px-3 py-2.5">
        <div className="text-white-secondary flex items-center justify-between text-[11px]">
          <span>{t('lc returned')}</span>
          <span className="text-success inline-flex items-center gap-1 font-extrabold tabular-nums">
            <CoinIcon size={22} />+{lockedAmount.toLocaleString()} {GlobalConstants.coinName}
          </span>
        </div>
        <div className="text-white-secondary mt-1.5 flex items-center justify-between text-[11px]">
          <span>{t('cancellation fee')}</span>
          <span className="text-gold inline-flex items-center gap-1 font-extrabold tabular-nums">
            <Image src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
            {cancelFee} {t('stars')}
          </span>
        </div>
        <div className="text-pink-secondary mt-1.5 text-[9px] italic leading-relaxed">
          {t('paid via stars level {level}', { level })}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant="transparent"
          onClick={() => setConfirming(false)}
          className="text-white-secondary flex-1 border border-white/10 px-3 py-3 text-[12px] font-extrabold uppercase tracking-wider"
        >
          {t('keep staking')}
        </Button>
        <Button
          variant="primary"
          onClick={onCancel}
          loading={loading}
          className="flex-[1.3] px-3 py-3 text-[12px] font-extrabold uppercase tracking-wider"
          style={{ background: 'linear-gradient(135deg, #FF8C8C 0%, #C73030 100%)' }}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <span>{t('pay')}</span>
            <Image src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
            <span className="tabular-nums">{cancelFee}</span>
            <span>· {t('cancel')}</span>
          </span>
        </Button>
      </div>
    </div>
  );
}
