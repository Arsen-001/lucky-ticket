'use client';

import { useEffect, useState } from 'react';
import { apiBase } from '@/config/api.config';
import { getRefererLink } from '@/utils/pages/referral.utils';
import type { PreLaunchSession } from '@/hooks/usePreLaunchGate';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';
import type { LocaleType } from '@/types/types/locale.types';

/** Placeholder inviter id for the mock layer, where nobody is signed in. */
const MOCK_USER_ID = 'mock-user-id';

/**
 * The invite block's data, fetched by hand rather than through RTK Query.
 *
 * The pre-launch gate renders its screen *outside* the provider tree — no
 * store, therefore no `useGetInvitedFriendsQuery`. These are the same three
 * endpoints the in-app invite screen uses (`me`, `referral/friends`,
 * `referral/prepare-share`), asked with the token the gate's own sign-in
 * returned. @see PreLaunchSession
 *
 * Referrals are already real before launch: a friend opening the invite link
 * gets an account created by that same sign-in, and the backend binds the
 * referral there — so this list is the true one, not a preview of one.
 */
export interface PreLaunchInviteState {
  /** Everyone who has joined through this player's link, newest first. */
  friends: InvitedFriend[];
  /** `t.me/<bot>?startapp=<id>` — empty until the inviter's id is known. */
  link: string;
  isLoading: boolean;
  isError: boolean;
  /** False when there is nobody to show this for — render nothing at all. */
  available: boolean;
  retry: () => void;
  /** Prepares the rich share card server-side; rejects when it can't be had. */
  prepareCard: (lang: LocaleType) => Promise<string>;
  /** Records that a share actually went out. Fire-and-forget. */
  markShared: (confirmed: boolean) => void;
}

const authedFetch = (path: string, token: string, init?: RequestInit) =>
  fetch(`${apiBase}/${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
    },
  });

const authedJson = async <T>(path: string, token: string): Promise<T> => {
  const response = await authedFetch(path, token);
  if (!response.ok) throw new Error(`${path} ${response.status}`);
  return (await response.json()) as T;
};

export function usePreLaunchInvite(session: PreLaunchSession | null): PreLaunchInviteState {
  const [friends, setFriends] = useState<InvitedFriend[]>([]);
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const token = session?.accessToken ?? null;
  // On a real backend the block exists only for someone the gate could actually
  // sign in — outside Telegram, or when the sign-in was refused, there is no
  // "your friends" to speak of.
  const available = !apiBase || !!token;

  useEffect(() => {
    if (!available) return;
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    const load = async (): Promise<{ friends: InvitedFriend[]; link: string }> => {
      // Mock layer: no backend to ask. The gate opens the app on mocks, so this
      // is only reached with the emergency override on — someone deliberately
      // looking at the pre-launch screen locally. Imported lazily so the demo
      // roster never rides along in the bundle real visitors download.
      if (!apiBase) {
        const { invitedFriendsMock } = await import('@/mock/referral.mock');
        return { friends: invitedFriendsMock, link: getRefererLink(MOCK_USER_ID) };
      }

      const [me, invited] = await Promise.all([
        authedJson<{ id?: string }>('me', token!),
        authedJson<InvitedFriend[]>('referral/friends', token!),
      ]);
      return {
        friends: Array.isArray(invited) ? invited : [],
        link: getRefererLink(me?.id),
      };
    };

    load()
      .then(result => {
        if (cancelled) return;
        setFriends(result.friends);
        setLink(result.link);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsError(true);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, available, attempt]);

  const prepareCard = async (lang: LocaleType): Promise<string> => {
    if (!apiBase || !token) throw new Error('no session');
    const response = await authedFetch('referral/prepare-share', token, {
      method: 'POST',
      body: JSON.stringify({ lang }),
    });
    if (!response.ok) throw new Error(`prepare-share ${response.status}`);
    const { id } = (await response.json()) as { id?: string };
    if (!id) throw new Error('prepare-share returned no id');
    return id;
  };

  const markShared = (confirmed: boolean) => {
    if (!apiBase || !token) return;
    // Best-effort telemetry: a failed report must never surface as a broken
    // share, so the rejection is swallowed on purpose.
    void authedFetch('referral/shared', token, {
      method: 'POST',
      body: JSON.stringify({ confirmed }),
    }).catch(() => {});
  };

  return {
    friends,
    link,
    isLoading,
    isError,
    available,
    retry: () => setAttempt(value => value + 1),
    prepareCard,
    markShared,
  };
}
