/**
 * Public economy anchors served by the backend's `GET /config`. `lcUsdRate` is
 * admin-controllable (drives the LC→TON cash-out rate, DOCS §6.1); the rest are
 * fixed anchors surfaced so the wallet has a single source for its estimate.
 */
export interface PublicConfig {
  /** USD value of one LC. */
  lcUsdRate: number;
  /** USD value of one TON. */
  tonUsdRate: number;
  /** USD value of one Lucky Star. */
  lsUsdRate: number;
}
