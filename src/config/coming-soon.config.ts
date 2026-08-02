/**
 * Pre-launch gate — the reason this branch exists.
 *
 * While `enabled` is true the app never boots: the root layout renders the
 * Coming Soon screen INSTEAD of `{children}`, so no route, provider, store or
 * backend query is ever mounted. That is deliberate — a gate that renders on
 * top of a running app still authenticates, still polls, and still leaks the
 * real screens for the frame before the overlay paints.
 *
 * The gate is on by default here. Set `NEXT_PUBLIC_COMING_SOON=0` (locally or
 * as a Vercel preview env var) to browse the real app off this branch without
 * a code change.
 */

/**
 * When the app opens, as an absolute instant — NOT "15 days from first visit".
 * A relative target would restart for every visitor and for every reload, so
 * the countdown would never actually reach zero. Overridable per deployment
 * via `NEXT_PUBLIC_LAUNCH_AT` (any value `new Date()` parses) so the date can
 * be moved from Vercel's env panel + a redeploy, without touching the code.
 *
 * Current value: 15 days from 2026-08-02.
 */
const DEFAULT_LAUNCH_AT = '2026-08-17T12:00:00.000Z';

const OFF_VALUES = ['0', 'false', 'off', 'no'];

const enabled = (() => {
  // `??` is not enough: a var declared-but-empty in `.env` reads as `''`, which
  // must mean "unset" (gate on), not "off".
  const raw = process.env.NEXT_PUBLIC_COMING_SOON?.trim().toLowerCase();
  if (!raw) return true;
  return !OFF_VALUES.includes(raw);
})();

const launchAt = (() => {
  const raw = process.env.NEXT_PUBLIC_LAUNCH_AT?.trim();
  if (!raw) return DEFAULT_LAUNCH_AT;
  const parsed = new Date(raw);
  // A typo in the env var must not turn the countdown into "NaN" on the live
  // page — fall back to the bundled date instead.
  return Number.isNaN(parsed.getTime()) ? DEFAULT_LAUNCH_AT : parsed.toISOString();
})();

export const comingSoonConfig = {
  /** @see coming-soon.config */
  enabled,
  /** ISO instant the countdown counts down to. @see DEFAULT_LAUNCH_AT */
  launchAt,
};
