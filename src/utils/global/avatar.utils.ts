import type { UserAvatar } from '@/types/interfaces/avatars.interfaces';

/**
 * Engine-speed boost % contributed by the player's currently-equipped avatar —
 * 0 when no avatar is equipped or the equipped one carries a non-speed boost.
 *
 * Feeds `effectiveCycleSeconds`'s `avatarBoostPct` (DOCS §9.7) so the Market's
 * advertised "+X% engine speed while equipped" avatars actually speed
 * production up. Must be applied symmetrically — in the UI *and* in the real
 * production cycle (`completeEngineCycle`) — or the engine would display a
 * faster cycle than it mints (same rule as the LP/VIP status boost).
 */
export const equippedAvatarEngineSpeedPct = (
  avatars: UserAvatar[] | undefined,
  avatarId: string | undefined
): number => {
  if (!avatars || !avatarId) return 0;
  const equipped = avatars.find(avatar => avatar.id === avatarId && avatar.owned);
  return equipped?.boost?.type === 'engineSpeed' ? equipped.boost.pct : 0;
};
