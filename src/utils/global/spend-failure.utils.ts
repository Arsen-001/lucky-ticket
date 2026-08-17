import type { Dictionary, MessageIds } from '@/types/types/i18n.types';

/**
 * What a refused spend turns into on screen.
 *
 * Every kind except `message` names a thing the player can go and get, which is
 * the whole point: a refusal that only states the problem leaves them on the
 * screen that just said no. `message` is the rest — reasons with nowhere to go,
 * which arrive as already-translated copy.
 */
export type SpendFailure =
  | { kind: 'coins' }
  | { kind: 'stars' }
  | { kind: 'ton' }
  | { kind: 'tickets' }
  | { kind: 'shards' }
  /**
   * The server no longer knows who is asking (401 that survived the refresh
   * retry). Not a purchase failure at all — the way out is a fresh sign-in,
   * so it gets its own modal instead of «Покупка не прошла».
   */
  | { kind: 'session' }
  | { kind: 'message'; text: string };

/** A currency refusal — the kinds that open a top-up route. */
export type SpendShortfallKind = Exclude<
  SpendFailure,
  { kind: 'message' } | { kind: 'session' }
>['kind'];

/**
 * A failure the caller already worked out (gifts translate their own slugs),
 * thrown from the mutation wrapper so the shared handler doesn't have to guess.
 */
export interface ResolvedSpendFailure {
  spendFailure: SpendFailure;
}

export const resolvedSpendFailure = (failure: SpendFailure): ResolvedSpendFailure => ({
  spendFailure: failure,
});

/**
 * The backend's own sentences. They are a wire format, not copy: the services
 * throw English `BadRequestException('Out of stock')` and friends, and for a
 * while the storefront simply put those in a toast — an untranslated server
 * string shown to a Russian-speaking player as if it were the app talking.
 *
 * Matching on prose is not a contract, so an unrecognised message falls back to
 * a generic line rather than leaking.
 */
const MESSAGE_KEYS: Record<string, MessageIds> = {
  'out of stock': 'purchase error out of stock',
  'item not found': 'purchase error item gone',
  'price option not available': 'purchase error item gone',
  'unsupported price type': 'purchase error item gone',
  'market is disabled': 'purchase error market closed',
  'tier not unlocked for this item': 'purchase error tier locked',
  'vip already at max level': 'purchase error vip max',
  'avatars are temporarily unavailable': 'purchase error avatars off',
  'avatar already owned': 'purchase error already owned',
  // engines.service: a compare-and-swap lost to a concurrent request on the
  // same engine (a second tap through a slow proxy, another device) — answered
  // 409, and `engines.api` refetches the tickets so the screen shows the
  // server's state before the player taps again. Nothing was charged.
  'upgrade already in progress': 'purchase error upgrade conflict',
  'claim already in progress': 'purchase error claim conflict',
};

/**
 * Prefixes, not exact strings. The same shortfall is phrased five ways across
 * the services — `Not enough Lucky Stars`, `…for the stake fee`, `…for the
 * cancel fee`, `Not enough TON (including network fee)`, `Not enough gold
 * tickets` — and an exact-match table silently demotes every variant it has
 * not seen to a generic "something went wrong". Order matters: `not enough lc`
 * must be tested before the bare fallbacks.
 */
const SHORTFALL_RULES: { test: RegExp; kind: SpendShortfallKind }[] = [
  { test: /^not enough lc\b/, kind: 'coins' },
  { test: /^not enough (lucky stars|stars)\b/, kind: 'stars' },
  { test: /^not enough ton\b/, kind: 'ton' },
  { test: /^not enough shards\b/, kind: 'shards' },
  { test: /^not enough \w+ tickets\b/, kind: 'tickets' },
  { test: /^not enough tickets\b/, kind: 'tickets' },
];

/**
 * The server's «someone got there first» — a 409 from a lost compare-and-swap.
 * For the free paths (`engines/claim`) that never enter `spendFailure`: a lost
 * claim race is not a failed claim, and must not be toasted as one.
 */
export const isConflictError = (error: unknown): boolean =>
  (error as { status?: unknown } | null | undefined)?.status === 409;

const readServerMessage = (error: unknown): string => {
  const data = (error as { data?: unknown } | null | undefined)?.data;
  if (typeof data === 'string') return data;
  const message = (data as { message?: unknown } | null | undefined)?.message;
  return typeof message === 'string' ? message : '';
};

/**
 * Turn a refused spend into something the app can say for itself.
 *
 * Nothing is ever charged behind one of these — every service debits and grants
 * inside one transaction, and each throw happens before the debit or rolls it
 * back — which is why the copy is allowed to promise it.
 */
export function spendFailure(error: unknown, t: Dictionary): SpendFailure {
  const resolved = (error as Partial<ResolvedSpendFailure> | null | undefined)?.spendFailure;
  if (resolved) return resolved;

  const status = (error as { status?: unknown } | null | undefined)?.status;
  // No verdict came back at all (dropped connection, timeout, unparseable
  // body). Naming a reason here would be inventing one, and a 5xx is the
  // server falling over rather than deciding — both are "try again".
  if (typeof status !== 'number' || status >= 500) {
    return { kind: 'message', text: t('purchase error network') };
  }
  // The base query already tried one refresh and retried; a 401 that still
  // comes back means the session is gone (a one-use refresh token rotated by
  // another device, an hour-old initData). Inside Telegram nothing redirects,
  // the screen keeps living on cached data, and every paid tap used to end in
  // «Покупка не прошла» — a broken-looking button rather than a lost session.
  if (status === 401) return { kind: 'session' };

  const message = readServerMessage(error).trim().toLowerCase();

  const shortfall = SHORTFALL_RULES.find(rule => rule.test.test(message));
  if (shortfall) return { kind: shortfall.kind };

  const key = MESSAGE_KEYS[message];
  return { kind: 'message', text: t(key ?? 'purchase failed') };
}
