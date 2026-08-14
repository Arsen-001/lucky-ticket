'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { runTopBackHandler } from '@/lib/telegram/back-stack';
import { getTelegramWebApp, isTelegramVersionAtLeast } from '@/lib/telegram/telegram';
import { useNavigationHistory } from '@/providers/NavigationHistoryProvider';

/**
 * `BackButton` landed in Bot API 6.1. Below that the SDK warns to the console
 * and drops the call, so ask before touching it.
 */
const MIN_VERSION = '6.1';

/** The SDK object, or `undefined` outside Telegram / on a client too old for it. */
function getBackButton() {
  if (!isTelegramVersionAtLeast(MIN_VERSION)) return undefined;
  return getTelegramWebApp()?.BackButton;
}

/**
 * Makes Back mean "back inside the app" instead of "put the game away".
 *
 * The client hands the Android back gesture to a Mini App **only while its
 * header arrow is visible**. With the arrow hidden the press belongs to
 * Telegram, and what Telegram does with it is not one behaviour: older builds
 * close the Mini App, current ones fold it into the collapsed bar, and
 * `enableClosingConfirmation` guards neither (measured on a device 15.08.2026 —
 * the window folded away without a word). Consuming the press is the only lever
 * the app has over any of that, so the arrow now stays up on **every** screen,
 * the root included.
 *
 * A press resolves in the order the player perceives the layers:
 *
 *  1. the topmost open overlay closes (@see back-stack) — a dialog must never
 *     let the page navigate out from under it;
 *  2. otherwise the in-app history is stepped back;
 *  3. with no history left but somewhere still to go — a deep link opened
 *     straight onto a detail page — Home. Same rule as {@link useSafeBack};
 *  4. at the end of the road, an explicit "leave the game?" — because that is
 *     the press the player used to lose the session to.
 *
 * So the arrow is never a dead tap on Home: it is the way out, asked for out
 * loud. Leaving is still one press plus one tap; it just cannot happen by
 * accident any more.
 *
 * Renders only that dialog; the rest is the client's chrome.
 */
export function TelegramBackButton() {
  const t = useAppTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { canGoBack } = useNavigationHistory();
  const [exitOpen, setExitOpen] = useState(false);

  const handleBack = () => {
    if (runTopBackHandler()) return;
    if (canGoBack()) {
      router.back();
      return;
    }
    if (pathname !== routes.home) {
      router.push(routes.home);
      return;
    }
    setExitOpen(true);
  };

  // The SDK keeps the handler it is given, so it must be one stable function
  // registered once — re-registering per render would leak listeners into the
  // client. The fresh closure is read through the ref at press time.
  const latest = useRef(handleBack);
  useEffect(() => {
    latest.current = handleBack;
  });

  useEffect(() => {
    const backButton = getBackButton();
    if (!backButton) return;

    const onClick = () => latest.current();
    backButton.onClick(onClick);
    backButton.show();
    return () => {
      backButton.offClick(onClick);
      // The Mini App outlives this component (the app is one webview session):
      // an arrow left behind with no handler is a dead tap.
      backButton.hide();
    };
  }, []);

  return (
    <ConfirmModal
      open={exitOpen}
      onClose={() => setExitOpen(false)}
      onConfirm={() => {
        setExitOpen(false);
        getTelegramWebApp()?.close();
      }}
      title={t('leave the game?')}
      confirmText={t('leave')}
    />
  );
}
