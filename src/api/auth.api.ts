import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import {
  getRefreshTokenCk,
  removeAccessTokenCk,
  removeRefreshTokenCk,
  setAccessTokenCk,
  setRefreshTokenCk,
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

    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
        body: { refreshToken: getRefreshTokenCk() ?? '' },
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } finally {
          removeAccessTokenCk();
          removeRefreshTokenCk();
          dispatch(api.util.invalidateTags([rtkTags.me]));
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;
