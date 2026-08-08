'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { icons } from '@/constants/icons';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import {
  computeStakeBaseAp,
  computeStakeCancelFee,
  computeStakeCompletionBonusAp,
} from '@/utils/global/stakes.utils';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';

export interface StakeCancelSectionProps {
  lockedAmount: number;
  durationMonths: number;
  loading?: boolean;
  onCancel: () => void;
}

export function StakeCancelSection({
  lockedAmount,
  durationMonths,
  loading = false,
  onCancel,
}: StakeCancelSectionProps) {
  const t = useAppTranslations();
  const [open, setOpen] = useState(false);
  const stakeKnobs = useStakesDisplayConfig();
  const cancelFee = computeStakeCancelFee(lockedAmount);
  const baseAp = computeStakeBaseAp(lockedAmount, durationMonths, stakeKnobs);
  const bonusAp = computeStakeCompletionBonusAp(lockedAmount, durationMonths, stakeKnobs);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-error/40 bg-error/15 flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-[13px] font-bold text-error-text/90"
      >
        <span>{t('cancel stake')}</span>
        <span className="inline-flex items-center gap-1 text-error-text/90 text-[12px] font-bold">
          <span>{t('costs')}</span>
          <Image src={icons.telegramStar} alt="" className="h-3 w-auto" />
          <span className="text-gold tabular-nums">{cancelFee}</span>
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        hideCloseButton
        label={t('cancel forfeits bonus')}
      >
        <div className="bg-background border-error/30 flex flex-col gap-4 rounded-2xl border px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="flex items-start gap-2.5">
            <div className="border-error/40 bg-error/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border">
              <AlertTriangle size={18} className="text-error-text" strokeWidth={2.4} />
            </div>
            <p className="flex-1 text-[12px] leading-relaxed text-white">
              <strong className="text-error-text">{t('cancel forfeits bonus')}</strong>{' '}
              {t('cancel forfeits description', {
                amount: lockedAmount.toLocaleString(),
                coin: GlobalConstants.coinName,
              })}
            </p>
          </div>

          <div className="bg-background-overlay/50 rounded-xl border border-white/5 px-3 py-2.5">
            <div className="text-white-secondary flex items-center justify-between text-[11px]">
              <span>{t('lc returned')}</span>
              <span className="text-success inline-flex items-center gap-1 font-extrabold tabular-nums">
                <LcLabel size={22} />+{lockedAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-white-secondary mt-1.5 flex items-center justify-between text-[11px]">
              <span>{t('base ap kept')}</span>
              <span className="text-teal inline-flex items-center gap-1 font-extrabold tabular-nums">
                <BoltIcon size={14} />+{baseAp}
              </span>
            </div>
            <div className="text-white-secondary mt-1.5 flex items-center justify-between text-[11px]">
              <span>{t('bonus ap forfeited')}</span>
              <span className="text-error-text/85 inline-flex items-center gap-1 font-extrabold tabular-nums line-through">
                <BoltIcon size={14} />+{bonusAp}
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
              {t('paid via stars')}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="transparent"
              onClick={() => setOpen(false)}
              className="text-white-secondary flex-1 border border-white/10 px-3 py-3 text-[12px] font-extrabold uppercase tracking-wider"
            >
              {t('keep staking')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setOpen(false);
                onCancel();
              }}
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
      </Modal>
    </>
  );
}
