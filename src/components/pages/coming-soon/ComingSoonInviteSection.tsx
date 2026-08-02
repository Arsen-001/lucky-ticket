'use client';

import { useLocale } from 'next-intl';
import { twMerge } from 'tailwind-merge';
import { ComingSoonFriendsList } from '@/components/pages/coming-soon/ComingSoonFriendsList';
import { ComingSoonInviteCard } from '@/components/pages/coming-soon/ComingSoonInviteCard';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useInviteShare } from '@/hooks/useInviteShare';
import { usePreLaunchInvite } from '@/hooks/usePreLaunchInvite';
import type { CSSProperties } from 'react';
import type { PreLaunchSession } from '@/hooks/usePreLaunchGate';
import type { LocaleType } from '@/types/types/locale.types';

export interface ComingSoonInviteSectionProps {
  /** The gate's sign-in result — no session, no invite block. */
  session: PreLaunchSession | null;
  className?: string;
  /** Carries the screen's entry-animation delay. */
  style?: CSSProperties;
}

/**
 * Invite block on the countdown screen: share the link, and see who came.
 *
 * Sharing behaves exactly as it does inside the app (same rich card, same
 * fallbacks) because both go through `useInviteShare`; only the plumbing under
 * it differs — no store exists here, so the data comes from
 * `usePreLaunchInvite` rather than RTK Query.
 */
export function ComingSoonInviteSection({
  session,
  className,
  style,
}: ComingSoonInviteSectionProps) {
  const t = useAppTranslations();
  const locale = useLocale() as LocaleType;
  const invite = usePreLaunchInvite(session);
  const { copied, copy, share, ready } = useInviteShare({
    link: invite.link,
    text: t('invite share message'),
    title: t('invite friends'),
    prepareCard: () => invite.prepareCard(locale),
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
      <ComingSoonFriendsList
        friends={invite.friends}
        loading={invite.isLoading}
        isError={invite.isError}
        onRetry={invite.retry}
      />
    </div>
  );
}
