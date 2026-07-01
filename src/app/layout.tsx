import Script from 'next/script';
import { StoreProvider } from '@/providers/StoreProvider';
import { NavigationHistoryProvider } from '@/providers/NavigationHistoryProvider';
import { TelegramProvider } from '@/providers/TelegramProvider';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { ToastViewport } from '@/components/shared/toast/ToastViewport';
import { AppStatusOverlay } from '@/components/shared/status/AppStatusOverlay';
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
        </head>
        <body>
          <div id="scroll-container">
            <NextIntlClientProvider>
              <NavigationHistoryProvider>
                <TelegramProvider>
                  <div className="max-w-140 m-auto h-full overflow-hidden">{children}</div>
                  <Onboarding />
                </TelegramProvider>
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
