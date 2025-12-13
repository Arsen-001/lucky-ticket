import { createApi } from '@reduxjs/toolkit/query/react';
import { rtkTags } from '@/constants/rtk-tags';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { type MockData, mockData } from '@/mock/index.mock';

// const baseUrl = getBaseApi();
// const baseQuery = fetchBaseQuery({
//   baseUrl,
//   prepareHeaders: headers => {
//     const token = getAccessTokenCk();
//     if (token) {
//       headers.set('authorization', `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

export const mockBaseQuery =
  <TMockMap extends Record<string, any>>(
    mockMap: TMockMap
  ): BaseQueryFn<{ url: string }, unknown, unknown> =>
  async ({ url }) => {
    function resolveMockValue() {
      const parts = url.split('/').filter(Boolean);
      const key = parts[0];
      parts.shift();

      if (parts.length === 1) {
        return mockMap[parts[key]];
      }

      let current = mockMap[key];

      for (const segment of parts) {
        if (current == null) return undefined;
        current = current.find(item => item.id === segment);
      }

      return current;
    }

    const value = resolveMockValue();
    await new Promise(res => setTimeout(res, 2000)); // simulate delay

    if (value === undefined) {
      return { error: { status: 404, data: `No mock for "${String(url)}"` } };
    }

    return { data: value };
  };

export const api = createApi({
  tagTypes: Object.values(rtkTags),
  reducerPath: 'api',
  baseQuery: mockBaseQuery<MockData>(mockData),
  endpoints: () => ({}),
});
