# Lucky Ticket — Engineering Standards

> Production-grade engineering standards for Lucky Ticket. This document captures the **global best practices** for Security, Architecture, Code Quality, Performance, Observability, and Documentation — grounded in the official guidance for our exact stack (verified against Next.js 16.2, React 19.2, Redux Toolkit 2.11, OWASP Cheat Sheet Series).
>
> **Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5 (strict) · Redux Toolkit 2 + RTK Query · Tailwind CSS 4 · React Hook Form + Yup · next-intl · dayjs · Lucide · Swiper

---

## Table of Contents

1. [Security](#1-security)
2. [Architecture](#2-architecture)
3. [Code Quality](#3-code-quality)
4. [Performance](#4-performance)
5. [Observability](#5-observability)
6. [Documentation](#6-documentation)
7. [Compliance Checklist](#7-compliance-checklist)

---

## 1. Security

> Sources: OWASP Top 10, OWASP Cheat Sheet Series, OWASP Developer Guide, Next.js 16 security guide.

### 1.1 OWASP Top 10 — Coverage Map

| OWASP Risk                         | How we address it in this app                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| A01 Broken Access Control          | Server-side authorization on every endpoint; verify resource ownership; never rely on client guards |
| A02 Cryptographic Failures         | TLS 1.2+ everywhere; encrypt PII at rest; never store auth tokens in `localStorage`                 |
| A03 Injection                      | Parameterized queries / ORM; Yup validation at every boundary; no `dangerouslySetInnerHTML`         |
| A04 Insecure Design                | Threat model new features; least-privilege defaults; deny-by-default authorization                  |
| A05 Security Misconfiguration      | Strict security headers (§1.6); minimal install footprint; production env hardening                 |
| A06 Vulnerable Components          | `npm audit` in CI; Dependabot/Renovate; pinned major versions                                       |
| A07 Identification & Auth Failures | Short-lived tokens, refresh rotation, MFA-ready, account lockout on auth endpoints                  |
| A08 Software & Data Integrity      | Signed Telegram `initData` HMAC verification; subresource integrity for third-party scripts         |
| A09 Logging & Monitoring Failures  | Structured audit logs (§5); alert on auth anomalies                                                 |
| A10 SSRF                           | Allowlist outbound URLs from any user-controlled input                                              |

### 1.2 Input Validation

- **Validate every user input** with Yup schemas in `src/lib/yup/*.schemes.ts`. Schemas are factory functions that accept `t` for localized error messages.
- Validate at the API boundary on the server. Client-side validation is UX, not security.
- For numeric inputs (LTC, stake amounts, ticket counts), enforce **min/max bounds and integer-only** where applicable. Reject `NaN`, `Infinity`, and negative values explicitly.
- Reject any payload field not present in the schema (Yup `.noUnknown(true).strict()`).

### 1.3 Authentication & Sessions

- Store session tokens in **`HttpOnly; Secure; SameSite=Strict` cookies**, never in `localStorage` or `sessionStorage` (any JS-readable store is XSS-exploitable).
- Recommended cookie shape (OWASP Session Management Cheat Sheet):
  ```http
  Set-Cookie: sessionId=<opaque>;
              HttpOnly;
              Secure;
              SameSite=Strict;
              Path=/;
              Max-Age=900
  ```
- **Token lifetimes:** access tokens ≤ 15 min, refresh tokens ≤ 30 days, rotated on every refresh.
- **Telegram WebApp `initData` must be verified server-side with HMAC-SHA256** before trusting any user identity. Never trust client-supplied user IDs.
- If JWTs are used, bind them to a server-set **fingerprint cookie** (OWASP JWT Cheat Sheet) and explicitly specify the algorithm during verification to defeat the `alg: none` attack.
- Account lockout / progressive backoff after repeated failed logins.

### 1.4 Authorization

- Role checks (user, admin, VIP tier) happen **server-side**. Client-side guards are UX hints only.
- **Prevent IDOR:** every resource fetch verifies the requesting user owns or has explicit access. Never rely on object IDs being unguessable.
- Privileged actions (admin tournament creation, balance adjustments, payout approval) require explicit role verification on every request.
- Default to **deny**; grant access via positive checks.

### 1.5 Secrets Management

- **Never commit secrets.** `.env.local` is gitignored; production secrets live in the deployment platform's secret store (Vercel env vars, AWS Secrets Manager, etc.).
- Public env vars use the `NEXT_PUBLIC_*` prefix. Anything with this prefix is shipped to the browser — treat it as public.
- Rotate API keys, Telegram bot tokens, and database credentials on a ≤ 90-day schedule and immediately on suspected compromise.
- Server-only modules importing secrets should use the `import 'server-only'` package guard so accidental client imports fail at build time.

### 1.6 Security Headers (Next.js 16)

Configure in `next.config.ts` for static headers, or in `proxy.ts` for nonce-based CSP.

**Static CSP (no nonce — simpler, suitable for most pages):**

```ts
// next.config.ts
const isDev = process.env.NODE_ENV === 'development';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://api.telegram.org;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, ' ')
  .trim();

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};
```

**Nonce-based CSP** (stricter, requires dynamic rendering — use for high-risk routes). See Next.js 16 CSP guide; generate the nonce in `proxy.ts` and propagate via `x-nonce` request header.

### 1.7 Rate Limiting & Abuse

- Rate-limit by user ID **and** IP on all mutation endpoints (auth, ticket purchase, stake placement, friend claim).
- Stricter limits on auth endpoints: e.g., 5 login attempts per 15 minutes per IP.
- Telegram Stars purchase flows require **idempotency keys** (UUID per request) to prevent duplicate charges on retry.
- CAPTCHAs or proof-of-work for high-cost endpoints if abuse is detected.

### 1.8 CSRF

- Default protection: `SameSite=Strict` cookies + custom request headers (e.g., `X-Requested-With`).
- For higher assurance, use the **double-submit cookie pattern**: server sets `XSRF-TOKEN` cookie, client mirrors it in `X-CSRF-Token` header on all state-changing requests. RTK Query base query injects this header automatically.

### 1.9 Cross-Site Scripting (XSS)

- React escapes by default. **Never** use `dangerouslySetInnerHTML` without DOMPurify-style sanitization.
- Reject `javascript:` and `data:` URLs in any user-supplied link field. Validate URL schemes against an allowlist (`https:`, `mailto:`, `tg:`).
- Strict CSP (§1.6) is the second line of defense.

### 1.10 Dependencies

- `npm audit` runs in CI; high/critical vulnerabilities block merges.
- Dependabot or Renovate is enabled for automated dependency PRs.
- **Pin exact versions** for production dependencies; review every major version bump.
- Avoid packages with < 1k weekly downloads or no maintenance in > 1 year unless absolutely necessary.

### 1.11 PII & Compliance

- Encrypt PII (email, Telegram ID, payout details) at rest.
- Log scrubbing — never log raw tokens, passwords, full PII payloads, or Telegram `initData`.
- Implement user data export and deletion endpoints (GDPR Art. 15 & 17). Document retention windows.
- Data minimization: collect only what the product needs.

### 1.12 Audit Logging

- Append-only log of privileged events: login, role changes, balance adjustments, stake/tournament wins, payouts, admin actions.
- Retain ≥ 1 year for compliance and incident review.
- Logs include `userId`, `action`, `targetResource`, `requestId`, `timestamp`, `ipHash`.

---

## 2. Architecture

### 2.1 Layering

```
UI (components/)
  ↓
State (lib/rtk/, hooks/)
  ↓
API (api/*.api.ts)
  ↓
Backend
```

- Components never call `fetch` directly — they go through RTK Query endpoints.
- Business logic lives in **selectors, slice reducers, or utility functions** — not inside components.
- Components are presentation-first: receive props, render UI, dispatch actions.

### 2.2 Server vs Client Components (Next.js 16 / React 19)

- **Server Components are the default.** Push `'use client'` to leaves only.
- A component must be a Client Component when it uses: hooks (`useState`, `useEffect`, custom hooks calling them), browser APIs, event handlers, or React Context.
- Co-locate `'use client'` with the smallest unit that needs it. A page with one interactive button should not flip the whole page to client.
- Server Components can fetch data directly (`async` components) and stream with Suspense; prefer this over RTK Query for data the page needs at first paint.
- Server Actions (`'use server'`) handle mutations from the server boundary; pair with `revalidatePath` / `revalidateTag` to refresh cached data:
  ```ts
  'use server';
  import { revalidatePath } from 'next/cache';
  export async function updateUser(id: string) {
    await db.user.update(...);
    revalidatePath('/profile');
  }
  ```

### 2.3 Folder Boundaries

- `src/components/shared/` — reusable, app-agnostic primitives (Button, Input, Modal). Zero business knowledge.
- `src/components/pages/` — feature-specific composition. May import shared components and call hooks.
- `src/components/layout-elements/` — global chrome (Header, TabBar, Drawer). Singleton-like.
- **Cross-feature imports between sibling `pages/*` directories are forbidden.** Promote shared logic to `shared/` or `hooks/`.

### 2.4 Component Decomposition

- **One component per file.** A list item, card section, form block, or stat row each gets its own file.
- If a component exceeds ~150 lines or contains a self-contained visual unit, extract it.
- Parent components compose; leaf components render. Use `/decompose` skill on overgrown files.

### 2.5 State Management

- **RTK Query for server state** — caching, invalidation, loading, errors handled by the library.
- **Redux slices** for app-wide client state (auth, theme, drawer state).
- **`useState` / `useReducer`** for local component state only.
- **Never duplicate server state into Redux.** Use RTK Query selectors / hooks directly.

### 2.6 RTK Query Conventions

- One file per resource: `src/api/<resource>.api.ts`, registered via `api.injectEndpoints`.
- Every endpoint declares `providesTags` (queries) or `invalidatesTags` (mutations).
- Cache tags registered in `src/constants/rtk-tags.ts` before use.
- Mock data wired through `src/mock/index.mock.ts` for every new endpoint (use `/new-rtk-endpoint` skill).

**ID-scoped tags** (recommended pattern from RTK docs — invalidates only the affected entity instead of the whole list):

```ts
getTickets: build.query<Ticket[], void>({
  providesTags: (result) =>
    result
      ? [
          ...result.map(({ id }) => ({ type: 'Ticket' as const, id })),
          { type: 'Ticket', id: 'LIST' },
        ]
      : [{ type: 'Ticket', id: 'LIST' }],
}),
updateTicket: build.mutation<Ticket, Partial<Ticket> & Pick<Ticket, 'id'>>({
  invalidatesTags: (_r, _e, { id }) => [{ type: 'Ticket', id }],
}),
addTicket: build.mutation<Ticket, NewTicket>({
  invalidatesTags: [{ type: 'Ticket', id: 'LIST' }], // only the list, not every ticket
}),
```

**Optimistic updates** for low-risk, high-frequency mutations (toggling favorites, claim states):

```ts
async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
  const undo = dispatch(api.util.updateQueryData('getTicket', id, draft => Object.assign(draft, patch)));
  try { await queryFulfilled; } catch { undo.undo(); }
}
```

### 2.7 Routing

- Next.js App Router with route groups: `(auth)`, `(tabs)`, `(out-tabs)`.
- All paths use the `routes` constant from `src/constants/routes.ts` — **never** hardcode strings.
- Any prop holding a navigation target uses the `Route` type, not `string`.
- Modal/drawer routes use the `(out-tabs)` group with `@header` parallel slot.

### 2.8 Forms

- React Hook Form + Yup, wired through the project's `Form` and `FormItem` components.
- Schemas are factory functions that receive `t`. Use `/new-yup-schema` skill.
- Submit handlers receive validated, typed data — no need to re-check inside.

### 2.9 Modals & Overlays

- All modals use the project's portal + `inert` + animation pattern (use `/new-modal` skill).
- `inert={!open ? true : undefined}` — never `inert={false}` (React strips boolean HTML attributes set to `false`).
- Focus trap and `aria-hidden` are mandatory for accessibility.

### 2.10 Internationalization

- Every user-visible string goes through `t()` via `useAppTranslations`.
- Three locales (`en`, `hy`, `ru`) must remain in sync. Use `/sync-translations` skill.
- ICU message format for plurals and interpolation: `t('items', { count })`.

### 2.11 Constants & Magic Values

- Coin name (`'LTC'`), referral percentages, password lengths, stake durations live in `src/constants/global.constants.ts`.
- No magic numbers in components. If a value has business meaning, it belongs in constants.

---

## 3. Code Quality

### 3.1 TypeScript

- **Strict mode is non-negotiable.** No `@ts-ignore` without an inline reason.
- No `any` — use `unknown` and narrow, or define the proper type.
- `import type { ... }` for type-only imports.
- Mark immutable props as `readonly`.
- Interfaces for component props; types for unions and utility types.

### 3.2 Naming Conventions

| Artifact        | Convention        | Example              |
| --------------- | ----------------- | -------------------- |
| Component file  | PascalCase        | `TicketCard.tsx`     |
| Component props | `<Name>Props`     | `TicketCardProps`    |
| Hook            | `use*`            | `useCountDown`       |
| Util            | `*.utils.ts`      | `date.utils.ts`      |
| API             | `*.api.ts`        | `tournaments.api.ts` |
| Schema          | `*.schemes.ts`    | `auth.schemes.ts`    |
| Type            | `*.types.ts`      | `ticket.types.ts`    |
| Interface       | `*.interfaces.ts` | `user.interfaces.ts` |
| Enum            | `*.enums.ts`      | `ticket.enums.ts`    |

### 3.3 Imports

- **Always use `@/` alias** — no relative `../../` paths.
- Order: node modules → `@/` aliases → relative → styles.
- Type-only imports separated with `import type`.

### 3.4 Component Patterns

- Named exports for components, hooks, utils. Default exports only for pages and layouts.
- Extend native HTML props when wrapping elements: `extends ButtonHTMLAttributes<HTMLButtonElement>`.
- Variant maps as `Record<Variant, string>` — not inline ternaries.
- Use `twMerge()` for all class composition. Never string concatenation.
- Sub-element styling via a single `classNames` object, not multiple `className*` props.

### 3.5 React Compiler (enabled in this project)

- The compiler memoizes automatically. **Don't pre-empt it with manual `useMemo` / `useCallback`** unless profiling shows it's needed.
- Pure function components only — no mutations of props or external state during render.
- Do not introduce custom directive strings (e.g., `'use foo'`) — the compiler treats unknown directives as opt-outs and may bail out of optimization.

### 3.6 Comments

- Default to **no comments**. Well-named identifiers tell the story.
- Comment only when the **why** is non-obvious — hidden constraints, workarounds, subtle invariants.
- No reference to tickets, PRs, or "added for X flow" — those rot. That belongs in the PR description.
- No multi-paragraph docstrings. One short line, max.

### 3.7 Error Handling

- Fail loud at system boundaries (API calls, form submission). Surface a localized error to the user.
- Never swallow errors silently. If you must catch, log it with context.
- No defensive checks for impossible states. Trust framework guarantees and internal contracts.
- Use **Error Boundaries** at route or feature level so a single component crash does not blank the app.

### 3.8 Linting & Formatting

- ESLint and Prettier are enforced. CI blocks merges on failures.
- `npm run check-quality` (or `/check-quality` skill) before declaring a task done.
- ESLint rules of note: `@typescript-eslint/no-explicit-any: warn`, `@typescript-eslint/no-unused-vars: error` (prefix unused with `_`).

### 3.9 Code Review

- All changes via PR. No direct pushes to `main`.
- PRs are small, focused, reviewable in ≤ 30 minutes.
- One logical change per PR. Refactors and feature work go in separate PRs.
- Two-person review for any change touching: auth, payments (Telegram Stars), audit logging, or security headers.

### 3.10 Git Hygiene

- Conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `perf:`, `test:`.
- Commit message explains **why**, not what.
- Squash merge by default to keep `main` history clean.

### 3.11 No Premature Abstraction

- Three similar lines is fine. Wait until the fourth before extracting.
- Don't add helpers, hooks, or wrappers for hypothetical future use.
- Delete unused code — no `_var` renames, no `// removed for X` comments.

---

## 4. Performance

> Sources: Next.js 16 docs, web.dev Core Web Vitals, React 19 release notes.

### 4.1 Core Web Vitals Targets

| Metric                          | Target  | Critical Threshold |
| ------------------------------- | ------- | ------------------ |
| LCP (Largest Contentful Paint)  | < 2.5s  | > 4.0s             |
| INP (Interaction to Next Paint) | < 200ms | > 500ms            |
| CLS (Cumulative Layout Shift)   | < 0.1   | > 0.25             |
| TTFB                            | < 800ms | > 1.8s             |
| FCP                             | < 1.8s  | > 3.0s             |

Measured via the `useReportWebVitals` hook from `next/web-vitals` (RUM) and Lighthouse / Chrome DevTools MCP (synthetic).

### 4.2 Web Vitals Reporting

Place this in a dedicated client component (Next.js 16 pattern — keeps the client boundary minimal):

```tsx
'use client';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals(metric => {
    // ship to analytics endpoint
    navigator.sendBeacon('/api/vitals', JSON.stringify(metric));
  });
  return null;
}
```

Mount once in the root layout.

### 4.3 Bundle Size

- Default to Server Components; `'use client'` is opt-in.
- **Dynamic imports** for heavy, below-the-fold components: `next/dynamic` with `loading` skeletons.
- Tree-shake icon libraries — import individual icons from `lucide-react`, never the whole package.
- Run `next build` and inspect with `@next/bundle-analyzer` on every major feature.
- **Note (Next.js 16):** the legacy "First Load JS" metric was removed from build output because it was inaccurate for RSC apps. Use Lighthouse / Vercel Analytics instead.
- Telegram WebApp budget: **initial JS < 200 KB gzipped** for fast cold-start in the in-app browser.

### 4.4 `next/image` (always)

Never use raw `<img>`. Always provide `width`, `height`, and `sizes`. Use `priority` only on the LCP image (above-the-fold hero):

```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, 1200px"
  priority
  placeholder="blur"
  blurDataURL={...}
/>
```

- Use `quality={75}` (default) unless you have a reason; for thumbnails go lower.
- AVIF/WebP served automatically by Next's optimizer.
- Lazy-load by default; eager-load only the LCP image.

### 4.5 Caching (Next.js 16)

- **`cacheComponents: true`** in `next.config.ts` enables granular component-level caching (replaces `experimental.dynamicIO` from Next 15).
- `fetch` cache modes:
  - `cache: 'force-cache'` — static, manually invalidated (replaces `getStaticProps`)
  - `cache: 'no-store'` — fresh every request (replaces `getServerSideProps`)
  - `next: { revalidate: N }` — ISR, N-second TTL
- On-demand invalidation in Server Actions:
  ```ts
  'use server';
  import { revalidatePath, revalidateTag } from 'next/cache';
  await mutate();
  revalidateTag('tickets');
  ```
- Pair with RTK Query tag invalidation on the client for end-to-end consistency.

### 4.6 Lists, Pagination, Virtualization

- Never render unbounded lists. Paginate, infinite-scroll with windowing, or virtualize (`react-window`).
- Tournament lists, leaderboards, ticket history all paginate server-side.
- Use the `PARTIAL-LIST` tag pattern (§2.6) so a page mutation doesn't refetch every item.

### 4.7 RTK Query Cache Tuning

- `keepUnusedDataFor` defaults are usually fine; tune per-endpoint for hot data (lower TTL) or stable data (higher TTL).
- `selectFromResult` to subscribe to a slice of the cache and avoid unnecessary re-renders.
- `prefetch` on hover/intent for expected navigations (e.g., ticket detail link).

### 4.8 Animations

- **CSS-only** entry animations. Never JS timers.
- Use `animate-fade-in`, `animate-slide-in-bottom` with inline `animationDelay` for staggered lists (`50ms` dense grids, `100ms` regular lists).
- Animate **`transform` and `opacity` only** — these are GPU-composited. Avoid `width`, `height`, `top`, `left`.
- Honor `prefers-reduced-motion` via Tailwind v4 `motion-safe:` / `motion-reduce:` variants.

### 4.9 Database & API (server side)

- Index every column used in `WHERE`, `JOIN`, or `ORDER BY`.
- Avoid N+1 — batch with `IN` queries, dataloaders, or joins.
- `EXPLAIN ANALYZE` on every new query touching > 1k rows.
- Cache hot reads in Redis with TTLs aligned to data volatility.

### 4.10 Turbopack (Next.js 16)

- Turbopack is the default dev bundler in Next.js 16. Configure at the **top level** of `next.config.ts` (not under `experimental`):
  ```ts
  const nextConfig: NextConfig = {
    turbopack: {
      /* options */
    },
  };
  ```

---

## 5. Observability

### 5.1 Logging

- **Structured JSON logs** in production. Each log line includes: `level`, `message`, `timestamp`, `requestId`, `userId` (if authenticated), `route`.
- Levels: `error` (broken), `warn` (degraded), `info` (significant business event), `debug` (dev-only).
- **Never log:** raw tokens, passwords, full PII, Telegram `initData`, payment details.
- Propagate a `requestId` correlation ID from edge → backend → DB so a single user action is traceable.

### 5.2 Error Tracking

- Client and server errors flow to **Sentry** (or equivalent). Source maps uploaded on every deploy.
- Tag errors with: release version, hashed user ID, route, feature flag exposure.
- **React Error Boundaries** at route and feature level — never let an error crash the whole app.
- Alert on error rate spikes (> 1% of requests over 5 min).

### 5.3 RED Metrics

For every API endpoint and critical user flow, track:

- **Rate** — requests per second
- **Errors** — error rate per endpoint
- **Duration** — p50, p95, p99 latency

**Critical user flows to instrument** (page these on regressions):

- Login / Telegram auth handshake
- Ticket purchase
- Stake placement / settlement
- Tournament join / claim
- Wallet top-up via Telegram Stars
- Friend claim modal flow

### 5.4 Real User Monitoring (RUM)

- Capture Core Web Vitals (LCP, INP, CLS, TTFB, FCP) from real users via `useReportWebVitals` (§4.2).
- Segment by device class (mobile/desktop/Telegram WebView), country, and route.
- Investigate any sustained regression > 10% in any metric.

### 5.5 Distributed Tracing

- OpenTelemetry instrumentation across client → server → database.
- Trace IDs included in error reports and logs for cross-system debugging.

### 5.6 Dashboards

- One dashboard per major surface: Auth, Tickets, Tournaments, Stakes, Wallet, Market.
- Each dashboard shows: traffic, error rate, latency p95, business KPI (e.g., tickets purchased / hour, LTC top-ups / hour).
- A separate **on-call dashboard** surfaces only the alerts that page someone — keep it scannable.

### 5.7 Alerting

- Alert on **user-impact**, not noise. SLO burn rate > 2× triggers a page; minor blips do not.
- Every alert has a runbook linked in the alert message.
- Alert fatigue is a bug — review and tune monthly. If an alert never requires action, delete it.

### 5.8 SLOs

Recommended starting SLOs:
| Surface | Availability | p95 Latency |
|---|---|---|
| Authentication | 99.9% | < 500ms |
| Ticket / Stake / Tournament APIs | 99.5% | < 800ms |
| Wallet / Payment | 99.9% | < 1.2s |
| Static asset CDN | 99.95% | < 200ms |

### 5.9 Health Checks

- `GET /api/health/liveness` — process is up.
- `GET /api/health/readiness` — dependencies (DB, Redis, Telegram API) reachable.
- Used by load balancers for traffic routing and uptime monitors.

### 5.10 Feature Flags & Experiments

- Feature flags decouple deploy from release. Roll out gradually, monitor, roll back instantly.
- Track flag exposure in metrics so regressions can be attributed.
- Clean up dead flags within 30 days of full rollout.

### 5.11 Audit Trail

- Append-only log of privileged actions (defined in §1.12). Queryable for compliance and incident review.

---

## 6. Documentation

### 6.1 Repository Documentation Map

| File                       | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `README.md`                | Setup, run, deploy, contribute                  |
| `AGENTS.md`                | Project rules and conventions (source of truth) |
| `DOCS/DOCS.md`             | Business logic and product behavior             |
| `DOCS/STANDARDS.md`        | This document — engineering standards           |
| `DOCS/adr/`                | Architecture Decision Records                   |
| `DOCS/runbooks/`           | On-call runbooks per alert                      |
| `.claude/PROJECT_RULES.md` | Claude Code-specific rules (R1–R31)             |
| `.claude/skills/`          | Invokable scaffolding skills                    |

### 6.2 README Requirements

- One-paragraph project description
- Prerequisites (Node version, package manager)
- Setup steps (install, env vars, run dev)
- Common scripts (`dev`, `build`, `lint`, `type-check`, `format`)
- Link to deeper docs (`AGENTS.md`, `DOCS/`)

### 6.3 Business Logic Docs

- `DOCS/DOCS.md` is the **source of truth for product behavior**: tickets, tournaments, tasks, stakes, leaderboard, market, wallet, statuses, Telegram Stars, referrals.
- Every change that modifies business rules **must** update `DOCS/DOCS.md` in the same PR.
- Use the `/docs-drift` skill to detect mismatches between code and docs before merging.

### 6.4 Code Comments

- Default: **no comments**. Names and types document themselves.
- Comment only when the **why** is non-obvious — hidden constraints, workarounds, subtle invariants.
- No "added for X" or "used by Y" — those rot the moment refactors happen.
- No multi-paragraph docstrings. One short line, max.

### 6.5 Architecture Decision Records (ADRs)

Significant architectural decisions get an ADR in `DOCS/adr/NNNN-<slug>.md`:

```markdown
# NNNN. <decision title>

## Status

Accepted | Superseded by NNNN | Deprecated

## Context

What problem are we solving?

## Decision

What did we choose?

## Consequences

What are the trade-offs?

## Alternatives considered

What else did we evaluate, and why not?
```

ADRs are **append-only**. Don't edit accepted ADRs — write a superseding one.

**Trigger an ADR for:** new external dependency, change in auth model, new caching layer, framework version major bump, schema-altering migrations, monetization changes.

### 6.6 API Documentation

- Every RTK Query endpoint file documents its query/mutation shape via TypeScript types — types are docs.
- Server-side endpoints exposed by an OpenAPI / Swagger spec, generated and versioned alongside the code.
- Include example request/response in the OpenAPI definitions.

### 6.7 Runbooks

- Every alert links to a runbook in `DOCS/runbooks/<alert-slug>.md`.
- Required sections:
  - **Symptom** — what the user / monitor sees
  - **Probable causes** — ordered by likelihood
  - **Diagnostic steps** — exact queries / commands
  - **Mitigation** — short-term fix
  - **Rollback** — how to revert the bad change
  - **Escalation** — who to ping if you're stuck

### 6.8 Translation Files

- `messages/{en,hy,ru}.json` are the canonical translation source. Keep keys identical across all three.
- Use `/sync-translations` to verify parity before committing.
- Missing keys silently render the raw key string in the UI — treat any drift as a bug.

### 6.9 Changelog

- Maintain `CHANGELOG.md` following Keep a Changelog format. Update on every release.
- Sections: Added, Changed, Deprecated, Removed, Fixed, Security.
- Link each entry to a PR or ADR.

### 6.10 PR Descriptions

- Title: short, imperative, ≤ 70 chars.
- Body sections:
  - **Summary** — 1–3 bullets of what changed
  - **Why** — motivation, linked issue
  - **Test plan** — how the reviewer can verify
  - **Screenshots / video** — for any UI change
  - **Risk** — what could break and how we'd notice
- A PR with no test plan is incomplete.

---

## 7. Compliance Checklist

Before merging any non-trivial change, confirm:

**Quality gates**

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run format` clean
- [ ] No `any`, no `@ts-ignore` without justification

**Conventions**

- [ ] No hardcoded user-facing strings (i18n via `t()`)
- [ ] No hardcoded routes (use `routes` constant + `Route` type)
- [ ] No magic numbers (extracted to `global.constants.ts`)
- [ ] Translations synced across `en`, `hy`, `ru`
- [ ] One component per file; classes composed via `twMerge`

**Architecture**

- [ ] No `fetch` in components — through RTK Query
- [ ] New endpoints have `providesTags` / `invalidatesTags`
- [ ] New mock data wired through `src/mock/index.mock.ts`
- [ ] `'use client'` used only where required (hooks, browser APIs, events)

**Security**

- [ ] No secrets in diff, no PII in logs
- [ ] All new inputs validated with Yup at API boundary
- [ ] Auth/role checks on the server, not just the client
- [ ] Mutations are idempotent or use idempotency keys (payments)

**Performance**

- [ ] No raw `<img>` — uses `next/image`
- [ ] No manual `useMemo` / `useCallback` without measured need
- [ ] Animations use `transform` / `opacity` only
- [ ] Lists are paginated or virtualized

**Documentation**

- [ ] Business-logic changes reflected in `DOCS/DOCS.md`
- [ ] ADR written for significant architectural decisions
- [ ] Runbook updated/created if a new alert was added
- [ ] PR has summary, why, test plan, and (for UI) screenshots

---

> **Treat this document as a living standard.** When a rule no longer reflects reality — because the framework moved, the threat model changed, or we found a better pattern — update it via PR and link the ADR that drove the change.
