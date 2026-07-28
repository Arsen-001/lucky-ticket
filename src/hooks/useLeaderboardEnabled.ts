import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';

/**
 * The public-leaderboard master switch from `GET /config` (admin-editable —
 * opening the board after the test period needs no frontend redeploy). Falls
 * back to the bundled flag while loading or on an older backend. When false the
 * drawer entry, the profile card and the board itself render locked.
 */
export function useLeaderboardEnabled(): boolean {
  const { data } = useGetPublicConfigQuery();
  return data?.leaderboardEnabled ?? appConfig.leaderboard.enabled;
}
