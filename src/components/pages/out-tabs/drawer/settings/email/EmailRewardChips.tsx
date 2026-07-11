'use client';

import type { ReactNode } from 'react';
import { Ticket as TicketIcon } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatNumber } from '@/utils/global/number.utils';
import type { EmailVerifyReward } from '@/types/interfaces/user.interfaces';

export interface EmailRewardChipsProps {
  reward: EmailVerifyReward;
}

/**
 * "What you get for confirming" teaser under the email field — one chip per
 * non-zero part of the admin-composed gift.
 */
export function EmailRewardChips({ reward }: EmailRewardChipsProps) {
  const t = useAppTranslations();

  const chips: { key: string; icon: ReactNode; label: string }[] = [];
  if (reward.ap > 0)
    chips.push({
      key: 'ap',
      icon: <BoltIcon size={13} />,
      label: t('plus {n} ap', { n: reward.ap }),
    });
  if (reward.lc > 0)
    chips.push({
      key: 'lc',
      icon: <LcLabel size={13} interactive={false} />,
      label: `+${formatNumber(reward.lc)}`,
    });
  if (reward.stars > 0)
    chips.push({
      key: 'stars',
      icon: <TelegramStarIcon size={12} />,
      label: `+${reward.stars} ${GlobalConstants.starName}`,
    });
  if (reward.tickets > 0)
    chips.push({
      key: 'tickets',
      icon: <TicketIcon size={13} className="text-electric-pink" />,
      label: `+${reward.tickets} ${t(
        reward.ticketTier.toLowerCase() as Lowercase<EmailVerifyReward['ticketTier']>
      )}`,
    });

  if (chips.length === 0) return null;

  return (
    <div className="mx-1 flex flex-wrap items-center gap-1.5">
      {chips.map(chip => (
        <span
          key={chip.key}
          className="border-teal/30 bg-teal/12 inline-flex items-center gap-1.5 rounded-full border px-3 py-1"
        >
          {chip.icon}
          <span className="text-teal text-[11px] font-extrabold">{chip.label}</span>
        </span>
      ))}
      <span className="text-[11px] text-white/50">{t('for verifying email')}</span>
    </div>
  );
}
