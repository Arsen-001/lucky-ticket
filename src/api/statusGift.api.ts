import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import { asTicketTier } from '@/utils/global/ticket-tier.utils';
import type {
  ClaimDailyGiftApiResponse,
  ClaimDailyGiftResponse,
  DailyGiftState,
  DailyGiftStateResponse,
} from '@/types/interfaces/status-gift.interfaces';

/**
 * The tier, in the casing the app draws with.
 *
 * Falls back to bronze rather than dropping the tile: the count is real money
 * either way, and every other reward surface in the app resolves an unknown
 * tier the same way. See {@link DailyGiftStateResponse} for what the wire sends.
 */
const appTier = (raw: string) => asTicketTier(raw) ?? 'bronze';

export const statusGiftApi = api.injectEndpoints({
  endpoints: builder => ({
    getDailyGift: builder.query<DailyGiftState, void>({
      query: () => ({ url: 'status/daily-gift' }),
      transformResponse: (raw: DailyGiftStateResponse): DailyGiftState => ({
        ...raw,
        ticketTier: appTier(raw.ticketTier),
      }),
      providesTags: [rtkTags.statusDailyGift],
    }),

    claimDailyGift: builder.mutation<ClaimDailyGiftResponse, void>({
      query: () => ({ url: 'status/daily-gift/claim', method: 'POST' }),
      transformResponse: (raw: ClaimDailyGiftApiResponse): ClaimDailyGiftResponse => ({
        ...raw,
        ticketTier: appTier(raw.ticketTier),
      }),
      // Coins and the ticket inventory both move, and the gift itself flips to
      // "collected" — refetching only the first two would leave the modal
      // offering a gift the server has already paid out.
      invalidatesTags: [
        rtkTags.statusDailyGift,
        rtkTags.me,
        rtkTags.lc,
        rtkTags.lcTransactions,
        rtkTags.tickets,
        rtkTags.inventory,
      ],
    }),
  }),
});

export const { useGetDailyGiftQuery, useClaimDailyGiftMutation } = statusGiftApi;
