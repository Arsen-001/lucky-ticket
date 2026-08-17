'use client';

import { Check } from 'lucide-react';
import { useGetStakesQuery } from '@/api/stakes.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Modal } from '@/components/shared/modals/Modal';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatDate } from '@/utils/global/date.utils';
import { formatCompact } from '@/utils/global/number.utils';
import { findLevelDef } from '@/utils/global/stakes.utils';

export interface StakeOpenedModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  months: number;
  /** The band the SERVER settled on — `0` when the deposit cleared none. */
  level: number;
  /** Unlock date as the server computed it (calendar months, not months × 30d). */
  endDate?: string;
}

export function StakeOpenedModal({
  open,
  onClose,
  amount,
  months,
  level,
  endDate,
}: StakeOpenedModalProps) {
  const t = useAppTranslations();
  // Cached by the screen that opened this sheet — no extra request.
  const { data: stakes } = useGetStakesQuery();
  const levelDef = stakes ? findLevelDef(stakes.levels, level) : null;

  return (
    <Modal open={open} onClose={onClose} hideCloseButton label={t('stake opened')}>
      <div
        className="border-success/30 flex flex-col items-center gap-4 rounded-2xl border px-5 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(74,222,128,0.18) 0%, transparent 55%),' +
            'linear-gradient(180deg, #1F2A28 0%, #151F35 100%)',
        }}
      >
        <div className="flex-center border-success/35 bg-success/15 h-16 w-16 rounded-full border shadow-[0_0_24px_rgba(74,222,128,0.4)]">
          <Check size={32} className="text-success" strokeWidth={3} />
        </div>
        <div>
          <h3 className="text-[20px] font-extrabold leading-tight text-white">
            {t('stake opened')}
          </h3>
          <div className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-white/75">
            <span className="text-gold tabular-nums">{formatCompact(amount)}</span>
            <LcLabel size={15} />
            <span>{t('locked for {n} months', { n: months })}</span>
          </div>
          {/* The band and the unlock date as the server recorded them — the
              response used to be thrown away and this sheet quoted the form's
              own guess back at the player. */}
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <StakesLevelChip level={level} tier={levelDef?.tier ?? null} size="sm" />
            {endDate && (
              <span className="text-white-secondary text-[11px] font-semibold tabular-nums">
                {t('ends on')} {formatDate(endDate, 'DD.MM.YY')}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="border-success/30 mt-1 w-full rounded-2xl border px-5 py-3.5 text-[14px] font-extrabold uppercase tracking-wider text-white shadow-[0_3px_9px_rgba(74,222,128,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(74,222,128,0.25) 0%, transparent 55%),' +
              'linear-gradient(180deg, #1F2A28 0%, #151F35 100%)',
          }}
        >
          {t('done')}
        </button>
      </div>
    </Modal>
  );
}
