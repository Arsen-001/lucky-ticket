import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import type {
  BuyStarsRequest,
  BuyStarsResponse,
  ConnectWalletRequest,
  ConnectWalletResponse,
  DepositAddressResponse,
  StarsPackage,
  SupportedWallet,
  TonProofPayloadResponse,
  WalletState,
  WalletTransaction,
  WithdrawTonRequest,
  WithdrawTonResponse,
} from '@/types/interfaces/wallet.interfaces';

export const walletApi = api.injectEndpoints({
  endpoints: builder => ({
    getWalletState: builder.query<WalletState, void>({
      query: () => ({ url: 'wallet' }),
      providesTags: [rtkTags.wallet],
    }),
    getSupportedWallets: builder.query<SupportedWallet[], void>({
      query: () => ({ url: 'wallet/supported' }),
    }),
    getWalletTransactions: builder.query<WalletTransaction[], void>({
      query: () => ({ url: 'wallet/transactions' }),
      providesTags: [rtkTags.walletTransactions],
    }),
    getStarsPackages: builder.query<StarsPackage[], void>({
      query: () => ({ url: 'wallet/stars-packages' }),
      providesTags: [rtkTags.starsPackages],
    }),
    getDepositAddress: builder.query<DepositAddressResponse, void>({
      query: () => ({ url: 'wallet/deposit-address' }),
    }),
    // Fresh one-time nonce for the TON Connect `ton_proof`. Fetched lazily right
    // before opening the connect sheet; the wallet signs it and the backend
    // verifies the signature in `connectWallet`.
    getTonProofPayload: builder.query<TonProofPayloadResponse, void>({
      query: () => ({ url: 'wallet/ton-proof/payload' }),
    }),
    connectWallet: builder.mutation<ConnectWalletResponse, ConnectWalletRequest>({
      query: body => ({ url: 'wallet/connect', method: 'POST', body }),
      // `tasks` too: «Connect a TON wallet» is a real task whose counter
      // (`wallet_connected`) flips on this very call. Without the tag the task
      // list kept showing it undone until something else happened to refetch —
      // the player did the thing and the screen disagreed.
      invalidatesTags: [rtkTags.wallet, rtkTags.tasks],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Same step lives in the 31-day checklist. @see refetchTestQuestProgress
          refetchTestQuestProgress(dispatch);
        } catch {
          // A failed connect changes nothing to refresh.
        }
      },
    }),
    disconnectWallet: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: 'wallet/disconnect', method: 'POST' }),
      // Unlinking flips the same counter back, so it refreshes the same places.
      invalidatesTags: [rtkTags.wallet, rtkTags.tasks],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          refetchTestQuestProgress(dispatch);
        } catch {
          // Nothing changed.
        }
      },
    }),
    withdrawTon: builder.mutation<WithdrawTonResponse, WithdrawTonRequest>({
      query: body => ({ url: 'wallet/withdraw', method: 'POST', body }),
      invalidatesTags: [...balanceTags.ton],
    }),
    buyStars: builder.mutation<BuyStarsResponse, BuyStarsRequest>({
      query: body => ({ url: 'wallet/buy-stars', method: 'POST', body }),
      // Exchanging TON → Stars moves the TON balance, the Stars balance, and
      // writes to both the wallet + Stars ledgers, so refresh all of them.
      invalidatesTags: [...balanceTags.ton, ...balanceTags.stars],
    }),
    // Native Telegram Stars purchase: returns an invoice link the Mini App opens
    // with `WebApp.openInvoice`. Crediting happens server-side via the payment
    // webhook, so the balance is refreshed manually once openInvoice reports 'paid'.
    createStarsInvoice: builder.mutation<{ link: string }, { stars: number }>({
      query: body => ({ url: 'wallet/stars/invoice', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetWalletStateQuery,
  useGetSupportedWalletsQuery,
  useGetWalletTransactionsQuery,
  useGetStarsPackagesQuery,
  useGetDepositAddressQuery,
  useLazyGetTonProofPayloadQuery,
  useConnectWalletMutation,
  useDisconnectWalletMutation,
  useWithdrawTonMutation,
  useBuyStarsMutation,
  useCreateStarsInvoiceMutation,
} = walletApi;
