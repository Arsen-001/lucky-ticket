'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'engine-cube-rotate-hint-seen';

/**
 * "The engine turns" nudge for the home slider — the cube's four faces (card /
 * passport / boost breakdown / chip slots) are worth nothing if nobody knows
 * they are there, and the row of dots under the slider only ever taught the
 * HORIZONTAL axis.
 *
 * Starts `false` and is raised from a mount effect rather than from the initial
 * state: localStorage is unreachable during SSR, so reading it in the
 * initializer renders one tree on the server and another on hydration.
 *
 * Dismissal is deliberately tied to the player actually rotating a cube, not to
 * the nudge having played — the first play can land under the onboarding tour
 * or an auto-surfaced result modal, and a lesson nobody saw must not count as
 * taught. Until then it replays on each visit to Home.
 */
export function useEngineRotateHint(): [boolean, () => void] {
  const [active, setActive] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== '1') setActive(true);
    } catch {
      // Storage blocked (private mode): nudging one extra time beats never.
      setActive(true);
    }
  }, []);

  const dismiss = () => {
    setActive(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* storage unavailable — the nudge simply replays next session */
    }
  };

  return [active, dismiss];
}
