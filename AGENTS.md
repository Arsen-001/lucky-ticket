# Lucky Ticket — Project Rules

## Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript 5** (strict mode)
- **Redux Toolkit** + **RTK Query** (mock base query in dev)
- **Tailwind CSS 4** via PostCSS + `tailwind-merge` (`twMerge`)
- **React Hook Form** + **Yup** for forms and validation
- **next-intl** for i18n
- **dayjs** for date/time
- **Lucide React** for icons
- **Swiper** for carousels

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/            # Auth pages
│   ├── (tabs)/            # Main tab pages
│   └── (out-tabs)/        # Drawer & modal routes
├── components/
│   ├── layout-elements/   # Header, TabBar, Drawer, PageHeader
│   ├── pages/             # Page-specific components
│   └── shared/            # Reusable UI components
│       ├── buttons/
│       ├── form-elements/
│       ├── modals/
│       ├── badges/
│       ├── seleketons/    # Skeleton loaders (note: this dir is named "seleketons")
│       ├── icons/
│       └── links/
├── api/                   # RTK Query endpoint files (*.api.ts)
├── lib/
│   ├── rtk/               # store, hooks, createAppSlice, features/
│   └── yup/               # Validation schemas (*.schemes.ts)
├── hooks/                 # Custom hooks (use*.ts)
├── providers/             # React providers
├── services/              # Service functions
├── constants/             # rtk-tags, routes, global constants
├── types/
│   ├── interfaces/        # *.interfaces.ts
│   ├── types/             # *.types.ts
│   └── enums/             # *.enum.ts
├── styles/
│   ├── global/            # animations.css, theme.css, utilities.css
│   └── components/        # Per-component styles
├── utils/
│   ├── global/            # *.utils.ts
│   └── pages/             # Page-specific utils
├── i18n/                  # next-intl config
├── mock/                  # Mock data for RTK Query
└── fonts/
```

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Component files | PascalCase | `Button.tsx`, `HomeTickestListItem.tsx` |
| Component props | `<Name>Props` | `ButtonProps`, `InputProps` |
| Hooks | `use` prefix | `useCountDown.ts`, `useAppTranslations.ts` |
| Utilities | `*.utils.ts` | `date.utils.ts`, `string.utils.ts` |
| API endpoints | `*.api.ts` | `tournaments.api.ts` |
| Validation schemas | `*.schemes.ts` | `auth.schemes.ts` |
| Type files | `*.types.ts` / `*.interfaces.ts` | `ticket.types.ts`, `user.interfaces.ts` |
| Enums | `*.enum.ts` | `ticket.enum.ts` |
| Constants | descriptive | `rtk-tags.ts`, `routes.ts` |

---

## Path Aliases

```typescript
@/*       → ./src/*
#/*       → ./*
@messages/* → ./messages/*
@assets/* → ./public/assets/*
```

Always use `@/` for imports within `src/`. Never use relative `../../` paths.

---

## Component Patterns

### Structure

```typescript
'use client'; // only if needed

import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonVariants = 'primary' | 'secondary' | 'transparent';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariants;
  loading?: boolean;
}

export function Button({ className, variant = 'primary', loading = false, ...rest }: ButtonProps) {
  const variantClasses: Record<ButtonVariants, string> = {
    primary: 'bg-pink-gradient',
    secondary: 'bg-gradient-purple',
    transparent: 'bg-transparent',
  };

  return (
    <button
      className={twMerge(variantClasses[variant], 'text-white font-semibold py-3.5 px-6 rounded-lg', className)}
      {...rest}
    />
  );
}
```

### Rules

- Use **named exports** for all components, utilities, and hooks
- Use **default exports** only for pages and layouts
- Use `export type { ... }` or `import type { ... }` for type-only imports
- Add `'use client'` only when the component uses browser APIs, hooks, or event handlers
- Extend HTML element props when wrapping native elements (e.g., `extends ButtonHTMLAttributes<HTMLButtonElement>`)
- Use `twMerge()` for all className composition — never string concatenation
- Define variant maps as `Record<VariantType, string>` rather than inline ternaries

---

## Styling

### Tailwind CSS 4

- Use **CSS custom properties** defined in `styles/global/theme.css` for colors
- Use **custom utilities** defined in `styles/global/utilities.css` (e.g., `flex-center`, `bg-pink-gradient`, `card-outlined`)
- Use `twMerge()` from `tailwind-merge` whenever merging classes conditionally

### Custom Utilities Available

```
flex-center          → flex items-center justify-center
flex-col-stretch     → flex flex-col items-stretch
flex-available       → flex: 1 1 0
bg-pink-gradient     → gradient-pink background
bg-gradient-purple   → gradient-purple background (reverse available)
card-outlined        → gradient border effect
loader               → animated text stroke loader
main-scrollbar       → styled scrollbar
scrollbar-hidden     → hidden scrollbar
inset-container-*    → fade overlay on scroll
shine-*              → rotating shine effect
```

### Animation Classes

```
animate-fade-in           → fade-in 0.3s ease-out
animate-slide-in-bottom   → slide up from 30px 0.4s ease-out
animate-spin              → continuous rotation (Lucide icons)
animation-blink           → pulsing opacity 1.8s
```

### Theme Colors (CSS variables)

- Tiers: `bronze`, `silver`, `gold`, `platinum`, `diamond`
- Accents: `pink`, `teal`, `electric-purple`, `electric-pink`, `orange`
- Backgrounds: `background` (#1b1930), `background-overlay`, `header`, `tab-bar`
- Status: `success`, `error` (#7E2828), `disabled` (#7A7A7A), `warning`

---

## State Management

### RTK Query

Define endpoints in `src/api/*.api.ts` using `api.injectEndpoints()`:

```typescript
// src/api/tournaments.api.ts
export const tournamentsApi = api.injectEndpoints({
  endpoints: builder => ({
    getTournaments: builder.query<PersonalTournament[], void>({
      query: () => ({ url: 'tournaments' }),
      providesTags: [rtkTags.tournaments],
    }),
  }),
});

export const { useGetTournamentsQuery } = tournamentsApi;
```

- Register cache tags in `src/constants/rtk-tags.ts`
- Always use `providesTags` / `invalidatesTags` for cache management

### Redux Slices

Use `createSlice` in `src/lib/rtk/features/*.slice.ts`. Use the typed hooks:

```typescript
import { useAppDispatch, useAppSelector } from '@/lib/rtk/hooks';
```

Never use raw `useDispatch` or `useSelector`.

---

## Forms

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getLoginSchema } from '@/lib/yup/auth.schemes';

const form = useForm({ resolver: yupResolver(getLoginSchema(t)) });

return (
  <Form form={form} onSubmit={handleSubmit}>
    <FormItem name="email">
      <Input placeholder={t('email')} />
    </FormItem>
  </Form>
);
```

- Validation schemas live in `src/lib/yup/` as factory functions that accept `t` (translation function)
- Use `FormItem` to wrap inputs — it injects `register` and validation state via `cloneElement`

---

## Routing

Use the `routes` constant from `src/constants/routes.ts` for all navigation — never hardcode paths:

```typescript
import { routes } from '@/constants/routes';

router.push(routes.tournaments.getById(id));
```

### Route Groups

- `(auth)` — authentication pages
- `(tabs)` — main tab interface
- `(out-tabs)` — drawer/modal routes with `@header` parallel slot

---

## Internationalization

Always use the custom hook, never raw `useTranslations`:

```typescript
import { useAppTranslations } from '@/hooks/useAppTranslations';

const t = useAppTranslations();
t('email required');
t('min length is {num}', { num: 8 });
```

---

## Loading / Skeleton Pattern

```typescript
<SkeletonSuspense loading={isLoading} skeleton={<Skeleton />}>
  <ActualContent />
</SkeletonSuspense>
```

---

## TypeScript Conventions

- Enable strict mode — no `@ts-ignore` unless absolutely necessary with a comment explaining why
- Use **union types** for component variants: `type ButtonVariants = 'primary' | 'secondary'`
- Use **Record** for variant-to-class maps: `Record<ButtonVariants, string>`
- Use `import type` for type-only imports consistently
- Mark immutable props as `readonly`
- Prefer interfaces for props, types for unions/utility types

---

## ESLint Rules (notable)

- `@typescript-eslint/no-explicit-any`: warn (avoid `any`, use proper types)
- `@typescript-eslint/no-unused-vars`: error (prefix unused vars with `_`)
- `react-hooks/exhaustive-deps`: off

---

## Code Quality Scripts

```bash
npm run lint        # ESLint
npm run type-check  # tsc --noEmit
npm run format      # Prettier
```

Run `type-check` before committing non-trivial changes.

---

## Key Project Notes

- **Mobile-first** dark-theme app (background: `#1b1930`)
- `reactStrictMode: false` in next.config.ts
- React Compiler (`reactCompiler: true`) is enabled — avoid manual `useMemo`/`useCallback` where the compiler can handle it
- Mock base query simulates random 400–1200ms latency for dev data
- No test framework is configured; type-check + lint serve as safety nets
