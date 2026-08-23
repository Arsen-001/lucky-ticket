'use client';

import Image from 'next/image';
import { MonitorSmartphone } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useTelegramChrome } from '@/hooks/useTelegramChrome';
import { GlobalConstants } from '@/constants/global.constants';
import { deviceGateConfig } from '@/config/device-gate.config';
import { QrCode } from '@/components/shared/QrCode';
import { ComingSoonLanguageSwitch } from './ComingSoonLanguageSwitch';
import type { DeviceKind } from '@/lib/telegram/platform';
// Same transparent derivative the countdown uses — `images/logo/*` is the
// generation workspace and `.vercelignore` keeps it out of the deployment.
import logo from '@assets/images/logo-wordmark.webp';

export interface OpenInTelegramScreenProps {
  /**
   * Where this person is standing. Only two kinds ever reach this screen —
   * `browser` and `telegram-web` — and they differ in what can be offered: a
   * plain tab can be handed to Telegram with one tap, while inside Telegram Web
   * that same link merely reopens the web version, so there the only way out is
   * the desktop app or the phone. @see isWebClient
   */
  deviceKind: DeviceKind;
}

/**
 * What a browser sees: a QR code that opens the game in a real Telegram client.
 *
 * The game lives inside Telegram's own shell — its chrome, its viewport, its
 * back button, its haptics — and a browser tab has none of it, Telegram Web
 * included. An installed client is what is being asked for, not a phone
 * specifically: since 14.08.2026 Telegram Desktop plays like a phone does.
 *
 * The QR stays the headline action anyway, because it is the one that works
 * from both sides of the screen: a person in Telegram Web is already at a
 * computer, and scanning is faster than installing.
 *
 * Rendered by the gate, before any provider exists (@see PreLaunchGate), so it
 * may use nothing from the store — translations and a server action for the
 * language switch are all that is available, and all that it needs.
 */
export function OpenInTelegramScreen({ deviceKind }: OpenInTelegramScreenProps) {
  const t = useAppTranslations();
  // Telegram keeps its own placeholder over the Mini App until the page says it
  // is ready — and TelegramProvider, which normally says so, never mounts
  // behind the gate. Without this a desktop client shows its loader forever.
  useTelegramChrome();

  const link = deviceGateConfig.openInTelegramUrl;
  const inBrowser = deviceKind === 'browser';

  return (
    <main className="mx-auto flex min-h-full max-w-[var(--app-max-w)] flex-col items-center justify-center gap-6 px-6 pb-[calc(var(--tg-inset-bottom)+2rem)] pt-[calc(var(--tg-inset-top)+2rem)] text-center">
      <h1 className="animate-fade-in w-full max-w-[230px]">
        <Image
          sizes="230px"
          src={logo}
          alt={GlobalConstants.projectName}
          loading="eager"
          fetchPriority="high"
          className="drop-shadow-3xl h-auto w-full"
        />
      </h1>

      <div className="animate-slide-in-bottom flex flex-col items-center gap-2">
        <span className="bg-electric-purple/15 text-electric-purple flex-center h-14 w-14 rounded-full">
          <MonitorSmartphone size={26} strokeWidth={2.2} />
        </span>
        <h2 className="text-xl font-extrabold text-white">{t('open in the telegram app')}</h2>
        <p className="text-white-secondary max-w-[20rem] text-sm font-medium leading-relaxed">
          {inBrowser ? t('open in telegram from browser') : t('open in telegram from web')}
        </p>
      </div>

      {/* White, square, unstyled on purpose: a camera reads contrast and quiet
          zone. The card around it carries the app's look instead. */}
      <div
        className="animate-slide-in-bottom rounded-3xl bg-white p-3 shadow-2xl"
        style={{ animationDelay: '100ms' }}
      >
        <QrCode value={link} label={t('qr opens the game in telegram')} />
      </div>

      <p
        className="animate-slide-in-bottom text-white-secondary text-xs font-medium"
        style={{ animationDelay: '150ms' }}
      >
        {t('scan qr with phone')}
      </p>

      {/* Only in a plain tab — on a phone it opens Telegram right there, and on
          a desktop browser it hands the link to the installed client, which is
          exactly where this screen is sending people. Inside Telegram Web the
          same tap only reopens the web version, i.e. this screen again. */}
      {inBrowser && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="bg-pink-gradient animate-slide-in-bottom rounded-lg px-6 py-3.5 text-sm font-semibold text-white active:scale-99"
          style={{ animationDelay: '200ms' }}
        >
          {t('open in telegram')}
        </a>
      )}

      <ComingSoonLanguageSwitch
        className="animate-slide-in-bottom"
        style={{ animationDelay: '250ms' }}
      />
    </main>
  );
}
