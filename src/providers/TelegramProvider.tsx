'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useTelegramLoginMutation } from '@/api/auth.api';
import { getTelegramWebApp } from '@/lib/telegram/telegram';
import { hasSessionCk } from '@/services/cookie.service';
import { routes } from '@/constants/routes';
import { resolveStartParamRoute } from '@/utils/global/deep-link.utils';
import { getDeviceTimezone } from '@/utils/global/timezone.utils';
import { TelegramSplash } from '@/components/telegram/TelegramSplash';

type Phase = 'pending' | 'authenticating' | 'ready' | 'error';

/**
 * Boot-overlay timing. The splash stays on top of the freshly-mounted app until
 * the first route has committed, so the user never sees the route-level
 * `loading.tsx` wordmark flash right after the splash (it renders the same
 * `LuckyTicket365` shimmer, which read as "the loader ran twice").
 */
const OVERLAY_MIN_MS = 400; // let the first route mount + suspend before checking
const OVERLAY_MAX_MS = 2500; // hard cap so the overlay can never get stuck
const OVERLAY_FADE_MS = 320; // must match the transition duration below

/** App background — keeps the Telegram header/body chrome on-theme. */
const THEME_BG = '#1b1930';

/** Pages that must stay reachable without a session (the email-auth flow). */
const AUTH_PATHS: string[] = [
  routes.login,
  routes.register,
  routes.forgotPassword,
  routes.resetPassword,
  routes.twoFactor,
];

/**
 * Boot-time gate for the Telegram Mini App. When the app is opened inside
 * Telegram it auto-authenticates from the signed `initData` (no login form, no
 * registration) before rendering the app, showing a branded splash meanwhile.
 *
 * When NOT inside Telegram (a plain browser / local dev / e2e) it renders the
 * app immediately and leaves the existing email-login flow in place as the
 * fallback for dev and admin. The first paint always renders the splash so SSR
 * and the first client render match; the effect resolves it on the next tick.
 */
export function TelegramProvider({ children }: { children: ReactNode }) {
  const [telegramLogin] = useTelegramLoginMutation();
  const [phase, setPhase] = useState<Phase>('pending');
  // `booted` = the splash overlay is fully gone and the app owns the screen;
  // `fading` drives its opacity transition. The overlay covers the whole boot
  // (auth + the first route commit) so only one loader is ever visible.
  const [booted, setBooted] = useState(false);
  const [fading, setFading] = useState(false);
  // Only bridge the first route commit inside Telegram; the plain-browser flow
  // reveals the app immediately (no splash → route-loader double to hide).
  const isTelegramBoot = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  const authenticate = (initData: string) => {
    setPhase('authenticating');
    telegramLogin({ initData, timezone: getDeviceTimezone() })
      .unwrap()
      .then(() => setPhase('ready'))
      .catch(() => {
        // A failed sign-in is only fatal when there is nothing to fall back to.
        //
        // `initData` is fixed at launch — it lives in the URL fragment, so a
        // reload re-reads the SAME blob with the same `auth_date`. The backend
        // only accepts it for an hour, and AppLifecycleProvider reloads after
        // 15 minutes in the background, so a session that runs past that hour
        // re-authenticates with a blob the server now refuses. Treating that as
        // fatal dropped the player on the error splash — and Retry re-sent the
        // identical stale blob, so it could never recover without fully
        // relaunching from the chat, all while a perfectly valid refresh token
        // sat in cookies.
        //
        // We still ATTEMPT the sign-in on every mount: it is what refreshes the
        // Telegram avatar and username. It just no longer has to succeed.
        // Asks the session flag, not the tokens: they are on their way to
        // `httpOnly` and will stop being readable here. @see cookie.service
        if (hasSessionCk()) {
          setPhase('ready');
          return;
        }
        setPhase('error');
      });
  };

  useEffect(() => {
    const tg = getTelegramWebApp();
    // Not inside Telegram → normal browser flow (email login stays available).
    if (!tg || !tg.initData) {
      // Web against the real backend with no session at all → go to the login
      // page instead of rendering an app where every query fails with
      // "Couldn't load data". Mock mode (no API URL) stays freely browsable.
      const hasSession = hasSessionCk();
      const onAuthPage = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
      if (process.env.NEXT_PUBLIC_API_URL && !hasSession && !onAuthPage) {
        router.replace(routes.login);
      }
      // Plain browser: reveal the app on the same tick — there's no route-loader
      // double to bridge here, so no overlay hold.
      setPhase('ready');
      setBooted(true);
      return;
    }
    // Inside Telegram: set up the webview chrome, then auth via signed initData.
    isTelegramBoot.current = true;
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.(THEME_BG);
      tg.setBackgroundColor?.(THEME_BG);
      tg.disableVerticalSwipes?.();
      // The last press has to be deliberate. `BackButton` takes the Android back
      // gesture over on every screen but the root — at the root it is a genuine
      // "close the game", and one stray press there ends the session, engine
      // timers and all. This makes the client ask first, on every way out it
      // owns (back at the root, the ✕, the swipe). @see TelegramBackButton
      tg.enableClosingConfirmation?.();
      // Immersive fullscreen (Bot API 8.0+). No-ops / emits `fullscreenFailed`
      // on clients that don't support it — harmless, we ignore the failure.
      tg.requestFullscreen?.();
    } catch {
      /* SDK chrome is best-effort — never block auth on it */
    }
    authenticate(tg.initData);
  }, []);

  // Mirror Telegram's safe-area + content-safe-area insets into CSS variables so
  // the header/tab bar clear the device chrome AND Telegram's floating buttons
  // in fullscreen. Re-syncs on every safe-area / fullscreen change.
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg || !tg.initData) return;

    const applyInsets = () => {
      const safeTop = tg.safeAreaInset?.top ?? 0;
      const safeBottom = tg.safeAreaInset?.bottom ?? 0;
      const contentTop = tg.contentSafeAreaInset?.top ?? 0;
      const contentBottom = tg.contentSafeAreaInset?.bottom ?? 0;
      const root = document.documentElement;
      root.style.setProperty('--tg-inset-top', `${safeTop + contentTop}px`);
      root.style.setProperty('--tg-inset-bottom', `${safeBottom + contentBottom}px`);
      // Individual bands so the brand bar can sit in Telegram's chrome strip
      // (below the OS status bar, aligned with the floating close/menu buttons).
      root.style.setProperty('--tg-safe-top', `${safeTop}px`);
      root.style.setProperty('--tg-content-top', `${contentTop}px`);
      root.dataset.tgFullscreen = tg.isFullscreen ? 'true' : 'false';
    };

    applyInsets();
    tg.onEvent?.('safeAreaChanged', applyInsets);
    tg.onEvent?.('contentSafeAreaChanged', applyInsets);
    tg.onEvent?.('fullscreenChanged', applyInsets);
    return () => {
      tg.offEvent?.('safeAreaChanged', applyInsets);
      tg.offEvent?.('contentSafeAreaChanged', applyInsets);
      tg.offEvent?.('fullscreenChanged', applyInsets);
    };
  }, []);

  // Telegram boot bridge: once authenticated, the app mounts *under* the splash
  // overlay. Keep it up until the first route commits — detected by the absence
  // of the route-level loader (`.loader`, rendered only by ProjectNameLoader in
  // loading.tsx) — then fade the splash out. A min hold lets the route mount and
  // suspend first; a hard cap guarantees the overlay is always dismissed.
  //
  // Uses timers, not requestAnimationFrame: rAF is *paused* while the tab is
  // hidden, which would leave the overlay stuck if the user backgrounds the
  // Mini App mid-boot. Timers only throttle (never pause) when hidden, so the
  // cap still fires and the splash always clears.
  useEffect(() => {
    if (phase !== 'ready' || !isTelegramBoot.current || booted) return;
    const startedAt = Date.now();
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      clearInterval(poll);
      clearTimeout(cap);
      setFading(true);
      window.setTimeout(() => setBooted(true), OVERLAY_FADE_MS);
    };
    const poll = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const routeStillLoading = !!document.querySelector('.loader');
      if (elapsed >= OVERLAY_MIN_MS && !routeStillLoading) dismiss();
    }, 120);
    // Independent hard cap — fires even if the poll interval is throttled.
    const cap = window.setTimeout(dismiss, OVERLAY_MAX_MS);
    return () => {
      clearInterval(poll);
      clearTimeout(cap);
    };
  }, [phase, booted]);

  // Keep the window open at full height.
  //
  // The Mini App is laid out for the whole sheet — a header pinned to the top
  // inset, a tab bar on the bottom one — so a collapsed window is not a smaller
  // version of the app, it is a cropped one. `disableVerticalSwipes` stops the
  // player's own drag, but the client also collapses on gestures the app does
  // not own, and there is no event that says "you were folded": only the
  // viewport changing height. So re-expand whenever it comes back short.
  // Cannot loop — `expand()` on an expanded window is a no-op.
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg || !tg.initData) return;

    const keepExpanded = () => {
      if (!tg.isExpanded) tg.expand();
    };
    tg.onEvent?.('viewportChanged', keepExpanded);
    return () => tg.offEvent?.('viewportChanged', keepExpanded);
  }, []);

  // Deep link: a shared in-app link opens the app via `t.me/<bot>?startapp=<param>`,
  // which arrives as `start_param`. Once the app is up, route to the target it
  // names. A non-deep-link param (e.g. a referral id) resolves to null and is
  // left untouched for the backend. New targets are added in `deep-link.utils`.
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (!booted || deepLinkHandled.current) return;
    deepLinkHandled.current = true;
    const route = resolveStartParamRoute(getTelegramWebApp()?.initDataUnsafe?.start_param);
    if (route) router.push(route);
  }, [booted]);

  const retry = () => {
    const tg = getTelegramWebApp();
    if (tg?.initData) authenticate(tg.initData);
    else setPhase('ready');
  };

  if (phase === 'error') return <TelegramSplash error onRetry={retry} />;

  return (
    <>
      {phase === 'ready' && children}
      {!booted && (
        <div
          aria-hidden={fading ? true : undefined}
          className={twMerge(
            'fixed inset-0 z-[1100] transition-opacity duration-300 ease-out',
            fading ? 'pointer-events-none opacity-0' : 'opacity-100'
          )}
        >
          <TelegramSplash />
        </div>
      )}
    </>
  );

  return <TelegramSplash error={phase === 'error'} onRetry={retry} />;
}
