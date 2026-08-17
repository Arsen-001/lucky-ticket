import dayjs from 'dayjs';
import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { configApi } from '@/api/config.api';
import { meApi } from '@/api/me.api';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import { ticketsApi } from '@/api/tickets.api';
import { rtkTags } from '@/constants/rtk-tags';
import { appConfig } from '@/config/app.config';
import { resolveEngineConfig } from '@/hooks/useEngineConfig';
import {
  distributeClaimShortfall,
  effectiveCycleSeconds,
  engineCapacity,
  maxBoostLevel,
  promoteEngineIfMaxed,
  resolveClaimedCount,
  type DrainedEngine,
  type EngineLevelTables,
} from '@/utils/global/ticket-engine.utils';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
// AVATARS OFF (2026-08-09) — see the `avatarSpeedPct` note below.
// import { equippedAvatarEngineSpeedPct } from '@/utils/global/avatar.utils';
import { testBadgeCapacityTickets, testBadgeSpeedBoostPct } from '@/utils/global/testQuest.utils';
import { inventoryApi } from '@/api/inventory.api';
// AVATARS OFF — import { avatarsApi } from '@/api/avatars.api';
import { testQuestApi } from '@/api/testQuest.api';
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

/**
 * `queryFulfilled` rejected with the server's 409 — engines.service `upgrade()`
 * lost its level CAS to a concurrent upgrade of the same engine (another
 * device, or a second tap that slipped past the in-flight guard). The
 * optimistic undo below puts the PRE-tap levels back, but the server's are
 * one step further — the one refetch of the tickets that is worth the cube
 * flicker, because without it the next tap prices and patches from a lie.
 */
const isUpgradeConflict = (reason: unknown): boolean =>
  (reason as { error?: { status?: unknown } } | null | undefined)?.error?.status === 409;

// The free Bronze starter engine, granted once after the onboarding language
// step. Comes with one ready ticket so the tour's claim finale has something to
// collect (DOCS §9 / §17.5).
const buildStarterEngine = (): TicketEngine => {
  const cycleSeconds = appConfig.engines.baseCycleSecondsByTier.bronze;
  return {
    id: STARTER_ENGINE_ID,
    // Named rather than implied: every engine carries its tier since 17.08.2026,
    // and `engineCapacity` reads it to decide the crown's bronze-only prize.
    tier: 'bronze',
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
    // `claimed` is OPTIONAL on purpose: it is the number the UI reports back to
    // the player, and the mock cannot know it (it holds no engine state), so the
    // type must force every caller through the local-total fallback in
    // `resolveClaimedCount` rather than trusting a field that may be absent.
    claimEngine: builder.mutation<{ claimed?: number }, { engineId: string }>({
      query: body => ({ url: 'engines/claim', method: 'POST', body }),
      // No `tickets` invalidation: the onQueryStarted patch below already writes
      // the claim result (pendingCount→0, balance, cycle restart, lifetime) into
      // the getTickets cache, so a refetch is redundant — and on the real backend
      // it re-fetches EVERY engine with fresh objects, visibly refreshing the
      // whole home slider right after a claim ("renders the full cube"). Claims
      // award no AP (`me` untouched) but advance tasks/achievements — those get
      // their own tags, which don't touch the slider.
      invalidatesTags: [rtkTags.tasks, rtkTags.achievements],
      async onQueryStarted({ engineId }, { dispatch, queryFulfilled }) {
        // Recorded from inside the recipe (immer runs it synchronously during
        // the dispatch) so the reconciliation below knows what was predicted.
        let predicted = 0;
        const patch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            for (const ticket of draft) {
              const engine = ticket.engines?.find(item => item.id === engineId);
              if (engine && engine.pendingCount > 0) {
                predicted = engine.pendingCount;
                ticket.count = (ticket.count ?? 0) + engine.pendingCount;
                engine.lifetimeProduced = (engine.lifetimeProduced ?? 0) + engine.pendingCount;
                engine.pendingCount = 0;
                engine.cycleStartedAt = dayjs().toISOString();
              }
            }
          })
        );
        try {
          const { data } = await queryFulfilled;
          // Settle the prediction against the server's own count. Nothing else
          // will: these mutations skip the `tickets` invalidation on purpose, so
          // an over-predicted inventory number would otherwise just stay on
          // screen. A matching response dispatches nothing.
          const delta = resolveClaimedCount(data, predicted) - predicted;
          if (delta !== 0) {
            dispatch(
              ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
                for (const ticket of draft) {
                  const engine = ticket.engines?.find(item => item.id === engineId);
                  if (!engine) continue;
                  ticket.count = Math.max(0, (ticket.count ?? 0) + delta);
                  engine.lifetimeProduced = Math.max(0, (engine.lifetimeProduced ?? 0) + delta);
                }
              })
            );
          }
        } catch {
          patch.undo();
        }
      },
    }),

    // See claimEngine — `claimed` optional for the same reason.
    claimEnginesForTier: builder.mutation<{ claimed?: number }, { tier: TicketType }>({
      query: body => ({ url: 'engines/claim-all', method: 'POST', body }),
      // No `tickets` invalidation (see claimEngine): the patch below fully updates
      // the getTickets cache, so the refetch is redundant and would refresh every
      // cube in the slider. tasks/achievements have their own tags.
      invalidatesTags: [rtkTags.tasks, rtkTags.achievements],
      async onQueryStarted({ tier }, { dispatch, queryFulfilled }) {
        // See claimEngine — filled synchronously by the recipe below. `drained`
        // keeps each engine's predicted share so a shortfall can be given back
        // without inventing per-engine numbers the response never carried.
        let predicted = 0;
        const drained: DrainedEngine[] = [];
        const patch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            const ticket = draft.find(item => item.ticketType === tier);
            if (!ticket?.engines) return;
            let total = 0;
            for (const engine of ticket.engines) {
              if (engine.pendingCount > 0) {
                total += engine.pendingCount;
                drained.push({ engineId: engine.id, amount: engine.pendingCount });
                engine.lifetimeProduced = (engine.lifetimeProduced ?? 0) + engine.pendingCount;
                engine.pendingCount = 0;
                engine.cycleStartedAt = dayjs().toISOString();
              }
            }
            ticket.count = (ticket.count ?? 0) + total;
            predicted = total;
          })
        );
        try {
          const { data } = await queryFulfilled;
          // See claimEngine: without this the tier's inventory keeps whatever the
          // prediction guessed, forever.
          const delta = resolveClaimedCount(data, predicted) - predicted;
          if (delta !== 0) {
            dispatch(
              ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
                const ticket = draft.find(item => item.ticketType === tier);
                if (!ticket) return;
                ticket.count = Math.max(0, (ticket.count ?? 0) + delta);
                // Only a shortfall is attributable: a surplus (the cache sat a
                // cycle behind the server) has no engine to credit, so that
                // lifetime lands on the next refetch instead of being guessed.
                const giveback = distributeClaimShortfall(drained, -delta);
                for (const engine of ticket.engines ?? []) {
                  const back = giveback.get(engine.id);
                  if (back) {
                    engine.lifetimeProduced = Math.max(0, (engine.lifetimeProduced ?? 0) - back);
                  }
                }
              })
            );
          }
        } catch {
          patch.undo();
        }
      },
    }),

    // Optional for the reason spelled out on claimEngine — and here the mock was
    // already contradicting the old non-optional type: `engines/instant-claim`
    // answers a bare `{}`.
    instantClaimEngine: builder.mutation<
      { claimed?: number; cost?: number },
      { engineId: string; cost: number }
    >({
      query: body => ({ url: 'engines/instant-claim', method: 'POST', body }),
      // No `tickets` invalidation (see claimEngine): the patch below fully updates
      // the getTickets cache, so the refetch is redundant and would refresh every
      // cube in the slider. me/tasks/achievements have their own tags.
      //
      // The star charge is a real debit with a ledger row behind it, so the whole
      // Stars group refreshes — `me` alone left /stars and the wallet quoting the
      // pre-skip balance.
      invalidatesTags: [...balanceTags.stars, rtkTags.tasks, rtkTags.achievements],
      async onQueryStarted({ engineId, cost }, { dispatch, queryFulfilled, getState }) {
        const inventory = inventoryApi.endpoints.getInventory.select()(
          getState() as Parameters<ReturnType<typeof inventoryApi.endpoints.getInventory.select>>[0]
        ).data;
        const tables = levelTablesFromState(getState());
        // The Test-Quest crown's permanent capacity tickets are part of that
        // batch on the server, so they are part of it here too.
        const badgeCapacity = testBadgeCapacityTickets(
          testQuestApi.endpoints.getTestQuest.select()(
            getState() as Parameters<
              ReturnType<typeof testQuestApi.endpoints.getTestQuest.select>
            >[0]
          ).data?.badgeLevel
        );
        // The boldest prediction of the three claim paths: with nothing pending
        // it invents a whole batch from `engineCapacity` — client-side math over
        // chips, boosters, the badge prize and admin-tunable tables — instead of
        // summing counts the server already sent. Most likely of the three to
        // need the reconciliation below, and it is a PAID action, so a wrong
        // ticket count sits next to a real star charge.
        let predicted = 0;
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
                  : engineCapacity(engine, {
                      capacityChip,
                      capacityBooster,
                      badgeCapacityTickets: badgeCapacity,
                      tables,
                    });
              predicted = claimAmount;
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
          const { data } = await queryFulfilled;
          // See claimEngine. Stars need no such pass — `me` is invalidated above,
          // so the real balance arrives with the refetch; only the tickets cache
          // is left to the prediction.
          const delta = resolveClaimedCount(data, predicted) - predicted;
          if (delta !== 0) {
            dispatch(
              ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
                for (const ticket of draft) {
                  const engine = ticket.engines?.find(item => item.id === engineId);
                  if (!engine) continue;
                  ticket.count = Math.max(0, (ticket.count ?? 0) + delta);
                  engine.lifetimeProduced = Math.max(0, (engine.lifetimeProduced ?? 0) + delta);
                }
              })
            );
          }
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
      // cubes on the home slider. Only the Stars balance is reconciled — but all
      // of its surfaces, not just the header pill.
      invalidatesTags: [...balanceTags.stars],
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
          // Writes an ENGINE_UPGRADE Stars row, which is what the test-quest's
          // «прокачай двигатель N раз» step counts.
          refetchTestQuestProgress(dispatch);
        } catch (reason) {
          ticketsPatch.undo();
          mePatch.undo();
          if (isUpgradeConflict(reason)) dispatch(api.util.invalidateTags([rtkTags.tickets]));
        }
      },
    }),

    upgradeEngineCapacity: builder.mutation<void, { engineId: string; cost: number }>({
      query: body => ({ url: 'engines/upgrade-capacity', method: 'POST', body }),
      // See upgrade-speed: the optimistic patch keeps the cache correct, so we
      // skip the all-engines `tickets` refetch that flickers neighbouring cubes.
      invalidatesTags: [...balanceTags.stars],
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
          // See upgrade-speed: the same ENGINE_UPGRADE row, the same quest step.
          refetchTestQuestProgress(dispatch);
        } catch (reason) {
          ticketsPatch.undo();
          mePatch.undo();
          if (isUpgradeConflict(reason)) dispatch(api.util.invalidateTags([rtkTags.tickets]));
        }
      },
    }),

    completeEngineCycle: builder.mutation<void, { engineId: string }>({
      query: body => ({ url: 'engines/complete-cycle', method: 'POST', body }),
      // No `tickets` invalidation: the onQueryStarted patch below fills
      // pendingCount in the cache with the same math the server runs, so the
      // all-engines refetch was pure churn — every engine finishing a cycle
      // used to re-fetch (and visibly refresh) every other cube on screen.
      // No invalidation: engines live inside the `getTickets` payload, which the
      // patch below updates in place. Refetching it here is what the patches
      // exist to avoid — an invalidation reloads the tickets screen into
      // skeletons every time an engine finishes a cycle.
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
        //
        // AVATARS OFF (2026-08-09) — the avatar cosmetics feature is switched
        // off for ~2 months, not removed. This is the non-React twin of
        // `useEngineSpeedAvatarBoostPct`; both are pinned to 0 together, and the
        // same caveat applies (the backend still boosts an owner's real cycle).
        const avatarSpeedPct = 0;
        // const avatars = avatarsApi.endpoints.getAvatarInventory.select()(
        //   getState() as Parameters<
        //     ReturnType<typeof avatarsApi.endpoints.getAvatarInventory.select>
        //   >[0]
        // ).data;
        // const avatarSpeedPct = equippedAvatarEngineSpeedPct(avatars, me?.avatarId);
        // The frozen Test-Quest badge's engine-speed boost is permanent too, and
        // the backend applies it to the real cycle (computeEngineState) — so the
        // optimistic completion math must match, or a badge holder's engine shows
        // a longer cycle than the server mints and skip/instant costs drift.
        const testQuest = testQuestApi.endpoints.getTestQuest.select()(
          getState() as Parameters<ReturnType<typeof testQuestApi.endpoints.getTestQuest.select>>[0]
        ).data;
        const badgeSpeedPct = testBadgeSpeedBoostPct(testQuest?.badgeLevel);
        // Its capacity half travels with it: the crown's permanent tickets grow
        // the batch the server mints, and — one ticket costing one tier cycle —
        // the cycle this loop is deciding against.
        const badgeCapacity = testBadgeCapacityTickets(testQuest?.badgeLevel);
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
                capacityChip,
                capacityBooster,
                isLuckyPlayer: me?.isLuckyPlayer ?? false,
                perks: me?.statusPerks,
                isVip: me?.isVIP ?? false,
                avatarBoostPct: avatarSpeedPct,
                badgeBoostPct: badgeSpeedPct,
                badgeCapacityTickets: badgeCapacity,
                tables,
              });
              const elapsed = dayjs().diff(dayjs(engine.cycleStartedAt), 'second');
              if (elapsed >= cycle) {
                engine.pendingCount = engineCapacity(engine, {
                  capacityChip,
                  capacityBooster,
                  badgeCapacityTickets: badgeCapacity,
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
  useUpgradeEngineSpeedMutation,
  useUpgradeEngineCapacityMutation,
  useCompleteEngineCycleMutation,
  useGrantWelcomePackMutation,
} = enginesApi;
