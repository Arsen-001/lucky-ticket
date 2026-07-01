'use client';

import { useCallback, useState } from 'react';
import { showRewardedAd, type RewardedAdOutcome } from '@/lib/adsgram/adsgram';

/**
 * Shows an Adsgram rewarded ad and tracks the "ad on screen" state so the
 * triggering control can disable itself while the ad plays. The returned
 * outcome tells the caller whether to grant the reward — see
 * {@link RewardedAdOutcome}.
 */
export function useRewardedAd() {
  const [showing, setShowing] = useState(false);

  const show = useCallback(async (): Promise<RewardedAdOutcome> => {
    setShowing(true);
    try {
      return await showRewardedAd();
    } finally {
      setShowing(false);
    }
  }, []);

  return { show, showing };
}
