import meMock from '@/mock/me.mock';
import { tournamentsMock } from '@/mock/tournaments.mock';
import { ticketsMock } from '@/mock/tickets.mock';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { tasksMock } from '@/mock/tasks.mock';
import { leaderboardMock } from '@/mock/leaderboard.mock';
import { faqMock } from '@/mock/faq.mock';
import { privacyMock } from '@/mock/privacy.mock';
import { notificationsMock } from '@/mock/notifications.mock';
import { notificationPreferencesMock } from '@/mock/notification-preferences.mock';
import { referralMock } from '@/mock/referral.mock';
import { marketMock } from '@/mock/market.mock';
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
import { jackpotMock } from '@/mock/jackpot.mock';
import { promoMock } from '@/mock/promo.mock';
import { partnersMock } from '@/mock/partners.mock';
import { configMock } from '@/mock/config.mock';

const successResponse = () => ({});

const marketMutationHandlers = {
  'POST market/engines/buy': successResponse,
  'POST market/shards/buy': successResponse,
  'POST market/boosters/buy': successResponse,
  'POST market/cosmetics/buy': successResponse,
  'POST market/tickets/buy': successResponse,
  'POST market/statuses/buy': successResponse,
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
  ...leaderboardMock,
  ...faqMock,
  ...privacyMock,
  ...notificationsMock,
  ...notificationPreferencesMock,
  ...referralMock,
  market: marketMock,
  ...marketMutationHandlers,
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
  ...jackpotMock,
  ...promoMock,
  ...partnersMock,
  ...configMock,
} as const;

export type MockData = typeof mockData;
export type MockDataKeys = keyof MockData;
/* eslint-enable */
