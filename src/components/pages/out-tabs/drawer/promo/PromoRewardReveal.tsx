'use client';

import { PartyPopper, Ticket as TicketIcon } from 'lucide-react';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatNumber } from '@/utils/global/number.utils';
import type { PromoReward, PromoRedeemResponse } from '@/types/interfaces/promo.interfaces';
import { staggerMs } from '@/utils/global/animation.utils';

interface PromoRewardRevealProps {
  response: PromoRedeemResponse;
}

export function PromoRewardReveal({ response }: PromoRewardRevealProps) {
  const t = useAppTranslations();

  return (
    <div className="card-outlined bg-background animate-slide-in-bottom relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl px-4 py-5 text-center">
      <span
        aria-hidden
        className="bg-electric-pink/20 pointer-events-none absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full blur-3xl"
      />
      <span className="bg-electric-pink/20 text-electric-pink flex-center relative h-12 w-12 rounded-full">
        <PartyPopper size={24} />
      </span>
      <div className="relative flex flex-col gap-0.5">
        <span className="text-base font-extrabold text-white">{t('reward unlocked')}</span>
        <span className="text-pink-secondary text-[11px] font-bold uppercase tracking-[0.2em]">
          {response.code}
        </span>
      </div>
      <div className="relative flex w-full flex-col gap-2">
        {response.rewards.map((reward, index) => (
          <div
            key={index}
            className="bg-background-overlay animate-slide-in-bottom flex items-center justify-center rounded-xl border border-white/5 py-2.5"
            style={{ animationDelay: `${staggerMs(index, 80)}ms` }}
          >
            <PromoRewardLine reward={reward} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoRewardLine({ reward }: { reward: PromoReward }) {
  const t = useAppTranslations();
  const amount = `+${formatNumber(reward.amount)}`;

  if (reward.kind === 'lc') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-white">
        {amount} <LcLabel size={16} interactive={false} />
      </span>
    );
  }

  if (reward.kind === 'stars') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-white">
        {amount} <TelegramStarIcon size={16} />
        <span className="text-pink-secondary text-[11px] font-bold uppercase">
          {GlobalConstants.starName}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-white">
      <TicketIcon size={16} className="text-electric-pink" /> {amount}
      <span className="text-white-secondary text-[12px] font-semibold capitalize">
        {reward.tier ? t(reward.tier) : ''} {t('tickets').toLowerCase()}
      </span>
    </span>
  );
}
