---
apply: always
---

`lucky-ticket` is a modern Next.js 16 (App Router) app using React 19, Redux Toolkit (incl. RTK Query), Tailwind CSS v4, and next-intl. The project is strongly typed with TypeScript, follows an opinionated folder structure, and ships mock APIs for local development via a custom `mockBaseQuery`.

### Tech Stack

- Framework: Next.js 16 (App Router) with TypeScript, React 19
- State/Data: Redux Toolkit, RTK Query, `mockBaseQuery`
- Styling: Tailwind CSS v4, `tailwind-merge`
- i18n: `next-intl` with typed message keys
- Forms/Validation: React Hook Form, Yup
- Utilities: Day.js, Lucide React, Swiper
- Tooling: ESLint 9, Prettier 3, Husky, lint-staged

### Directory Structure (authoritative)

- `src/api`: RTK Query slices and endpoints. Use `api.injectEndpoints` and `rtkTags`.
- `src/app`: App Router routes/layouts. Keep pages thin and delegate to `src/components/pages`.
- `src/components`:
  - `layout-elements`: Header, TabBar, etc.
  - `pages`: Feature/page-scoped UI. Tabs live under `pages/tabs/*`.
  - `shared`: Reusable UI (buttons, inputs, modals, badges, links, icons, skeletons, etc.).
- `src/constants`: Global constants (e.g., `routes`, `rtk-tags`, `global.constants`, icon maps).
- `src/hooks`: Custom hooks: `useAppTranslations`, `useLocation`, typed RTK hooks in `src/lib/rtk/hooks`.
- `src/lib`:
  - `rtk`: Store, typed hooks, slices utilities.
  - `yup`: Yup schemas.
- `src/mock`: Mock data and handlers used by `mockBaseQuery`.
- `src/providers`: App-level providers (e.g., `StoreProvider`).
- `src/styles`: Tailwind v4 and component CSS (e.g., `styles/components/*`).
- `src/types`: `enums`, `interfaces`, `types` (type-only helpers, ticket, i18n types, etc.).
- `src/utils`: `global` and `pages` utilities.

Note: Some existing file/directory names contain typos and are referenced as-is in code, e.g., `src/types/interfaces/component.interfcaes.ts`, `src/components/shared/seleketons/*`. Use these paths exactly unless a coordinated refactor is performed.

### Coding Rules & Conventions

#### 1) Components

- Use functional components with TypeScript: `export function ComponentName(props: Props) { ... }`.
- Keep App Router page files minimal; move UI/logic to `src/components/pages/...`.
- Co-locate page-specific components under the relevant feature path (e.g., `pages/tabs/market/*`).
- Prefer composition over deep prop drilling. Reuse primitives from `components/shared` (e.g., `Button`, `Modal`, `Link`, `Skeleton`, `Avatar`).
- Client components must declare `'use client'` at the top. Default to server when possible.

Example scaffold

```tsx
'use client';
import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface ExampleProps extends HTMLAttributes<HTMLDivElement> {}

export function Example({ className, ...rest }: ExampleProps) {
  const t = useAppTranslations();
  return (
    <div {...rest} className={twMerge('p-4', className)}>
      {t('example key')}
    </div>
  );
}
```

#### 2) Styling (Tailwind v4)

- Use Tailwind utility classes. Merge conditionals with `twMerge`.
- Prefer inline utilities; only create CSS files in `src/styles/components` for complex, reusable styling (e.g., animations or third-party overrides).
- Respect existing design tokens/classes (e.g., `bg-purple-gradient`, `focus-outline`, `bg-tab-bar`).
- Keep class lists short and readable; extract repeated patterns into class strings or components.

#### 3) State Management & API

- Central API slice at `src/api/index.api.ts` using `mockBaseQuery(mockData)` for local dev.
- Define features via `api.injectEndpoints({ endpoints: builder => ({ ... }) })` in dedicated files: `me.api.ts`, `market.api.ts`, etc.
- Use `providesTags`/`invalidatesTags` with `rtkTags` for cache control.
- Prefer RTK Query hooks for all server data access.
- Local UI state: Redux slices when shared across components (e.g., `layout.slice.ts`), otherwise local `useState`.
- Slice creation: use `createSlice`. Use `createAppSlice` only when you need thunks from `buildCreateSlice`.
- Always export typed hooks from `src/lib/rtk/hooks` and use them (`useAppDispatch`, `useAppSelector`, `useAppStore`).

Mutation example

```ts
export const exampleApi = api.injectEndpoints({
  endpoints: b => ({
    doThing: b.mutation<ResponseType, RequestType>({
      query: body => ({ url: 'thing', method: 'POST', body }),
      invalidatesTags: [rtkTags.me],
    }),
  }),
});
```

#### 4) TypeScript

- Use `import type { ... }` for type-only imports. Return types for hooks and non-trivial functions are required.
- Prefer `interface` for extensible object shapes, `type` for unions/aliases.
- Mark immutable interface fields as `readonly` where appropriate.
- Keep message keys type-safe using `MessageIds` and the `Dictionary` function signature.
- Reuse shared interfaces from `src/types/interfaces/*` (e.g., `ChildrenProps`, `ClassNameProps` in `component.interfcaes.ts`).

#### 5) Internationalization (next-intl)

- Client: `useAppTranslations(namespace?)` returns a typed `Dictionary`.
- Server: `getLocale` and `NextIntlClientProvider` are wired in `src/app/layout.tsx`.
- No hardcoded user-facing strings in components. All labels, placeholders, CTAs, errors, tooltips, empty states, and headings must use translation keys.
- Keys should be descriptive and grouped by domain/feature. Use interpolation for variables: `t('active for {days} days', { days })`.
- Do not provide literal fallbacks in components—only within messages files.

#### 6) Routing

- Define routes in `src/constants/routes.ts`. Use the exported `routes` object.
- Use the shared `Link` component for type-safe navigation: `href: Route`.
- For programmatic navigation, use `useRouter().push(route)` with a typed route from `routes`.

#### 7) Naming

- Components: PascalCase (`MarketItemCard.tsx`).
- Shared primitives live in descriptive subfolders (e.g., `shared/buttons/Button.tsx`).
- Utilities/enums/interfaces/types: kebab-case filenames with suffixes (`date.utils.ts`, `market.enums.ts`, `user.interfaces.ts`).
- Constants: either camelCase objects (e.g., `routes`) or UPPER_SNAKE_CASE for primitives.

#### 8) Imports & Module Aliases

- Use `@/*` for imports from `src`, `@messages/*` for messages, `@assets/*` for static assets. Keep type-only imports prefixed with `import type`.
- Import order: core (React/Next), third-party, aliases (`@/...`), relative paths, styles.

#### 9) Loading, Skeletons, Modals

- Prefer optimistic, snappy UX. While `isLoading`, render `Skeleton`/`SkeletonSuspense` from `shared/seleketons`.
- Use `Modal` + `ClientPortal` with `#portal-root` defined in `src/app/layout.tsx`.
- Keep modals self-contained with `open`, `onClose`, and accessibility-friendly focus handling.

#### 10) Images & Icons

- Use Next `Image` for all images. Always set explicit `width`/`height` (or style) and `alt`.
- For dynamic/animated placeholders, use existing patterns (e.g., `Ticket` component’s loading animation).
- Lucide icons: pass sizing through props or clone with unified `iconSize`. Keep stroke widths consistent (`stroke-2` by default).

#### 11) Error Handling

- For RTK Query mutations, wrap `unwrap()` in `try/catch` and log with meaningful context.
- Surface user-friendly, localized error toasts or inline messages (use i18n keys). Do not leak raw errors.

#### 12) Performance

- Favor server components by default. Mark interactive ones with `'use client'`.
- Keep component trees flat. Memoize expensive subtrees as needed. Avoid prop-driven re-renders by splitting components.
- Derive UI from RTK Query cache; avoid duplicating server data in local slices.

#### 13) Testing & Tooling

- Run `npm run lint` and `npm run format` before commits. Husky/lint-staged will enforce Prettier on staged files.
- Type-check with `npm run type-check` in CI or before release.

### Patterns Observed (enforced by rules)

- API: `api/index.api.ts` defines `mockBaseQuery` with method-aware resolution, path traversal, dynamic function responses, and random delays. All feature APIs must inject endpoints into this base `api` and use `rtkTags`.
- Store: `lib/rtk/store.ts` builds store with combined slices and `api.middleware`. Use `StoreProvider` at app root.
- Typed hooks: `useAppDispatch`, `useAppSelector`, `useAppStore` ensure consistent typing.
- i18n typing: `src/types/types/i18n.types.ts` wires `IntlMessages` to guarantee key safety.
- Routing: `routes` exposes nested builders like `tournaments.getById(id)` with literal type preservation for `href` safety.

### Do/Don’t Checklists

Do

- Use `useAppTranslations` and typed message keys everywhere.
- Keep pages thin; place feature UI under `src/components/pages/*`.
- Use RTK Query for all data fetching and cache invalidation via `rtkTags`.
- Use `twMerge` for any class string that may receive conditionals.
- Use shared primitives (`Button`, `Link`, `Modal`, `Skeleton`, `Avatar`).
- Type request/response shapes in API endpoints.

Don’t

- Don’t hardcode English strings into components.
- Don’t create new global stores or ad-hoc contexts for server data.
- Don’t bypass `routes` or the shared `Link` component for navigation.
- Don’t import from non-aliased deep relative paths when an alias exists.

### Small Examples

Typed RTK Query selector/mutation usage

```tsx
'use client';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/me.api';

export function ProfileHeader() {
  const { data: me, isLoading } = useGetMeQuery();
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  // ...render with Skeletons while loading, call updateMe(...).unwrap() in try/catch
  return null;
}
```

Tailwind + twMerge pattern

```tsx
import { twMerge } from 'tailwind-merge';

function Box({ active }: { active?: boolean }) {
  return <div className={twMerge('p-4 rounded', active ? 'bg-purple-600' : 'bg-white/5')} />;
}
```

### Known Quirks (follow current names)

- Types path: `src/types/interfaces/component.interfcaes.ts` (typo is intentional in current codebase).
- Skeletons path: `src/components/shared/seleketons/*`.

By following these rules, AI and contributors will generate code that matches the project’s architecture, typing, i18n, data, and styling patterns consistently and safely.
