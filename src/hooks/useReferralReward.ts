import { useGetPublicConfigQuery } from '@/api/config.api';
import { GlobalConstants } from '@/constants/global.constants';

/**
 * The ongoing referral reward, as the screen states it: a flat % of the LC a
 * referred friend wins in a tournament (DOCS §17.2).
 *
 * Read from `GET /config` so an admin retune reaches the copy without a
 * deploy, falling back to the bundled constant while loading or on an older
 * backend. The backend stays authoritative on what actually accrues — this is
 * the promise, not the payment.
 */
export function useReferralTournamentPct(): number {
  const { data } = useGetPublicConfigQuery();
  return data?.referral?.tournamentLcPct ?? GlobalConstants.referralTournamentLcPercentage;
}
