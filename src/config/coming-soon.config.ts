/**
 * Pre-launch gate — client half.
 *
 * The gate used to be a build-time constant on a separate `production` branch,
 * which meant changing who could see the app required a redeploy. It is now
 * decided at runtime by the backend: one admin toggle, plus per-player
 * exceptions. This file holds only what a client still has to own — the
 * emergency override, and the date to show when the server can't be reached.
 *
 * Two rules the rest of the code depends on:
 *
 *  1. **Fail closed.** No answer means the countdown, never the app. A backend
 *     blip must not be the reason a pre-launch product opens to the world.
 *  2. **The env var can only close.** `NEXT_PUBLIC_COMING_SOON=1` forces the
 *     gate on whatever the config says; there is deliberately no value that
 *     forces it *off*, so a wrong config cannot be papered over by a wrong env
 *     var — and nothing outside the admin panel can open the app.
 *
 * @see src/hooks/usePreLaunchGate — the runtime decision
 * @see src/components/pages/coming-soon/PreLaunchGate — where it is applied
 */

/**
 * The countdown target used only when the server hasn't told us one, as an
 * absolute instant — NOT "15 days from first visit". A relative target would
 * restart for every visitor and every reload, so the countdown would never
 * actually reach zero.
 */
const FALLBACK_LAUNCH_AT = '2026-08-17T18:00:00.000Z';

const ON_VALUES = ['1', 'true', 'on', 'yes'];

/** Emergency close: forces the gate on whatever the backend says. */
const forcedOn = ON_VALUES.includes(
  (process.env.NEXT_PUBLIC_COMING_SOON ?? '').trim().toLowerCase()
);

const fallbackLaunchAt = (() => {
  const raw = process.env.NEXT_PUBLIC_LAUNCH_AT?.trim();
  if (!raw) return FALLBACK_LAUNCH_AT;
  const parsed = new Date(raw);
  // A typo in the env var must not turn the countdown into "NaN" on the live
  // page — fall back to the bundled date instead.
  return Number.isNaN(parsed.getTime()) ? FALLBACK_LAUNCH_AT : parsed.toISOString();
})();

export const comingSoonConfig = {
  /** @see coming-soon.config — this closes the gate; it can never open it. */
  forcedOn,
  /** Shown while the server's date is unknown. @see FALLBACK_LAUNCH_AT */
  fallbackLaunchAt,
};
