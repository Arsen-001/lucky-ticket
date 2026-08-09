'use client';

import type { ReactNode } from 'react';
import { MailCheck } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { TicketRewardIcon } from '@/components/shared/icons/TicketRewardIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatNumber } from '@/utils/global/number.utils';
import { asTicketTier } from '@/utils/global/ticket-tier.utils';
import type { EmailVerifyReward } from '@/types/interfaces/user.interfaces';
import { staggerMs } from '@/utils/global/animation.utils';

export interface EmailVerifiedModalProps {
  email: string;
  reward: EmailVerifyReward;
}

/**
 * Reveal card shown inside the shared Modal after a confirmation that granted
 * the one-off gift (visual sibling of PromoRewardReveal).
 */
export function EmailVerifiedModal({ email, reward }: EmailVerifiedModalProps) {
  const t = useAppTranslations();

  const lines: { key: string; content: ReactNode }[] = [];
  if (reward.ap > 0)
    lines.push({
      key: 'ap',
      content: (
        <span className="inline-flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-white">
          +{formatNumber(reward.ap)} <BoltIcon size={16} />
          <span className="text-teal text-[11px] font-bold uppercase">AP</span>
        </span>
      ),
    });
  if (reward.lc > 0)
    lines.push({
      key: 'lc',
      content: (
        <span className="inline-flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-white">
          +{formatNumber(reward.lc)} <LcLabel size={16} interactive={false} />
        </span>
      ),
    });
  if (reward.stars > 0)
    lines.push({
      key: 'stars',
      content: (
        <span className="inline-flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-white">
          +{formatNumber(reward.stars)} <TelegramStarIcon size={16} />
          <span className="text-pink-secondary text-[11px] font-bold uppercase">
            {GlobalConstants.starName}
          </span>
        </span>
      ),
    });
  if (reward.tickets > 0)
    lines.push({
      key: 'tickets',
      content: (
        <span className="inline-flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-white">
          <TicketRewardIcon
            tier={asTicketTier(reward.ticketTier)}
            amount={reward.tickets}
            size={18}
          />{' '}
          +{reward.tickets}
          <span className="text-white-secondary text-[12px] font-semibold capitalize">
            {t(reward.ticketTier.toLowerCase() as Lowercase<EmailVerifyReward['ticketTier']>)}{' '}
            {t('tickets').toLowerCase()}
          </span>
        </span>
      ),
    });

  return (
    <div className="card-outlined bg-background animate-slide-in-bottom relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl px-4 py-5 text-center">
      <span
        aria-hidden
        className="bg-teal/20 pointer-events-none absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full blur-3xl"
      />
      <span className="bg-teal/20 text-teal flex-center relative h-12 w-12 rounded-full">
        <MailCheck size={24} />
      </span>
      <div className="relative flex flex-col gap-0.5">
        <span className="text-base font-extrabold text-white">{t('email confirmed')}</span>
        <span className="text-pink-secondary text-[11px] font-bold tracking-[0.08em]">{email}</span>
      </div>
      {lines.length > 0 && (
        <div className="relative flex w-full flex-col gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
            {t('reward unlocked')}
          </span>
          {lines.map((line, index) => (
            <div
              key={line.key}
              className="bg-background-overlay animate-slide-in-bottom flex items-center justify-center rounded-xl border border-white/5 py-2.5"
              style={{ animationDelay: `${staggerMs(index, 80)}ms` }}
            >
              {line.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
