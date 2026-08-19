import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

const HOOK = 'src/components/pages/out-tabs/drawer/test-quest/useTestQuestScreen.ts';
const PANEL = 'src/components/pages/out-tabs/drawer/test-quest/TestQuestSteps.tsx';
const CHAIN = 'src/components/pages/out-tabs/drawer/test-quest/TestQuestChain.tsx';
const HOME = 'src/components/pages/tabs/home/HomeTestQuestCard.tsx';
const MOCK = 'src/mock/testQuest.mock.ts';

/**
 * The Test-Quest checklist is a CONDITION of the daily claim, not decoration.
 *
 * Until 19.08.2026 the backend paid a level out on the daily reset and the
 * channel subscription alone — `stepProgress` was documented "display-only" —
 * so the whole 31-day ladder was walkable by opening the app once a day and
 * pressing Gift, doing none of the tasks. The server is the authority and
 * refuses now (`unmetSteps`, backend `test-quest.service.ts`); these assertions
 * keep the Mini App from offering a button that server will only reject.
 */
describe('test-quest — the screen respects the checklist gate', () => {
  it('the screen hook reads the server verdict and blocks the claim on it', () => {
    const src = read(HOOK);
    expect(src).toMatch(/const stepsComplete = data\?\.stepsComplete \?\? true;/);
    // The claim handler must bail on it, exactly like it does on the channel gate.
    const handler = src.slice(
      src.indexOf('const handleClaim'),
      src.indexOf('const handleVerifyChannel')
    );
    expect(handler).toMatch(/!stepsComplete/);
  });

  it('the checklist panel locks its CTA instead of offering a claim', () => {
    const src = read(PANEL);
    expect(src).toMatch(/const tasksBlocked = !gateBlocked && !stepsComplete;/);
    // The locked branch renders a disabled button — never `onClaim`.
    const branch = src.slice(src.indexOf('tasksBlocked ? ('), src.indexOf(') : gateBlocked ? ('));
    expect(branch).toMatch(/disabled/);
    expect(branch).not.toMatch(/onClaim/);
  });

  it('the chain passes the verdict down — an unwired prop would default to open', () => {
    expect(read(CHAIN)).toMatch(/stepsComplete=\{s\.stepsComplete\}/);
  });

  it('the home card only promises a gift when both gates are clear', () => {
    // A pulsing gift badge on Home that leads to a locked CTA is a broken promise.
    expect(read(HOME)).toMatch(
      /claimableToday \?\? false\) && \(data\?\.stepsComplete \?\? true\)/
    );
  });

  it('the mock serves the field and refuses to advance without it', () => {
    const src = read(MOCK);
    expect(src).toMatch(/stepsComplete: unmet\.length === 0/);
    // Dev mode must show the same wall as production, or the branch is untested
    // in the only environment anyone actually clicks through.
    expect(src).toMatch(/channelSubscribed && before\.stepsComplete/);
  });
});
