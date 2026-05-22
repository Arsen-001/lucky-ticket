# LuckyTicket365 — Project Rules

> **See also:** [`.claude/PROJECT_RULES.md`](.claude/PROJECT_RULES.md) for supplementary Claude-Code-specific rules (R1–R31), and [`.claude/skills/`](.claude/skills/git pull) for invokable scaffolding skills:
>
> - `/new-rtk-endpoint` — wire an API file + tag + mock through all three required places
> - `/new-component` — scaffold a component matching project conventions
> - `/new-modal` — scaffold a modal with proper portal/inert/animation handling
> - `/new-yup-schema` — scaffold a localized yup factory schema
> - `/sync-translations` — verify en/hy/ru parity
> - `/check-quality` — run type-check + lint + format
> - `/docs-drift` — surface mismatches between DOCS.md and implementation

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
│   └── enums/             # *.enums.ts
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

| Artifact           | Convention                       | Example                                    |
| ------------------ | -------------------------------- | ------------------------------------------ |
| Component files    | PascalCase                       | `Button.tsx`, `HomeTickestListItem.tsx`    |
| Component props    | `<Name>Props`                    | `ButtonProps`, `InputProps`                |
| Hooks              | `use` prefix                     | `useCountDown.ts`, `useAppTranslations.ts` |
| Utilities          | `*.utils.ts`                     | `date.utils.ts`, `string.utils.ts`         |
| API endpoints      | `*.api.ts`                       | `tournaments.api.ts`                       |
| Validation schemas | `*.schemes.ts`                   | `auth.schemes.ts`                          |
| Type files         | `*.types.ts` / `*.interfaces.ts` | `ticket.types.ts`, `user.interfaces.ts`    |
| Enums              | `*.enums.ts`                     | `ticket.enums.ts`                          |
| Constants          | descriptive                      | `rtk-tags.ts`, `routes.ts`                 |

---

## Path Aliases

```
@/*       → ./src/*
#/*       → ./*
@messages/* → ./messages/*
@assets/* → ./public/assets/*
```

Always use `@/` for imports within `src/`. Never use relative `../../` paths.

---

## Component Patterns

### Structure

```tsx
'use client'; // only if needed

import type { ButtonHTMLAttributes } from 'react';
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
      className={twMerge(
        variantClasses[variant],
        'text-white font-semibold py-3.5 px-6 rounded-lg',
        className
      )}
      {...rest}
    />
  );
}
```

### Rules

- **One component per file** — each file must export exactly one logical component
- **Decompose aggressively** — if a component contains a distinct visual or logical unit that could stand alone (a list item, a card section, a form block, a stat row), extract it into its own file; do not leave it as an inline function or JSX block inside the parent
- Use **named exports** for all components, utilities, and hooks
- Use **default exports** only for pages and layouts
- Use `export type { ... }` or `import type { ... }` for type-only imports
- Add `'use client'` only when the component uses browser APIs, hooks, or event handlers
- Extend HTML element props when wrapping native elements (e.g., `extends ButtonHTMLAttributes<HTMLButtonElement>`)
- Use `twMerge()` for all className composition — never string concatenation
- Define variant maps as `Record<VariantType, string>` rather than inline ternaries

### Sub-element Styling

When a component needs to style multiple internal parts, accept a `classNames` object — not multiple `className*` props:

```
classNames?: { label?: string; icon?: string; wrapper?: string }
```

### Controlled / Uncontrolled Dual Mode

Interactive components (Switch, Tabs, Select) support both modes in one component:

```ts
const activeValue = propValue !== undefined ? propValue : internalValue;
```

### Custom Image Icon Components

Components like `Ticket`, `Medal`, and `TicketOverlap` follow a specific pattern:

- Never accept `src` — derive it from the `type` prop via a variant map
- Rename Next.js Image's `loading` prop to `nextLoading` to avoid collision with the component's own `loading: boolean`
- When `loading={true}`, cycle through all type variants with `setInterval` + `animation-blink` class

### `inert` Attribute

Use `inert={!open ? true : undefined}` — not `inert={false}` — because React strips boolean HTML attributes when set to `false`.

---

## Styling

### Tailwind CSS 4

- Use **CSS custom properties** defined in `styles/global/theme.css` for colors
- Use **custom utilities** defined in `styles/global/utilities.css` (e.g., `flex-center`, `bg-pink-gradient`, `card-outlined`)
- Use `twMerge()` from `tailwind-merge` whenever merging classes conditionally
- When a component needs CSS Tailwind can't express (complex transitions, keyframes), create `/src/styles/components/<name>.css` and import it directly in the component. Define new utilities with the `@utility` at-rule (Tailwind v4 syntax)

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

Every list and grid uses inline `animationDelay` — never JS-based timers:

```
className="animate-slide-in-bottom"
style={{ animationDelay: `${index * 100}ms` }}
```

Use `50ms` for dense grids (tournament cards), `100ms` for lists and tab items.

`(tabs)/layout.tsx` wraps content in a `key={pathname}` div — React remounts it on each navigation, re-triggering CSS entry animations automatically. Never add JS animation resets.

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

- Register cache tags in `src/constants/rtk-tags.ts` before use
- Always use `providesTags` / `invalidatesTags` for cache management
- Every new mock file must be imported and spread into `mockData` in `src/mock/index.mock.ts`

### Redux Slices

Use `createSlice` in `src/lib/rtk/features/*.slice.ts`. Use the typed hooks:

```typescript
import { useAppDispatch, useAppSelector } from '@/lib/rtk/hooks';
```

Never use raw `useDispatch` or `useSelector`.

---

## Forms

```
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

Any prop that holds a navigation path must use the `Route` type from `src/constants/routes.ts`, not `string`.

### Route Groups

- `(auth)` — authentication pages
- `(tabs)` — main tab interface
- `(out-tabs)` — drawer/modal routes with `@header` parallel slot

---

## Internationalization

**Never hardcode user-visible text** — every string rendered in the UI (labels, placeholders, error messages, button text, headings, empty states) must go through `t()`. Hardcoded English strings in JSX are a bug.

Always use the custom hook, never raw `useTranslations`:

```typescript
import { useAppTranslations } from '@/hooks/useAppTranslations';

const t = useAppTranslations();
t('email required');
t('min length is {num}', { num: 8 });
```

---

## Loading / Skeleton Pattern

Two distinct patterns — choose based on context:

**Field-level skeletons** (single item, multiple fields): use `SkeletonSuspense` per field:

```tsx
<SkeletonSuspense loading={isLoading} skeleton={<Skeleton />}>
  <ActualContent />
</SkeletonSuspense>
```

**List-level loading** (full list): use placeholder arrays, not `SkeletonSuspense` at the list level. Each item receives a `loading` prop and renders its own skeleton internally:

```tsx
const items = isLoading ? (new Array(5).fill({}) as ItemProps[]) : realData;

items.map((item, index) => <Item loading={isLoading} {...item} />);
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

## Constants

Magic values (coin name `'LC'`, `minPasswordLength`, `referralPercentage`) live in `src/constants/global.constants.ts`. Never hardcode them inline.

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

**Build & runtime**

- Mobile-first dark-theme app (background: `#1b1930`)
- `reactStrictMode: false` in `next.config.ts`
- React Compiler (`reactCompiler: true`) is enabled — avoid manual `useMemo`/`useCallback` where the compiler can handle it

**Development**

- Mock base query simulates random 400–1200ms latency for dev data

**Testing**

- No test framework is configured; type-check + lint serve as safety nets

---

## Business Logic Documentation

Full product and business logic documentation is located in [`documentation.md`](DOCS/DOCS.md). It covers all platform systems: tickets, tournaments, tasks, stakes, leaderboard, market, wallet, statuses, Telegram Stars, and referral mechanics.

**Any change that affects business logic — new features, modified rules, updated flows, or removed mechanics — must be reflected in `documentation.md`.** Keep it in sync with the implementation; treat it as the source of truth for product behavior.
