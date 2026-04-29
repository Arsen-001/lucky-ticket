---
name: check-quality
description: Run type-check, lint, and prettier formatting in sequence and surface any failures with their file paths and line numbers. Use after non-trivial changes — especially edits to types, RTK endpoints, routes, or yup schemas — and before declaring a task complete. The repo has no test framework, so type-check + lint are the safety net.
---

# check-quality

Run the project's quality scripts and report failures concisely.

## When to use

- After editing types in `src/types/`
- After adding/modifying any `*.api.ts`, `*.slice.ts`, or `*.schemes.ts`
- After touching routes, mocks, or component prop signatures
- Before saying "done" on any non-trivial task
- When the user asks "is everything okay?" / "run the checks" / "make sure it builds"

## Steps

Run in this order. Stop at the first failure and report.

```bash
npm run type-check
npm run lint
npm run format
```

Run them in parallel as Bash tool calls in a single message — they're independent.

## What to report

- **Pass**: one line per check, e.g. `type-check ✓ / lint ✓ / format ✓`
- **Fail**: file path, line number, the actual error message. Don't paraphrase TypeScript errors — quote them verbatim.
- Don't dump the entire log; pull out the relevant errors.

## Don'ts

- Don't skip these because "the change looks safe" — the React Compiler can hide subtle TS errors until type-check runs
- Don't run `npm run build` instead — it's much slower and exercises the same TS checker
- Don't use `--no-verify` to bypass pre-commit Prettier
- Don't auto-suppress with `@ts-ignore`/`eslint-disable` — fix the underlying issue. If suppression is truly necessary, add a one-line `// eslint-disable-next-line <rule> -- <reason>` and tell the user
