'use client';

import { BellOff, HelpCircle, RadioTower } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ReferralDisqualification } from '@/types/interfaces/referral.interfaces';
import type { ComponentType } from 'react';

export interface FriendNotCountedBadgeProps {
  reason: ReferralDisqualification;
  className?: string;
}

type BadgeTone = 'fault' | 'unsure';

/** Spelled out as literals so `t()` still type-checks them. @see PromoContainer */
type ReasonMessageKey = 'not in channel' | 'blocked the bot' | 'could not check';

/**
 * Two tones, not three. `not-in-channel` and `bot-blocked` are things the
 * friend did and the inviter can ask about; `unknown` is OUR failure to reach
 * Telegram, and dressing it in the same warning colour tells a player their
 * friend left when nobody knows that. The muted tone is the honest one.
 */
const TONE: Record<BadgeTone, string> = {
  fault: 'bg-warning/12 text-warning border-warning/25',
  unsure: 'border-white/10 bg-white/5 text-white/50',
};

const REASON: Record<
  ReferralDisqualification,
  {
    icon: ComponentType<{ size?: number; className?: string }>;
    tone: BadgeTone;
    key: ReasonMessageKey;
  }
> = {
  'not-in-channel': { icon: RadioTower, tone: 'fault', key: 'not in channel' },
  'bot-blocked': { icon: BellOff, tone: 'fault', key: 'blocked the bot' },
  unknown: { icon: HelpCircle, tone: 'unsure', key: 'could not check' },
};

/** Why a friend on the list is not a referral — one chip, stated plainly. */
export function FriendNotCountedBadge({ reason, className }: FriendNotCountedBadgeProps) {
  const t = useAppTranslations();
  const { icon: Icon, tone, key } = REASON[reason];

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold leading-none',
        TONE[tone],
        className
      )}
    >
      <Icon size={10} className="flex-shrink-0" />
      <span className="truncate">{t(key)}</span>
    </span>
  );
}
