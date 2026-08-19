'use client';

import { useCallback, useEffect, useState } from 'react';
import { showRewardedAd, preloadRewardedAd, type RewardedAdResult } from '@/lib/ads';

/**
 * Plays a rewarded ad through the provider waterfall (see `src/lib/ads`) and
 * tracks the "ad on screen" state so the triggering control can disable itself
 * while it plays. The returned result tells the caller whether to grant the
 * reward and which network served it — see {@link RewardedAdResult}.
 */
export function useRewardedAd() {
  const [showing, setShowing] = useState(false);

  // Warm the networks up on mount so the first watch doesn't wait on a cold
  // request. Safe to call with nothing configured — it's a no-op then. No view
  // index yet at mount: which network's turn it is depends on the slot the
  // player ends up tapping, and guessing it would warm the wrong one.
  useEffect(() => {
    preloadRewardedAd();
  }, []);

  const show = useCallback(async (viewIndex?: number): Promise<RewardedAdResult> => {
    setShowing(true);
    try {
      return await showRewardedAd(viewIndex);
    } finally {
      setShowing(false);
    }
  }, []);

  // Exposed so the caller can warm the chain again between views — the pause
  // after a watch is the only moment when warming up costs the player nothing.
  // Pass the NEXT view's index: with rotation on, that is a different network
  // from the one that just played.
  const preload = useCallback((viewIndex?: number) => preloadRewardedAd(viewIndex), []);

  return { show, showing, preload };
}
