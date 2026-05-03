'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { ModalCloseButton } from '@/components/shared/modals/ModalCloseButton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { icons } from '@/constants/icons';

const STAR_PRESETS = [100, 250, 500, 1000, 2500] as const;

export interface NotEnoughStarsModalProps {
  open: boolean;
  onClose: () => void;
  requiredStars?: number;
  currentStars: number;
  onTopUp?: (amount: number) => void;
}

export function NotEnoughStarsModal({
  open,
  onClose,
  requiredStars,
  currentStars,
  onTopUp,
}: NotEnoughStarsModalProps) {
  const t = useAppTranslations();

  const hasRequirement = typeof requiredStars === 'number';
  const deficit = hasRequirement ? Math.max(1, requiredStars - currentStars) : null;
  const presets = (deficit ? [deficit, ...STAR_PRESETS] : [...STAR_PRESETS]).sort((a, b) => a - b);

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={twMerge(
          'fixed inset-0 z-100 flex items-end transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="bg-fade absolute inset-0 backdrop-blur-[1px]" onClick={onClose} />

        <div
          className={twMerge(
            'bg-background relative flex max-h-[85vh] w-full flex-col rounded-t-2xl transition-transform duration-300 ease-in-out',
            open ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <div className="flex-shrink-0">
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <ModalCloseButton onClick={onClose} className="z-10" />
          </div>

          <div className="flex flex-col gap-5 px-5 pb-7 pt-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-gold/10 border-gold/25 flex-center h-14 w-14 rounded-full border">
                <Image src={icons.telegramStar} alt="" width={28} height={28} />
              </div>
              <h3 className="text-lg font-extrabold text-white">
                {hasRequirement ? t('not enough stars') : t('add stars')}
              </h3>
              <p className="text-pink-secondary text-sm">
                {hasRequirement
                  ? t('not enough stars description', {
                      balance: currentStars,
                      required: requiredStars,
                    })
                  : t('top up stars description')}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <Image src={icons.telegramStar} alt="" width={18} height={18} />
                <span className="text-pink-secondary text-xs font-semibold uppercase tracking-wider">
                  {t('balance')}
                </span>
              </div>
              <span className="text-base font-extrabold tabular-nums text-white">
                {currentStars}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-pink-secondary text-xs font-bold uppercase tracking-wider">
                {t('add stars')}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {presets.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => onTopUp?.(amount)}
                    className="border-gold/30 bg-gold/8 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition-colors hover:bg-gold/15 active:scale-99"
                  >
                    <Image src={icons.telegramStar} alt="" width={20} height={20} />
                    <span className="text-gold text-base font-extrabold tabular-nums">
                      +{amount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}
