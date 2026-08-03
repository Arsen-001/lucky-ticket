'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { getTelegramWebApp } from '@/lib/telegram/telegram';
import { usePreLaunchInvite } from '@/hooks/usePreLaunchInvite';
import { LaunchCountdown } from './LaunchCountdown';
import { ComingSoonChannelLink } from './ComingSoonChannelLink';
import { ComingSoonGiftSteps } from './ComingSoonGiftSteps';
import { ComingSoonInviteSection } from './ComingSoonInviteSection';
import { ComingSoonLanguageSwitch } from './ComingSoonLanguageSwitch';
import type { PreLaunchSession } from '@/hooks/usePreLaunchGate';
// A shipped output, NOT `images/logo/*`: that folder is the logo generation
// workspace and `.vercelignore` keeps it out of the deployment, so importing
// from it builds locally and then fails the Vercel build. `logo.png` is the
// square master and carries its own opaque background, which reads as a dark
// box over the atmospheric backdrop — hence this transparent derivative.
import logo from '@assets/images/logo-wordmark.webp';

/** App background — keeps the Telegram header/body chrome on-theme. */
const THEME_BG = '#1b1930';

export interface ComingSoonScreenProps {
  /** ISO instant the countdown runs to — the server's date, or the fallback. */
  launchAt: string;
  /** The gate's sign-in result, if there was one. @see ComingSoonInviteSection */
  session: PreLaunchSession | null;
}

/**
 * The screen everyone gets while the gate is up. Everything the app normally
 * boots — store, RTK queries, the tab shell — is never mounted behind it
 * (@see PreLaunchGate), so this renders on its own against the shared
 * atmospheric backdrop.
 *
 * The account was already created by the gate's own sign-in call: whoever is
 * looking at this countdown is a real player and a real referral by the time it
 * ends. That is also why inviting works here — the friends a visitor brings in
 * now are recorded exactly as they will be after launch.
 */
export function ComingSoonScreen({ launchAt, session }: ComingSoonScreenProps) {
  const t = useAppTranslations();
  // Fetched here rather than inside the invite block: the gift ladder sits
  // directly under the headline and the invite block far below it, and both
  // count the same referrals. One fetch, one number, no drift between them.
  const invite = usePreLaunchInvite(session);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    // Telegram keeps its own loading placeholder over the Mini App until the
    // page says it's ready — normally TelegramProvider does this, and it never
    // mounts here.
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.(THEME_BG);
    tg.setBackgroundColor?.(THEME_BG);
  }, []);

  return (
    // `m-auto` on the inner column rather than `justify-center` on the outer
    // one: with the invite list the content can now outgrow the viewport, and a
    // centered flex column clips its own overflow at the TOP — the logo would
    // become unreachable by scrolling.
    <main className="mx-auto flex min-h-full max-w-[var(--app-max-w)] flex-col px-6 pb-[calc(var(--tg-inset-bottom)+2rem)] pt-[calc(var(--tg-inset-top)+2rem)] text-center">
      <div className="m-auto flex w-full flex-col items-center gap-7">
        <h1 className="animate-fade-in w-full max-w-[270px]">
          <Image
            src={logo}
            alt={GlobalConstants.projectName}
            priority
            className="drop-shadow-3xl h-auto w-full"
          />
        </h1>

        <h2 className="animate-slide-in-bottom max-w-[20rem] text-balance text-lg font-extrabold leading-snug text-white">
          {t('coming soon earn now')}
        </h2>

        {invite.available && (
          <ComingSoonGiftSteps
            invitedCount={invite.friends.length}
            gift={invite.gift}
            loading={invite.isLoading}
            className="animate-slide-in-bottom"
            style={{ animationDelay: '100ms' }}
          />
        )}

        <LaunchCountdown targetDate={launchAt} className="animate-fade-in" />

        <ComingSoonInviteSection
          invite={invite}
          className="animate-slide-in-bottom"
          style={{ animationDelay: '300ms' }}
        />

        <div
          className="animate-slide-in-bottom flex flex-col items-center gap-4"
          style={{ animationDelay: '400ms' }}
        >
          <ComingSoonChannelLink />
          <ComingSoonLanguageSwitch />
        </div>
      </div>
    </main>
  );
}
