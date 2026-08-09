import type {
  LuckyPlayerDailyGift,
  StatusPerkBase,
  VipLevelPerks,
} from '@/types/interfaces/market.interfaces';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';
import { GlobalConstants } from '@/constants/global.constants';
import { formatNumber } from '@/utils/global/number.utils';

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
  /** Same value at the level the player holds today — set only on upgrade rows. */
  from?: string;
}

const TIERS: TicketType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

/** `1.90` → `1.9`, `20.0` → `20` — the config stores fractional percents. */
const num = (value: number): string => String(Math.round(value * 100) / 100);

const pct = (value: number): string => `+${num(value)}%`;

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
        ? `${base.adsDailyLimit + perks.adsDailyBonus} (+${perks.adsDailyBonus})`
        : `+${perks.adsDailyBonus}`,
    });

  const sendTiers = TIERS.filter(
    tier => (perks.ticketSendDailyBonus?.[tier.toUpperCase()] ?? 0) > 0
  );
  if (sendTiers.length)
    rows.push({
      id: 'ticketSend',
      label: t('perk ticket send'),
      // Only the tiers the status opens or widens. Platinum and Diamond have a
      // free limit of 0, so their presence here IS the permission to send them.
      value: sendTiers
        .map(tier => {
          const bonus = perks.ticketSendDailyBonus[tier.toUpperCase()];
          const total = (base?.ticketSendDailyLimit?.[tier.toUpperCase()] ?? 0) + bonus;
          return `${t(tier)} ${base ? total : `+${bonus}`}`;
        })
        .join(' · '),
    });

  if (perks.bulkClaimEnabled) rows.push({ id: 'bulkClaim', label: t('perk bulk claim') });

  if (dailyGift?.enabled && (dailyGift.lc > 0 || dailyGift.ticketCount > 0))
    rows.push({
      id: 'dailyGift',
      label: t('perk daily gift'),
      value: [
        dailyGift.lc > 0 ? `${formatNumber(dailyGift.lc)} ${GlobalConstants.coinName}` : null,
        dailyGift.ticketCount > 0
          ? `${dailyGift.ticketCount} × ${t(dailyGift.ticketTier.toLowerCase() as 'bronze')}`
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
