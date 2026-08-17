'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { icons } from '@/constants/icons';
import { GlobalConstants } from '@/constants/global.constants';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import { computeStakeCancelFee } from '@/utils/global/stakes.utils';
import { formatNumber } from '@/utils/global/number.utils';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

export interface StakeConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** The band the deposit falls in — `null` when it clears none. */
  levelDef: StakeLevelDefinition | null;
  deposit: number;
  durationMonths: number;
  /** Stars charged to open the stake — meaningless while `stakeFeeFree`. */
  stakeFee: number;
  stakeFeeFree: boolean;
  freeStartsRemaining: number;
  balanceAfter: number;
  loading?: boolean;
}

/**
 * The last stop before LC leaves the balance.
 *
 * The sticky CTA used to open the stake on its own tap: one finger on a button
 * that also carries the fee badge, and the deposit was locked for months with
 * no way back except a Stars-priced cancellation. This sheet restates what is
 * about to happen — amount, term, band, fee, what the balance drops to — and
 * names the cost of changing one's mind, so the irreversible half of the flow
 * needs a second, deliberate tap.
 */
export function StakeConfirmModal({
  open,
  onClose,
  onConfirm,
  levelDef,
  deposit,
  durationMonths,
  stakeFee,
  stakeFeeFree,
  freeStartsRemaining,
  balanceAfter,
  loading = false,
}: StakeConfirmModalProps) {
  const t = useAppTranslations();
  const stakeCfg = useStakesDisplayConfig();
  const cancelFee = computeStakeCancelFee(deposit);
  const level = levelDef?.level ?? 0;

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      // An in-flight request has nothing to cancel: dismissing the sheet would
      // not stop the stake, only hide it while it opens.
      closeOnOverlayClick={!loading}
      hideCloseButton
      label={t('open this stake?')}
    >
      <div className="bg-background flex flex-col gap-4 rounded-2xl border border-white/10 px-5 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-[19px] font-extrabold leading-tight text-white">
            {t('open this stake?')}
          </h3>
          <StakesLevelChip level={level} tier={levelDef?.tier ?? null} size="md" />
        </div>

        <div className="bg-background-overlay/50 rounded-xl border border-white/5 px-3 py-2.5">
          <div className="text-white-secondary flex items-center justify-between text-[11px]">
            <span>{t('amount')}</span>
            <span className="text-gold inline-flex items-center gap-1 font-extrabold tabular-nums">
              {formatNumber(deposit)}
              <LcLabel size={13} />
            </span>
          </div>
          <div className="text-white-secondary mt-1.5 flex items-center justify-between text-[11px]">
            <span>{t('duration')}</span>
            <span className="font-extrabold tabular-nums text-white">
              {t('{n} months', { n: durationMonths })}
            </span>
          </div>
          <div className="text-white-secondary mt-1.5 flex items-center justify-between text-[11px]">
            <span>{t('stake fee')}</span>
            {stakeFeeFree ? (
              <span className="text-success inline-flex items-center gap-1.5 font-extrabold">
                {t('fee free')}
                <span className="inline-flex items-center rounded-full border border-bronze/50 bg-bronze/25 px-1.5 py-0.5 text-[9px] font-bold leading-none tabular-nums text-white">
                  {freeStartsRemaining}/{stakeCfg.freeStartCount}
                </span>
              </span>
            ) : (
              <span className="text-gold inline-flex items-center gap-1 font-extrabold tabular-nums">
                <Image sizes="14px" src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
                {formatNumber(stakeFee)}
              </span>
            )}
          </div>
          <div className="text-white-secondary mt-1.5 flex items-center justify-between text-[11px]">
            <span>{t('balance after')}</span>
            <span className="inline-flex items-center gap-1 font-extrabold tabular-nums text-white">
              {formatNumber(balanceAfter)}
              <LcLabel size={13} />
            </span>
          </div>
        </div>

        {/* The exit price, quoted before the entrance — the cancel sheet on the
            progress screen is the only other place it is named, and by then the
            LC is already locked. */}
        <div className="border-error/30 bg-error/10 flex items-start gap-2.5 rounded-xl border px-3 py-2.5">
          <AlertTriangle size={15} className="text-error-text mt-0.5 shrink-0" strokeWidth={2.4} />
          <p className="text-white-secondary flex-1 text-[10.5px] leading-relaxed">
            {t('stake lock warning', {
              amount: formatNumber(deposit),
              coin: GlobalConstants.coinName,
              n: durationMonths,
            })}{' '}
            <span className="font-bold text-white">
              {t('early cancel costs {n} stars and revokes ap', { n: cancelFee })}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="transparent"
            onClick={onClose}
            disabled={loading}
            className="text-white-secondary flex-1 border border-white/10 px-3 py-3 text-[12px] font-extrabold uppercase tracking-wider"
          >
            {t('cancel')}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="stakes-liquid-glass stakes-btn-glow flex flex-[1.3] items-center justify-center gap-2 overflow-hidden rounded-lg px-3 py-3 text-[12px] font-extrabold uppercase tracking-wider text-white transition-transform active:scale-[0.99] disabled:opacity-70"
          >
            {/* Plain "Confirm", not the CTA's "Confirm Level N stake": the band
                is already a chip under the title, and the long label wrapped to
                two lines inside the sheet — in Russian, and in most of the
                nineteen other dictionaries. */}
            <span className="relative z-10">{t('confirm')}</span>
            {loading && <Loader2 size={15} className="relative z-10 animate-spin" />}
          </button>
        </div>
      </div>
    </Modal>
  );
}
