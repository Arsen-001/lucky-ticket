'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { comingSoonConfig } from '@/config/coming-soon.config';
import { GlobalConstants } from '@/constants/global.constants';
import { getTelegramWebApp } from '@/lib/telegram/telegram';
import { LaunchCountdown } from './LaunchCountdown';
import { ComingSoonChannelLink } from './ComingSoonChannelLink';
import { ComingSoonLanguageSwitch } from './ComingSoonLanguageSwitch';
// A shipped output, NOT `images/logo/*`: that folder is the logo generation
// workspace and `.vercelignore` keeps it out of the deployment, so importing
// from it builds locally and then fails the Vercel build. `logo.png` is the
// square master and carries its own opaque background, which reads as a dark
// box over the atmospheric backdrop — hence this transparent derivative.
import logo from '@assets/images/logo-wordmark.webp';

/** App background — keeps the Telegram header/body chrome on-theme. */
const THEME_BG = '#1b1930';

/**
 * The only screen this branch serves. Everything the app normally boots —
 * store, Telegram auth, RTK queries, the tab shell — is skipped by the root
 * layout while the gate is on, so this renders on its own against the shared
 * atmospheric backdrop.
 */
export function ComingSoonScreen() {
  const t = useAppTranslations();

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
    <main className="mx-auto flex min-h-full max-w-[var(--app-max-w)] flex-col items-center justify-center gap-7 px-6 pb-[calc(var(--tg-inset-bottom)+2rem)] pt-[calc(var(--tg-inset-top)+2rem)] text-center">
      <h1 className="animate-fade-in w-full max-w-[270px]">
        <Image
          src={logo}
          alt={GlobalConstants.projectName}
          priority
          className="drop-shadow-3xl h-auto w-full"
        />
      </h1>

      <div className="animate-slide-in-bottom flex flex-col items-center gap-3">
        <span className="border-electric-pink/40 bg-electric-pink/10 text-electric-pink rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em]">
          {t('coming soon')}
        </span>
        <p className="text-white-secondary max-w-[22rem] text-sm font-medium leading-relaxed">
          {t('coming soon blurb')}
        </p>
      </div>

      <LaunchCountdown targetDate={comingSoonConfig.launchAt} className="animate-fade-in" />

      <div
        className="animate-slide-in-bottom flex flex-col items-center gap-4"
        style={{ animationDelay: '400ms' }}
      >
        <ComingSoonChannelLink />
        <ComingSoonLanguageSwitch />
      </div>
    </main>
  );
}
