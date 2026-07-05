import { useGetAvatarInventoryQuery } from '@/api/avatars.api';
import { useGetMeQuery } from '@/api/me.api';
import { equippedAvatarEngineSpeedPct } from '@/utils/global/avatar.utils';

/**
 * Engine-speed boost % from the equipped avatar (0 if none). Pass the result as
 * `effectiveCycleSeconds`'s `avatarBoostPct` wherever a cycle is computed,
 * alongside `isLuckyPlayer` / `isVip`.
 */
export const useEngineSpeedAvatarBoostPct = (): number => {
  // Scope the `me` subscription to avatarId only — otherwise every unrelated
  // `me` change (e.g. a Lucky-Stars charge on an engine action) re-renders
  // every engine cube that calls this hook, for a value that didn't change.
  const { avatarId } = useGetMeQuery(undefined, {
    selectFromResult: ({ data }) => ({ avatarId: data?.avatarId }),
  });
  const { data: avatars } = useGetAvatarInventoryQuery();
  return equippedAvatarEngineSpeedPct(avatars, avatarId);
};
