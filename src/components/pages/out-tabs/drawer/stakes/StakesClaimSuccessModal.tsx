'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { icons } from '@/constants/icons';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';

export interface StakesClaimSuccessModalProps {
  open: boolean;
  onClose: () => void;
  /** Total LC credited (principal + yield). */
  amount: number;
  /** Stars credited on completion. */
  stars: number;
  /** AP credited on completion (bonus only — base was credited at start). */
  ap: number;
}

export function StakesClaimSuccessModal({
  open,
  onClose,
  amount,
  stars,
  ap,
}: StakesClaimSuccessModalProps) {
  const t = useAppTranslations();

  return (
    <Modal open={open} onClose={onClose} hideCloseButton>
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
            {t('stake complete')}
          </h3>
          <p className="text-white-secondary mt-1 text-[12px]">{t('all rewards added')}</p>
        </div>

        <div className="grid w-full grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-black/25 px-2 py-2.5">
            <LcLabel size={20} />
            <span className="text-gold text-[13px] font-extrabold leading-none tabular-nums">
              +{formatCompact(amount)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-black/25 px-2 py-2.5">
            <Image src={icons.telegramStar} alt="" className="h-5 w-auto" />
            <span className="text-gold text-[13px] font-extrabold leading-none tabular-nums">
              +{stars}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-black/25 px-2 py-2.5">
            <BoltIcon size={18} className="text-teal" />
            <span className="text-teal text-[13px] font-extrabold leading-none tabular-nums">
              +{ap}
            </span>
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
