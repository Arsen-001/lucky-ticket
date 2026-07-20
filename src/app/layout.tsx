import Script from 'next/script';
import { StoreProvider } from '@/providers/StoreProvider';
import { NavigationHistoryProvider } from '@/providers/NavigationHistoryProvider';
import { TelegramProvider } from '@/providers/TelegramProvider';
import { TonConnectProvider } from '@/providers/TonConnectProvider';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { TournamentResultWatcher } from '@/components/pages/tabs/tournaments/TournamentResultWatcher';
import { ToastViewport } from '@/components/shared/toast/ToastViewport';
import { AppStatusOverlay } from '@/components/shared/status/AppStatusOverlay';
import { FullscreenBrandBar } from '@/components/layout-elements/FullscreenBrandBar';
import { NextIntlClientProvider } from 'next-intl';
import { gilroy, spaceGrotesk } from '@/fonts/index.fonts';
import { getLocale } from 'next-intl/server';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import '@/styles/index.css';

export default async function RootLayout({ children }: ChildrenProps) {
  const locale = await getLocale();

  return (
    <StoreProvider>
      {/* telegram-web-app.js (beforeInteractive) sets --tg-viewport-* on <html>
          before hydration, so its style attr won't match React's render. This
          is expected external mutation — suppress the hydration warning for the
          <html> element's own attributes (does not affect children). */}
      <html
        lang={locale}
        className={`${gilroy.variable} ${spaceGrotesk.variable}`}
        suppressHydrationWarning
      >
        <head>
          <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
          {/* Rewarded-ad SDKs — each loads only when its network is configured,
              so an unused network costs nothing. Order here is irrelevant; the
              waterfall order lives in NEXT_PUBLIC_AD_PROVIDERS. */}
          {process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID && (
            <Script src="https://sad.adsgram.ai/js/sad.min.js" strategy="afterInteractive" />
          )}
          {process.env.NEXT_PUBLIC_MONETAG_ZONE_ID && (
            <Script
              src="https://libtl.com/sdk.js"
              data-zone={process.env.NEXT_PUBLIC_MONETAG_ZONE_ID}
              data-sdk={`show_${process.env.NEXT_PUBLIC_MONETAG_ZONE_ID}`}
              strategy="afterInteractive"
            />
          )}
        </head>
        {/* The Telegram client / iOS Safari inject `ontouchstart=""` onto <body>
            before hydration (to enable :active on touch), which won't match
            React's server render. Suppress the warning for the <body>'s own
            attributes — this is shallow and does not affect children, so real
            hydration bugs in the app content still surface. */}
        <body suppressHydrationWarning>
          <div id="scroll-container">
            <NextIntlClientProvider>
              <NavigationHistoryProvider>
                <TonConnectProvider>
                  <TelegramProvider>
                    <div className="max-w-[var(--app-max-w)] m-auto h-full overflow-hidden">
                      {children}
                    </div>
                    <Onboarding />
                    <TournamentResultWatcher />
                  </TelegramProvider>
                </TonConnectProvider>
                <FullscreenBrandBar />
                <ToastViewport />
                <AppStatusOverlay />
              </NavigationHistoryProvider>
            </NextIntlClientProvider>
          </div>
          <div id="portal-root" />
        </body>
      </html>
    </StoreProvider>
  );
}
