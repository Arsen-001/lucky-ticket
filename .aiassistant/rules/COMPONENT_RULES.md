---
apply: by model decision
instructions: Apply when working with components
---

type: always on
pattern: src/components/\*_/_.{ts,tsx}

Rules:

- type must remain unchanged unless explicitly specified
- pattern must target the intended file scope
- Do not add extra metadata fields unless requested

–

# Component Rules

## Naming

- Use PascalCase for component filenames and function names (e.g., `MarketTabs.tsx`).
- Use camelCase for props and local variables.

## Structure

- Use `'use client'` only when necessary for hooks, state, or event listeners.
- Export components as named functions.
- Define Props interfaces immediately above the component.
- Keep components small and focused on a single responsibility.
- Place subcomponents in a nested folder if they are only used by a specific parent.

## Best Practices

- Use `useAppTranslations` (for client components) and `getAppTranslations` (for server compliment) for all user-facing text.
- Use `lucide-react` for icons unless specified otherwise.
- Prefer `HTMLAttributes` or specific prop types for component props to ensure type safety.
- Use `ReactNode` for props that accept children or complex UI elements (e.g., `title`, `description`).
- Ensure components are accessible (use semantic HTML, aria-labels where needed).
- **Loading State Management**:
  - Include a `loading?: boolean` prop in the component interface.
  - Wrap individual UI elements that need skeletons with `SkeletonSuspense`.
  - Provide a configured `Skeleton` component (with appropriate `variant`, `textSize`, etc.) via the `skeleton` prop of `SkeletonSuspense`.
  - Pass the `loading` state to sub-components that manage their own loading UI.
  - Use the `loading` state to disable interactive elements like `Button` during loading.
- **NEVER** use `memo`, `useMemo`, or `useCallback`.

## Tools

- Use TypeScript for strict type checking.
- Use Lucide icons for consistent iconography.
