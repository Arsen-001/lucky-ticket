import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * A screen that notices its query failed must SAY so.
 *
 * The failure mode this guards is quiet: when the backend 500s or times out and
 * nothing renders an error, the screen still draws — as an empty list, a zero
 * balance, a "nothing here yet". The player reads that as their own account
 * being empty, not as the server being down, and there is no retry anywhere on
 * screen. Nothing throws, so the error boundary never fires and the e2e sweep
 * stays green: every one of those screens renders text and has no console error.
 *
 * The rule is therefore narrow on purpose: if a file goes to the trouble of
 * reading `isError`, it must do something visible with it. Owning a query
 * without reading `isError` is not caught here — that is a secondary query
 * (partner stats behind a form, `me` on a locked-tier screen), and demanding a
 * full-screen error state for those would be worse than the disease.
 *
 * Both escapes are legitimate and both exist in this codebase, which is why the
 * check accepts either:
 *  - render an error component (`QueryErrorState` is the shared one, but
 *    `LeaderboardErrorState` and `TasksLoadError` are bespoke and correct — a
 *    locked leaderboard and a task list want their own copy);
 *  - hand `isError` / `error` down to a child that renders it.
 *
 * Audited 13.08.2026 across `src/components`: 32 files render the shared
 * component, 2 render their own, and the rest never look at `isError`.
 */
const COMPONENTS = new URL('../src/components', import.meta.url).pathname;

const tsxFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return tsxFiles(full);
    return entry.name.endsWith('.tsx') ? [full] : [];
  });

describe('a failed query is never drawn as an empty screen', () => {
  it('every file that reads isError also shows it or passes it on', () => {
    const silent: string[] = [];

    for (const file of tsxFiles(COMPONENTS)) {
      const source = readFileSync(file, 'utf8');
      if (!/use[A-Za-z]+Query\(/.test(source)) continue;
      if (!/\bisError\b/.test(source)) continue;

      // Rendered as JSX, not merely imported: `<SomethingErrorState`,
      // `<TasksLoadError`, `<QueryErrorState`.
      const rendersError = /<[A-Z][A-Za-z]*(Error[A-Za-z]*|LoadError)\b/.test(source);
      // Or handed to a child to render. Narrowly `isError=`: a bare `error={`
      // matches form errors, toast payloads and half a dozen other things, and
      // an escape hatch that wide makes the check unable to fail at all.
      const passesError = /\bisError=\{/.test(source);

      if (!rendersError && !passesError) silent.push(path.relative(COMPONENTS, file));
    }

    expect(silent).toEqual([]);
  });
});
