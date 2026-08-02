'use client';

import { useEffect, useRef } from 'react';
import { getTelegramWebApp } from '@/lib/telegram/telegram';

/**
 * Marks the sign-in as done for this Mini App session. Telegram keeps the
 * webview alive across minimises, but a re-open remounts the screen — without
 * this the same account would be re-signed-in on every remount, which is
 * harmless server-side and still pointless traffic.
 */
const SESSION_KEY = 'lt365:prelaunch-signed-in';

function alreadySignedIn(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    // Private-mode webviews can throw on sessionStorage — losing the guard only
    // costs a duplicate request, so treat it as "not signed in yet".
    return false;
  }
}

function rememberSignedIn(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* see alreadySignedIn */
  }
}

/**
 * Create the account while the app is still closed.
 *
 * The pre-launch gate does not mount the app (no store, no RTK Query, no
 * screens), so opening the Mini App used to leave no trace at all: no `User`
 * row, and therefore no recipient for the launch announcement and no referral
 * bound for whoever invited them. The ads promise "open it now, you're
 * registered" — this is the one request that makes that true.
 *
 * Deliberately a bare `fetch`, not the `telegramLogin` RTK mutation: reaching
 * that mutation would mean mounting the store and the API layer behind the
 * gate, which is exactly what the gate exists to prevent. Tokens are NOT kept
 * either — the account is what matters here; the app authenticates normally on
 * its own the first time it actually boots.
 *
 * Silent by design: the visitor came for a countdown, and a failed background
 * sign-in has nothing for them to act on. The backend applies its usual rules,
 * including `registrationOpen` — with registration closed in the admin panel,
 * first-time visitors are refused here just as they would be in the live app.
 */
export function usePreLaunchSignIn(): void {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const initData = getTelegramWebApp()?.initData;
    // Outside Telegram there is no credential to sign in with; with no API URL
    // the app is in mock mode and there is no backend to sign in to.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!initData || !apiUrl) return;
    if (alreadySignedIn()) return;

    fetch(`${apiUrl.replace(/\/$/, '')}/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(response => {
        // Only a real success is remembered: a 401/403 must stay retryable on
        // the next open (a closed registration can be reopened, a network blip
        // can pass).
        if (response.ok) rememberSignedIn();
      })
      .catch(() => {
        /* offline / blocked — the countdown is unaffected, try again next open */
      });
  }, []);
}
