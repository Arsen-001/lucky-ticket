'use client';

import { useEffect, useState } from 'react';
import { comingSoonConfig } from '@/config/coming-soon.config';
import { getTelegramWebApp } from '@/lib/telegram/telegram';

export type PreLaunchStatus = 'checking' | 'gated' | 'open';

export interface PreLaunchGateState {
  status: PreLaunchStatus;
  /** What the countdown counts down to — the server's date, or the bundled one. */
  launchAt: string;
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
  });

  useEffect(() => {
    let cancelled = false;
    const settle = (next: PreLaunchGateState) => {
      if (!cancelled) setState(next);
    };

    // Emergency close wins over every answer below — see coming-soon.config.
    if (comingSoonConfig.forcedOn) {
      settle({ status: 'gated', launchAt: comingSoonConfig.fallbackLaunchAt });
      return;
    }

    // No API URL = the mock layer, i.e. local development and e2e. There is no
    // backend to ask and no audience to protect, so the app opens.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      settle({ status: 'open', launchAt: comingSoonConfig.fallbackLaunchAt });
      return;
    }

    const base = apiUrl.replace(/\/$/, '');
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
            appOpen?: boolean;
            comingSoon?: { launchAt?: string };
          };
          return {
            status: auth?.appOpen === true ? 'open' : 'gated',
            launchAt: readLaunchAt(auth?.comingSoon?.launchAt),
          };
        }
        // Refused (banned, registration closed, bad initData): fall through —
        // the anonymous answer is still better than guessing.
      }
      return askAnonymously();
    };

    ask()
      .then(settle)
      .catch(() => settle({ status: 'gated', launchAt: comingSoonConfig.fallbackLaunchAt }));

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
