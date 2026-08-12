'use client';

import Image from 'next/image';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { Modal } from '@/components/shared/modals/Modal';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import { formatCompact } from '@/utils/global/number.utils';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
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
            const apYearTotal = Math.round(
              ((lv.minDeposit * maxMonths) / apDivisor) *
                (1 + stakeCfg.apCompletionBonusPercent / 100)
            );
            const yearStars = maxMonths * lv.completionStarsPerMonth;

            return (
              <div
                key={lv.level}
                className="stake-card-shell stake-card-border flex flex-col gap-2 px-3 py-2.5"
                style={{ ['--stake-card-accent' as string]: `var(--color-${lv.tier})` }}
              >
                <div className="relative flex items-center justify-between">
                  <StakesLevelChip level={lv.level} tier={lv.tier} size="sm" />
                  <span className="text-gold inline-flex items-center gap-1 text-[12px] font-extrabold tabular-nums">
                    {formatCompact(lv.minDeposit)}
                    <LcLabel size={11} />
                  </span>
                </div>
                <div className="relative grid grid-cols-3 gap-2 text-[10px]">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-pink-secondary font-bold uppercase tracking-wider">
                      AP/{t('mo')}
                    </span>
                    <span className="text-teal inline-flex items-center gap-0.5 font-extrabold tabular-nums">
                      <BoltIcon size={10} />+{apMonth}
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-pink-secondary font-bold uppercase tracking-wider">
                      {t('year total ap')}
                    </span>
                    <span className="text-teal inline-flex items-center gap-0.5 font-extrabold tabular-nums">
                      <BoltIcon size={10} />+{apYearTotal}
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-pink-secondary font-bold uppercase tracking-wider">
                      {t('year stars')}
                    </span>
                    <span className="text-gold inline-flex items-center gap-0.5 font-extrabold tabular-nums">
                      +{yearStars}
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
