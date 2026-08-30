'use client';

import { twMerge } from 'tailwind-merge';
import { ComingSoonFriendsList } from '@/components/pages/coming-soon/ComingSoonFriendsList';
import { ComingSoonInviteCard } from '@/components/pages/coming-soon/ComingSoonInviteCard';
import { comingSoonConfig } from '@/config/coming-soon.config';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useInviteShare } from '@/hooks/useInviteShare';
import type { CSSProperties } from 'react';
import type { PreLaunchInviteState } from '@/hooks/usePreLaunchInvite';

export interface ComingSoonInviteSectionProps {
  /**
   * Referral state owned by the screen — the gift ladder reads the same one.
   * @see ComingSoonScreen
   */
  invite: PreLaunchInviteState;
  className?: string;
  /** Carries the screen's entry-animation delay. */
  style?: CSSProperties;
}

/**
 * Invite block on the countdown screen: share the link, and see who came.
 *
 * Sharing behaves exactly as it does inside the app — the bare invite link,
 * the same thing the copy button puts on the clipboard — because both screens
 * go through `useInviteShare`. Only the plumbing under it differs: no store
 * exists here, so the data comes from `usePreLaunchInvite` rather than RTK
 * Query.
 */
export function ComingSoonInviteSection({
  invite,
  className,
  style,
}: ComingSoonInviteSectionProps) {
  const t = useAppTranslations();
  const { copied, copy, share, ready } = useInviteShare({
    link: invite.link,
    title: t('invite friends'),
    onShared: invite.markShared,
  });

  // Nobody signed in (outside Telegram, or the sign-in was refused): there is no
  // link to hand out and no list to show, so the countdown stays as it was.
  if (!invite.available) return null;

  return (
    <div className={twMerge('flex w-full flex-col gap-3', className)} style={style}>
      <ComingSoonInviteCard
        invitedCount={invite.friends.length}
        loading={invite.isLoading}
        copied={copied}
        ready={ready}
        onShare={share}
        onCopy={copy}
      />
      {/* The promo is five friends, but the referral programme does not stop
          there: friends keep paying their inviter after launch, and the status
          tiers are gated on how many were brought. Saying so here is the only
          place a pre-launch visitor can learn that the sixth friend is not
          wasted. */}
      <p className="text-white-secondary rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-center text-[11px] font-medium leading-relaxed">
        {t('coming soon more friends better', {
          count: comingSoonConfig.giftFriendsRequired,
        })}
      </p>

      <ComingSoonFriendsList
        friends={invite.friends}
        counted={invite.gift.counted ?? undefined}
        notCountedIds={invite.gift.notCountedFriendIds}
        loading={invite.isLoading}
        isError={invite.isError}
        onRetry={invite.retry}
      />
    </div>
  );
}
