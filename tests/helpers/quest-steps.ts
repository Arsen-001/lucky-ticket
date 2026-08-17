import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The checklist as the SERVER defines it — the only copy that exists now.
 *
 * Until 18.08.2026 the Mini App carried its own ladder and every guard in this
 * folder read that one, i.e. the copy players never see. The two drifted, the
 * app fell back to its own list whenever the server's looked wrong, and the
 * result was a production checklist whose counters never moved while the whole
 * suite stayed green. The local copy is gone; these helpers read the backend
 * source so the guards check what actually ships.
 *
 * Requires the backend checked out next to this repo. Callers skip when it is
 * absent (CI clones only the frontend) — and say so out loud rather than
 * quietly passing.
 */

export interface WireStep {
  labelKey: string;
  target?: number;
  action?: string;
  kind: string;
  gate?: string;
}

export const BACKEND_LEVELS_PATH = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/test-quest/test-quest.levels.ts'
);

export const hasBackend = existsSync(BACKEND_LEVELS_PATH);

/**
 * Parse a `Record<number, Step[]>` literal out of TypeScript source.
 *
 * Brace-balanced, not line-based: the block is generated one step per line and
 * prettier then wraps any step past 80 characters onto four. A line-based
 * parser silently produced `kind: ''` for those — hence `assertParsed` below.
 */
export const parseStepsBlock = (
  source: string,
  declaration: string
): Record<number, WireStep[]> => {
  const start = source.indexOf(declaration);
  if (start === -1) throw new Error(`${declaration} not found`);
  const block = source.slice(start, source.indexOf('\n};\n', start));
  const out: Record<number, WireStep[]> = {};

  const heads = [...block.matchAll(/\n {2}(\d+): \[/g)];
  for (let i = 0; i < heads.length; i += 1) {
    const level = Number(heads[i][1]);
    const from = heads[i].index! + heads[i][0].length;
    const to = i + 1 < heads.length ? heads[i + 1].index! : block.length;

    const steps: WireStep[] = [];
    for (const raw of block.slice(from, to).match(/\{[^{}]*\}/g) ?? []) {
      const text = raw.replace(/\s+/g, ' ');
      const label = text.match(/labelKey: '([^']+)'/);
      if (!label) continue;
      const target = text.match(/target: (\d+)/);
      const action = text.match(/action: '([^']+)'/);
      const kind = text.match(/kind: '([^']+)'/);
      const gate = text.match(/gate: '([^']+)'/);
      steps.push({
        labelKey: label[1],
        ...(target ? { target: Number(target[1]) } : {}),
        ...(action ? { action: action[1] } : {}),
        kind: kind ? kind[1] : '',
        ...(gate ? { gate: gate[1] } : {}),
      });
    }
    out[level] = steps;
  }
  return out;
};

/** The backend's per-level checklist — what `GET /test-quest` will send. */
export const backendSteps = (): Record<number, WireStep[]> =>
  parseStepsBlock(readFileSync(BACKEND_LEVELS_PATH, 'utf8'), 'export const TEST_QUEST_STEPS');

/** The mock's copy — what localhost serves, so dev sees what production sees. */
export const mockSteps = (): Record<number, WireStep[]> =>
  parseStepsBlock(
    readFileSync(resolve(process.cwd(), 'src/mock/testQuest.mock.ts'), 'utf8'),
    'const MOCK_STEPS'
  );
