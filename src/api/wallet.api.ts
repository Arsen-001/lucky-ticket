import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  BuyStarsRequest,
  BuyStarsResponse,
  ConnectWalletRequest,
  ConnectWalletResponse,
  DepositAddressResponse,
  StarsPackage,
  SupportedWallet,
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
    connectWallet: builder.mutation<ConnectWalletResponse, ConnectWalletRequest>({
      query: body => ({ url: 'wallet/connect', method: 'POST', body }),
      invalidatesTags: [rtkTags.wallet],
    }),
    disconnectWallet: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: 'wallet/disconnect', method: 'POST' }),
      invalidatesTags: [rtkTags.wallet],
    }),
    withdrawTon: builder.mutation<WithdrawTonResponse, WithdrawTonRequest>({
      query: body => ({ url: 'wallet/withdraw', method: 'POST', body }),
      invalidatesTags: [rtkTags.wallet, rtkTags.walletTransactions],
    }),
    buyStars: builder.mutation<BuyStarsResponse, BuyStarsRequest>({
      query: body => ({ url: 'wallet/buy-stars', method: 'POST', body }),
      invalidatesTags: [rtkTags.wallet, rtkTags.walletTransactions, rtkTags.me],
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
  useConnectWalletMutation,
  useDisconnectWalletMutation,
  useWithdrawTonMutation,
  useBuyStarsMutation,
  useCreateStarsInvoiceMutation,
} = walletApi;
