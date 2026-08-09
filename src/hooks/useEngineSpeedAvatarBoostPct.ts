// AVATARS OFF (2026-08-09) — see the note on the hook below.
// import { useGetAvatarInventoryQuery } from '@/api/avatars.api';
// import { useGetMeQuery } from '@/api/me.api';
// import { equippedAvatarEngineSpeedPct } from '@/utils/global/avatar.utils';

/**
 * Engine-speed boost % from the equipped avatar (0 if none). Pass the result as
 * `effectiveCycleSeconds`'s `avatarBoostPct` wherever a cycle is computed,
 * alongside `isLuckyPlayer` / `isVip`.
 *
 * AVATARS OFF (2026-08-09) — the avatar cosmetics feature is switched off for
 * ~2 months, not removed. The hook is kept (and still returns a number) so the
 * six engine screens that read it, and the guardrail that checks it sits in
 * their ticker dependency arrays, stay untouched: the switch is here and in
 * `engines.api.ts`, nowhere else.
 *
 * ⚠️ The backend still applies this boost server-side (`EnginesService.avatarBoost`),
 * so a player who already owns *and* wears a speed avatar keeps producing on the
 * boosted cycle while the UI counts the base one — their engine finishes a little
 * earlier than the countdown says, and the next refetch corrects the display.
 * Turning the boost off on the backend too would close that gap.
 */
export const useEngineSpeedAvatarBoostPct = (): number => {
  return 0;

  // Scope the `me` subscription to avatarId only — otherwise every unrelated
  // `me` change (e.g. a Lucky-Stars charge on an engine action) re-renders
  // every engine cube that calls this hook, for a value that didn't change.
  // const { avatarId } = useGetMeQuery(undefined, {
  //   selectFromResult: ({ data }) => ({ avatarId: data?.avatarId }),
  // });
  // const { data: avatars } = useGetAvatarInventoryQuery();
  // return equippedAvatarEngineSpeedPct(avatars, avatarId);
};
