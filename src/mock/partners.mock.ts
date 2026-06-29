import { mockDb } from '@/mock/backend/db';
import type { PartnerStats } from '@/types/interfaces/partners.interfaces';

/**
 * The advertiser cabinet (DOCS §11.8) manages sponsored tournaments, which live
 * in the tournaments catalog (`tournaments.mock`). The only partner-specific
 * state left here is the advertiser's TON balance — debited when a tournament
 * is created (`createSponsoredTournament`) and read by the dashboard.
 */
const advertiser = mockDb.advertiser;

export const partnersMock = {
  'GET partners/stats': (): PartnerStats => ({ balanceTon: advertiser.balanceTon }),
};
