'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { routes } from '@/constants/routes';
import { getTelegramWebApp, isTelegramVersionAtLeast } from '@/lib/telegram/telegram';
import {
  backHandlerCount,
  runTopBackHandler,
  subscribeBackHandlers,
} from '@/lib/telegram/back-stack';
import { useNavigationHistory } from '@/providers/NavigationHistoryProvider';

/**
 * `BackButton` landed in Bot API 6.1. Below that the SDK warns to the console
 * and drops the call, and this runs on every navigation — so ask first.
 */
const MIN_VERSION = '6.1';

/** The SDK object, or `undefined` outside Telegram / on a client too old for it. */
function getBackButton() {
  if (!isTelegramVersionAtLeast(MIN_VERSION)) return undefined;
  return getTelegramWebApp()?.BackButton;
}

/**
 * Makes Back mean "back inside the app" instead of "close the game".
 *
 * Android routes the system back gesture to the Mini App **only while
 * Telegram's own back arrow is visible** — with it hidden (which is what the
 * app shipped, since nothing ever called `show()`) the client closes the Mini
 * App on the first press, from any screen, mid-flow. So the arrow is kept in
 * sync with whether there is anywhere to go: any screen but Home, or any open
 * overlay.
 *
 * A press resolves in the same order the player perceives the layers:
 *
 *  1. the topmost open overlay closes (@see back-stack) — a dialog must never
 *     let the page navigate out from under it;
 *  2. otherwise the in-app history is stepped back;
 *  3. with no history — a deep link opened straight onto a detail page — Home,
 *     so back never escapes to a blank tab. Same rule as {@link useSafeBack}.
 *
 * On Home with nothing open the arrow is hidden and back closes the Mini App,
 * which is the platform behaviour players expect at the root.
 *
 * Renders nothing; it only drives the client's chrome.
 */
export function TelegramBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { canGoBack } = useNavigationHistory();

  const overlayCount = useSyncExternalStore(
    subscribeBackHandlers,
    backHandlerCount,
    () => 0 // SSR: no overlay can be open before hydration
  );

  const handleBack = () => {
    if (runTopBackHandler()) return;
    if (canGoBack()) {
      router.back();
      return;
    }
    router.push(routes.home);
  };

  // The SDK keeps the handler it was given, so it must be one stable function
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
    return () => {
      backButton.offClick(onClick);
      // The Mini App outlives this component (the app is one webview session):
      // an arrow left behind with no handler is a dead tap.
      backButton.hide();
    };
  }, []);

  useEffect(() => {
    const backButton = getBackButton();
    if (!backButton) return;

    if (overlayCount > 0 || pathname !== routes.home) backButton.show();
    else backButton.hide();
  }, [pathname, overlayCount]);

  return null;
}
