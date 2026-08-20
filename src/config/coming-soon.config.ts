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

/**
 * Friends to bring before the bot sends a Telegram gift — the one thing the
 * pre-launch screen actually pays out, and the reason it shows a ladder rather
 * than a bare countdown.
 *
 * Ten since 2026-08-20 (5 → 7 → 10), and every one of them has to be in the
 * channel: at five the queue filled with claims whose friends had never joined
 * it. Must equal the backend's `PRE_LAUNCH_GIFT_FRIENDS` — the guardrail suite
 * reads both files and fails when they drift.
 *
 * 🔴 This is the FALLBACK, not the rule. The live threshold arrives with the
 * promo state (`PreLaunchGiftState.required`) because it is a panel setting
 * now; anything that can reach the server must prefer that number, and this one
 * is what to draw in the second before the answer lands.
 *
 * The promo outlived the gate it was named for: the same ladder is the friends
 * screen's event since 20.08.2026, so it is no longer a launch-window promo —
 * only its constants still live here. The delivery itself is the bot's job —
 * the screen only counts. @see GiftLadder
 */
const GIFT_FRIENDS_REQUIRED = 10;

export const comingSoonConfig = {
  /** @see coming-soon.config — this closes the gate; it can never open it. */
  forcedOn,
  /** Shown while the server's date is unknown. @see FALLBACK_LAUNCH_AT */
  fallbackLaunchAt,
  /** @see GIFT_FRIENDS_REQUIRED */
  giftFriendsRequired: GIFT_FRIENDS_REQUIRED,
};
