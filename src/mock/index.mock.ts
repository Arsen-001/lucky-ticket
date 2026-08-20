import meMock from '@/mock/me.mock';
import { tournamentsMock } from '@/mock/tournaments.mock';
import { ticketsMock } from '@/mock/tickets.mock';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { tasksMock } from '@/mock/tasks.mock';
import { testQuestMock } from '@/mock/testQuest.mock';
import { leaderboardMock } from '@/mock/leaderboard.mock';
import { faqMock } from '@/mock/faq.mock';
import { privacyMock } from '@/mock/privacy.mock';
import { termsMock } from '@/mock/terms.mock';
import { notificationsMock } from '@/mock/notifications.mock';
import { notificationPreferencesMock } from '@/mock/notification-preferences.mock';
import { referralMock } from '@/mock/referral.mock';
import { rouletteMock } from '@/mock/roulette.mock';
import { duelMock } from '@/mock/duel.mock';
import { marketMock, marketSavingsMock } from '@/mock/market.mock';
import { giftsMock } from '@/mock/gifts.mock';
import { stakesMock } from '@/mock/stakes.mock';
import { walletMock } from '@/mock/wallet.mock';
import { lcMock } from '@/mock/lc.mock';
import { starsMock } from '@/mock/stars.mock';
import { achievementsMock } from '@/mock/achievements.mock';
import { profileMock, ownProfile, buildAccountOverlay } from '@/mock/profile.mock';
import { pinState } from '@/mock/pin-state.mock';
import type {
  PinAchievementRequest,
  UnpinAchievementRequest,
} from '@/types/interfaces/achievement.interfaces';
import { inventoryMock } from '@/mock/inventory.mock';
import { enginesMock } from '@/mock/engines.mock';
import { avatarsMock } from '@/mock/avatars.mock';
import { statusGiftMock } from '@/mock/statusGift.mock';
import { jackpotMock } from '@/mock/jackpot.mock';
import { promoMock } from '@/mock/promo.mock';
import { partnersMock } from '@/mock/partners.mock';
import { configMock } from '@/mock/config.mock';
import { authMock } from '@/mock/auth.mock';
import { chargeMockUser } from '@/mock/backend/charge';
import { MarketPriceType } from '@/types/enums/market.enums';

/** Every catalog item, whatever shelf it sits on — purchases arrive by id. */
const marketCatalog = () => [
  ...marketMock.engines,
  ...marketMock.tickets,
  ...marketMock.shards,
  ...marketMock.cosmetics,
  ...marketMock.statuses,
];

/**
 * Take what the item costs off the shared mock player, so the balance screens
 * have something to refresh TO. Without it every buy answered `{}` and the /lc,
 * /stars and /wallet refetches came back with the pre-purchase number — see
 * `chargeMockUser`.
 */
const buyFromCatalog = (itemId?: string) => (args: FetchArgs) => {
  const body = (args.body ?? {}) as {
    priceType?: MarketPriceType;
    /** Tickets: units in the order. */
    count?: number;
    /** Shards: bundles in the order. */
    quantity?: number;
  } & Record<string, unknown>;
  const id =
    itemId ??
    (body.engineId as string) ??
    (body.shardId as string) ??
    (body.cosmeticId as string) ??
    (body.statusId as string);
  const item = marketCatalog().find(entry => entry.id === id);
  const price = item?.prices.find(p => p.type === (body.priceType ?? MarketPriceType.LC));
  if (price) {
    const total = price.amount * Math.max(1, Math.trunc(body.quantity ?? body.count ?? 1));
    chargeMockUser({
      lc: price.type === MarketPriceType.LC ? total : 0,
      stars: price.type === MarketPriceType.TELEGRAM_STARS ? total : 0,
      description: `Market: ${item?.name ?? id}`,
      sourceId: id,
    });
  }
  return {};
};

const marketMutationHandlers = {
  'POST market/engines/buy': buyFromCatalog(),
  'POST market/shards/buy': buyFromCatalog(),
  'POST market/cosmetics/buy': buyFromCatalog(),
  'POST market/statuses/buy': buyFromCatalog(),
  // Tickets alone are bought per id — `market/tickets/:ticketId/buy`, matching
  // the backend route — so a single static key never matches and every ticket
  // purchase in dev died on a 404 toast. The resolver has no wildcards, so the
  // keys are generated from the catalog and stay in sync with it.
  ...Object.fromEntries(
    marketMock.tickets.map(ticket => [
      `POST market/tickets/${ticket.id}/buy`,
      buyFromCatalog(ticket.id),
    ])
  ),
};

/**
 * Type for functional mock handlers.
 * Allows dynamic data generation based on request arguments.
 */
/* eslint-disable */
export type MockHandler<T = any> = (args: FetchArgs) => T | Promise<T>;

/**
 * Union type for mock values, allowing either static data or a functional handler.
 */
export type MockValue<T = any> = T | MockHandler<T> | { data: T } | { error: any };
const pinHandlers = {
  'GET achievements': () => {
    const achs = pinState.getAchievementsWithPins();
    return { total: achs.length, earned: achs.filter(a => a.earned).length, achievements: achs };
  },
  'GET profile/me': () => ({
    ...ownProfile,
    ...buildAccountOverlay(),
    pinnedAchievements: pinState.getPinnedAchievements(),
  }),
  'POST profile/showcase/pin': (args: FetchArgs) => {
    const body = args.body as PinAchievementRequest;
    pinState.pin(body.achievementId, body.slot);
    return {
      ...ownProfile,
      ...buildAccountOverlay(),
      pinnedAchievements: pinState.getPinnedAchievements(),
    };
  },
  'POST profile/showcase/unpin': (args: FetchArgs) => {
    const body = args.body as UnpinAchievementRequest;
    pinState.unpin(body.slot);
    return {
      ...ownProfile,
      ...buildAccountOverlay(),
      pinnedAchievements: pinState.getPinnedAchievements(),
    };
  },
};

export const mockData = {
  ...meMock,
  ...tournamentsMock,
  ...ticketsMock,
  ...tasksMock,
  ...testQuestMock,
  ...leaderboardMock,
  ...faqMock,
  ...privacyMock,
  ...termsMock,
  ...notificationsMock,
  ...notificationPreferencesMock,
  ...referralMock,
  ...rouletteMock,
  ...duelMock,
  market: marketMock,
  'market/savings': marketSavingsMock,
  ...marketMutationHandlers,
  ...giftsMock,
  ...stakesMock,
  ...walletMock,
  ...lcMock,
  ...starsMock,
  ...achievementsMock,
  ...profileMock,
  ...pinHandlers,
  ...inventoryMock,
  ...enginesMock,
  ...avatarsMock,
  ...statusGiftMock,
  ...jackpotMock,
  ...promoMock,
  ...partnersMock,
  ...configMock,
  ...authMock,
} as const;

export type MockData = typeof mockData;
export type MockDataKeys = keyof MockData;
/* eslint-enable */
