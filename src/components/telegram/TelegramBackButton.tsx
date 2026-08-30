'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { routes } from '@/constants/routes';
import { hasBackHandler, runTopBackHandler, subscribeBackStack } from '@/lib/telegram/back-stack';
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
 * Makes Back mean "back inside the app" — and nothing else.
 *
 * The client hands the Android back gesture to a Mini App **only while its
 * header arrow is visible**; with the arrow hidden the press belongs to
 * Telegram, which closes or folds the game. So the arrow is up exactly on the
 * screens where the app has somewhere to go, and down where it does not:
 *
 *  - **an overlay is open** — the press must close the dialog, never navigate
 *    the page out from under it (@see back-stack). True even at the root, which
 *    is why this listens to the stack rather than only to the route;
 *  - **anywhere but Home** — step back through the in-app history, or to Home
 *    when a deep link dropped the player straight onto a detail page. Same rule
 *    as {@link useSafeBack};
 *  - **Home, nothing open** — the arrow is hidden and the press is Telegram's
 *    again. Leaving the game is one press, with no dialog in the way.
 *
 * That last line is a deliberate reversal of 15.08.2026, when the arrow was
 * pinned to every screen and the root press opened a "leave the game?"
 * confirmation. It did stop the accidental exit, at the price of making every
 * intentional one a two-step — and the exit is the far more common press.
 *
 * Renders nothing; the arrow is the client's own chrome.
 */
export function TelegramBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { canGoBack } = useNavigationHistory();
  // Overlays register with the back-stack outside React, so their presence is
  // mirrored into state — the arrow has to appear the moment a dialog opens.
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => subscribeBackStack(() => setOverlayOpen(hasBackHandler())), []);

  const atRoot = pathname === routes.home && !overlayOpen;

  const handleBack = () => {
    if (runTopBackHandler()) return;
    if (canGoBack()) {
      router.back();
      return;
    }
    if (pathname !== routes.home) router.push(routes.home);
    // At the root with nothing open the arrow is hidden, so there is no press
    // left to answer here — closing the game is Telegram's own gesture.
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
    if (atRoot) backButton.hide();
    else backButton.show();
  }, [atRoot]);

  return null;
}
