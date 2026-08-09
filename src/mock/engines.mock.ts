const successResponse = () => ({});

export const enginesMock = {
  // Claims pay in tickets only — no AP is awarded (product decision), so the
  // real backend answers with just `{ claimed }`.
  //
  // The mock deliberately OMITS that field instead of inventing a number. Engine
  // state lives in the RTK cache here (the optimistic patches in `engines.api`
  // are the only writer — nothing mutates these fixtures), so the mock has no
  // way to know how many tickets a claim produced. The constant `{ claimed: 1 }`
  // it used to return was a lie the UI is now free to believe: the celebration
  // modal reads the response, so a hardcoded 1 would report "1 ticket" after a
  // 22-ticket claim-all. Absent → `resolveClaimedCount` falls back to the
  // client's own total, which in mock mode IS the truth.
  'POST engines/claim': successResponse,
  'POST engines/claim-all': successResponse,
  'POST engines/instant-claim': successResponse,
  // `engines/skip` still exists on the backend (pay to fill a cycle WITHOUT
  // claiming it), but no screen calls it since instant claim became one tap —
  // so there is no client to mock. Restore both together if the two-step
  // variant ever comes back.
  'POST engines/upgrade-speed': successResponse,
  'POST engines/upgrade-capacity': successResponse,
  'POST engines/complete-cycle': successResponse,
  'POST engines/grant-welcome': successResponse,
};
