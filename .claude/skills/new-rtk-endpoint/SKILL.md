---
name: new-rtk-endpoint
description: Scaffold a new RTK Query endpoint file with matching cache tag and mock data wired through src/mock/index.mock.ts. Use when adding a new resource to src/api/ or extending an existing one. Prevents the common runtime-404 caused by forgetting one of the three required wiring steps.
---

# new-rtk-endpoint

Add a new RTK Query API file with all three required pieces wired correctly.

## When to use

The user asks to "add an endpoint", "create an api file", "wire up X data", "add a new resource", or describes a new server interaction. Also use when extending an existing `*.api.ts` file with a new query/mutation that returns a new collection (needs a tag).

## Required wiring (all three must be done)

A new endpoint without all three pieces will return a 404 from `mockBaseQuery`. The three pieces are:

### 1. Cache tag — `src/constants/rtk-tags.ts`

Add the tag to the `rtkTags` object before referencing it:

```ts
export const rtkTags = {
  // ...existing
  myResource: 'MyResource',
  myResourceById: ':MyResourceById', // dynamic per-item tag if needed
} as const;
```

### 2. API file — `src/api/<resource>.api.ts`

```ts
import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { MyResource } from '@/types/interfaces/my-resource.interfaces';

export const myResourceApi = api.injectEndpoints({
  endpoints: builder => ({
    getMyResources: builder.query<MyResource[], void>({
      query: () => ({ url: 'my-resources' }),
      providesTags: [rtkTags.myResource],
    }),
    getMyResourceById: builder.query<MyResource, string>({
      query: id => ({ url: `my-resources/${id}` }),
      providesTags: (_result, _error, id) => [{ type: rtkTags.myResourceById, id }],
    }),
    updateMyResource: builder.mutation<MyResource, { id: string; patch: Partial<MyResource> }>({
      query: ({ id, patch }) => ({ url: `my-resources/${id}`, method: 'PATCH', body: patch }),
      invalidatesTags: (_result, _error, { id }) => [
        rtkTags.myResource,
        { type: rtkTags.myResourceById, id },
      ],
    }),
  }),
});

export const { useGetMyResourcesQuery, useGetMyResourceByIdQuery, useUpdateMyResourceMutation } =
  myResourceApi;
```

### 3. Mock data — `src/mock/<resource>.mock.ts` + register in `index.mock.ts`

`src/mock/my-resource.mock.ts`:

```ts
import type { MyResource } from '@/types/interfaces/my-resource.interfaces';

export const myResourceMock = {
  'my-resources': [{ id: '1' /* ... */ }, { id: '2' /* ... */ }] satisfies MyResource[],
};
```

For per-method routing, key by `'POST my-resources'`, `'PATCH my-resources/1'`, etc. The mock base query first checks method-prefixed keys, then exact paths, then walks segments matching array `id`/`uuid`.

For dynamic mock responses (e.g. read body or query string), use a function:

```ts
'POST my-resources': (args: FetchArgs) => ({ data: { ...args.body, id: '999' } }),
```

Then spread into `src/mock/index.mock.ts`:

```ts
import { myResourceMock } from './my-resource.mock';

export const mockData = {
  ...existingMocks,
  ...myResourceMock,
};
```

## Steps

1. Confirm the resource name and shape (ask the user if unclear)
2. Add the tag(s) to `src/constants/rtk-tags.ts`
3. Create the type interface at `src/types/interfaces/<resource>.interfaces.ts` if it doesn't exist
4. Create the API file at `src/api/<resource>.api.ts`
5. Create the mock at `src/mock/<resource>.mock.ts`
6. Register the mock in `src/mock/index.mock.ts`
7. Run `npm run type-check` to confirm everything wires up

## Don'ts

- Don't forget step 6 (mock registration) — this is the most common bug
- Don't reference a tag that isn't yet in `rtkTags` — TypeScript won't catch it because tags are strings
- Don't use raw `useDispatch`/`useSelector` to consume — use the auto-generated hooks
