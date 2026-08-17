import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { GlobalConstants } from '@/constants/global.constants';
import {
  getTestQuestSteps,
  resolveTestQuestSteps,
  testQuestLadder,
  type TestQuestStep,
} from '@/constants/testQuest.constants';
import { CHIP_MINT_SHARD_COST } from '@/utils/global/inventory.utils';
import { MAX_BOOST_LEVEL } from '@/utils/global/ticket-engine.utils';
import en from '@messages/en.json';
import ru from '@messages/ru.json';

/**
 * Shape guard for the 31-day Test-Quest checklist (`TEST_QUEST_STEP_OVERRIDES`).
 *
 * The checklist is DISPLAY-ONLY — `TestQuestService.claim()` gates on the badge,
 * the daily reset and the channel subscription, and verifies not one of these
 * steps. That is a product decision, and it is exactly why the text has to be
 * honest on its own: nothing downstream will refuse an impossible task, so an
 * unreachable line just sits there telling a player to do something they cannot.
 *
 * Каждая проверка ниже стоит за конкретным дефектом, найденным 17.08.2026.
 */

const STATUS_STEP_TIER: Record<string, keyof typeof GlobalConstants.apTierThresholds> = {
  'quest step reach silver': 'silver',
  'quest step keep silver': 'silver',
  'quest step reach gold': 'gold',
  'quest step keep gold': 'gold',
  'quest step reach platinum': 'platinum',
  'quest step keep platinum': 'platinum',
  'quest step reach diamond': 'diamond',
  'quest step keep diamond': 'diamond',
};

/**
 * Generous upper bound on the one-time catalogue's Activity Points — the live
 * total was 1 593 AP over 110 tasks (14.08.2026) and `tests/economy-sim.test.ts`
 * pins it under 2 200. Using the ceiling keeps this test independent of the
 * backend checkout and makes every failure a real impossibility, never a
 * borderline call.
 */
const CATALOG_AP_CEILING = 2_200;

/** The most AP anyone can hold by day N: full daily ceiling + the whole catalogue. */
const apCeilingByDay = (day: number) =>
  GlobalConstants.dailyBaselineApByTier.bronze * day + CATALOG_AP_CEILING;

const targetOf = (steps: TestQuestStep[], labelKey: string) =>
  steps.find(s => s.labelKey === labelKey)?.target;

const levels = testQuestLadder.map(l => ({ ...l, steps: getTestQuestSteps(l.level) }));

describe('test-quest checklist', () => {
  it('every level ends with the channel gate, exactly once', () => {
    for (const l of levels) {
      const gates = l.steps.filter(s => s.gate === 'channel');
      expect(gates, `level ${l.level}`).toHaveLength(1);
      expect(l.steps.at(-1)?.gate, `level ${l.level} last step`).toBe('channel');
    }
  });

  it('every step label exists in both authored dictionaries', () => {
    for (const l of levels) {
      for (const s of l.steps) {
        expect(en, `en.json ← level ${l.level}`).toHaveProperty(s.labelKey);
        expect(ru, `ru.json ← level ${l.level}`).toHaveProperty(s.labelKey);
      }
    }
  });

  it('the counted core grows every level — no clone levels', () => {
    // The de-plateau rule: spend / ads / share / upgrade must move on EVERY
    // level, or two consecutive days ask for the same thing and the ladder
    // stops reading as progress.
    const core = [
      'quest step spend tickets',
      'quest step watch ads',
      'quest step share',
      'quest step upgrade engine',
    ] as const;
    for (const key of core) {
      const series = levels
        .map(l => ({ level: l.level, target: targetOf(l.steps, key) }))
        .filter((x): x is { level: number; target: number } => x.target != null);
      for (let i = 1; i < series.length; i++) {
        expect(
          series[i].target,
          `${key}: level ${series[i].level} vs ${series[i - 1].level}`
        ).toBeGreaterThan(series[i - 1].target);
      }
    }
  });

  it('the shard run lands on a chip, and the chip comes after the shards', () => {
    // 20 shards of a tier mint one chip. The ladder exists to reach that, so the
    // last shard milestone must clear the mint cost, and the "mint / equip"
    // steps must sit BELOW it (i.e. on a later, lower-numbered level) — asking
    // for a chip while the shard count is still short is the same class of
    // defect as "reach Platinum on day 27".
    const mintCost = CHIP_MINT_SHARD_COST.bronze;
    const series = levels
      .map(l => ({ level: l.level, target: targetOf(l.steps, 'quest step buy shards') }))
      .filter((x): x is { level: number; target: number } => x.target != null);

    expect(series.length, 'the shard ladder must exist').toBeGreaterThan(0);
    for (let i = 1; i < series.length; i++) {
      expect(
        series[i].target,
        `shards: level ${series[i].level} vs ${series[i - 1].level}`
      ).toBeGreaterThan(series[i - 1].target);
    }
    const last = series.at(-1)!;
    expect(last.target, 'final shard milestone vs mint cost').toBeGreaterThanOrEqual(mintCost);

    for (const l of levels) {
      for (const s of l.steps) {
        if (s.kind !== 'chip') continue;
        expect(
          l.level,
          `chip step "${s.labelKey}" on level ${l.level} must follow the ${last.target}-shard milestone on level ${last.level}`
        ).toBeLessThan(last.level);
      }
    }
  });

  it('the referral milestones grow — level 1 is never a copy of level 2', () => {
    const series = levels
      .map(l => ({ level: l.level, target: targetOf(l.steps, 'quest step invite referrals') }))
      .filter((x): x is { level: number; target: number } => x.target != null);
    for (let i = 1; i < series.length; i++) {
      expect(
        series[i].target,
        `referrals: level ${series[i].level} vs ${series[i - 1].level}`
      ).toBeGreaterThan(series[i - 1].target);
    }
  });

  it('no level asks for more engine upgrades than the player can own', () => {
    // One engine caps at MAX_BOOST_LEVEL speed + MAX_BOOST_LEVEL capacity taps.
    // The ladder hands out a second engine on level 12 (`1 ENG` in its drop),
    // so before that level the ceiling is a single engine's worth.
    const perEngine = MAX_BOOST_LEVEL * 2;
    const freeEngineLevel = testQuestLadder.find(l => l.drop.includes('ENG'))?.level;
    expect(freeEngineLevel, 'a free engine must exist in the ladder').toBeDefined();

    for (const l of levels) {
      const upg = targetOf(l.steps, 'quest step upgrade engine');
      if (upg == null) continue;
      const engines = l.level <= freeEngineLevel! ? 2 : 1;
      expect(upg, `level ${l.level} upgrades vs ${engines} engine(s)`).toBeLessThanOrEqual(
        perEngine * engines
      );
    }
  });

  it('no status step asks for a tier the test window cannot reach', () => {
    // A tier is TWO gates (DOCS §5.1): the AP threshold and a referral count.
    // Platinum (5 900 AP + 10 referrals) used to sit on day 27, where the
    // absolute AP ceiling is ~3 145 — unreachable by arithmetic, not by effort.
    const thresholds = GlobalConstants.apTierThresholds;
    const refRequirements = GlobalConstants.tierReferralRequirements;

    // Referral milestones are cumulative: the highest one banked so far.
    let referralsSoFar = 0;
    for (const l of levels) {
      referralsSoFar = Math.max(
        referralsSoFar,
        targetOf(l.steps, 'quest step invite referrals') ?? 0
      );
      for (const s of l.steps) {
        if (s.kind !== 'status') continue;
        const tier = STATUS_STEP_TIER[s.labelKey];
        // A status step the map does not know would slip past every assertion
        // below — that is exactly how "reach Platinum" survived until 17.08.2026.
        expect(tier, `unmapped status step "${s.labelKey}" on level ${l.level}`).toBeDefined();
        // Crown levels have no day of their own — they land after the last one.
        const day = l.day ?? Math.max(...testQuestLadder.map(x => x.day ?? 0));
        expect(
          apCeilingByDay(day),
          `level ${l.level} asks for ${tier} (${thresholds[tier]} AP) on day ${day}`
        ).toBeGreaterThanOrEqual(thresholds[tier]);
        expect(
          referralsSoFar,
          `level ${l.level} asks for ${tier}, which needs ${refRequirements[tier]} referrals`
        ).toBeGreaterThanOrEqual(refRequirements[tier]);
      }
    }
  });

  it('no step costs real money', () => {
    // The smallest Lucky-Stars package is 1 TON (backend `starsPackages`), so a
    // "swap TON for stars" line made a free 31-day checklist unfinishable
    // without a purchase. Connecting a wallet is free and stays.
    const paid = levels.flatMap(l =>
      l.steps
        .filter(s => /swap|buy stars|top up/i.test(s.labelKey))
        .map(s => `L${l.level}:${s.labelKey}`)
    );
    expect(paid).toEqual([]);
  });

  it('does not point at switched-off features', () => {
    // Avatars are commented out in both repos (`AVATARS OFF`).
    const dead = levels.flatMap(l =>
      l.steps.filter(s => /avatar/i.test(s.labelKey)).map(s => `L${l.level}:${s.labelKey}`)
    );
    expect(dead).toEqual([]);
  });
});

describe('test-quest checklist — server-driven rendering', () => {
  const known = getTestQuestSteps(30);

  it('prefers the server list over the bundled one', () => {
    const fromServer = [
      { labelKey: 'quest step watch ads', target: 7, action: 'adsWatched', kind: 'ads' },
      { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
    ];
    expect(resolveTestQuestSteps(30, fromServer)).toEqual([
      { labelKey: 'quest step watch ads', target: 7, action: 'adsWatched', kind: 'ads' },
      { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
    ]);
  });

  it('drops rows this build cannot render instead of showing a raw key', () => {
    // An admin typo or a key added on the server before the app ships it would
    // otherwise reach t() and print "quest step whatever" on someone's screen.
    const resolved = resolveTestQuestSteps(30, [
      { labelKey: 'quest step spend tickets', target: 5, action: 'ticketsSpent', kind: 'tickets' },
      { labelKey: 'quest step from the future', target: 3, kind: 'ads' },
      { labelKey: 'quest step watch ads', kind: 'telepathy' },
    ]);
    expect(resolved).toEqual([
      { labelKey: 'quest step spend tickets', target: 5, action: 'ticketsSpent', kind: 'tickets' },
    ]);
  });

  it('falls back to the bundled ladder when the server sends nothing usable', () => {
    expect(resolveTestQuestSteps(30, undefined)).toEqual(known);
    expect(resolveTestQuestSteps(30, [])).toEqual(known);
    expect(resolveTestQuestSteps(30, [{ labelKey: 'nope', kind: 'nope' }])).toEqual(known);
  });

  it('ignores a nonsense target or action rather than trusting it', () => {
    const [step] = resolveTestQuestSteps(30, [
      { labelKey: 'quest step watch ads', target: -4, action: 'mindReading', kind: 'ads' },
    ]);
    expect(step).toEqual({ labelKey: 'quest step watch ads', kind: 'ads' });
  });
});

describe('test-quest checklist — backend parity', () => {
  // The catalogue moved to the backend on 17.08.2026; this copy is the fallback
  // for an older server. If the two drift, players on a current build see one
  // list and the fallback path another. Skipped when the backend is not checked
  // out next to this repo (CI that clones only the frontend).
  const levelsPath = resolve(
    process.cwd(),
    '../lucky-ticket-backend/src/test-quest/test-quest.levels.ts'
  );
  const hasBackend = existsSync(levelsPath);

  it.skipIf(!hasBackend)('the bundled ladder matches the backend defaults', () => {
    const src = readFileSync(levelsPath, 'utf8');
    const block = src.slice(
      src.indexOf('export const TEST_QUEST_STEPS'),
      src.indexOf('/** The catalog the app reads')
    );
    expect(block.length, 'TEST_QUEST_STEPS not found in the backend').toBeGreaterThan(0);

    for (const l of testQuestLadder) {
      const steps = getTestQuestSteps(l.level);
      for (const s of steps) {
        expect(block, `level ${l.level}: ${s.labelKey}`).toContain(`'${s.labelKey}'`);
      }
      // Same number of rows for the level, counted off its own block.
      const start = block.indexOf(`\n  ${l.level}: [`);
      const rows = block.slice(start, block.indexOf('\n  ],', start)).split('labelKey').length - 1;
      expect(rows, `level ${l.level} row count`).toBe(steps.length);
    }
  });
});
