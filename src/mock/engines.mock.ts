const successResponse = () => ({});

export const enginesMock = {
  // Claims pay in tickets only — no AP is awarded (product decision), so the
  // handlers return just the claimed count.
  'POST engines/claim': () => ({ claimed: 1 }),
  'POST engines/claim-all': () => ({ claimed: 1 }),
  'POST engines/instant-claim': successResponse,
  'POST engines/skip': successResponse,
  'POST engines/upgrade-speed': successResponse,
  'POST engines/upgrade-capacity': successResponse,
  'POST engines/complete-cycle': successResponse,
  'POST engines/grant-welcome': successResponse,
};
