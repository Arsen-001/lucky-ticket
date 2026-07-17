import dayjs from 'dayjs';
import { api } from '@/api/index.api';
import { configApi } from '@/api/config.api';
import { meApi } from '@/api/me.api';
import { ticketsApi } from '@/api/tickets.api';
import { rtkTags } from '@/constants/rtk-tags';
import { appConfig } from '@/config/app.config';
import { resolveEngineConfig } from '@/hooks/useEngineConfig';
import {
  effectiveCycleSeconds,
  engineCapacity,
  maxBoostLevel,
  promoteEngineIfMaxed,
  type EngineLevelTables,
} from '@/utils/global/ticket-engine.utils';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import { equippedAvatarEngineSpeedPct } from '@/utils/global/avatar.utils';
import { inventoryApi } from '@/api/inventory.api';
import { avatarsApi } from '@/api/avatars.api';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const STARTER_ENGINE_ID = 'engine-bronze-starter';

/**
 * Admin-tunable level tables for the non-React optimistic paths — read from the
 * cached `GET /config` in the store (same resolution as `useEngineConfig`), so
 * the optimistic math matches what the components rendered and what the server
 * will actually do. Falls back to bundled defaults when config isn't loaded.
 */
const levelTablesFromState = (state: unknown): EngineLevelTables =>
  resolveEngineConfig(
    configApi.endpoints.getPublicConfig.select()(
      state as Parameters<ReturnType<typeof configApi.endpoints.getPublicConfig.select>>[0]
    ).data
  ).tables;

// Against the real backend the granted engine gets a server UUID, so the
// optimistic phantom (STARTER_ENGINE_ID) must be reconciled away — otherwise the
// tour's claim hits POST engines/claim with a fake id → 404. In pure mock mode
// the grant isn't persisted, so we keep the optimistic engine (no invalidation).
const IS_REAL_BACKEND = !!process.env.NEXT_PUBLIC_API_URL;

// The free Bronze starter engine, granted once after the onboarding language
// step. Comes with one ready ticket so the tour's claim finale has something to
// collect (DOCS §9 / §17.5).
const buildStarterEngine = (): TicketEngine => {
  const cycleSeconds = appConfig.engines.baseCycleSecondsByTier.bronze;
  return {
    id: STARTER_ENGINE_ID,
    cycleSeconds,
    cycleStartedAt: dayjs().subtract(cycleSeconds, 'second').toISOString(),
    pendingCount: 1,
    engineLevel: 1,
    speedLevel: 0,
    capacityLevel: 0,
  };
};

export const enginesApi = api.injectEndpoints({
  endpoints: builder => ({
    claimEngine: builder.mutation<{ claimed: number }, { engineId: string }>({
      query: body => ({ url: 'engines/claim', method: 'POST', body }),
      // No `tickets` invalidation: the onQueryStarted patch below already writes
      // the claim result (pendingCount→0, balance, cycle restart, lifetime) into
      // the getTickets cache, so a refetch is redundant — and on the real backend
      // it re-fetches EVERY engine with fresh objects, visibly refreshing the
      // whole home slider right after a claim ("renders the full cube"). Claims
      // award no AP (`me` untouched) but advance tasks/achievements — those get
      // their own tags, which don't touch the slider.
      invalidatesTags: [rtkTags.engines, rtkTags.tasks, rtkTags.achievements],
      async onQueryStarted({ engineId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (engine && engine.pendingCount > 0) {
                ticket.count = (ticket.count ?? 0) + engine.pendingCount;
                engine.lifetimeProduced = (engine.lifetimeProduced ?? 0) + engine.pendingCount;
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
      // No `tickets` invalidation (see claimEngine): the patch below fully updates
      // the getTickets cache, so the refetch is redundant and would refresh every
      // cube in the slider. tasks/achievements have their own tags.
      invalidatesTags: [rtkTags.engines, rtkTags.tasks, rtkTags.achievements],
      async onQueryStarted({ tier }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            const ticket = draft.find(item => item.ticketType === tier);
            if (!ticket?.engines) return;
            let total = 0;
            for (const engine of ticket.engines) {
              if (engine.pendingCount > 0) {
                total += engine.pendingCount;
                engine.lifetimeProduced = (engine.lifetimeProduced ?? 0) + engine.pendingCount;
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
      // No `tickets` invalidation (see claimEngine): the patch below fully updates
      // the getTickets cache, so the refetch is redundant and would refresh every
      // cube in the slider. me/tasks/achievements have their own tags.
      invalidatesTags: [rtkTags.engines, rtkTags.me, rtkTags.tasks, rtkTags.achievements],
      async onQueryStarted({ engineId, cost }, { dispatch, queryFulfilled, getState }) {
        const inventory = inventoryApi.endpoints.getInventory.select()(
          getState() as Parameters<ReturnType<typeof inventoryApi.endpoints.getInventory.select>>[0]
        ).data;
        const tables = levelTablesFromState(getState());
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
                  : engineCapacity(engine, { capacityChip, capacityBooster, tables });
              ticket.count = (ticket.count ?? 0) + claimAmount;
              engine.lifetimeProduced = (engine.lifetimeProduced ?? 0) + claimAmount;
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
      // No `tickets` invalidation: the onQueryStarted patch below already writes
      // the new level into the getTickets cache, so a full refetch is redundant —
      // and it would re-fetch EVERY engine, visibly refreshing the neighbouring
      // cubes on the home slider. Only stars (me) is reconciled.
      invalidatesTags: [rtkTags.engines, rtkTags.me],
      async onQueryStarted({ engineId, cost }, { dispatch, queryFulfilled, getState }) {
        const tables = levelTablesFromState(getState());
        const ticketsPatch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (!engine) continue;
              const next = {
                ...engine,
                speedLevel: Math.min(maxBoostLevel(tables), (engine.speedLevel ?? 0) + 1),
              };
              const promoted = promoteEngineIfMaxed(next, tables);
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
      // See upgrade-speed: the optimistic patch keeps the cache correct, so we
      // skip the all-engines `tickets` refetch that flickers neighbouring cubes.
      invalidatesTags: [rtkTags.engines, rtkTags.me],
      async onQueryStarted({ engineId, cost }, { dispatch, queryFulfilled, getState }) {
        const tables = levelTablesFromState(getState());
        const ticketsPatch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (!engine) continue;
              const next = {
                ...engine,
                capacityLevel: Math.min(maxBoostLevel(tables), (engine.capacityLevel ?? 0) + 1),
              };
              const promoted = promoteEngineIfMaxed(next, tables);
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

    // Pay stars to skip the remaining cycle → engine becomes ready (button turns
    // into "Claim"); the actual claim (and its AP) happens when the user taps Claim.
    skipEngineCycle: builder.mutation<
      { skipped: boolean; cost: number },
      { engineId: string; cost: number }
    >({
      query: ({ engineId }) => ({ url: 'engines/skip', method: 'POST', body: { engineId } }),
      // See upgrade-speed: fill pendingCount in the cache optimistically (below)
      // instead of refetching EVERY engine, which visibly refreshes the
      // neighbouring cubes on the home slider. Only stars (me) is reconciled.
      invalidatesTags: [rtkTags.engines, rtkTags.me],
      async onQueryStarted({ engineId, cost }, { dispatch, queryFulfilled, getState }) {
        const inventory = inventoryApi.endpoints.getInventory.select()(
          getState() as Parameters<ReturnType<typeof inventoryApi.endpoints.getInventory.select>>[0]
        ).data;
        const tables = levelTablesFromState(getState());
        const ticketsPatch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (!engine || engine.pendingCount > 0) continue;
              const capacityChip = findEquippedChip(inventory?.chips, engineId, 'capacity');
              const capacityBooster = findActiveBooster(inventory?.boosters, engineId, 'capacity');
              engine.pendingCount = engineCapacity(engine, {
                capacityChip,
                capacityBooster,
                tables,
              });
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
      // No `tickets` invalidation: the onQueryStarted patch below fills
      // pendingCount in the cache with the same math the server runs, so the
      // all-engines refetch was pure churn — every engine finishing a cycle
      // used to re-fetch (and visibly refresh) every other cube on screen.
      invalidatesTags: [rtkTags.engines],
      async onQueryStarted({ engineId }, { dispatch, queryFulfilled, getState }) {
        const inventory = inventoryApi.endpoints.getInventory.select()(
          getState() as Parameters<ReturnType<typeof inventoryApi.endpoints.getInventory.select>>[0]
        ).data;
        // Status (VIP > LP) speed boost must be applied to the *actual*
        // production cycle, not just the UI — otherwise the engine shows a
        // shorter (boosted) cycle but never mints faster (DOCS §7.3 / §9.7).
        const me = meApi.endpoints.getMe.select()(
          getState() as Parameters<ReturnType<typeof meApi.endpoints.getMe.select>>[0]
        ).data;
        // The equipped avatar's engine-speed boost is permanent-while-equipped,
        // so it must move the real production cycle too (DOCS §9.7) — not just
        // the UI — exactly like the status boost above.
        const avatars = avatarsApi.endpoints.getAvatarInventory.select()(
          getState() as Parameters<
            ReturnType<typeof avatarsApi.endpoints.getAvatarInventory.select>
          >[0]
        ).data;
        const avatarSpeedPct = equippedAvatarEngineSpeedPct(avatars, me?.avatarId);
        const tables = levelTablesFromState(getState());
        const patch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (!engine || engine.pendingCount > 0) continue;
              const speedChip = findEquippedChip(inventory?.chips, engineId, 'speed');
              const speedBooster = findActiveBooster(inventory?.boosters, engineId, 'speed');
              const capacityChip = findEquippedChip(inventory?.chips, engineId, 'capacity');
              const capacityBooster = findActiveBooster(inventory?.boosters, engineId, 'capacity');
              const cycle = effectiveCycleSeconds(engine, {
                speedChip,
                speedBooster,
                isLuckyPlayer: me?.isLuckyPlayer ?? false,
                isVip: me?.isVIP ?? false,
                avatarBoostPct: avatarSpeedPct,
                tables,
              });
              const elapsed = dayjs().diff(dayjs(engine.cycleStartedAt), 'second');
              if (elapsed >= cycle) {
                engine.pendingCount = engineCapacity(engine, {
                  capacityChip,
                  capacityBooster,
                  tables,
                });
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

    // Grants the brand-new account's welcome pack — fired once when the player
    // claims it after the onboarding language step: a free Bronze engine (with
    // one ready ticket for the tour's claim finale), a starter Bronze-ticket
    // balance, and a first activity point. Idempotent (keyed on the starter
    // engine) and does not invalidate the tickets tag, so the grant persists.
    grantWelcomePack: builder.mutation<void, void>({
      query: () => ({ url: 'engines/grant-welcome', method: 'POST' }),
      // On the real backend, refetch tickets/me so the server's real UUID engine
      // replaces the optimistic phantom (so the tour's claim targets a valid id).
      invalidatesTags: IS_REAL_BACKEND ? [rtkTags.tickets, rtkTags.me] : [],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        const tickets = ticketsApi.endpoints.getTickets.select()(
          getState() as Parameters<ReturnType<typeof ticketsApi.endpoints.getTickets.select>>[0]
        ).data;
        const alreadyGranted = tickets?.some(ticket =>
          ticket.engines?.some(engine => engine.id === STARTER_ENGINE_ID)
        );
        if (alreadyGranted) return;

        const { bronzeTickets, activityPoints } = appConfig.onboardingTour.welcomePack;
        const ticketsPatch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            const bronze = draft.find(ticket => ticket.ticketType === 'bronze');
            if (!bronze) return;
            bronze.engines = [...(bronze.engines ?? []), buildStarterEngine()];
            bronze.count = (bronze.count ?? 0) + bronzeTickets;
          })
        );
        const mePatch = dispatch(
          meApi.util.updateQueryData('getMe', undefined, draft => {
            draft.activityPoints += activityPoints;
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
  }),
});

export const {
  useClaimEngineMutation,
  useClaimEnginesForTierMutation,
  useInstantClaimEngineMutation,
  useSkipEngineCycleMutation,
  useUpgradeEngineSpeedMutation,
  useUpgradeEngineCapacityMutation,
  useCompleteEngineCycleMutation,
  useGrantWelcomePackMutation,
} = enginesApi;
