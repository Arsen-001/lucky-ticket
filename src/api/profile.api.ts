import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  BuyShowcaseSlotRequest,
  InviteToTournamentRequest,
  InviteToTournamentResponse,
  LikeProfileResponse,
  ProfileResponse,
  SendTicketRequest,
  SendTicketResponse,
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
      query: userId => ({ url: 'profile/like', method: 'POST', body: { userId } }),
      invalidatesTags: (_result, _error, userId) => [{ type: rtkTags.profileById, id: userId }],
    }),

    sendTicket: builder.mutation<SendTicketResponse, SendTicketRequest>({
      query: body => ({ url: 'profile/send-ticket', method: 'POST', body }),
      invalidatesTags: [{ type: rtkTags.profileById, id: 'me' }, rtkTags.tickets],
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
  useSendTicketMutation,
  usePinAchievementMutation,
  useUnpinAchievementMutation,
  useBuyShowcaseSlotMutation,
  usePinCollageMutation,
  useUnpinCollageMutation,
  useInviteToTournamentMutation,
} = profileApi;
