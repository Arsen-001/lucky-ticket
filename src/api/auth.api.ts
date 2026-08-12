import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import { adoptCookieTransportIfProven } from '@/services/auth-transport.service';
import {
  getRefreshTokenCk,
  removeAccessTokenCk,
  removeRefreshTokenCk,
  removeSessionFlagCk,
  setAccessTokenCk,
  setRefreshTokenCk,
  setSessionFlagCk,
} from '@/services/cookie.service';
import type { LoginRequest } from '@/types/interfaces/auth.interfaces';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

function persistTokens(tokens: AuthTokens) {
  setAccessTokenCk(tokens.accessToken);
  setRefreshTokenCk(tokens.refreshToken);
  // Raised on the same event as the tokens, so the app can keep answering "is
  // there a session?" once the tokens themselves become `httpOnly` and vanish
  // from JavaScript. @see cookie.service
  setSessionFlagCk();
  // And immediately try to stop keeping a readable copy at all — but only if
  // the cookie transport can be PROVEN to work. @see auth-transport.service
  void adoptCookieTransportIfProven();
}

export const authApi = api.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<AuthTokens, LoginRequest>({
      query: body => ({ url: 'auth/login', method: 'POST', body }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        const { data } = await queryFulfilled;
        persistTokens(data);
        dispatch(api.util.invalidateTags([rtkTags.me]));
      },
    }),

    register: builder.mutation<AuthTokens, RegisterBody>({
      query: body => ({ url: 'auth/register', method: 'POST', body }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        const { data } = await queryFulfilled;
        persistTokens(data);
        dispatch(api.util.invalidateTags([rtkTags.me]));
      },
    }),

    // Telegram Mini App auth: the signed `initData` IS the credential — the
    // backend verifies it and find-or-creates the account, so there is no
    // registration step. Called once on boot by TelegramProvider.
    telegramLogin: builder.mutation<AuthTokens, { initData: string }>({
      query: body => ({ url: 'auth/telegram', method: 'POST', body }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        const { data } = await queryFulfilled;
        persistTokens(data);
        dispatch(api.util.invalidateTags([rtkTags.me]));
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
        body: { refreshToken: getRefreshTokenCk() ?? '' },
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } catch {
          // The logout call can 401 when the session is already dead (e.g. the
          // refresh token was revoked). Swallow it — we clean up locally below
          // regardless, and an unhandled reject here surfaces as a console error.
        } finally {
          removeAccessTokenCk();
          removeRefreshTokenCk();
          removeSessionFlagCk();
          dispatch(api.util.invalidateTags([rtkTags.me]));
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useTelegramLoginMutation,
} = authApi;
