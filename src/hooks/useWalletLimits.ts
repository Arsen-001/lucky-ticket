import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';
import { walletConstants } from '@/utils/pages/wallet.utils';

export interface WalletLimits {
  /** Flat fee charged ON TOP of a withdrawal — the recipient gets the amount. */
  withdrawFeeTon: number;
  minWithdrawTon: number;
  /** Ceiling on a single withdrawal — the treasury signs these automatically. */
  maxWithdrawTon: number;
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
    withdrawFeeTon: data?.wallet?.withdrawFeeTon ?? walletConstants.TON_NETWORK_FEE,
    minWithdrawTon: data?.wallet?.minWithdrawTon ?? walletConstants.TON_MIN_WITHDRAW,
    maxWithdrawTon: data?.wallet?.maxWithdrawTon ?? walletConstants.TON_MAX_WITHDRAW,
    minWithdrawLc: data?.wallet?.minWithdrawLc ?? appConfig.wallet.minWithdrawLc,
  };
}
