'use client';

import { useEffect } from 'react';
import { allowsNativeMenu } from '@/utils/global/content-protection.utils';

/**
 * Keeps the app's artwork inside the app.
 *
 * A long press on any image in the Telegram WebView opens the client's native
 * sheet — *Save image*, *Copy image*, *Share*, and on iOS *Look Up* / on
 * Android *Search image with Google*, which lifts a ticket, an engine or a
 * market avatar straight out of the app and into a search engine. The same
 * menu is one right-click away in Telegram Desktop and in a browser.
 *
 * Two layers close it, because neither is enough alone:
 *
 *  1. **CSS** (`styles/global/content-protection.css`) — `-webkit-touch-callout`
 *     is what suppresses the iOS long-press sheet; it fires no DOM event, so
 *     JavaScript never gets the chance to cancel it.
 *  2. **This provider** — Chromium (Android WebView, Telegram Desktop, any
 *     browser) does dispatch `contextmenu`, `dragstart` and `copy`, and there
 *     cancelling them is the only thing that works.
 *
 * Text fields are exempt on both layers: blocking the menu there removes paste,
 * and the wallet address is pasted, not typed. Opt an element out with
 * `data-allow-native-menu="true"`. Copy *buttons* are unaffected — every one of
 * them writes with `navigator.clipboard.writeText`, which is not the `copy`
 * event.
 *
 * Renders nothing; mounted once at the root, above the pre-launch gate, so the
 * countdown screen's artwork is covered too.
 *
 * ⚠️ What this cannot do: a screenshot, and anything the OS layers on top of one
 * (iOS Visual Look Up, Android Circle to Search) happen outside the page — no
 * web app can see them, let alone stop them. This raises the effort from "hold
 * a finger down" to "take a screenshot and crop it"; it is not DRM.
 */
export function ContentProtectionProvider() {
  useEffect(() => {
    const block = (event: Event) => {
      if (allowsNativeMenu(event.target)) return;
      event.preventDefault();
    };

    // Capture phase: a component that stops propagation for its own reasons
    // must not be able to hand the native menu back by accident.
    const options: AddEventListenerOptions = { capture: true };

    // Long press (Android WebView) and right-click — the "save / copy / search
    // this image" sheet itself.
    document.addEventListener('contextmenu', block, options);
    // Drag an image out of the window onto the desktop = a download.
    document.addEventListener('dragstart', block, options);
    // Selection is already off globally in CSS; these cover the routes around
    // it (⌘C on a stray selection, the client's own "select all").
    document.addEventListener('copy', block, options);
    document.addEventListener('cut', block, options);
    document.addEventListener('selectstart', block, options);

    return () => {
      document.removeEventListener('contextmenu', block, options);
      document.removeEventListener('dragstart', block, options);
      document.removeEventListener('copy', block, options);
      document.removeEventListener('cut', block, options);
      document.removeEventListener('selectstart', block, options);
    };
  }, []);

  return null;
}
