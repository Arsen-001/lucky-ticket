import { Env } from '@/services/environment.service';
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
  /** `preload` warms the ad up; omitted entirely for a normal show. */
  type?: 'preload';
  /** Echoed in the postback — our user id. */
  ymid?: string;
};

type MonetagShow = (options?: MonetagShowOptions) => Promise<void>;

/**
 * A rejection faster than this almost certainly means "nothing to show" rather
 * than "the user watched some of it and closed it" — the SDK gives no reason
 * code, so the elapsed time is the only signal that separates the two. The
 * distinction matters: a skip must NOT fall through to the next provider.
 */
const NO_FILL_REJECT_MS = 2000;

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
    // The SDK rejects without a reason code; see NO_FILL_REJECT_MS.
    return performance.now() - startedAt < NO_FILL_REJECT_MS ? 'noAd' : 'skipped';
  }
}

function preload(): void {
  const showAd = getShowFn();
  // Fire-and-forget: a failed warm-up must not surface anywhere. No ymid — a
  // warm-up is not a view, and minting an id here would burn one.
  void showAd?.({ type: 'preload' }).catch(() => {});
}

export const monetagProvider: AdProvider = {
  id: 'monetag',
  isConfigured: () => !!getZoneId(),
  show,
  preload,
};
