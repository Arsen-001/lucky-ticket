'use client';

import '@/styles/components/stakes.css';
import { useMemo, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  computeStakeAprPercent,
  computeStakeMonths,
  computeStakeReturnCoins,
} from '@/utils/global/stakes.utils';
import type { ActiveStake, StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

interface PrizeRowProps {
  icon: ReactNode;
  label: string;
  sub: string;
  accentClass: string;
  value: ReactNode;
  delayMs?: number;
}

function PrizeRow({ icon, label, sub, accentClass, value, delayMs = 0 }: PrizeRowProps) {
  return (
    <div
      className="stake-card-shell stake-card-border animate-fade-in flex items-center gap-3 p-3"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className={`flex-center h-10 w-10 shrink-0 rounded-xl border ${accentClass}`}>
        {icon}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="text-[13px] font-extrabold text-white">{label}</div>
        <div className="text-pink-secondary mt-0.5 text-[11px]">{sub}</div>
      </div>
      <div className="relative shrink-0">{value}</div>
    </div>
  );
}

/** Rolls the completion bonus draw — Lucky Stars or nothing. */
function rollBonusLS(levelDef: StakeLevelDefinition): number {
  if (Math.random() * 100 >= levelDef.starsChance) return 0;
  return Math.round(levelDef.starsMin + Math.random() * (levelDef.starsMax - levelDef.starsMin));
}

export interface StakesClaimRewardsModalProps {
  open: boolean;
  onClose: () => void;
  levelDef: StakeLevelDefinition;
  stake: ActiveStake;
}

export function StakesClaimRewardsModal({
  open,
  onClose,
  levelDef,
  stake,
}: StakesClaimRewardsModalProps) {
  const t = useAppTranslations();
  const months = computeStakeMonths(stake.startDate, stake.endDate);
  const yieldLC = computeStakeReturnCoins(stake.lockedAmount, months);
  const ratePercent = computeStakeAprPercent(months);
  const rateLabel = ratePercent.toFixed(ratePercent % 1 === 0 ? 0 : 1);

  const bonusLS = useMemo(() => (open ? rollBonusLS(levelDef) : 0), [open, levelDef]);

  return (
    <Modal open={open} onClose={onClose} hideCloseButton>
      <div className="stake-card-shell stake-card-border flex flex-col gap-4 px-5 py-5">
        <div className="text-center">
          <div className="border-success/35 bg-success/15 text-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest">
            <span className="bg-success h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--color-success)]" />
            {t('stake complete')}
          </div>
          <h2 className="mt-3 text-[24px] font-extrabold leading-tight tracking-tight text-white">
            {t('you earned')}{' '}
            <GoldenText className="text-[24px] font-extrabold">
              +{yieldLC.toLocaleString()} {GlobalConstants.coinName}
            </GoldenText>
          </h2>
        </div>

        <div className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
          {t('your prizes')}
        </div>

        <div className="flex flex-col gap-2">
          <PrizeRow
            icon={<ArrowDownToLine size={20} className="text-white/80" />}
            label={t('principal returned')}
            sub={t('available immediately on claim')}
            accentClass="border-white/15 bg-white/5"
            value={
              <span className="text-gold inline-flex items-center gap-1 text-[14px] font-extrabold tabular-nums">
                {stake.lockedAmount.toLocaleString()}
                <LcLabel size={13} />
              </span>
            }
          />
          <PrizeRow
            icon={<TrendingUp size={20} className="text-success" />}
            label={t('apr yield')}
            sub={t('rate {rate}% for {n} months', { rate: rateLabel, n: months })}
            accentClass="border-success/40 bg-success/15"
            value={
              <span className="text-success inline-flex items-center gap-1 text-[14px] font-extrabold tabular-nums">
                +{yieldLC.toLocaleString()}
                <LcLabel size={13} />
              </span>
            }
            delayMs={80}
          />
          <PrizeRow
            icon={<Star size={20} className="text-gold" fill="currentColor" strokeWidth={0} />}
            label={t('bonus draw')}
            sub={bonusLS > 0 ? t('the draw hit') : t('no bonus this time')}
            accentClass="border-gold/40 bg-gold/15"
            value={
              bonusLS > 0 ? (
                <span className="text-gold text-[14px] font-extrabold tabular-nums">
                  +{bonusLS} {t('stars')}
                </span>
              ) : (
                <span className="text-[13px] font-bold text-white/35">—</span>
              )
            }
            delayMs={160}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="stakes-btn-glow mt-1 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[14px] font-extrabold uppercase tracking-wider text-white shadow-[0_10px_28px_rgba(222,0,155,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]"
          style={{ background: 'linear-gradient(135deg, #DE009B 0%, #743DF5 100%)' }}
        >
          <span>{t('claim all rewards')}</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </Modal>
  );
}
