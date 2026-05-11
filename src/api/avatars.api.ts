import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { UserAvatar } from '@/types/interfaces/avatars.interfaces';

export const avatarsApi = api.injectEndpoints({
  endpoints: builder => ({
    getAvatarInventory: builder.query<UserAvatar[], void>({
      query: () => ({ url: 'avatars' }),
      providesTags: [rtkTags.avatars],
    }),
  }),
});

export const { useGetAvatarInventoryQuery } = avatarsApi;
