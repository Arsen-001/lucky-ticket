import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  BuyShowcaseSlotRequest,
  InviteToTournamentRequest,
  InviteToTournamentResponse,
  LikeProfileResponse,
  ProfileResponse,
} from '@/types/interfaces/profile.interfaces';
import type {
  BuySlotResponse,
  PinAchievementRequest,
  UnpinAchievementRequest,
} from '@/types/interfaces/achievement.interfaces';

export const profileApi = api.injectEndpoints({
  endpoints: builder => ({
    getProfile: builder.query<ProfileResponse, string | undefined>({
      query: userId => ({ url: `profile/${userId ?? 'me'}` }),
      providesTags: (_result, _error, userId) => [
        { type: rtkTags.profileById, id: userId ?? 'me' },
        rtkTags.profile,
      ],
    }),

    likeProfile: builder.mutation<LikeProfileResponse, string>({
      query: userId => ({ url: `profile/${userId}/like`, method: 'POST' }),
      invalidatesTags: (_result, _error, userId) => [{ type: rtkTags.profileById, id: userId }],
    }),

    pinAchievement: builder.mutation<ProfileResponse, PinAchievementRequest>({
      query: body => ({ url: 'profile/showcase/pin', method: 'POST', body }),
      invalidatesTags: [rtkTags.profile, rtkTags.achievements],
    }),

    unpinAchievement: builder.mutation<ProfileResponse, UnpinAchievementRequest>({
      query: body => ({ url: 'profile/showcase/unpin', method: 'POST', body }),
      invalidatesTags: [rtkTags.profile, rtkTags.achievements],
    }),

    buyShowcaseSlot: builder.mutation<BuySlotResponse, BuyShowcaseSlotRequest>({
      query: body => ({ url: 'profile/showcase/buy-slot', method: 'POST', body }),
      invalidatesTags: [rtkTags.profile],
    }),

    pinCollage: builder.mutation<ProfileResponse, PinAchievementRequest>({
      query: body => ({ url: 'profile/collage/pin', method: 'POST', body }),
      invalidatesTags: [rtkTags.profile, rtkTags.achievements],
    }),

    unpinCollage: builder.mutation<ProfileResponse, UnpinAchievementRequest>({
      query: body => ({ url: 'profile/collage/unpin', method: 'POST', body }),
      invalidatesTags: [rtkTags.profile, rtkTags.achievements],
    }),

    inviteToTournament: builder.mutation<InviteToTournamentResponse, InviteToTournamentRequest>({
      query: body => ({ url: 'profile/invite-tournament', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useLikeProfileMutation,
  usePinAchievementMutation,
  useUnpinAchievementMutation,
  useBuyShowcaseSlotMutation,
  usePinCollageMutation,
  useUnpinCollageMutation,
  useInviteToTournamentMutation,
} = profileApi;
