'use client';

import { Info } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface FriendsQualificationNoteProps {
  /** How many invited friends do not count right now. */
  notCounted: number;
}

/**
 * The rule, stated once above the list.
 *
 * Shown only while somebody is actually not counted — the list already says
 * *which* friend and *why*, and this says what the reasons mean together. To a
 * player whose friends all qualify it would be a condition announced for no
 * reason, so the parent hides it. @see InvitedFriendsList
 */
export function FriendsQualificationNote({ notCounted }: FriendsQualificationNoteProps) {
  const t = useAppTranslations();

  return (
    <div className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5">
      <Info size={14} className="text-electric-pink mt-px flex-shrink-0" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11px] font-bold leading-snug text-white/85">
          {t('friends not counted as referrals', { count: notCounted })}
        </span>
        <span className="text-white-secondary text-[11px] leading-snug">
          {t('referral requires channel explainer')}
        </span>
      </div>
    </div>
  );
}
