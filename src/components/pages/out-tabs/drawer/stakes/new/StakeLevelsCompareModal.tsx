'use client';

import Image from 'next/image';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { Modal } from '@/components/shared/modals/Modal';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import {
  StakesLevelChip,
  stakeAccent,
} from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import {
  computeStakeBaseAp,
  computeStakeCompletionBonusAp,
  formatStakeRatePercent,
} from '@/utils/global/stakes.utils';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

export interface StakeLevelsCompareModalProps {
  open: boolean;
  onClose: () => void;
  levels: StakeLevelDefinition[];
}

export function StakeLevelsCompareModal({ open, onClose, levels }: StakeLevelsCompareModalProps) {
  const t = useAppTranslations();
  const stakeCfg = useStakesDisplayConfig();
  const maxMonths = stakeCfg.durationMaxMonths;
  const apDivisor = stakeCfg.apDivisor;

  return (
    <Modal open={open} onClose={onClose} label={t('compare stake levels')}>
      <div className="bg-background flex flex-col gap-3 rounded-2xl border border-white/10 px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <h3 className="text-[16px] font-extrabold text-white">{t('compare stake levels')}</h3>
        <p className="text-pink-secondary text-[10px]">
          {t('all values at min deposit and {n} months', { n: maxMonths })}
        </p>

        <div className="flex flex-col gap-2">
          {levels.map(lv => {
            const apMonth = Math.round(lv.minDeposit / apDivisor);
            // Same flooring the backend applies (`floor(base)`, then
            // `floor(base × pct/100)`) — rounding the product instead put this
            // table a point or two above what the claim actually pays.
            const apTotal =
              computeStakeBaseAp(lv.minDeposit, maxMonths, stakeCfg) +
              computeStakeCompletionBonusAp(lv.minDeposit, maxMonths, stakeCfg);
            const termStars = maxMonths * lv.completionStarsPerMonth;

            return (
              <div
                key={lv.level}
                className="stake-card-shell stake-card-border flex flex-col gap-2 px-3 py-2.5"
                style={{ ['--stake-card-accent' as string]: stakeAccent(lv) }}
              >
                <div className="relative flex items-center justify-between gap-2">
                  <StakesLevelChip level={lv.level} tier={lv.tier} size="sm" />
                  <div className="flex items-center gap-2">
                    {/* The APR boost — the only reason to reach for a band
                        (DOCS §18.2). It was missing from the very sheet whose
                        job is to justify climbing the ladder. */}
                    <span className="text-electric-pink rounded-full border border-electric-pink/35 bg-electric-pink/10 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums">
                      +{formatStakeRatePercent(lv.yieldBoostPct)}%
                    </span>
                    <span className="text-gold inline-flex items-center gap-1 text-[12px] font-extrabold tabular-nums">
                      {formatCompact(lv.minDeposit)}
                      <LcLabel size={11} />
                    </span>
                  </div>
                </div>
                <div className="relative grid grid-cols-3 gap-2 text-[10px]">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-pink-secondary font-bold uppercase tracking-wider">
                      AP/{t('mo')}
                    </span>
                    <span className="text-teal inline-flex items-center gap-0.5 font-extrabold tabular-nums">
                      <BoltIcon size={10} />+{formatNumber(apMonth)}
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    {/* "over N months", not "per year": the period is
                        `durationMaxMonths`, an admin knob that is 12 today and
                        need not stay 12. */}
                    <span className="text-pink-secondary font-bold uppercase tracking-wider">
                      {t('ap over {n} months', { n: maxMonths })}
                    </span>
                    <span className="text-teal inline-flex items-center gap-0.5 font-extrabold tabular-nums">
                      <BoltIcon size={10} />+{formatNumber(apTotal)}
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-pink-secondary font-bold uppercase tracking-wider">
                      {t('stars over {n} months', { n: maxMonths })}
                    </span>
                    <span className="text-gold inline-flex items-center gap-0.5 font-extrabold tabular-nums">
                      +{formatNumber(termStars)}
                      <Image
                        sizes="10px"
                        src={icons.telegramStar}
                        alt=""
                        className="h-2.5 w-auto"
                      />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
