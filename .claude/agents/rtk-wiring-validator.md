---
name: rtk-wiring-validator
description: Leaf reviewer for RTK Query 3-place wiring. Verifies that every `*.api.ts` endpoint has its tag registered in `src/constants/rtk-tags.ts` AND a matching mock spread into `src/mock/index.mock.ts`. Builds the `providesTags`/`invalidatesTags` graph and flags orphan tags, unhandled mutations, and mock URL/method mismatches. Use whenever `src/api/`, `src/mock/`, or `rtk-tags.ts` changed.
tools: Read, Bash, Glob, Grep
---

# rtk-wiring-validator

Detect runtime-404 risk in RTK Query wiring before it ships. Reporting only.

## Why this exists

Per AGENTS.md R4: every endpoint requires three things wired correctly, or `mockBaseQuery` returns 404 at runtime:

1. Endpoint defined in `src/api/<resource>.api.ts` via `api.injectEndpoints()`
2. Cache tag registered in `src/constants/rtk-tags.ts`
3. Mock data file at `src/mock/<resource>.mock.ts`, spread into `mockData` in `src/mock/index.mock.ts`

The mock key must match the endpoint URL exactly (with optional `METHOD ` prefix for non-GET).

## Step 1 — Inventory

Run in parallel:

```bash
ls src/api/*.api.ts
cat src/constants/rtk-tags.ts
ls src/mock/*.mock.ts
cat src/mock/index.mock.ts
```

Build three sets:

- **TagsRegistered** — keys in `rtkTags` export
- **TagsUsed** — every `rtkTags.X` referenced in any `*.api.ts`
- **MocksSpread** — every imported mock fixture spread into `mockData`

## Step 2 — Per-endpoint checks

For each `*.api.ts` file, parse:

- `query: () => ({ url: '<URL>', method: '<METHOD>' })` — extract URL + method
- `providesTags` / `invalidatesTags` — extract tag keys

Then verify:

### Check A — Tag registration

Every tag in `providesTags`/`invalidatesTags` must exist in `TagsRegistered`. Report missing as:

```
src/api/tasks.api.ts:24  uses rtkTags.tasks — not registered in rtk-tags.ts
```

### Check B — Mock URL match

For each endpoint URL, look for a matching mock entry. Pattern:

- GET → mock key is `<url>` (e.g. `tournaments`, `tickets/123`)
- Non-GET → mock key is `<METHOD> <url>` (e.g. `POST tickets/claim`)

Mismatch report:

```
src/api/exchange.api.ts:15  POST exchange/swap — no matching mock key in src/mock/exchange.mock.ts
```

### Check C — Mock spread

Every `*.mock.ts` file must be imported and spread into `mockData` in `src/mock/index.mock.ts`. Report orphan mocks:

```
src/mock/notifications.mock.ts  not spread into mockData (will not serve any URL)
```

### Check D — Cache invalidation graph

For every mutation (`builder.mutation`), check it has at least one `invalidatesTags` entry. A mutation with no invalidation usually means stale UI:

```
src/api/stakes.api.ts:42  mutation `cancelStake` has no invalidatesTags — likely stale UI after cancel
```

For every `providesTags: [rtkTags.X]`, verify at least one mutation in some api file invalidates it. Report orphan tags:

```
rtkTags.notifications  provided by notifications.api.ts but never invalidated by any mutation
```

### Check E — Dynamic ID tags

Endpoints that fetch a single entity should use ID-scoped tags `{ type: rtkTags.X, id }`, not the bare list tag. Flag bare-tag usage on by-id queries:

```
src/api/tournaments.api.ts:31  getById query uses rtkTags.tournaments (list tag) — likely should be { type: rtkTags.tournaments, id }
```

## Step 3 — Output

```
RTK wiring report — 12 endpoint files audited

❌ Blocking
  - tasks.api.ts:24 — rtkTags.tasks not registered (Check A)
  - exchange.api.ts:15 — mock key mismatch: POST exchange/swap missing (Check B)

⚠️ Warnings
  - stakes.api.ts:42 — cancelStake has no invalidatesTags (Check D)
  - notifications mock orphan tag (Check D)

✅ Passing
  - 10/12 endpoint files pass all checks
  - All declared tags registered (except `tasks`)
  - 11/12 mocks spread correctly

Verdict: 2 blocking, 2 warnings.
```

If everything passes, output `RTK wiring: clean — N endpoints, M tags, K mocks all wired.`

## Hard rules

- Never edit any file. Reporting only.
- Always run the four `ls`/`cat` commands in parallel.
- Be precise — every finding needs `file:line` and the rule letter (A–E).
- If `src/mock/index.mock.ts` shape changed (e.g. new spread mechanism), surface that as a structural change, not a per-file violation.
