'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTelegramLoginMutation } from '@/api/auth.api';
import { getTelegramWebApp } from '@/lib/telegram/telegram';
import { getAccessTokenCk, getRefreshTokenCk } from '@/services/cookie.service';
import { routes } from '@/constants/routes';
import { TelegramSplash } from '@/components/telegram/TelegramSplash';

type Phase = 'pending' | 'authenticating' | 'ready' | 'error';

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
  const router = useRouter();
  const pathname = usePathname();

  const authenticate = (initData: string) => {
    setPhase('authenticating');
    telegramLogin({ initData })
      .unwrap()
      .then(() => setPhase('ready'))
      .catch(() => setPhase('error'));
  };

  useEffect(() => {
    const tg = getTelegramWebApp();
    // Not inside Telegram → normal browser flow (email login stays available).
    if (!tg || !tg.initData) {
      // Web against the real backend with no session at all → go to the login
      // page instead of rendering an app where every query fails with
      // "Couldn't load data". Mock mode (no API URL) stays freely browsable.
      const hasSession = !!getAccessTokenCk() || !!getRefreshTokenCk();
      const onAuthPage = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
      if (process.env.NEXT_PUBLIC_API_URL && !hasSession && !onAuthPage) {
        router.replace(routes.login);
      }
      setPhase('ready');
      return;
    }
    // Inside Telegram: set up the webview chrome, then auth via signed initData.
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.(THEME_BG);
      tg.setBackgroundColor?.(THEME_BG);
      tg.disableVerticalSwipes?.();
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
      const top = (tg.safeAreaInset?.top ?? 0) + (tg.contentSafeAreaInset?.top ?? 0);
      const bottom = (tg.safeAreaInset?.bottom ?? 0) + (tg.contentSafeAreaInset?.bottom ?? 0);
      const root = document.documentElement.style;
      root.setProperty('--tg-inset-top', `${top}px`);
      root.setProperty('--tg-inset-bottom', `${bottom}px`);
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

  if (phase === 'ready') return <>{children}</>;

  const retry = () => {
    const tg = getTelegramWebApp();
    if (tg?.initData) authenticate(tg.initData);
    else setPhase('ready');
  };

  return <TelegramSplash error={phase === 'error'} onRetry={retry} />;
}
