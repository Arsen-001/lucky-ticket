import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';
import { walletConstants } from '@/utils/pages/wallet.utils';

export interface WalletLimits {
  /**
   * Whether money may leave the platform at all — false closes the TON
   * withdrawal AND the LC→TON conversion (it is one switch server-side), and
   * both screens render the "opens after the test period" lock.
   */
  withdrawalsEnabled: boolean;
  /** Flat fee charged ON TOP of a withdrawal — the recipient gets the amount. */
  withdrawFeeTon: number;
  minWithdrawTon: number;
  /** Ceiling on a single withdrawal — the treasury signs these automatically. */
  maxWithdrawTon: number;
  /** Per-account daily withdrawal cap (UTC day) — spans transactions. */
  withdrawDailyCapTon: number;
  /** Smallest deposit the send-from-wallet form offers (advisory — see below). */
  minDepositTon: number;
  /** Minimum LC per LC→TON conversion. */
  minWithdrawLc: number;
}

/**
 * The withdrawal fee and minimums the backend actually enforces, read from
 * `GET /config`. The bundled numbers are only a fallback while the query is in
 * flight: they used to be the client's own copy, so an admin lowering the
 * minimum or changing the fee left the form validating against stale values and
 * quoting a fee the server no longer charged.
 */
export function useWalletLimits(): WalletLimits {
  const { data } = useGetPublicConfigQuery();

  return {
    // Open until the server says otherwise: while the query is in flight — or
    // against a backend old enough not to publish the flag — locking the screen
    // would hide a working feature, and the 403 still refuses anything real.
    withdrawalsEnabled: data?.wallet?.withdrawalsEnabled ?? true,
    withdrawFeeTon: data?.wallet?.withdrawFeeTon ?? walletConstants.TON_NETWORK_FEE,
    minWithdrawTon: data?.wallet?.minWithdrawTon ?? walletConstants.TON_MIN_WITHDRAW,
    maxWithdrawTon: data?.wallet?.maxWithdrawTon ?? walletConstants.TON_MAX_WITHDRAW,
    withdrawDailyCapTon:
      data?.wallet?.withdrawDailyCapTon ?? walletConstants.TON_WITHDRAW_DAILY_CAP,
    minDepositTon: data?.wallet?.minDepositTon ?? walletConstants.TON_MIN_DEPOSIT,
    minWithdrawLc: data?.wallet?.minWithdrawLc ?? appConfig.wallet.minWithdrawLc,
  };
}
