import type {
  LuckyPlayerDailyGift,
  StatusPerkBase,
  VipLevelPerks,
} from '@/types/interfaces/market.interfaces';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';
import { GlobalConstants } from '@/constants/global.constants';
import { formatMultiplier, formatNumber } from '@/utils/global/number.utils';

/**
 * Turns the LIVE status config (`market.statuses[].perks` / `levelPerks`) into
 * the rows the VIP and Lucky Player screens show.
 *
 * The rule is "quote what the admin granted, and nothing else": a perk sitting
 * at `0` produces NO row. The screens used to render a frozen list of i18n keys
 * seeded into the catalog, which promised perks the config had since zeroed —
 * VIP advertised +25% engine speed against a live 20%, a stake-fee discount
 * that is 0 on all twenty levels, and tournament boosts nobody grants.
 *
 * Capability rows (bulk claim, profile badge) carry no `value`; the renderer
 * shows the label alone.
 */
export interface StatusPerkRow {
  /** Stable id — React key, and the hook for diffing two levels. */
  id: string;
  /** Already-translated label. */
  label: string;
  /** Already-formatted value (`+10%`, `12 (+2)`); absent for capability rows. */
  value?: string;
  /**
   * One line under the label, for a perk whose VALUE alone would be read wrong.
   * The engine-speed multiplier is the case it exists for: `×1.3` next to a
   * column of `+X%` rows needs to say why it is not one of them.
   */
  note?: string;
  /**
   * Set when the value IS a multiplier — the renderer then prints it as the
   * gold `×N` multiplier pill instead of plain text, the same mark the engine
   * screens use. `value` still carries the written form, which is what diffs
   * two VIP levels.
   */
  multiplier?: number;
  /** Same value at the level the player holds today — set only on upgrade rows. */
  from?: string;
  /**
   * Per-tier daily send limits, when the row has them. The renderer draws the
   * ticket art for each tier instead of its name — five spelled-out tiers is
   * the longest value on the screen and reads as a wall of words, while the
   * tickets are the same objects the player already recognises everywhere else.
   * `value` stays the written form: it is what diffs two VIP levels.
   */
  tiers?: { tier: TicketType; total: number }[];
}

const TIERS: TicketType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

/**
 * A Lucky Player LISTING's perks, translated into the shape the rows are built
 * from.
 *
 * The catalog still carries the subscription's engine-speed perk in
 * `engineSpeedBoostPct` — the admin config field was never renamed when the perk
 * became a multiplier (17.08.2026), and `/me` fixes it up in
 * `resolveEngineSpeedStatus` on the server. The market listing does not, so the
 * screen selling the subscription was advertising `+30%` for something that is
 * a ×1.3, next to VIP rows where `+X%` means the other thing entirely.
 *
 * A payload that already carries the split (a newer backend) is passed through
 * untouched.
 */
export const luckyPlayerCatalogPerks = (perks: StatusPerks): StatusPerks => ({
  ...perks,
  engineSpeedBoostPct: perks.engineSpeedMultiplierPct === undefined ? 0 : perks.engineSpeedBoostPct,
  engineSpeedMultiplierPct: perks.engineSpeedMultiplierPct ?? perks.engineSpeedBoostPct,
});

/** `1.90` → `1.9`, `20.0` → `20` — the config stores fractional percents. */
const num = (value: number): string => String(Math.round(value * 100) / 100);

const pct = (value: number): string => `+${num(value)}%`;

/**
 * Non-breaking space. A value like the five-tier send list is long enough to
 * wrap on a phone, and it must break BETWEEN pairs — "Платина" alone on one
 * line with its "2" on the next reads as a different number.
 */
const NB = '\u00A0';

/**
 * The rows a status with these perks actually grants.
 *
 * `base` carries the free limits the counted perks are added to, so ad views
 * and ticket sends are quoted as the total the server will enforce. It comes
 * from the same payload; the caller passes `undefined` on older responses and
 * those two rows fall back to quoting the bonus alone.
 */
export const buildStatusPerkRows = (
  perks: StatusPerks,
  base: StatusPerkBase | undefined,
  t: Dictionary,
  dailyGift?: LuckyPlayerDailyGift
): StatusPerkRow[] => {
  const rows: StatusPerkRow[] = [];

  if (perks.engineSpeedBoostPct > 0)
    rows.push({
      id: 'engineSpeed',
      label: t('perk engine speed'),
      value: pct(perks.engineSpeedBoostPct),
    });

  // The MULTIPLIER form of the same perk — Lucky Player's, and quoted as `×1.3`
  // rather than `+30%` because that is the difference the player is buying: a
  // summand is diluted by every other boost on the engine, a factor is not.
  // @see luckyPlayerCatalogPerks for where a Lucky Player listing gets it.
  if ((perks.engineSpeedMultiplierPct ?? 0) > 0)
    rows.push({
      id: 'engineSpeedMultiplier',
      label: t('perk engine speed'),
      value: formatMultiplier(1 + (perks.engineSpeedMultiplierPct as number) / 100),
      multiplier: 1 + (perks.engineSpeedMultiplierPct as number) / 100,
      note: t('multiplier multiplies stack'),
    });

  if (perks.stakeYieldBoostPct > 0)
    rows.push({
      id: 'stakeYield',
      label: t('perk stake yield'),
      value: pct(perks.stakeYieldBoostPct),
    });

  if (perks.marketDiscountPct > 0)
    rows.push({
      id: 'marketDiscount',
      label: t('perk market discount'),
      value: `−${num(perks.marketDiscountPct)}%`,
    });

  if (perks.tournamentRewardBoostPct > 0)
    rows.push({
      id: 'tournamentReward',
      label: t('perk tournament reward'),
      value: pct(perks.tournamentRewardBoostPct),
    });

  if (perks.tournamentJoinApBoostPct > 0)
    rows.push({
      id: 'tournamentJoinAp',
      label: t('perk tournament join ap'),
      value: pct(perks.tournamentJoinApBoostPct),
    });

  if (perks.stakeFeeDiscountBonusPct > 0)
    rows.push({
      id: 'stakeFeeDiscount',
      label: t('perk stake fee discount'),
      // The bonus is percentage points ON TOP of the volume ladder everyone
      // shares, so the number worth quoting is the ceiling it reaches.
      value: base
        ? t('up to {pct}', {
            pct: `−${num(base.stakeFeeVolumeDiscountMaxPct + perks.stakeFeeDiscountBonusPct)}%`,
          })
        : `+${num(perks.stakeFeeDiscountBonusPct)} ${t('pp')}`,
    });

  if (perks.adsDailyBonus > 0)
    rows.push({
      id: 'adsDaily',
      label: t('perk ads daily'),
      value: base
        ? `${base.adsDailyLimit + perks.adsDailyBonus}${NB}(+${perks.adsDailyBonus})`
        : `+${perks.adsDailyBonus}`,
    });

  if (perks.adsSkipDaily > 0)
    rows.push({
      id: 'adsSkip',
      label: t('perk ads skip'),
      // Quoted against the cap it is bounded by, the same way the ads row
      // quotes its total: "10 of 20" is the promise the server will keep, while
      // a bare "10" reads as ten EXTRA views to anyone who has just read the
      // row above it.
      value: base
        ? `${Math.min(perks.adsSkipDaily, base.adsDailyLimit + perks.adsDailyBonus)}${NB}/${NB}${base.adsDailyLimit + perks.adsDailyBonus}`
        : String(perks.adsSkipDaily),
    });

  const sendTiers = TIERS.filter(
    tier => (perks.ticketSendDailyBonus?.[tier.toUpperCase()] ?? 0) > 0
  );
  if (sendTiers.length) {
    // Only the tiers the status opens or widens. Platinum and Diamond have a
    // free limit of 0, so their presence here IS the permission to send them.
    const sends = sendTiers.map(tier => {
      const bonus = perks.ticketSendDailyBonus[tier.toUpperCase()];
      return {
        tier,
        total: (base?.ticketSendDailyLimit?.[tier.toUpperCase()] ?? 0) + bonus,
        bonus,
      };
    });
    rows.push({
      id: 'ticketSend',
      label: t('perk ticket send'),
      tiers: sends.map(({ tier, total }) => ({ tier, total })),
      value: sends
        .map(({ tier, total, bonus }) => `${t(tier)}${NB}${base ? total : `+${bonus}`}`)
        // The separator sticks to the pair before it, so a wrap happens AFTER
        // the dot rather than leaving a line that opens with one.
        .join(`${NB}· `),
    });
  }

  if (perks.bulkClaimEnabled) rows.push({ id: 'bulkClaim', label: t('perk bulk claim') });

  if (dailyGift?.enabled && (dailyGift.lc > 0 || dailyGift.ticketCount > 0))
    rows.push({
      id: 'dailyGift',
      label: t('perk daily gift'),
      value: [
        dailyGift.lc > 0 ? `${formatNumber(dailyGift.lc)}${NB}${GlobalConstants.coinName}` : null,
        dailyGift.ticketCount > 0
          ? `${dailyGift.ticketCount}${NB}×${NB}${t(dailyGift.ticketTier.toLowerCase() as 'bronze')}`
          : null,
      ]
        .filter(Boolean)
        .join(' + '),
    });

  return rows;
};

/**
 * What the NEXT VIP level adds on top of the one held today: rows whose value
 * changes, plus rows the next level opens outright. Rows that stay identical
 * are dropped — an upgrade list that repeats the current one sells nothing.
 */
export const buildVipUpgradeRows = (
  current: VipLevelPerks | undefined,
  next: VipLevelPerks | undefined,
  base: StatusPerkBase | undefined,
  t: Dictionary
): StatusPerkRow[] => {
  if (!next) return [];
  const nextRows = buildStatusPerkRows(next.perks, base, t);
  if (!current) return nextRows;
  const currentById = new Map(
    buildStatusPerkRows(current.perks, base, t).map(row => [row.id, row])
  );
  return nextRows
    .filter(row => currentById.get(row.id)?.value !== row.value)
    .map(row => ({ ...row, from: currentById.get(row.id)?.value }));
};
