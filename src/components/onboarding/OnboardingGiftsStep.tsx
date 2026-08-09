'use client';

import type { ReactNode } from 'react';
import { Gift } from 'lucide-react';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { Button } from '@/components/shared/buttons/Button';
import { EngineIcon } from '@/components/shared/icons/EngineIcon';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { appConfig } from '@/config/app.config';
import { staggerMs } from '@/utils/global/animation.utils';

export interface OnboardingGiftsStepProps {
  /** Fired when the player claims the pack — grants the gifts and starts the tour. */
  onClaim: () => void;
}

/**
 * Welcome-gifts screen shown right after the language step. Presents the
 * brand-new account's starter pack (one Bronze engine, a Bronze-ticket balance,
 * and a first activity point); claiming it grants the gifts and starts the tour.
 */
export function OnboardingGiftsStep({ onClaim }: OnboardingGiftsStepProps) {
  const t = useAppTranslations();
  const { bronzeTickets, activityPoints } = appConfig.onboardingTour.welcomePack;

  const gifts: { icon: ReactNode; label: string; amount: number }[] = [
    { icon: <EngineIcon tier="bronze" size={46} />, label: t('bronze engine'), amount: 1 },
    {
      icon: <TicketOverlap type="bronze" width={48} height={36} />,
      label: t('bronze tickets'),
      amount: bronzeTickets,
    },
    { icon: <BoltIcon size={38} />, label: t('activity points'), amount: activityPoints },
  ];

  return (
    <ClientPortal>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[120] flex items-center justify-center px-4"
      >
        <div className="absolute inset-0 bg-[rgba(9,7,18,0.92)] backdrop-blur-sm" />

        <div className="border-electric-pink/30 bg-background-overlay/95 animate-slide-in-bottom relative w-full max-w-[var(--app-modal-max-w)] rounded-2xl border p-5 shadow-[0_18px_60px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md">
          <div className="mb-4 flex flex-col items-center text-center">
            <span className="bg-electric-pink/15 ring-electric-pink/30 flex-center mb-3 h-12 w-12 rounded-2xl ring-1">
              <Gift size={24} className="text-electric-pink" strokeWidth={2.2} />
            </span>
            <h3 className="text-lg font-extrabold text-white">{t('welcome gifts title')}</h3>
            <p className="text-white-secondary mt-1 text-sm leading-relaxed">
              {t('welcome gifts description')}
            </p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {gifts.map((gift, index) => (
              <li
                key={index}
                style={{ animationDelay: `${staggerMs(index, 90)}ms` }}
                className="animate-slide-in-bottom bg-background-overlay flex items-center gap-3 rounded-2xl border border-white/10 p-3"
              >
                <span className="flex-center h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {gift.icon}
                </span>
                <span className="flex-1 text-sm font-bold text-white">{gift.label}</span>
                <span className="bg-pink-gradient rounded-full px-3 py-1 text-sm font-extrabold tabular-nums text-white">
                  ×{gift.amount}
                </span>
              </li>
            ))}
          </ul>

          <Button onClick={onClaim} className="mt-5 w-full">
            {t('claim gifts')}
          </Button>
        </div>
      </div>
    </ClientPortal>
  );
}
