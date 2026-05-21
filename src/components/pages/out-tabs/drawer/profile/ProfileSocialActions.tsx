'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { ProfileLikeButton } from '@/components/pages/out-tabs/drawer/profile/ProfileLikeButton';
import { ProfileSendTicketModal } from '@/components/pages/out-tabs/drawer/profile/ProfileSendTicketModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';

export interface ProfileSocialActionsProps {
  profile: ProfileResponse;
  /** Preview mode — actions are shown but non-functional (DOCS §17.3.2). */
  isPreview?: boolean;
}

export function ProfileSocialActions({ profile, isPreview }: ProfileSocialActionsProps) {
  const t = useAppTranslations();
  const [sendOpen, setSendOpen] = useState(false);

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
        <ProfileLikeButton
          userId={profile.id}
          liked={profile.liked}
          likesReceived={profile.publicStats.likesReceived}
          disabled={isPreview}
        />
      </div>

      {!isPreview && (
        <ProfileSendTicketModal
          open={sendOpen}
          onClose={() => setSendOpen(false)}
          userId={profile.id}
          username={profile.username}
        />
      )}
    </>
  );
}
