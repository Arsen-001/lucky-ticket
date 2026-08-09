import { describe, it, expect } from 'vitest';
import { buildStatusPerkRows, buildVipUpgradeRows } from '@/utils/global/status-perks.utils';
import type { StatusPerkBase } from '@/types/interfaces/market.interfaces';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';

/**
 * The VIP / Lucky Player screens must quote the live admin config and NOTHING
 * else. They used to render a frozen list of i18n strings seeded into the
 * catalog, which kept promising perks the config had since zeroed — +25% engine
 * speed against a live 20%, a stake-fee discount of 0, tournament boosts nobody
 * grants. These tests pin the rule that replaced it: a perk at 0 has no row.
 */

// Identity translator: rows come back keyed, so assertions read as keys.
const t = ((key: string) => key) as unknown as Dictionary;

const BASE: StatusPerkBase = {
  adsDailyLimit: 10,
  ticketSendDailyLimit: { BRONZE: 1, SILVER: 1, GOLD: 1, PLATINUM: 0, DIAMOND: 0 },
  stakeFeeVolumeDiscountMaxPct: 20,
};

const perks = (over: Partial<StatusPerks> = {}): StatusPerks => ({
  engineSpeedBoostPct: 0,
  stakeYieldBoostPct: 0,
  tournamentRewardBoostPct: 0,
  tournamentJoinApBoostPct: 0,
  marketDiscountPct: 0,
  referralPct: 0,
  adsDailyBonus: 0,
  stakeFeeDiscountBonusPct: 0,
  ticketSendDailyBonus: { BRONZE: 0, SILVER: 0, GOLD: 0, PLATINUM: 0, DIAMOND: 0 },
  bulkClaimEnabled: false,
  ...over,
});

const ids = (rows: { id: string }[]) => rows.map(r => r.id);
const valueOf = (rows: { id: string; value?: string }[], id: string) =>
  rows.find(r => r.id === id)?.value;

describe('status perk rows', () => {
  it('grants nothing → shows nothing', () => {
    expect(buildStatusPerkRows(perks(), BASE, t)).toEqual([]);
  });

  it('drops every perk the admin set to zero', () => {
    // The live VIP level 1 (read from prod 2026-08-09): three percentage perks
    // are zero across all twenty levels and must not appear.
    const rows = buildStatusPerkRows(
      perks({
        engineSpeedBoostPct: 1,
        stakeYieldBoostPct: 0.1,
        marketDiscountPct: 1,
        adsDailyBonus: 1,
        ticketSendDailyBonus: { BRONZE: 2, SILVER: 1, GOLD: 0, PLATINUM: 0, DIAMOND: 0 },
      }),
      BASE,
      t
    );
    expect(ids(rows)).toEqual([
      'engineSpeed',
      'stakeYield',
      'marketDiscount',
      'adsDaily',
      'ticketSend',
    ]);
    // Fractional percents survive; `0.1` must not round to `0%`.
    expect(valueOf(rows, 'stakeYield')).toBe('+0.1%');
    expect(valueOf(rows, 'engineSpeed')).toBe('+1%');
  });

  it('quotes counted perks as the total the server enforces', () => {
    const rows = buildStatusPerkRows(
      perks({
        adsDailyBonus: 10,
        stakeFeeDiscountBonusPct: 10,
        ticketSendDailyBonus: { BRONZE: 4, SILVER: 3, GOLD: 2, PLATINUM: 2, DIAMOND: 1 },
      }),
      BASE,
      t
    );
    expect(valueOf(rows, 'adsDaily')).toBe('20\u00A0(+10)');
    // The bonus is percentage points on the shared volume ladder, so the number
    // worth showing is the ceiling it reaches: 20 + 10.
    expect(valueOf(rows, 'stakeFeeDiscount')).toBe('up to {pct}');
    // Only the tiers the status opens or widens, quoted as base + bonus.
    // Each tier keeps a NON-BREAKING space before its count: the list wraps on
    // a phone, and "platinum" alone on one line with its "2" on the next reads
    // as a different number.
    expect(valueOf(rows, 'ticketSend')).toBe(
      'bronze\u00A05\u00A0· silver\u00A04\u00A0· gold\u00A03\u00A0· platinum\u00A02\u00A0· diamond\u00A01'
    );
  });

  it('lists a closed tier only when the status opens it', () => {
    // Platinum/Diamond have a free limit of 0 — a positive bonus IS the
    // permission to send them, and no bonus must not read as "you may send".
    const rows = buildStatusPerkRows(
      perks({ ticketSendDailyBonus: { BRONZE: 2, SILVER: 1, GOLD: 0, PLATINUM: 0, DIAMOND: 0 } }),
      BASE,
      t
    );
    expect(valueOf(rows, 'ticketSend')).toBe('bronze\u00A03\u00A0· silver\u00A02');
  });

  it('shows the daily gift only while it is enabled', () => {
    const gift = { enabled: true, lc: 1_000, ticketTier: 'BRONZE', ticketCount: 2 };
    expect(valueOf(buildStatusPerkRows(perks(), BASE, t, gift), 'dailyGift')).toBe(
      '1,000\u00A0LC + 2\u00A0×\u00A0bronze'
    );
    expect(ids(buildStatusPerkRows(perks(), BASE, t, { ...gift, enabled: false }))).toEqual([]);
  });
});

describe('vip upgrade rows', () => {
  const level = (n: number, over: Partial<StatusPerks>) => ({ level: n, perks: perks(over) });

  it('shows only what the next level changes, with the value held today', () => {
    const rows = buildVipUpgradeRows(
      level(2, {
        engineSpeedBoostPct: 1.9,
        marketDiscountPct: 1.4,
        ticketSendDailyBonus: { BRONZE: 3, SILVER: 2, GOLD: 0, PLATINUM: 0, DIAMOND: 0 },
      }),
      level(3, {
        engineSpeedBoostPct: 2.7,
        marketDiscountPct: 1.4,
        ticketSendDailyBonus: { BRONZE: 4, SILVER: 3, GOLD: 1, PLATINUM: 0, DIAMOND: 0 },
      }),
      BASE,
      t
    );
    // marketDiscount is identical on both levels — an upgrade list that repeats
    // the current one sells nothing.
    expect(ids(rows)).toEqual(['engineSpeed', 'ticketSend']);
    expect(rows[0]).toMatchObject({ from: '+1.9%', value: '+2.7%' });
    // Gold opens at level 3.
    expect(valueOf(rows, 'ticketSend')).toBe(
      'bronze\u00A05\u00A0· silver\u00A04\u00A0· gold\u00A02'
    );
  });

  it('offers the full level-1 list to someone who is not a VIP yet', () => {
    const rows = buildVipUpgradeRows(undefined, level(1, { engineSpeedBoostPct: 1 }), BASE, t);
    expect(ids(rows)).toEqual(['engineSpeed']);
    expect(rows[0].from).toBeUndefined();
  });

  it('has nothing to add at the ceiling', () => {
    expect(buildVipUpgradeRows(level(20, { engineSpeedBoostPct: 20 }), undefined, BASE, t)).toEqual(
      []
    );
  });
});
