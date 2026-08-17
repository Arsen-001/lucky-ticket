import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The paid engine action is ONE tap: pay Stars → the cycle's tickets land in the
 * inventory → the engine starts its next cycle.
 *
 * It was two taps between 2026-06-30 and today. `POST engines/skip` only filled
 * `pendingCount`, leaving the player to press Claim again, and the reason was
 * written into the code: claiming awarded AP, so collapsing the two steps would
 * have swallowed it. The backend removed AP from engine claims on 2026-07-08
 * ("Economy: engine claims award no AP"), which left the second tap costing a
 * tap and buying nothing — while `instantClaimEngine`, the endpoint built for
 * this, sat unreferenced for over a month.
 *
 * Source assertions rather than behavioural ones because the failure mode is a
 * silent rewiring, not a broken render. DOCS §9.6 describes the one-tap shape;
 * these keep the code on that side of the line.
 */

const root = resolve(__dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const PAID_BUTTON_SCREENS = [
  'src/components/pages/tabs/home/HomeEnginesSlider.tsx',
  'src/components/pages/out-tabs/tabs-extra/engine/EngineDetails.tsx',
];

describe('instant claim is one tap', () => {
  it.each(PAID_BUTTON_SCREENS)('%s pays through instant-claim', path => {
    const source = read(path);
    expect(source).toMatch(/useInstantClaimEngineMutation/);
    expect(source).not.toMatch(/skipEngineCycle/);
  });

  it('the two-step mutation is gone from the client', () => {
    // The backend route survives; nothing here calls it. A re-added mutation
    // with no caller is exactly what made this take a month to notice.
    const api = read('src/api/engines.api.ts');
    expect(api).not.toMatch(/skipEngineCycle/);
    expect(api).not.toMatch(/engines\/skip/);
  });

  it('the paid button promises collection, not a skipped wait', () => {
    // A button still labelled "Skip" would now be describing a claim.
    //
    // The visible label is the bare verb since a1c499f (17.08.2026): at readable
    // type «Забрать сейчас · 1» took 133px of a 260px row and pushed the ticket
    // name off the strip. The adverb did not disappear — it moved to the
    // button's `title` and the confirm modal — so that is what this now checks.
    const row = read('src/components/pages/out-tabs/tabs-extra/ticket/EngineCardCycleRow.tsx');
    expect(row).toMatch(/t\('claim'\)/);
    expect(row).toMatch(/t\('instant claim with stars'\)/);
    expect(row).not.toMatch(/t\('skip'\)/);

    const slider = read('src/components/pages/tabs/home/HomeEnginesSlider.tsx');
    expect(slider).toMatch(/t\('instant claim title'\)/);
    expect(slider).toMatch(/t\('instant claim description'\)/);
    expect(slider).not.toMatch(/t\('skip cycle/);
  });

  it('the retired copy is gone from every locale, and the new copy is in all of them', () => {
    for (const locale of ['en', 'ru', 'de']) {
      const messages = JSON.parse(read(`messages/${locale}.json`)) as Record<string, string>;
      expect(messages['instant claim title'], locale).toBeTruthy();
      expect(messages['instant claim description'], locale).toBeTruthy();
      for (const dead of ['skip', 'skip cycle title', 'skip cycle description']) {
        expect(messages[dead], `${locale}: ${dead}`).toBeUndefined();
      }
    }
  });
});
