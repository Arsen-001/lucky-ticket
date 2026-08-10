import type { Dictionary, MessageIds } from '@/types/types/i18n.types';

/**
 * What a refused purchase turns into on screen.
 *
 * Two of the refusals have a way out, so they get their own screen rather than
 * a sentence: `coins` opens the "not enough LC" modal (which carries the player
 * to the LC page), `stars` opens the buy-stars sheet pre-filled with the
 * shortfall. Everything else is something the player can only read, so it
 * arrives as already-translated copy.
 */
export type MarketPurchaseFailure =
  | { kind: 'coins' }
  | { kind: 'stars' }
  | { kind: 'message'; text: string };

/**
 * A failure the caller already worked out (gifts translate their own slugs),
 * thrown from `mutate` so the shared confirm handler doesn't have to guess.
 */
export interface ResolvedMarketFailure {
  marketFailure: MarketPurchaseFailure;
}

export const resolvedMarketFailure = (failure: MarketPurchaseFailure): ResolvedMarketFailure => ({
  marketFailure: failure,
});

/**
 * The backend's own sentences. They are a wire format, not copy: the market
 * service throws English `BadRequestException('Out of stock')` and friends, and
 * for a while the storefront simply put those in a toast — an untranslated
 * server string shown to a Russian-speaking player as if it were the app
 * talking.
 *
 * Matching on prose is the same deal the gift shop made: not a contract, so an
 * unrecognised message falls back to a generic line rather than leaking.
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
};

const BALANCE_KINDS: Record<string, 'coins' | 'stars'> = {
  'not enough lc': 'coins',
  'not enough lucky stars': 'stars',
};

const readServerMessage = (error: unknown): string => {
  const data = (error as { data?: unknown } | null | undefined)?.data;
  if (typeof data === 'string') return data;
  const message = (data as { message?: unknown } | null | undefined)?.message;
  return typeof message === 'string' ? message : '';
};

/**
 * Turn a refused market purchase into something the app can say for itself.
 *
 * Nothing is ever charged behind one of these — the market service debits and
 * grants inside one transaction, and every throw above happens before or rolls
 * back the debit — which is why the copy is allowed to promise it.
 */
export function marketPurchaseFailure(error: unknown, t: Dictionary): MarketPurchaseFailure {
  const resolved = (error as Partial<ResolvedMarketFailure> | null | undefined)?.marketFailure;
  if (resolved) return resolved;

  const status = (error as { status?: unknown } | null | undefined)?.status;
  // No verdict came back at all (dropped connection, timeout, unparseable
  // body). Naming a reason here would be inventing one, and a 5xx is the
  // server falling over rather than deciding — both are "try again".
  if (typeof status !== 'number' || status >= 500) {
    return { kind: 'message', text: t('purchase error network') };
  }

  const message = readServerMessage(error).trim().toLowerCase();

  const balance = BALANCE_KINDS[message];
  if (balance) return { kind: balance };

  const key = MESSAGE_KEYS[message];
  return { kind: 'message', text: t(key ?? 'purchase failed') };
}
