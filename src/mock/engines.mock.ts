import type { FetchArgs } from '@reduxjs/toolkit/query';
import { chargeMockUser } from '@/mock/backend/charge';

const successResponse = () => ({});

/**
 * Dev switch: make the next claim answer «this cycle is still running».
 *
 * ```js
 * localStorage.setItem('mock:claim-not-ready', '90'); // seconds the server still wants
 * localStorage.removeItem('mock:claim-not-ready');
 * ```
 *
 * The mock never refuses anything, so the whole refusal half of a screen is
 * invisible on localhost — which is how «Не удалось забрать награду» reached
 * production and stayed there (@see engineElapsedAligned). This is the same
 * blind spot the market mock has.
 *
 * Reads `localStorage` rather than an env var so it can be flipped in a running
 * app, from the console, without a restart. Absent → the mock behaves exactly
 * as before.
 */
const claimNotReadySeconds = (): number | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('mock:claim-not-ready');
    if (!raw) return null;
    const seconds = Number(raw);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 90;
  } catch {
    // Private mode, blocked site data — the switch is a dev convenience, not a
    // reason to break the fixture.
    return null;
  }
};

/** The refusal the real backend sends, shape for shape. @see EnginesService.syncOf */
const notReadyRefusal = (engineIds: string[], secondsRemaining: number) => {
  const now = new Date();
  const engines = engineIds.map(id => ({
    id,
    pendingCount: 0,
    // A cycle that started long enough ago to look finished locally — which is
    // exactly the disagreement this switch reproduces.
    cycleStartedAt: new Date(now.getTime() - 86_400_000).toISOString(),
    secondsRemaining,
    ready: false,
    serverNow: now.toISOString(),
  }));
  return {
    error: {
      status: 400,
      data: {
        statusCode: 400,
        message:
          engineIds.length === 1 ? 'Engine still producing — nothing to claim' : 'Nothing to claim',
        reason: 'not-ready',
        secondsRemaining,
        ...(engineIds.length === 1 ? { engine: engines[0] } : { engines }),
      },
    },
  };
};

const claimEngine = (args: FetchArgs) => {
  const seconds = claimNotReadySeconds();
  if (seconds === null) return {};
  const { engineId } = (args.body ?? {}) as { engineId?: string };
  return notReadyRefusal(engineId ? [engineId] : [], seconds);
};

const claimTier = () => {
  const seconds = claimNotReadySeconds();
  return seconds === null ? {} : notReadyRefusal([], seconds);
};

/**
 * The three paid engine actions send the star price they quoted, so the mock can
 * charge exactly what the player was shown. Without it the header dropped (the
 * optimistic patch in `engines.api.ts`) while the /stars and wallet screens
 * refetched the untouched balance right back — see `chargeMockUser`.
 */
const chargeStars = (args: FetchArgs) => {
  const { cost } = (args.body ?? {}) as { cost?: number };
  chargeMockUser({ stars: Math.max(0, cost ?? 0) });
  return {};
};

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
  //
  // …unless `mock:claim-not-ready` is set — @see claimNotReadySeconds, the only
  // way to see a refusal on localhost.
  'POST engines/claim': claimEngine,
  'POST engines/claim-all': claimTier,
  'POST engines/instant-claim': chargeStars,
  // `engines/skip` still exists on the backend (pay to fill a cycle WITHOUT
  // claiming it), but no screen calls it since instant claim became one tap —
  // so there is no client to mock. Restore both together if the two-step
  // variant ever comes back.
  'POST engines/upgrade-speed': chargeStars,
  'POST engines/upgrade-capacity': chargeStars,
  // Against the real backend this answers `{ ok, engine }` — whether the server
  // AGREED the cycle was over, and its own countdown (@see engineElapsedAligned).
  // The mock cannot: engine state lives in the RTK cache here, so there is no
  // second opinion to give. `{}` leaves the client's own math in charge, which
  // in mock mode IS the truth.
  'POST engines/complete-cycle': successResponse,
  'POST engines/grant-welcome': successResponse,
};
