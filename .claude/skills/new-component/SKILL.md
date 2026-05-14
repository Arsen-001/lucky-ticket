---
name: new-component
description: Scaffold a new React component matching LuckyTicket365 conventions — twMerge, Record-typed variants, classNames object, extends-HTML-props, named export. Use when adding a button, card, badge, list item, form element, layout piece, or any reusable UI primitive. Routes the component to the correct directory and skips 'use client' unless required.
---

# new-component

Scaffold a component that follows the project's conventions exactly.

## When to use

- "Create a component called X"
- "Add a Button/Card/Badge/Modal/etc."
- "Extract this JSX into its own component"
- Any time the user describes a reusable UI piece

## Where the component goes

| Type               | Directory                                                          |
| ------------------ | ------------------------------------------------------------------ |
| Button-like        | `src/components/shared/buttons/`                                   |
| Form input/wrapper | `src/components/shared/form-elements/`                             |
| Modal              | `src/components/shared/modals/`                                    |
| Badge / pill       | `src/components/shared/badges/`                                    |
| Custom icon        | `src/components/shared/icons/`                                     |
| Skeleton loader    | `src/components/shared/seleketons/` (yes, misspelled — keep as-is) |
| Page-specific      | `src/components/pages/<route-group>/<route>/`                      |
| Layout primitive   | `src/components/layout-elements/`                                  |

When in doubt, ask the user.

## Template — wraps a native HTML element

```tsx
'use client'; // only if needed (hooks, events, browser APIs)

import type { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export type FooVariants = 'primary' | 'secondary';

export interface FooProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FooVariants;
  loading?: boolean;
  classNames?: {
    label?: string;
    icon?: string;
  };
}

export function Foo({
  className,
  classNames,
  variant = 'primary',
  loading = false,
  children,
  ...rest
}: FooProps) {
  const variantClasses: Record<FooVariants, string> = {
    primary: 'bg-pink-gradient text-white',
    secondary: 'bg-gradient-purple text-white',
  };

  return (
    <button
      className={twMerge(
        'flex-center font-semibold py-3.5 px-6 rounded-lg',
        variantClasses[variant],
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading}
      {...rest}
    >
      <span className={twMerge('truncate', classNames?.label)}>{children}</span>
    </button>
  );
}
```

## Template — page-specific list item

```tsx
import { twMerge } from 'tailwind-merge';
import type { Foo } from '@/types/interfaces/foo.interfaces';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export interface FooListItemProps extends Partial<Foo> {
  loading?: boolean;
  index?: number;
}

export function FooListItem({ loading = false, index = 0, name, value }: FooListItemProps) {
  return (
    <div
      className="animate-slide-in-bottom flex items-center justify-between p-4 rounded-lg card-outlined"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="w-32 h-5" />}
      >
        <span className="text-white-secondary">{name}</span>
      </SkeletonSuspense>
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="w-16 h-5" />}
      >
        <span className="font-semibold">{value}</span>
      </SkeletonSuspense>
    </div>
  );
}
```

## Rules to apply

- **Named export only** — components, utilities, hooks. Default exports are reserved for `page.tsx` and `layout.tsx`.
- **One component per file**. Extract any inline sub-component into its own file.
- **Extend HTML props** when wrapping a native element (`extends ButtonHTMLAttributes<...>`).
- **`classNames` object** for sub-element styling — never multiple `XClassName` props.
- **`Record<Variant, string>`** for variant-class maps — never inline ternaries.
- **`twMerge` for every conditional class** — order matters: base → variants → state → consumer's `className`.
- **No manual memoization** — React Compiler handles it.
- **No JS-driven animations** — use `animate-*` classes plus inline `animationDelay` for stagger.
- **`'use client'` only when actually needed**.
- **Localize all visible strings** via `useAppTranslations`.
- **Don't accept `src` on icon components** — derive it from a `type` prop and a variant map (see `Ticket.tsx`, `Medal.tsx`).
- **For `inert`** use `inert={!open ? true : undefined}` — never `false`.

## Steps

1. Confirm the component name, target directory, and whether it wraps a native element
2. Confirm whether it needs `'use client'`
3. Write the file using the matching template
4. If exposing variants, add the `XVariants` type and `Record` map
5. If the component will be used in a list, accept `loading?: boolean` and `index?: number`
6. Run `npm run type-check` to confirm
