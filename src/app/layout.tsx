import { localeDirection } from '@/i18n/config';
import Script from 'next/script';
import { StoreProvider } from '@/providers/StoreProvider';
import { AppLifecycleProvider } from '@/providers/AppLifecycleProvider';
import { NavigationHistoryProvider } from '@/providers/NavigationHistoryProvider';
import { TelegramProvider } from '@/providers/TelegramProvider';
import { ContentProtectionProvider } from '@/providers/ContentProtectionProvider';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { TournamentResultWatcher } from '@/components/pages/tabs/tournaments/TournamentResultWatcher';
import { TicketFlightViewport } from '@/components/shared/ticket-flight/TicketFlightViewport';
import { ToastViewport } from '@/components/shared/toast/ToastViewport';
import { OverlayProbeBanner } from '@/components/shared/debug/OverlayProbeBanner';
import { AppStatusOverlay } from '@/components/shared/status/AppStatusOverlay';
import { FullscreenBrandBar } from '@/components/layout-elements/FullscreenBrandBar';
import { PortraitOnlyGate } from '@/components/layout-elements/PortraitOnlyGate';
import { AtmosphericBackground } from '@/components/shared/AtmosphericBackground';
import { PreLaunchGate } from '@/components/pages/coming-soon/PreLaunchGate';
import { TelegramLocaleSeed } from '@/components/telegram/TelegramLocaleSeed';
import { DayjsLocaleProvider } from '@/providers/DayjsLocaleProvider';
import { NextIntlClientProvider } from 'next-intl';
import { gilroy, spaceGrotesk, notoArmenian, notoArabic } from '@/fonts/index.fonts';
import { getLocale } from 'next-intl/server';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { appConfig } from '@/config/app.config';
import type { Metadata, Viewport } from 'next';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import '@/styles/index.css';

/**
 * Which ad networks the waterfall may use — mirrors `NEXT_PUBLIC_AD_PROVIDERS`
 * (see `src/lib/ads/index.ts`). Read here too so dropping a network from that
 * list also stops its SDK from loading: otherwise a disabled network keeps
 * costing every page load a third-party script that is never called.
 *
 * Parsed once at module level — the value is fixed for the process, so there
 * is no reason to re-split it on every render.
 */
const ENABLED_AD_PROVIDERS: Set<string> | null = (() => {
  const raw = process.env.NEXT_PUBLIC_AD_PROVIDERS?.trim();
  // Unset → default order, every configured network runs.
  if (!raw) return null;
  return new Set(raw.split(',').map(part => part.trim()));
})();

function isProviderEnabled(id: string): boolean {
  return ENABLED_AD_PROVIDERS === null || ENABLED_AD_PROVIDERS.has(id);
}

/**
 * The app runs inside Telegram, but its URL still gets pasted into chats and
 * browsers — without this the document had no title at all and previewed as a
 * bare vercel.app link. The artwork itself is file-based metadata:
 * `icon.png`, `apple-icon.png` and `opengraph-image.png` sit next to this file
 * and Next attaches them automatically, so only the copy is declared here.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getAppTranslations();

  return {
    // Without this the social-card and icon URLs resolve against
    // `http://localhost:3000` in a production build — the tags ship, the
    // images 404 for everyone but the machine that built them.
    metadataBase: new URL(appConfig.publicOrigin),
    title: GlobalConstants.projectName,
    description: t('app description'),
    applicationName: GlobalConstants.projectName,
    openGraph: {
      type: 'website',
      siteName: GlobalConstants.projectName,
      title: GlobalConstants.projectName,
      description: t('app description'),
    },
    twitter: { card: 'summary_large_image' },
  };
}

/**
 * Without this Next ships its default `width=device-width, initial-scale=1`,
 * which leaves iOS free to auto-zoom the whole page whenever a focused input
 * computes below 16px — every input here does (`Input` is `text-sm`, the TON
 * address field 12px mono). The page scales up under the keyboard and reads as
 * "the modal grew"; Android never does it, so it looked iPhone-specific.
 * Pinch-zoom by the user is still allowed by iOS Safari regardless of this.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: ChildrenProps) {
  const locale = await getLocale();
  // The portrait wall lives outside every provider, i18n included — so its two
  // strings are translated here. @see PortraitOnlyGate
  const t = await getAppTranslations();

  return (
    <>
      {/* telegram-web-app.js (beforeInteractive) sets --tg-viewport-* on <html>
          before hydration, so its style attr won't match React's render. This
          is expected external mutation — suppress the hydration warning for the
          <html> element's own attributes (does not affect children). */}
      <html
        lang={locale}
        dir={localeDirection(locale)}
        className={`${gilroy.variable} ${spaceGrotesk.variable} ${notoArmenian.variable} ${notoArabic.variable}`}
        suppressHydrationWarning
      >
        <head>
          {/* Which way the DEVICE is facing, decided before the first paint.
              The portrait wall is a media query, and a media query only knows
              the shape of the webview — which is short and wide on an upright
              phone in Telegram's compact mode. Without this attribute in place
              from the very first frame, such a phone flashes "turn me upright"
              on every launch. @see usePortraitOnly, which owns it afterwards. */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=screen.orientation&&screen.orientation.type,u=t?t.indexOf('portrait')===0:(typeof orientation==='number'?Math.abs(orientation)!==90:null);if(u===true)document.documentElement.dataset.devicePortrait='true';}catch(e){}})();`,
            }}
          />
          <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
          {/* Rewarded-ad SDKs — each loads only when its network is configured,
              so an unused network costs nothing. Order here is irrelevant; the
              waterfall order lives in NEXT_PUBLIC_AD_PROVIDERS. */}
          {process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID && isProviderEnabled('adsgram') && (
            <Script src="https://sad.adsgram.ai/js/sad.min.js" strategy="afterInteractive" />
          )}
          {process.env.NEXT_PUBLIC_MONETAG_ZONE_ID && isProviderEnabled('monetag') && (
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
          {/* Above every gate and every provider: a long press must not offer
              "save image" / "search this image" on the countdown screen, the
              maintenance wall or a modal any more than it may inside the app.
              @see ContentProtectionProvider */}
          <ContentProtectionProvider />
          {/* The app's sky, behind every screen. Mounted here rather than in a
              route layout so drawer and auth screens get it too, and pinned to
              the phone column so it never spills into the desktop gutters. */}
          <AtmosphericBackground className="start-[var(--app-gutter)] end-[var(--app-gutter)]" />
          <div id="scroll-container">
            <NextIntlClientProvider>
              {/* Dates speak the reader's language from the first paint — it
                  wraps the gate too, because the countdown screen shows one. */}
              <DayjsLocaleProvider>
                {/* The pre-launch gate sits OUTSIDE every provider on purpose: it
                  renders its children only on an explicit "this person is let
                  in", and an unrendered element never executes. So while the
                  gate holds, the store is never created, no query runs and no
                  route mounts — the app does not boot, rather than booting
                  under a cover. @see PreLaunchGate */}
                {/* Above the gate: it renders the countdown INSTEAD of its
                  children, so a seed underneath never runs for a gated
                  visitor — and the countdown itself stayed English. */}
                <TelegramLocaleSeed />
                <PreLaunchGate>
                  <StoreProvider>
                    <AppLifecycleProvider />
                    <NavigationHistoryProvider>
                      <TelegramProvider>
                        {/* The one element that exists only when the app truly
                            booted: it lives inside PreLaunchGate, so the
                            countdown, the maintenance wall, the boot splash and
                            the open-on-your-phone screen all render *instead* of
                            it. The smoke suites assert it, because "the page
                            rendered some text" is equally true of all five. */}
                        <div
                          data-testid="app-shell"
                          className="max-w-[var(--app-max-w)] m-auto h-full overflow-hidden"
                        >
                          {children}
                        </div>
                        <Onboarding />
                        <TournamentResultWatcher />
                      </TelegramProvider>
                      <FullscreenBrandBar />
                      <TicketFlightViewport />
                      <ToastViewport />
                      <AppStatusOverlay />
                      <OverlayProbeBanner />
                    </NavigationHistoryProvider>
                  </StoreProvider>
                </PreLaunchGate>
              </DayjsLocaleProvider>
            </NextIntlClientProvider>
          </div>
          <div id="portal-root" />
          {/* Outside the gate and outside every provider, and last in the body:
              a phone on its side gets this instead of the app, the countdown,
              the maintenance wall or a modal — whichever of them it was about
              to show. @see PortraitOnlyGate */}
          <PortraitOnlyGate
            title={t('turn your phone upright')}
            description={t('the game plays in portrait only')}
          />
        </body>
      </html>
    </>
  );
}
