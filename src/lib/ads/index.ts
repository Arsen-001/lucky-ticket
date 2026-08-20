import { Env } from '@/services/environment.service';
import { adsgramProvider } from './adsgram.provider';
import { monetagProvider } from './monetag.provider';
import type {
  AdProvider,
  AdProviderId,
  AdShowResult,
  RewardedAdFailure,
  RewardedAdResult,
} from './types';

/**
 * Rewarded-ad waterfall.
 *
 * One user action plays exactly ONE ad. Networks are tried in order and the
 * next one is only asked after the previous returned nothing — never two ads
 * in a row. When every network comes up empty the chain ends there and the
 * caller shows ONE screen naming the reason (product decision, 17.08.2026):
 * an in-app promo used to stand in for the missing video, which cost the player
 * a second tap to learn the same thing and hid the network's own reason from
 * the telemetry — every attempt was attributed to the promo instead.
 *
 * Order comes from `NEXT_PUBLIC_AD_PROVIDERS` (comma-separated) so it can be
 * re-tuned from Vercel env once real per-network eCPM is known, with no code
 * change. Unknown or unconfigured ids are dropped — `house` among them, so an
 * env list left over from before that decision degrades to the networks in it.
 */

const PROVIDERS: Record<AdProviderId, AdProvider> = {
  adsgram: adsgramProvider,
  monetag: monetagProvider,
};

/** Applied when `NEXT_PUBLIC_AD_PROVIDERS` is unset. */
const DEFAULT_ORDER: AdProviderId[] = ['adsgram', 'monetag'];

/**
 * How many views in a row go to the same network before the chain rotates.
 *
 * A pure waterfall gives the network at the top ~everything: with fill at 97%
 * the second one is asked about twice in a hundred views, which is too little
 * to earn from and far too little to ever compare against (the panel refuses a
 * verdict under 1000 views per network — decades away from second place).
 *
 * Rotating is not only about measuring, though. Advertisers frequency-cap their
 * campaigns, so a viewer's expensive demand is spent after the first few views
 * and the rest of their session is filled with cheap or unpaid inventory — it
 * is in this project's own numbers (25 views at $1.58 one day, 3 at $0.00 the
 * next). Players here watch ~6 ads per session, deep into that decay. Handing
 * every other block to another network puts each of those views in front of a
 * pool that has not been capped yet.
 *
 * **1** — alternate on every view — is the default for that reason: it puts each
 * of a player's views in front of the freshest pool available. Two in a row
 * already spends the second on demand the first one dented. That is a judgement
 * call, not a measurement: the panel reports revenue per network, never per
 * view POSITION, so 1 and 2 look identical in it (both split the day 50/50).
 * It is one variable to change if the weekly comparison ever says otherwise.
 *
 * `0` disables rotation and restores the strict waterfall. With one usable
 * network it does nothing either way.
 */
const DEFAULT_ROTATE_EVERY = 1;

/**
 * Deadlock guard around a single `show()`.
 *
 * Every SDK here hands back one promise covering load AND playback, so this
 * cannot be a fill timeout — it has to outlast a genuinely watched video plus
 * its end card. It exists for the case none of the networks documents: an SDK
 * that neither resolves nor rejects, which today freezes the watch button for
 * the rest of the session because `useRewardedAd` never leaves `showing`.
 */
const SHOW_TIMEOUT_MS = 90_000;

/**
 * How long a network that just answered `noAd` is moved to the BACK of the
 * chain. Fill is a property of the moment, not of the network, so this is a
 * demotion and never a removal: an empty chain would report `unavailable`,
 * which is the dev/mock path that grants a reward outright — a no-fill must
 * never be able to reach it.
 */
const NO_FILL_DEMOTION_MS = 5 * 60_000;

/** Provider id → timestamp until which it is considered empty. */
const emptyUntil = new Map<AdProviderId, number>();

function isProviderId(value: string): value is AdProviderId {
  return value in PROVIDERS;
}

/** The configured order, before filtering by what's actually usable. */
function getConfiguredOrder(): AdProviderId[] {
  const raw = Env.adProviders?.trim();
  if (!raw) return DEFAULT_ORDER;
  const ids = raw
    .split(',')
    .map(part => part.trim())
    .filter(isProviderId);
  return ids.length > 0 ? ids : DEFAULT_ORDER;
}

function isEmptyNow(id: AdProviderId, now: number): boolean {
  const until = emptyUntil.get(id);
  if (until === undefined) return false;
  if (until > now) return true;
  emptyUntil.delete(id);
  return false;
}

/** Views per network before the chain rotates; see DEFAULT_ROTATE_EVERY. */
function getRotateEvery(): number {
  const raw = Env.adRotateEvery?.trim();
  if (!raw) return DEFAULT_ROTATE_EVERY;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : DEFAULT_ROTATE_EVERY;
}

/**
 * Rotate the chain so this view starts at its turn's network.
 *
 * Driven by the view's own number, not by a counter this module keeps: the
 * player reloads the Mini App, and any state here would restart at the top and
 * hand the first network more than its share. The day's view index is the same
 * number the backend uses to price the view, so both ends agree on which view
 * this is without talking to each other.
 */
function rotate(chain: AdProvider[], viewIndex: number | undefined): AdProvider[] {
  const every = getRotateEvery();
  if (every === 0 || chain.length < 2 || viewIndex === undefined || viewIndex < 0) return chain;
  const turn = Math.floor(viewIndex / every) % chain.length;
  return [...chain.slice(turn), ...chain.slice(0, turn)];
}

/**
 * The usable chain for one view: rotated to whose turn it is, then with any
 * network that recently had nothing to serve pushed to the end.
 *
 * Demotion is applied AFTER the rotation on purpose — an empty network must
 * lose its turn rather than waste the player's round-trip on it, but it keeps
 * its place in the fallback order so nothing is ever dropped from the chain.
 */
function getChain(viewIndex?: number): AdProvider[] {
  const now = Date.now();
  const usable = rotate(
    getConfiguredOrder()
      .map(id => PROVIDERS[id])
      .filter(provider => provider.isConfigured()),
    viewIndex
  );
  const filling = usable.filter(provider => !isEmptyNow(provider.id, now));
  const empty = usable.filter(provider => isEmptyNow(provider.id, now));
  return [...filling, ...empty];
}

/**
 * Warm up the network that is about to be asked first. Only that one: `preload`
 * is a real request to the network, and warming every configured SDK on mount
 * spends a request per network to save the latency of at most one of them.
 *
 * `viewIndex` is the day's view number the warm-up is for — with rotation on,
 * whose turn it is depends on it, and warming the wrong network costs a request
 * and saves nothing.
 */
export function preloadRewardedAd(viewIndex?: number): void {
  getChain(viewIndex)[0]?.preload?.();
}

/** A `show()` that never hangs; `null` means the SDK stopped answering. */
async function showWithTimeout(provider: AdProvider): Promise<AdShowResult | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const watchdog = new Promise<null>(resolve => {
    timer = setTimeout(() => resolve(null), SHOW_TIMEOUT_MS);
  });
  try {
    return await Promise.race([provider.show(), watchdog]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Play a rewarded ad and resolve with a normalized outcome plus the provider
 * that produced it. Never throws — the caller branches on the outcome to
 * decide whether to credit.
 *
 * `viewIndex` is which view of the day this is (the ad slot's own index), which
 * decides whose turn it is when rotation is on. Omitted — an older caller — the
 * chain stays in its configured order.
 *
 * `onFailure` fires once per network that came up empty, in the order they were
 * asked. The returned result names only ONE provider, so without this every
 * network the chain passed over left no trace at all.
 */
export async function showRewardedAd(
  viewIndex?: number,
  onFailure?: (attempt: { provider: AdProviderId; outcome: RewardedAdFailure }) => void
): Promise<RewardedAdResult> {
  const chain = getChain(viewIndex);

  // No network wired (dev / plain browser / e2e) — keep the existing mock flow
  // rather than refusing the action.
  if (chain.length === 0) return { outcome: 'unavailable', provider: null };

  let last: RewardedAdResult = { outcome: 'error', provider: chain[0].id };
  for (const provider of chain) {
    const result = await showWithTimeout(provider);

    // The SDK went silent past the watchdog. Stop the chain rather than open a
    // second ad: the first one may still be on screen, or arrive on top of the
    // next network's video a moment later.
    if (result === null) {
      onFailure?.({ provider: provider.id, outcome: 'error' });
      return { outcome: 'error', provider: provider.id };
    }

    const { outcome, displayed } = result;

    // Watched to the end → done. Closed by the user → also done: falling
    // through would turn "close the ad" into "get another chance at a
    // reward", so the chain stops and nothing is granted.
    if (outcome === 'completed' || outcome === 'skipped') {
      // It served something, so whatever we believed about its fill is stale.
      emptyUntil.delete(provider.id);
      return { outcome, provider: provider.id };
    }

    // It FAILED, but a creative had already reached the screen. Stop here:
    // asking the next network now plays a second video at a player who just
    // sat through one, for a single tap and a single reward. Reported from
    // production 20.08.2026 — "three ads in a row on one tap", of which this
    // was the outer two.
    if (displayed) {
      onFailure?.({ provider: provider.id, outcome });
      return { outcome, provider: provider.id };
    }

    // Nothing to serve → remember it, so the next watch does not pay this
    // network's round-trip before reaching one that fills. `tooFast` and
    // `error` are deliberately NOT remembered: the first is our own pacing and
    // the second says nothing about inventory.
    if (outcome === 'noAd') emptyUntil.set(provider.id, Date.now() + NO_FILL_DEMOTION_MS);

    // Report THIS network's refusal, not just the chain's last one. The result
    // carries a single provider, so for years everything a passed-over network
    // did was invisible: on 20.08.2026 Monetag sat at 0.2% of impressions with
    // zero recorded no-fills, because a Monetag miss followed by an Adsgram
    // miss was stored as one Adsgram row. The panel could not answer the only
    // question worth asking about a second network.
    onFailure?.({ provider: provider.id, outcome });

    // noAd / tooFast / error → the next provider gets a turn. The last one is
    // reported if everyone comes up empty, so the modal explains the real
    // reason rather than a generic failure — and the attempt is telemetered
    // against the network that actually refused.
    last = { outcome, provider: provider.id };
  }

  return last;
}

export type { RewardedAdOutcome, RewardedAdResult, AdProviderId } from './types';
