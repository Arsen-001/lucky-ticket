import { GlobalConstants } from '@/constants/global.constants';
import { mockDb } from '@/mock/backend/db';
import { ticketsMock } from '@/mock/tickets.mock';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { TicketType } from '@/types/types/ticket.types';

const successResponse = () => ({});

const engineTier = (engineId: string): TicketType | null => {
  for (const ticket of ticketsMock.tickets) {
    if (ticket.engines?.some(engine => engine.id === engineId)) return ticket.ticketType;
  }
  // Engines granted after the fixture was built (e.g. the Bronze starter or a
  // market purchase) aren't in the static list — their id embeds the tier.
  const match = /^engine-(bronze|silver|gold|platinum|diamond)/.exec(engineId);
  return (match?.[1] as TicketType) ?? null;
};

// The claim endpoints return the SERVER-decided AP reward (`apGain`) and
// persist it on the shared mock user, so the `me` refetch triggered by the
// mutation's invalidation returns the same balance the frontend just applied.
// The real backend zeroes `apGain` past the daily claim cap; the mock keeps
// dev simple and always awards the tier rate.
const claimResponse = (tier: TicketType | null, claimed: number) => {
  const apGain = tier ? GlobalConstants.apRewards.claimByTier[tier] : 0;
  mockDb.user.activityPoints += apGain;
  return { claimed, apGain };
};

export const enginesMock = {
  'POST engines/claim': (args: FetchArgs) => {
    const { engineId } = (args.body ?? {}) as { engineId?: string };
    return claimResponse(engineId ? engineTier(engineId) : null, 1);
  },
  'POST engines/claim-all': (args: FetchArgs) => {
    const { tier } = (args.body ?? {}) as { tier?: TicketType };
    return claimResponse(tier ?? null, 1);
  },
  'POST engines/instant-claim': successResponse,
  'POST engines/skip': successResponse,
  'POST engines/upgrade-speed': successResponse,
  'POST engines/upgrade-capacity': successResponse,
  'POST engines/complete-cycle': successResponse,
  'POST engines/grant-welcome': successResponse,
};
