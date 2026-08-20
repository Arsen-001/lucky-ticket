import { Env } from '@/services/environment.service';
import { classifyFastReject } from './fast-reject';
import type { AdProvider, RewardedAdOutcome } from './types';

/**
 * Monetag rewarded-ad provider (Rewarded Interstitial).
 *
 * The SDK tag is loaded in the root layout and defines a single global named
 * after the zone — `show_<zoneId>(options) => Promise<void>`. It resolves when
 * the ad was watched to the end and rejects otherwise. Docs:
 * https://docs.monetag.com/docs/sdk-reference/
 *
 * `ymid` is echoed back in Monetag's S2S postback, so it carries the Telegram
 * user id — that's how the backend attributes a server-confirmed view.
 */

type MonetagShowOptions = {
  /** Echoed in the postback — our user id. */
  ymid?: string;
};

type MonetagShow = (options?: MonetagShowOptions) => Promise<void>;

function getZoneId(): string | undefined {
  return Env.monetagZoneId || undefined;
}

function getShowFn(): MonetagShow | null {
  const zoneId = getZoneId();
  if (typeof window === 'undefined' || !zoneId) return null;
  const fn = (window as unknown as Record<string, unknown>)[`show_${zoneId}`];
  return typeof fn === 'function' ? (fn as MonetagShow) : null;
}

// Distinguishes two views inside the same millisecond.
let viewCounter = 0;

/**
 * Monetag's `ymid`, echoed back in the S2S postback: `<telegramId>.<unique>`.
 *
 * Monetag asks for a UNIQUE value per ad event, and the backend uses it as the
 * idempotency key — reusing one id would make every view after the first look
 * like a retry and silently drop the reward. The telegram id stays as a prefix
 * so the backend can still attribute the view if the `{telegram_id}` macro
 * arrives empty.
 */
function nextYmid(): string | undefined {
  const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if (!id) return undefined;
  const seq = viewCounter;
  viewCounter = seq + 1;
  return `${id}.${Date.now().toString(36)}${seq.toString(36)}`;
}

async function show(): Promise<Exclude<RewardedAdOutcome, 'unavailable'>> {
  const showAd = getShowFn();
  // Configured but the SDK tag hasn't loaded — do NOT credit a free reward.
  if (!showAd) return 'error';

  const startedAt = performance.now();
  try {
    await showAd({ ymid: nextYmid() });
    return 'completed';
  } catch {
    // The SDK rejects without a reason code; see `classifyFastReject`.
    return classifyFastReject(startedAt);
  }
}

/**
 * Deliberately NO `preload`.
 *
 * Monetag does document one — `show_<zone>({type: 'preload'})` — but only as
 * half of a pair: it "loads ad materials in background without showing", and
 * the ad is displayed by a LATER call with `type: 'end'`. This provider never
 * calls `end`; `show()` above passes no type at all, which starts a fresh
 * interstitial. So warming up left a charged ad sitting in the SDK that nothing
 * here ever spends, alongside the one the player actually asked for.
 *
 * That went unnoticed for as long as Monetag was out of the waterfall
 * (2026-08-02 … 2026-08-20) and surfaced the same day it went back in, as ads
 * arriving in more than the one the player tapped for.
 *
 * Implementing the pair properly would mean tracking whether a preload is
 * outstanding and branching `show()` on it — state that has to survive a
 * reload, and gets an undefined answer when `end` is called with nothing
 * charged. The whole prize is the latency of one request. Not worth it: the
 * warm-up is simply gone, and `preload` being absent is a no-op in the chain.
 */
export const monetagProvider: AdProvider = {
  id: 'monetag',
  isConfigured: () => !!getZoneId(),
  show,
};
