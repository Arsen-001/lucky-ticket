---
apply: always
---

### Project Overview

`lucky-ticket` is a modern web application built with Next.js (App Router), React 19, and Redux Toolkit. It follows a highly structured directory organization and uses Tailwind CSS v4 for styling.

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **State Management:** Redux Toolkit (RTK) & RTK Query
- **Styling:** Tailwind CSS v4, `tailwind-merge`
- **Internationalization:** `next-intl`
- **Validation:** Yup, React Hook Form
- **Utilities:** Day.js, Lucide React, Swiper

### Directory Structure

- `src/api`: RTK Query service definitions and API endpoints.
- `src/app`: Next.js App Router pages and layouts.
- `src/components`:
  - `layout-elements`: Global layout components (Header, TabBar, etc.).
  - `pages`: Page-specific components organized by feature.
  - `shared`: Reusable UI components (Buttons, Modals, Inputs).
- `src/constants`: Global constants, routes, and configuration.
- `src/hooks`: Custom React hooks.
- `src/lib`: Third-party library configurations (RTK store, Yup schemas).
- `src/mock`: Mock data for development and testing.
- `src/providers`: React context providers (e.g., Redux StoreProvider).
- `src/styles`: CSS files using Tailwind CSS v4.
- `src/types`: TypeScript definitions categorized into `enums`, `interfaces`, and `types`.
- `src/utils`: Helper functions.

### Coding Rules & Conventions

#### 1. Components

- Use Functional Components with TypeScript.
- Prefer `export function ComponentName() {}` for components.
- Props should be typed using interfaces from `src/types/interfaces/component.interfcaes.ts` when applicable (e.g., `ChildrenProps`, `ClassNameProps`).
- Page components in `src/app` should generally be lightweight, delegating UI logic to components in `src/components/pages`.

#### 2. Styling

- Use Tailwind CSS v4 utility classes.
- Use `twMerge` for merging class names.
- Global styles and theme variables are located in `src/styles`.
- Component-specific styles (if not purely Tailwind) should be in `src/styles/components`.

#### 3. State Management & API

- Use RTK Query for all data fetching.
- Inject endpoints into the main API slice located in `src/api/index.api.ts`.
- Use `rtkTags` for cache invalidation.
- Local state management should use Redux Slices (created via `createAppSlice`).

#### 4. TypeScript

- Use `readonly` for property definitions in interfaces where appropriate.
- Prefer `type` for simple types and `interface` for object structures that might be extended.
- Always define return types for hooks and complex functions.
- Import types using `import type { ... }`.

#### 5. Internationalization (i18n)

- Use `useAppTranslations` hook for client-side translations.
- All user-facing text must be internationalized using the dictionary keys.

#### 6. Routing

- Define all routes in `src/constants/routes.ts`.
- Use the `routes` constant for navigation to ensure type safety.

#### 7. Naming Conventions

- **Files:** PascalCase for components (`TournamentCard.tsx`), kebab-case for utilities and other files (`date.utils.ts`, `auth.interfaces.ts`).
- **Variables/Functions:** camelCase.
- **Constants:** camelCase (for object exports like `routes`) or UPPER_SNAKE_CASE for simple constants.

#### 8. Imports

- Use the `@/` alias for absolute imports from the `src` directory.
- Maintain a clean import order: React/Next.js imports, third-party libraries, internal components, constants, types, and styles.
