'use client';

import Image from 'next/image';
import { Smartphone } from 'lucide-react';
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
   * Where this person is standing. Only the copy and the button change: a
   * browser can be sent to Telegram with a tap, a desktop Telegram client is
   * already in Telegram and can only be sent to a phone.
   */
  deviceKind: DeviceKind;
}

/**
 * What a computer sees: a QR code that opens the game on a phone.
 *
 * The app is a phone product — a 390px column, Telegram's own chrome, a thumb
 * — and a desktop session is also the comfortable way to run several accounts
 * at once. So instead of a shrunken game on a wide screen, a computer gets the
 * one thing it is good for here: a code big enough to scan from across a desk.
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
          sizes="100vw"
          src={logo}
          alt={GlobalConstants.projectName}
          priority
          className="drop-shadow-3xl h-auto w-full"
        />
      </h1>

      <div className="animate-slide-in-bottom flex flex-col items-center gap-2">
        <span className="bg-electric-purple/15 text-electric-purple flex-center h-14 w-14 rounded-full">
          <Smartphone size={26} strokeWidth={2.2} />
        </span>
        <h2 className="text-xl font-extrabold text-white">{t('play from your phone')}</h2>
        <p className="text-white-secondary max-w-[20rem] text-sm font-medium leading-relaxed">
          {inBrowser ? t('open in telegram from browser') : t('open in telegram from desktop')}
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

      {/* Only in a browser — on a phone it opens Telegram right there, and on a
          desktop browser it hands the link to the desktop client. Inside a
          desktop Telegram client the same tap would just reopen this screen. */}
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
