'use client';

import { useEffect, useState } from 'react';
import { apiBase } from '@/config/api.config';
import { comingSoonConfig } from '@/config/coming-soon.config';
import { getTelegramWebApp } from '@/lib/telegram/telegram';

export type PreLaunchStatus = 'checking' | 'gated' | 'open';

/**
 * The credential the countdown screen runs on.
 *
 * The gate's sign-in mints a real access token, and while the gate holds it is
 * the *only* one that exists — the store, and with it every RTK query and its
 * cookie-bearer plumbing, is never created. Anything the pre-launch screen has
 * to ask the backend (who did this player invite?) is asked with this.
 *
 * Short-lived by design: it is a normal 15-minute access token and nothing here
 * refreshes it, so treat a failure as "ask again later", never as a hard error.
 */
export interface PreLaunchSession {
  accessToken: string;
}

export interface PreLaunchGateState {
  status: PreLaunchStatus;
  /** What the countdown counts down to — the server's date, or the bundled one. */
  launchAt: string;
  /** Present only when the Telegram sign-in actually succeeded. */
  session: PreLaunchSession | null;
}

/**
 * Ask the backend whether THIS person gets the app or the countdown.
 *
 * Two questions, in order of what they can answer:
 *
 *  - `POST auth/telegram` — the only call that knows who is asking. It is also
 *    the call that creates the account, so a pre-launch visitor becomes a real
 *    player (and a real referral) whether or not they are let in; that was
 *    already this screen's job before the gate became controllable.
 *  - `GET /config` — anonymous, and therefore only able to say whether the gate
 *    is up at all. Used outside Telegram, and whenever the sign-in refuses
 *    (banned account, registration closed): those people still deserve a
 *    correct screen rather than a spinner.
 *
 * Anything else — offline, 500, a shape we don't recognise — resolves to
 * `gated`. The cost of wrongly showing the countdown is one confused tester;
 * the cost of wrongly opening the app is the launch.
 */
export function usePreLaunchGate(): PreLaunchGateState {
  const [state, setState] = useState<PreLaunchGateState>({
    status: 'checking',
    launchAt: comingSoonConfig.fallbackLaunchAt,
    session: null,
  });

  useEffect(() => {
    let cancelled = false;
    const settle = (next: PreLaunchGateState) => {
      if (!cancelled) setState(next);
    };

    // Emergency close — see coming-soon.config. It overrides the ANSWER, not
    // the code path: everything below still runs, because the countdown is no
    // longer a dead end (it carries the invite block) and that needs the
    // session the sign-in returns. Written as a rewrite of a decided answer so
    // that it can only ever produce `gated` — there is no arrangement of this
    // function in which the env var opens the app.
    const forcedClosed = comingSoonConfig.forcedOn;
    const closeIfForced = (answer: PreLaunchGateState): PreLaunchGateState =>
      forcedClosed ? { ...answer, status: 'gated' } : answer;

    // No API URL = the mock layer, i.e. local development and e2e. There is no
    // backend to ask and no audience to protect, so the app opens.
    if (!apiBase) {
      settle(
        closeIfForced({
          status: 'open',
          launchAt: comingSoonConfig.fallbackLaunchAt,
          session: null,
        })
      );
      return;
    }

    const base = apiBase;
    const initData = getTelegramWebApp()?.initData;

    const readLaunchAt = (value: unknown): string =>
      typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
        ? value
        : comingSoonConfig.fallbackLaunchAt;

    const askAnonymously = async (): Promise<PreLaunchGateState> => {
      const response = await fetch(`${base}/config`);
      if (!response.ok) throw new Error(`config ${response.status}`);
      const config: unknown = await response.json();
      const gate = (config as { comingSoon?: { enabled?: boolean; launchAt?: string } })
        ?.comingSoon;
      return {
        // Only an explicit `false` opens the app. A missing field means an
        // older backend that has never heard of the gate — closed.
        status: gate?.enabled === false ? 'open' : 'gated',
        launchAt: readLaunchAt(gate?.launchAt),
        // Anonymous by definition: this arm runs when nobody signed in.
        session: null,
      };
    };

    const ask = async (): Promise<PreLaunchGateState> => {
      if (initData) {
        const response = await fetch(`${base}/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
        if (response.ok) {
          const body: unknown = await response.json();
          const auth = body as {
            accessToken?: string;
            appOpen?: boolean;
            comingSoon?: { launchAt?: string };
          };
          return {
            status: auth?.appOpen === true ? 'open' : 'gated',
            launchAt: readLaunchAt(auth?.comingSoon?.launchAt),
            // Keep the token this call just minted. It costs nothing here and
            // it is what lets the countdown screen show a real invite list
            // instead of a decorative one. @see PreLaunchSession
            session: auth?.accessToken ? { accessToken: auth.accessToken } : null,
          };
        }
        // Refused (banned, registration closed, bad initData): fall through —
        // the anonymous answer is still better than guessing.
      }
      return askAnonymously();
    };

    ask()
      .then(answer => settle(closeIfForced(answer)))
      .catch(() =>
        settle({ status: 'gated', launchAt: comingSoonConfig.fallbackLaunchAt, session: null })
      );

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
