import type { Dictionary, MessageIds } from '@/types/types/i18n.types';
import type { SpendFailure } from '@/utils/global/spend-failure.utils';

/**
 * Turn a gift-purchase failure into something a player can act on.
 *
 * The server answers with a slug, not a sentence — `gift-send-failed` carries a
 * second part naming Telegram's own reason. Localising here rather than reading
 * the server's prose is the same rule the wallet lock taught: an English
 * sentence the client pattern-matches on is not a contract.
 *
 * Every one of these leaves the coins with the player: the send is only ever
 * attempted after the debit, and a refusal refunds before the error is thrown.
 * The copy says so, because "покупка не прошла" without it reads as lost money.
 */
const CODE_KEYS: Record<string, MessageIds> = {
  'gift-shop-disabled': 'gift error shop closed',
  'gift-no-telegram': 'gift error no telegram',
  'gift-not-available': 'gift error unavailable',
  'gift-user-limit': 'gift error user limit',
  'gift-budget-spent': 'gift error budget spent',
  'gift-insufficient-coins': 'gift error not enough coins',
  'recipient-disallowed-gifts': 'gift error gifts disallowed',
  'bot-balance-too-low': 'gift error temporarily unavailable',
  'gift-sold-out': 'gift error unavailable',
  'rate-limited': 'gift error temporarily unavailable',
};

const giftErrorCode = (error: unknown): string => {
  const raw = (error as { data?: { message?: string } } | undefined)?.data?.message ?? '';
  // `gift-send-failed:<telegram-code>` — the part after the colon is the one
  // that says what to do about it.
  return raw.startsWith('gift-send-failed:') ? raw.slice('gift-send-failed:'.length) : raw;
};

export function giftErrorMessage(error: unknown, t: Dictionary): string {
  const key = CODE_KEYS[giftErrorCode(error)];
  return key ? t(key) : t('gift error send failed');
}

/**
 * The same refusals, in the shape the storefront's confirm handler acts on.
 *
 * A shortfall is the one gift failure with somewhere to go, so it hands back
 * the shared "not enough LC" screen instead of a sentence that names the
 * problem and stops there.
 */
export function giftPurchaseFailure(error: unknown, t: Dictionary): SpendFailure {
  if (giftErrorCode(error) === 'gift-insufficient-coins') return { kind: 'coins' };
  return { kind: 'message', text: giftErrorMessage(error, t) };
}
