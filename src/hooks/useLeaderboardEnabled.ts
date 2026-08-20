import { useGetPublicConfigQuery } from '@/api/config.api';
import { useGetMeQuery } from '@/api/me.api';
import { appConfig } from '@/config/app.config';

/**
 * May the current player open the leaderboard?
 *
 * Two halves, because the answer has two: `GET /config` carries the master
 * switch (admin-editable — opening the board to everyone needs no redeploy),
 * and it is anonymous, so it can only say «открыта ли доска всем». While the
 * switch is off the board is still open to the people an admin named in
 * «Настройки → Система», and that half rides on `GET /me`, which knows who is
 * asking. Either one is enough.
 *
 * Falls back to the bundled flag while loading or on an older backend. When it
 * comes back false the drawer entry, the profile card and the board itself
 * render locked — and the server refuses the standings on the same rule, so the
 * two cannot disagree.
 */
export function useLeaderboardEnabled(): boolean {
  const { data } = useGetPublicConfigQuery();
  const { data: me } = useGetMeQuery();
  return (
    (data?.leaderboardEnabled ?? appConfig.leaderboard.enabled) || me?.leaderboardAllowed === true
  );
}
