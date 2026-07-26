import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  AvatarDailyRewardState,
  ClaimAvatarDailyRewardResponse,
  UserAvatar,
} from '@/types/interfaces/avatars.interfaces';

export const avatarsApi = api.injectEndpoints({
  endpoints: builder => ({
    getAvatarInventory: builder.query<UserAvatar[], void>({
      query: () => ({ url: 'avatars' }),
      providesTags: [rtkTags.avatars],
    }),

    getAvatarDailyReward: builder.query<AvatarDailyRewardState, void>({
      query: () => ({ url: 'avatars/daily-reward' }),
      providesTags: [rtkTags.avatarDailyReward],
    }),

    claimAvatarDailyReward: builder.mutation<ClaimAvatarDailyRewardResponse, void>({
      query: () => ({ url: 'avatars/daily-reward/claim', method: 'POST' }),
      // The grant lands on the LC / LS balances and their histories.
      invalidatesTags: [
        rtkTags.avatarDailyReward,
        rtkTags.me,
        rtkTags.lc,
        rtkTags.lcTransactions,
        rtkTags.stars,
        rtkTags.starsTransactions,
      ],
    }),
  }),
});

export const {
  useGetAvatarInventoryQuery,
  useGetAvatarDailyRewardQuery,
  useClaimAvatarDailyRewardMutation,
} = avatarsApi;
