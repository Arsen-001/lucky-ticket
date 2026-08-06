'use client';

import { UserMinus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface FriendNotCountedBadgeProps {
  className?: string;
}

/**
 * "Not a referral right now" — one badge, no reason.
 *
 * It used to name which of three things happened (left the channel, blocked
 * the bot, or Telegram would not answer). That distinction paid for itself
 * nowhere: the screen has two states now — earning and not earning — and the
 * rule that separates them is stated once above the list rather than
 * re-litigated on every row. @see FriendsQualificationNote
 */
export function FriendNotCountedBadge({ className }: FriendNotCountedBadgeProps) {
  const t = useAppTranslations();

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white/50',
        className
      )}
    >
      <UserMinus size={10} className="flex-shrink-0" />
      <span className="truncate">{t('not counted')}</span>
    </span>
  );
}
