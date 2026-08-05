'use client';
import { useState } from 'react';
import { Send, Trophy } from 'lucide-react';
import { ProfileLikeButton } from '@/components/pages/out-tabs/drawer/profile/ProfileLikeButton';
import { ProfileSendTicketModal } from '@/components/pages/out-tabs/drawer/profile/ProfileSendTicketModal';
import { ProfileInviteTournamentModal } from '@/components/pages/out-tabs/drawer/profile/ProfileInviteTournamentModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';
import { displayNameOf } from '@/utils/global/user.utils';

export interface ProfileSocialActionsProps {
  profile: ProfileResponse;
  /** Preview mode — actions are shown but non-functional (DOCS §17.3.2). */
  isPreview?: boolean;
}

export function ProfileSocialActions({ profile, isPreview }: ProfileSocialActionsProps) {
  const t = useAppTranslations();
  const [sendOpen, setSendOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  // A tournament invite reaches only one's own referrals (DOCS §17.3.3). On
  // anyone else the button is absent rather than disabled: a stranger can never
  // become your referral (attribution is frozen at their first sign-in), so a
  // greyed-out button would promise an unlock that nothing the player does can
  // deliver. Preview mode keeps it, since it demonstrates the owner's profile.
  const canInvite = isPreview || !!profile.isMyReferral;

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setSendOpen(true)}
          disabled={isPreview}
          className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3.5 py-2 text-[12px] font-bold text-white/85 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-60"
        >
          <Send size={14} strokeWidth={2.6} />
          {t('send ticket')}
        </button>
        {canInvite && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            disabled={isPreview}
            className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3.5 py-2 text-[12px] font-bold text-white/85 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-60"
          >
            <Trophy size={14} strokeWidth={2.6} />
            {t('invite')}
          </button>
        )}
        <ProfileLikeButton
          userId={profile.id}
          liked={profile.liked}
          likesReceived={profile.publicStats.likesReceived}
          disabled={isPreview}
        />
      </div>

      {!isPreview && (
        <>
          <ProfileSendTicketModal
            open={sendOpen}
            onClose={() => setSendOpen(false)}
            userId={profile.id}
            username={displayNameOf(profile)}
          />
          {canInvite && (
            <ProfileInviteTournamentModal
              open={inviteOpen}
              onClose={() => setInviteOpen(false)}
              userId={profile.id}
              username={displayNameOf(profile)}
            />
          )}
        </>
      )}
    </>
  );
}
