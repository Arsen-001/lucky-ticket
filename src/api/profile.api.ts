import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  PlayerStats,
  BuyShowcaseSlotRequest,
  InviteToTournamentRequest,
  InviteToTournamentResponse,
  LikeProfileResponse,
  ProfileResponse,
  SendTicketRequest,
  SendTicketResponse,
  UpdateBannerIconsRequest,
} from '@/types/interfaces/profile.interfaces';
import type {
  BuySlotResponse,
  PinAchievementRequest,
  UnpinAchievementRequest,
} from '@/types/interfaces/achievement.interfaces';

export const profileApi = api.injectEndpoints({
  endpoints: builder => ({
    getPlayerStats: builder.query<PlayerStats, void>({
      query: () => ({ url: 'profile/stats' }),
      providesTags: [rtkTags.playerStats],
    }),
    getProfile: builder.query<ProfileResponse, string | undefined>({
      query: userId => ({ url: `profile/${userId ?? 'me'}` }),
      providesTags: (_result, _error, userId) => [
        { type: rtkTags.profileById, id: userId ?? 'me' },
        rtkTags.profile,
      ],
    }),

    likeProfile: builder.mutation<LikeProfileResponse, string>({
      query: userId => ({ url: 'profile/like', method: 'POST', body: { userId } }),
      // Liking grants the liker +1 AP — refresh `me` so the header AP updates.
      invalidatesTags: (_result, _error, userId) => [
        { type: rtkTags.profileById, id: userId },
        rtkTags.me,
      ],
    }),

    sendTicket: builder.mutation<SendTicketResponse, SendTicketRequest>({
      query: body => ({ url: 'profile/send-ticket', method: 'POST', body }),
      // Sending awards the sender +AP (capped) — refresh `me` so the header AP updates.
      invalidatesTags: [{ type: rtkTags.profileById, id: 'me' }, rtkTags.tickets, rtkTags.me],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        // `profile.ticketsSent` is the other half of the test-quest's «потрать
        // N билетов» counter — tournament entries are the first (@see
        // refetchTestQuestProgress).
        try {
          await queryFulfilled;
          refetchTestQuestProgress(dispatch);
        } catch {
          /* the send failed — nothing was spent */
        }
      },
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
      // Buying a slot debits Lucky Stars and writes a SHOWCASE_SLOT ledger row —
      // refresh every Stars surface, not just the header pill.
      invalidatesTags: [rtkTags.profile, ...balanceTags.stars],
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

    // Persist the owner's banner collage layout. Optimistically patches the
    // owner's profile cache so the icons stay where they were dropped without
    // waiting for the round-trip; the mock backend keeps the last write.
    updateBannerIcons: builder.mutation<ProfileResponse, UpdateBannerIconsRequest>({
      query: body => ({ url: 'profile/banner-icons', method: 'PATCH', body }),
      async onQueryStarted({ positions }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          profileApi.util.updateQueryData('getProfile', undefined, draft => {
            draft.bannerIconPositions = positions;
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
  useGetPlayerStatsQuery,
  useGetProfileQuery,
  useLikeProfileMutation,
  useSendTicketMutation,
  usePinAchievementMutation,
  useUnpinAchievementMutation,
  useBuyShowcaseSlotMutation,
  usePinCollageMutation,
  useUnpinCollageMutation,
  useInviteToTournamentMutation,
  useUpdateBannerIconsMutation,
} = profileApi;
