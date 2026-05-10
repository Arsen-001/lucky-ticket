import dayjs from 'dayjs';
import { api } from '@/api/index.api';
import { meApi } from '@/api/me.api';
import { ticketsApi } from '@/api/tickets.api';
import { rtkTags } from '@/constants/rtk-tags';
import {
  MAX_BOOST_LEVEL,
  effectiveCycleSeconds,
  engineCapacity,
  isEngineMaxed,
} from '@/utils/global/ticket-engine.utils';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import { inventoryApi } from '@/api/inventory.api';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const promoteIfMaxed = (engine: TicketEngine): TicketEngine => {
  if (isEngineMaxed(engine)) {
    return {
      ...engine,
      engineLevel: (engine.engineLevel ?? 1) + 1,
      speedLevel: 0,
      capacityLevel: 0,
    };
  }
  return engine;
};

export const enginesApi = api.injectEndpoints({
  endpoints: builder => ({
    claimEngine: builder.mutation<{ claimed: number }, { engineId: string }>({
      query: body => ({ url: 'engines/claim', method: 'POST', body }),
      invalidatesTags: [rtkTags.engines],
      async onQueryStarted({ engineId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (engine && engine.pendingCount > 0) {
                ticket.count = (ticket.count ?? 0) + engine.pendingCount;
                engine.pendingCount = 0;
                engine.cycleStartedAt = dayjs().toISOString();
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    claimEnginesForTier: builder.mutation<{ claimed: number }, { tier: TicketType }>({
      query: body => ({ url: 'engines/claim-all', method: 'POST', body }),
      invalidatesTags: [rtkTags.engines],
      async onQueryStarted({ tier }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            const ticket = draft.find(item => item.ticketType === tier);
            if (!ticket?.engines) return;
            let total = 0;
            for (const engine of ticket.engines) {
              if (engine.pendingCount > 0) {
                total += engine.pendingCount;
                engine.pendingCount = 0;
                engine.cycleStartedAt = dayjs().toISOString();
              }
            }
            ticket.count = (ticket.count ?? 0) + total;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    instantClaimEngine: builder.mutation<
      { claimed: number; cost: number },
      { engineId: string; cost: number }
    >({
      query: body => ({ url: 'engines/instant-claim', method: 'POST', body }),
      invalidatesTags: [rtkTags.engines, rtkTags.me],
      async onQueryStarted({ engineId, cost }, { dispatch, queryFulfilled, getState }) {
        const inventory = inventoryApi.endpoints.getInventory.select()(
          getState() as Parameters<ReturnType<typeof inventoryApi.endpoints.getInventory.select>>[0]
        ).data;
        const ticketsPatch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (!engine) continue;
              const capacityChip = findEquippedChip(inventory?.chips, engineId, 'capacity');
              const capacityBooster = findActiveBooster(inventory?.boosters, engineId, 'capacity');
              const claimAmount =
                engine.pendingCount > 0
                  ? engine.pendingCount
                  : engineCapacity(engine, { capacityChip, capacityBooster });
              ticket.count = (ticket.count ?? 0) + claimAmount;
              engine.pendingCount = 0;
              engine.cycleStartedAt = dayjs().toISOString();
            }
          })
        );
        const mePatch = dispatch(
          meApi.util.updateQueryData('getMe', undefined, draft => {
            draft.telegramStars = Math.max(0, draft.telegramStars - cost);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          ticketsPatch.undo();
          mePatch.undo();
        }
      },
    }),

    upgradeEngineSpeed: builder.mutation<void, { engineId: string; cost: number }>({
      query: body => ({ url: 'engines/upgrade-speed', method: 'POST', body }),
      invalidatesTags: [rtkTags.engines, rtkTags.me],
      async onQueryStarted({ engineId, cost }, { dispatch, queryFulfilled }) {
        const ticketsPatch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (!engine) continue;
              const next = {
                ...engine,
                speedLevel: Math.min(MAX_BOOST_LEVEL, (engine.speedLevel ?? 0) + 1),
              };
              const promoted = promoteIfMaxed(next);
              Object.assign(engine, promoted);
            }
          })
        );
        const mePatch = dispatch(
          meApi.util.updateQueryData('getMe', undefined, draft => {
            draft.telegramStars = Math.max(0, draft.telegramStars - cost);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          ticketsPatch.undo();
          mePatch.undo();
        }
      },
    }),

    upgradeEngineCapacity: builder.mutation<void, { engineId: string; cost: number }>({
      query: body => ({ url: 'engines/upgrade-capacity', method: 'POST', body }),
      invalidatesTags: [rtkTags.engines, rtkTags.me],
      async onQueryStarted({ engineId, cost }, { dispatch, queryFulfilled }) {
        const ticketsPatch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (!engine) continue;
              const next = {
                ...engine,
                capacityLevel: Math.min(MAX_BOOST_LEVEL, (engine.capacityLevel ?? 0) + 1),
              };
              const promoted = promoteIfMaxed(next);
              Object.assign(engine, promoted);
            }
          })
        );
        const mePatch = dispatch(
          meApi.util.updateQueryData('getMe', undefined, draft => {
            draft.telegramStars = Math.max(0, draft.telegramStars - cost);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          ticketsPatch.undo();
          mePatch.undo();
        }
      },
    }),

    completeEngineCycle: builder.mutation<void, { engineId: string }>({
      query: body => ({ url: 'engines/complete-cycle', method: 'POST', body }),
      async onQueryStarted({ engineId }, { dispatch, queryFulfilled, getState }) {
        const inventory = inventoryApi.endpoints.getInventory.select()(
          getState() as Parameters<ReturnType<typeof inventoryApi.endpoints.getInventory.select>>[0]
        ).data;
        const patch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (!engine || engine.pendingCount > 0) continue;
              const speedChip = findEquippedChip(inventory?.chips, engineId, 'speed');
              const speedBooster = findActiveBooster(inventory?.boosters, engineId, 'speed');
              const capacityChip = findEquippedChip(inventory?.chips, engineId, 'capacity');
              const capacityBooster = findActiveBooster(inventory?.boosters, engineId, 'capacity');
              const cycle = effectiveCycleSeconds(engine, { speedChip, speedBooster });
              const elapsed = dayjs().diff(dayjs(engine.cycleStartedAt), 'second');
              if (elapsed >= cycle) {
                engine.pendingCount = engineCapacity(engine, { capacityChip, capacityBooster });
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useClaimEngineMutation,
  useClaimEnginesForTierMutation,
  useInstantClaimEngineMutation,
  useUpgradeEngineSpeedMutation,
  useUpgradeEngineCapacityMutation,
  useCompleteEngineCycleMutation,
} = enginesApi;
