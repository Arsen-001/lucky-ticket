/**
 * The advertiser (sponsor / casino) account behind the partner cabinet. Money
 * is denominated in TON (decimal), matching the wallet (DOCS §11.8 / §21).
 */
export interface Advertiser {
  id: string;
  username: string;
  /** Main spendable balance, in TON. */
  balanceTon: number;
}

/** The single stat the cabinet still needs server-side — the advertiser balance. */
export interface PartnerStats {
  /** Advertiser's current spendable balance, in TON. */
  balanceTon: number;
}
