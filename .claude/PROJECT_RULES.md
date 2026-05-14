# LuckyTicket365 — Claude Code Rules (supplements AGENTS.md)

These rules cover project-specific conventions that aren't fully captured in AGENTS.md. They reflect actual patterns in the codebase and should be followed when writing or editing code.

---

## Workflow Rules

### R1. Always type-check after non-trivial edits

After any change touching types, RTK endpoints, routes, or schemas, run:

```bash
npm run type-check
```

Lint and Prettier run automatically on commit (Husky + lint-staged). Don't run `npm run lint` unless investigating an ESLint-specific issue.

### R2. Never bypass git hooks

The repo has Husky-managed pre-commit hooks running Prettier on staged files. Never use `--no-verify` to skip them.

### R3. Don't fix the `seleketons/` typo

The folder `src/components/shared/seleketons/` is intentionally misspelled and accepted as tech debt. Renaming it would break dozens of imports. Same applies to `src/types/interfaces/component.interfcaes.ts`.

---

## RTK Query Rules

### R4. Mock data MUST be wired through three places

When adding any new endpoint:

1. Create the API file at `src/api/<resource>.api.ts` using `api.injectEndpoints()`
2. Register the cache tag in `src/constants/rtk-tags.ts` BEFORE using it in `providesTags`/`invalidatesTags`
3. Create the mock at `src/mock/<resource>.mock.ts` AND spread it into `mockData` in `src/mock/index.mock.ts`

Skipping any of these three steps will produce a runtime 404 from `mockBaseQuery`. The mock key must match the endpoint URL (with optional `METHOD ` prefix for non-GET).

### R5. Use `providesTags` / `invalidatesTags` on every endpoint

Cache invalidation is the only way mutations refresh queries in this app. Endpoints that return a list use `providesTags: [rtkTags.X]`. Mutations that change that list use `invalidatesTags: [rtkTags.X]`.

### R6. Never use raw Redux hooks

Use `useAppDispatch`, `useAppSelector`, `useAppStore` from `@/lib/rtk/hooks` — never `useDispatch`/`useSelector` directly.

### R7. Mock latency is real

The mock base query simulates 400–1200ms random latency. Code, animations, and skeletons must look correct under this delay. Don't assume responses are synchronous.

---

## Component Rules

### R8. One component per file

If you find yourself defining a second component (even a small JSX-returning function) in the same file, extract it. List items, card sections, form blocks — always their own file.

### R9. Use `twMerge` for every conditional class

Never concatenate strings or use template literals to merge classes. Always:

```ts
className={twMerge(base, condition && variant, props.className)}
```

### R10. Variants as `Record<Variant, string>`

Never inline ternaries for variant styling. Define a typed map:

```ts
const variantClasses: Record<ButtonVariants, string> = { ... };
```

### R11. Multi-element styling uses `classNames` object

Never accept `labelClassName`, `iconClassName`, etc. as separate props. Use:

```ts
classNames?: { label?: string; icon?: string; wrapper?: string }
```

### R12. `inert` must be `true | undefined`, never `false`

React strips boolean attributes set to `false`. Always:

```tsx
inert={!open ? true : undefined}
```

### R13. Custom image-icon components don't accept `src`

For `Ticket`, `Medal`, `TicketOverlap` and similar: derive `src` from `type` via a variant map. If you need to forward Next.js Image's native `loading` prop, rename it to `nextLoading`.

---

## Styling Rules

### R14. CSS animations only — no JS animation libraries or timers

Animations live in `src/styles/global/animations.css` or per-component CSS files. For staggered list entry, use inline `style={{ animationDelay: '...' }}` — `50ms` for grids, `100ms` for lists. Never use `setTimeout`/`setInterval` to drive UI animations. The `(tabs)/layout.tsx` `key={pathname}` trick already handles re-triggering on navigation.

### R15. Per-component CSS goes in `src/styles/components/<name>.css`

When Tailwind can't express it (keyframes, complex pseudo-elements), create a dedicated CSS file and import it directly in the component. Use Tailwind v4's `@utility` at-rule for new utilities, `@theme` for new tokens.

### R16. Use theme variables, never raw hex

Colors come from `theme.css` custom properties (`--color-bronze`, `--color-electric-pink`, etc.). Tier colors are `bronze | silver | gold | platinum | diamond`. If a color isn't in the theme, add it there first.

---

## Forms Rules

### R17. Yup schemas are factories that receive `t`

Every schema file in `src/lib/yup/` exports `getXSchema(t: Dictionary)`. Error messages must go through `t()` — never hardcode English. Pass interpolation args as the second argument: `t('min length is {num}', { num: 8 })`.

### R18. Always wrap inputs in `FormItem`

`FormItem` injects `register(name, rules)` via `cloneElement`. Don't manually call `register()` in your inputs unless you have a reason that justifies bypassing the wrapper.

---

## i18n Rules

### R19. Three-way translation parity

Every key added to `messages/en.json` MUST also be added to `messages/hy.json` AND `messages/ru.json`. Missing translations show as the raw key in production. Use the `/sync-translations` skill before committing changes that touch any messages file.

### R20. No hardcoded user-visible strings

Every string rendered in JSX (button labels, headings, placeholders, errors, empty states) goes through `useAppTranslations()`. This includes Yup schema error messages.

### R21. Never use raw `useTranslations`

Always import from `@/hooks/useAppTranslations`. The wrapper provides the typed `Dictionary` return.

---

## Routing Rules

### R22. Use the `routes` constant — never hardcode paths

Every navigation must go through `src/constants/routes.ts`. Dynamic routes use the `getById(id)` helpers. Props that hold paths must type as `Route`, never `string`.

### R23. Match the route group convention

- Auth pages → `(auth)`
- Tab pages → `(tabs)`
- Drawer + detail pages → `(out-tabs)/(drawer)/...` or `(out-tabs)/(tabs-extra)/...`
- Every `(out-tabs)` route MUST have a matching `@header/...` parallel slot

---

## Domain Rules (from DOCS.md)

### R24. Engine model: claim-gates-production

After an engine produces its per-cycle output, it pauses until the user claims. Don't model engines as continuously producing — `pendingCount` accumulates only for the current cycle, not over time.

### R25. VIP is permanent and endless

VIP level never decreases or expires. The level cap is unbounded. Pricing differs between first-unlock and subsequent upgrades; both LC and Telegram Stars (XTR) are accepted.

### R26. Stake is a 3-hour session, blocks next stake until claimed

Don't allow a new stake to start while the previous session has unclaimed rewards. Early cancellation returns LC but grants no rewards (no tickets, no bonuses, no Stars draw).

### R27. Referral commission is tickets only

Inviters earn 10% (or 20% for Telegram Premium friends) of tickets a referred friend claims — same type, accumulated, must be actively claimed. There is NO commission on LC, XTR, or any other currency.

### R28. DOCS.md is the source of truth for business logic

Any change to features, rules, flows, or mechanics must be reflected in `DOCS/DOCS.md` in the same PR. Treat it as load-bearing documentation, not a reference. Use `/docs-drift` to surface mismatches.

---

## Code Quality Rules

### R29. Don't add manual memoization

React Compiler is enabled (`reactCompiler: true`). Don't write `useMemo`, `useCallback`, or `React.memo` unless you've measured a regression the compiler can't handle.

### R30. Loading states use the documented pattern

- Single item with multiple fields → `SkeletonSuspense` per field
- List of items → placeholder array (`new Array(5).fill({})`) + per-item `loading` prop, NOT a list-level `SkeletonSuspense`

### R31. Constants belong in `global.constants.ts`

Magic values (`'LC'`, `minPasswordLength`, `referralPercentage`, `telegramPremiumReferralPercentage`) live in `src/constants/global.constants.ts`. Never inline them.
