'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { useTelegramChrome } from '@/hooks/useTelegramChrome';
import { usePreLaunchInvite } from '@/hooks/usePreLaunchInvite';
import { LaunchCountdown } from './LaunchCountdown';
import { ComingSoonChannelLink } from './ComingSoonChannelLink';
import { GiftLadder } from '@/components/shared/gift-ladder/GiftLadder';
import { ComingSoonInviteSection } from './ComingSoonInviteSection';
import { ComingSoonLanguageSwitch } from './ComingSoonLanguageSwitch';
import type { PreLaunchSession } from '@/hooks/usePreLaunchGate';
// A shipped output, NOT `images/logo/*`: that folder is the logo generation
// workspace and `.vercelignore` keeps it out of the deployment, so importing
// from it builds locally and then fails the Vercel build. `logo.png` is the
// square master and carries its own opaque background, which reads as a dark
// box over the atmospheric backdrop — hence this transparent derivative.
import logo from '@assets/images/logo-wordmark.webp';

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
  // There is no toast viewport behind the gate (it lives inside the store), so
  // a refusal is shown where the press happened — under the gift itself.
  const [claimError, setClaimError] = useState<string | null>(null);
  // Fetched here rather than inside the invite block: the gift ladder sits
  // directly under the headline and the invite block far below it, and both
  // count the same referrals. One fetch, one number, no drift between them.
  const invite = usePreLaunchInvite(session);
  // Telegram keeps its own loading placeholder over the Mini App until the page
  // says it's ready — normally TelegramProvider does this, and it never mounts
  // behind the gate. Shared with the maintenance wall, which has the same
  // problem. @see useTelegramChrome
  useTelegramChrome();

  const handleClaim = async () => {
    setClaimError(null);
    const refusal = await invite.claim();
    // The backend's own sentence when it has one ("подарки на сегодня
    // разобраны"), a generic line when the request never got there.
    if (refusal) setClaimError(refusal === 'error' ? t('action failed') : refusal);
  };

  return (
    // Top-aligned, not centred: the screen opens on the logo and the promise
    // instead of on a band of empty sky, and the content grows downward as the
    // invite list fills. (`mb-auto` keeps the leftover space at the bottom; a
    // centred column would also clip its own overflow at the TOP once the list
    // outgrows the viewport, putting the logo out of scrolling reach.)
    <main className="mx-auto flex min-h-full max-w-[var(--app-max-w)] flex-col px-6 pb-[calc(var(--tg-inset-bottom)+2rem)] pt-[calc(var(--tg-inset-top)+1.5rem)] text-center">
      <div className="mb-auto flex w-full flex-col items-center gap-7">
        <h1 className="animate-fade-in w-full max-w-[270px]">
          <Image
            sizes="270px"
            src={logo}
            alt={GlobalConstants.projectName}
            loading="eager"
            fetchPriority="high"
            className="drop-shadow-3xl h-auto w-full"
          />
        </h1>

        {/* The single instruction for someone who just arrived, and the only
            thing they can act on before launch — so it sits directly under the
            logo, at headline size, with its own button attached rather than the
            link living further down the page. */}
        <div className="flex w-full flex-col items-center gap-4">
          <h2 className="animate-slide-in-bottom max-w-[20rem] text-balance text-2xl font-extrabold leading-tight text-white">
            {t('coming soon follow and wait')}
          </h2>

          <ComingSoonChannelLink className="animate-fade-in" />
        </div>

        <p className="animate-slide-in-bottom max-w-[20rem] text-balance text-lg font-extrabold leading-snug text-white">
          {t('coming soon earn now')}
        </p>

        {/* Два разных «available», и путать их дорого. `invite.available` — это
            «мы авторизовались и вообще можем спрашивать». `gift.available` —
            ответ сервера про ЭТОГО игрока: промо закрыто или подарок у него уже
            есть. Здесь стояло только первое, и получивший подарок увидел бы
            лестницу снова — на экране друзей правило ровно обратное
            (@see FriendsGiftEventCard), а правило должно быть одно на оба
            экрана. Экран «скоро» сейчас выключен для всех, так что это заслон
            на случай, когда гейт поднимут обратно. */}
        {invite.available && invite.gift.available !== false && (
          <GiftLadder
            // The COUNTED friends, not everyone invited: the backend files a
            // claim on subscribed friends only, and a ladder counting the rest
            // would promise a gift nobody is going to file.
            invitedCount={invite.gift.counted ?? invite.friends.length}
            gift={invite.gift}
            loading={invite.isLoading}
            onClaim={handleClaim}
            claiming={invite.claiming}
            error={claimError}
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

        <ComingSoonLanguageSwitch
          className="animate-slide-in-bottom"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </main>
  );
}
