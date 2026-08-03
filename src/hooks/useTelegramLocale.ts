'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Cookies from 'js-cookie';
import { LOCALE_COOKIE_NAME } from '@/i18n/config';
import { setAppLocale } from '@/services/locale';
import { resolveTelegramLocale } from '@/utils/global/locale.utils';
import { getTelegramWebApp } from '@/lib/telegram/telegram';

/**
 * Seed the app language from the player's Telegram client language, once.
 *
 * Telegram hands every Mini App `initDataUnsafe.user.language_code`, and the
 * app ignored it entirely — `language_code` appeared exactly once in the whole
 * codebase, in the type that declares it. Locale came only from the `locale`
 * cookie, so the FIRST launch always rendered English: a Russian player opening
 * the app from the bot got an English interface and had to find
 * Settings → Languages to fix it. (The onboarding language step covers only
 * brand-new accounts — it is gated on `activityPoints === 0` and an unseen
 * tour — so anyone who signed up earlier, or skipped it, stayed on English.)
 *
 * Rules, in order:
 *  1. An existing cookie is a DECISION — an explicit pick, or a previous seed —
 *     and is never overridden. A player who deliberately chose English keeps
 *     English even with a Russian Telegram.
 *  2. Only the two-letter prefix is used: Telegram sends `ru`, but also
 *     `ru-RU`, `de-DE`, `pt-BR`.
 *  3. An unsupported language (the app ships en/ru/de) falls through to the
 *     default rather than writing a cookie the server would reject anyway.
 *
 * `router.refresh()` rather than a full reload, deliberately: this runs on the
 * very first render of a launch, before the player has navigated anywhere, so
 * there are no other screens sitting in the client router cache under the old
 * locale — which is the reason the Languages screen needs a hard reload and
 * the onboarding step does not.
 */
export function useTelegramLocale(): void {
  const router = useRouter();
  const currentLocale = useLocale();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // The rules live in `resolveTelegramLocale` (pure, unit-tested) because
    // this hook itself can only run inside a real Telegram client.
    const target = resolveTelegramLocale({
      cookieLocale: Cookies.get(LOCALE_COOKIE_NAME),
      languageCode: getTelegramWebApp()?.initDataUnsafe?.user?.language_code,
    });
    if (!target) return;

    void (async () => {
      await setAppLocale(target);
      // Persisting is worth it even when the language already matches (it
      // records the decision so later launches short-circuit), but re-rendering
      // the tree for a no-op change is not.
      if (target !== currentLocale) router.refresh();
    })();
  }, []);
}
