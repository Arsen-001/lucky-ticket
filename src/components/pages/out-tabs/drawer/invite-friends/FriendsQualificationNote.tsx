'use client';

import { Ban, Info } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface FriendsQualificationNoteProps {
  /** How many invited friends do not count right now. */
  notCounted: number;
  /**
   * This player's own referrals were wiped because THEY blocked the bot.
   * @see InvitedFriend.notCountedReason
   */
  burned?: boolean;
}

/**
 * The rule, stated once above the list.
 *
 * Shown only while somebody is actually not counted — the list already says
 * *which* friend is out, and this says why that can happen. To a player whose
 * friends all qualify it would be a condition announced for no reason, so the
 * parent hides it. @see InvitedFriendsList
 *
 * Two texts, because there are two completely different reasons and the wrong
 * one is worse than none. The default explains what a friend must keep doing
 * («пока ОН подписан на канал и не заблокировал бота»). That sentence is a lie
 * to a player whose own block burned their referrals: it blames the friends for
 * something their inviter did, and sends them chasing people who did nothing
 * wrong. @see AccountWipeService in the backend
 */
export function FriendsQualificationNote({ notCounted, burned }: FriendsQualificationNoteProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'flex items-start gap-2 rounded-xl border px-3 py-2.5',
        burned ? 'border-error/25 bg-error/10' : 'border-white/8 bg-white/4'
      )}
    >
      {burned ? (
        <Ban size={14} className="text-error mt-px flex-shrink-0" />
      ) : (
        <Info size={14} className="text-electric-pink mt-px flex-shrink-0" />
      )}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11px] font-bold leading-snug text-white/85">
          {burned
            ? t('referrals burned by bot block')
            : t('friends not counted as referrals', { count: notCounted })}
        </span>
        <span className="text-white-secondary text-[11px] leading-snug">
          {burned ? t('referrals burned explainer') : t('referral requires channel explainer')}
        </span>
      </div>
    </div>
  );
}
