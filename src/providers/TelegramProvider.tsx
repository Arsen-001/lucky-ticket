'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTelegramLoginMutation } from '@/api/auth.api';
import { getTelegramWebApp } from '@/lib/telegram/telegram';
import { TelegramSplash } from '@/components/telegram/TelegramSplash';

type Phase = 'pending' | 'authenticating' | 'ready' | 'error';

/** App background — keeps the Telegram header/body chrome on-theme. */
const THEME_BG = '#1b1930';

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
    } catch {
      /* SDK chrome is best-effort — never block auth on it */
    }
    authenticate(tg.initData);
  }, []);

  if (phase === 'ready') return <>{children}</>;

  const retry = () => {
    const tg = getTelegramWebApp();
    if (tg?.initData) authenticate(tg.initData);
    else setPhase('ready');
  };

  return <TelegramSplash error={phase === 'error'} onRetry={retry} />;
}
