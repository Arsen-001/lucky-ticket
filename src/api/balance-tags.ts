import { rtkTags } from '@/constants/rtk-tags';

/**
 * Every cache that renders a balance, grouped by the currency that moved.
 *
 * A balance is not one number on one screen — each currency is drawn in three
 * or four places at once, fed by different queries:
 *
 * | currency | header pill | own screen        | ledger              | elsewhere            |
 * | -------- | ----------- | ----------------- | ------------------- | -------------------- |
 * | LC       | `me`        | `lc`              | `lcTransactions`    | wallet reads `lc`    |
 * | Stars    | `me`        | `stars`           | `starsTransactions` | `wallet.starsBalance`|
 * | TON      | —           | `wallet`          | `walletTransactions`| —                    |
 *
 * Every mutation that debits or credits a balance must invalidate the WHOLE
 * group for that currency, not the one tag whose screen the author happened to
 * be looking at. Refreshing `me` alone is the bug this exists to prevent: the
 * header pill drops, the player opens /lc to check, and the ledger page still
 * shows the pre-purchase balance with no row for the charge — which reads as
 * "it took my coins twice" or "the purchase never happened".
 *
 * Spread the groups instead of listing tags by hand:
 *
 * ```ts
 * invalidatesTags: [rtkTags.market, ...balanceTags.lc, ...balanceTags.stars],
 * ```
 *
 * A mutation that can be paid in either currency (the whole market, extra ad
 * views) spreads BOTH — the client does not always know which one the server
 * charged, and an extra refetch only ever costs a request for a screen that is
 * currently mounted. `tests/balance-refresh.test.ts` enforces the grouping.
 */
export const balanceTags = {
  /** LC (Lucky Coins) moved: header pill, /lc balance, /lc history. */
  lc: [rtkTags.me, rtkTags.lc, rtkTags.lcTransactions],
  /**
   * Lucky Stars moved: header pill, /stars balance, /stars history — and
   * `wallet`, because the wallet screen draws `starsBalance` from `GET /wallet`
   * rather than from the stars query.
   */
  stars: [rtkTags.me, rtkTags.stars, rtkTags.starsTransactions, rtkTags.wallet],
  /** TON moved: the wallet balance and its transaction list. */
  ton: [rtkTags.wallet, rtkTags.walletTransactions],
} as const;

/**
 * Tickets and shards are balances too, but they are deliberately NOT in the
 * table above: `tickets` and `inventory` are big payloads whose screens
 * (home slider, tickets tab, inventory) are patched in place by the engine
 * mutations to avoid a full-slider refresh — see the notes in `engines.api.ts`.
 * Add them per mutation, on purpose, never by spreading a group.
 */
export type BalanceCurrency = keyof typeof balanceTags;
