import { GlobalConstants } from '@/constants/global.constants';
import { formatNumber } from '@/utils/global/number.utils';
import type { StakeHistoryEntry, StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';
import { effectiveStakeFeeDiscountBonusPct, effectiveStatusPct } from '@/utils/global/status.utils';

/**
 * Admin-tunable inputs of the stake projections. Components pass the live
 * server values (`useStakesDisplayConfig`); the bundled constants below are
 * the default for mocks/tests and the loading fallback.
 */
export interface StakeMathKnobs {
  durationMinMonths: number;
  durationMaxMonths: number;
  aprMinPercent: number;
  aprMaxPercent: number;
  apDivisor: number;
  apCompletionBonusPercent: number;
}

export const defaultStakeKnobs: StakeMathKnobs = {
  durationMinMonths: GlobalConstants.stakeDurationMinMonths,
  durationMaxMonths: GlobalConstants.stakeDurationMaxMonths,
  aprMinPercent: GlobalConstants.stakeAprMinPercent,
  aprMaxPercent: GlobalConstants.stakeAprMaxPercent,
  apDivisor: GlobalConstants.stakeApDivisor,
  apCompletionBonusPercent: GlobalConstants.stakeApCompletionBonusPercent,
};

export const computeStakeAprPercent = (
  months: number,
  knobs: StakeMathKnobs = defaultStakeKnobs
) => {
  const {
    durationMinMonths: minM,
    durationMaxMonths: maxM,
    aprMinPercent: minApr,
    aprMaxPercent: maxApr,
  } = knobs;
  const clamped = Math.min(Math.max(months, minM), maxM);
  const ratio = (clamped - minM) / (maxM - minM);
  return minApr + ratio * (maxApr - minApr);
};

/**
 * The rate a stake actually earns: the duration APR **plus the band's boost in
 * percentage points** (DOCS §18.1). A deposit in no band earns the duration APR
 * alone. Additive, not multiplicative, on purpose — a band has to be worth
 * reaching, and 1% of a 3–10% yield is not felt.
 */
export const computeStakeEffectiveAprPercent = (
  months: number,
  levelBoostPct = 0,
  knobs: StakeMathKnobs = defaultStakeKnobs
) => computeStakeAprPercent(months, knobs) + Math.max(0, levelBoostPct);

export const computeStakeReturnCoins = (
  deposit: number,
  months: number,
  isLuckyPlayer = false,
  isVip = false,
  knobs: StakeMathKnobs = defaultStakeKnobs,
  perks?: Pick<StatusPerks, 'stakeYieldBoostPct'>,
  levelBoostPct = 0
) => {
  const ratePercent = computeStakeEffectiveAprPercent(months, levelBoostPct, knobs);
  const base = (deposit * ratePercent) / 100;
  // VIP supersedes LP — the higher-tier yield boost wins, never stacks. Pass
  // `me.statusPerks` from anywhere that shows this number to a player: VIP's
  // boost ramps per level, so the flat constant over-promises at low levels.
  const statusBoostPct = effectiveStatusPct('stakeYieldBoostPct', isLuckyPlayer, isVip, perks);
  return Math.round(base * (1 + statusBoostPct / 100));
};

/**
 * Base AP credited the moment a stake starts: `deposit × months ÷ apDivisor`
 * (DOCS §5.3 / §18.3). Floored to match the backend (`stake-math.baseAp`) so the
 * projection equals what's credited.
 *
 * **Revoked in full on early cancellation** — `StakesService.cancel` decrements
 * `activityPoints` by `min(stake.apAwarded, balance)`. This docblock used to say
 * the opposite ("retained on cancel"), and the cancel sheet was built on that
 * sentence; with the AP retained, open→cancel was a near-free infinite AP loop,
 * which was farmed in the wild and closed on 2026-07-07. Cancelling returns the
 * principal and nothing else.
 */
export const computeStakeBaseAp = (
  deposit: number,
  months: number,
  knobs: StakeMathKnobs = defaultStakeKnobs
) => Math.floor((deposit * months) / knobs.apDivisor);

/**
 * Completion bonus AP granted only when the stake runs to the end —
 * `apCompletionBonusPercent` of the (floored) base. Forfeited on early
 * cancellation. Floor-of-floored-base mirrors the backend claim exactly
 * (`floor(apAwarded × pct / 100)`), so the pre-claim projection can't drift.
 */
export const computeStakeCompletionBonusAp = (
  deposit: number,
  months: number,
  knobs: StakeMathKnobs = defaultStakeKnobs
) =>
  Math.floor((computeStakeBaseAp(deposit, months, knobs) * knobs.apCompletionBonusPercent) / 100);

/** Total AP across the lifecycle = base (on start) + completion bonus (on claim). */
export const computeStakeActivityPoints = (
  deposit: number,
  months: number,
  knobs: StakeMathKnobs = defaultStakeKnobs
) =>
  computeStakeBaseAp(deposit, months, knobs) +
  computeStakeCompletionBonusAp(deposit, months, knobs);

/**
 * Guaranteed Stars paid out on full completion (forfeited on cancel). A stake
 * that cleared no band pays none — there is no band to pay them.
 */
export const computeStakeCompletionStars = (
  months: number,
  levelDef: StakeLevelDefinition | null
) => (levelDef ? months * levelDef.completionStarsPerMonth : 0);

/** Whole-Star base used by both stake fee and cancel fee: `ceil(deposit / feeStep)`. */
export const computeStakeFeeBase = (deposit: number) =>
  Math.ceil(deposit / GlobalConstants.stakeFeeStep);

/**
 * Volume discount % keyed to the deposit size, plus the status bonus on top
 * (DOCS §18.5). A deposit under the first threshold gets nothing to boost — a
 * status must not discount a fee for volume the player never put up.
 */
export const computeStakeVolumeDiscountPercent = (deposit: number, statusBonusPct: number) => {
  let percent = 0;
  for (const b of GlobalConstants.stakeFeeVolumeDiscount) {
    if (deposit >= b.threshold) percent = b.percent;
  }
  return percent > 0 ? percent + Math.max(0, statusBonusPct) : 0;
};

export interface StakeFeeBreakdown {
  base: number;
  volumeDiscountPercent: number;
  monthDiscountPercent: number;
  totalDiscountPercent: number;
  fee: number;
  free: boolean;
}

/**
 * Stake-start fee in Stars. The first `freeStartCount` stakes an account opens
 * are free — any deposit, any band; everything else:
 * `max(feeMin, ceil(base × (1 − total/100)))`.
 */
export const computeStakeFee = (
  deposit: number,
  months: number,
  isLuckyPlayer: boolean,
  freeStartsUsed: number,
  isVip = false,
  perks?: Pick<StatusPerks, 'stakeFeeDiscountBonusPct'>,
  freeStartCount: number = GlobalConstants.stakeFreeStartCount
): StakeFeeBreakdown => {
  const base = computeStakeFeeBase(deposit);
  const volumeDiscountPercent = computeStakeVolumeDiscountPercent(
    deposit,
    effectiveStakeFeeDiscountBonusPct(isLuckyPlayer, isVip, perks)
  );
  const monthDiscountPercent = months * GlobalConstants.stakeFeeMonthDiscountPercent;
  const totalDiscountPercent = Math.min(99, volumeDiscountPercent + monthDiscountPercent);
  const free = freeStartsUsed < freeStartCount;
  const fee = free
    ? 0
    : Math.max(
        GlobalConstants.stakeFeeMinStars,
        Math.ceil(base * (1 - totalDiscountPercent / 100))
      );
  return { base, volumeDiscountPercent, monthDiscountPercent, totalDiscountPercent, fee, free };
};

/** Cancel fee = `max(cancelFeeMin, cancelFeeMultiplier × base)` (no discounts). */
export const computeStakeCancelFee = (deposit: number) => {
  const base = computeStakeFeeBase(deposit);
  return Math.max(
    GlobalConstants.stakeCancelFeeMinStars,
    GlobalConstants.stakeCancelFeeMultiplier * base
  );
};

/**
 * Whole months a stake runs, DERIVED from its start/end dates — the fallback
 * only. Prefer `stakeDurationMonths()`.
 *
 * The server adds calendar months (`end.setMonth(+n)`) and charges and pays by
 * the stored `durationMonths`; this rounds a 30-day approximation, which agrees
 * with it up to 12 months and stops agreeing above ~30 (36 calendar months is
 * 1096 days → `round(36.5) = 37`). Deriving a number the server already sent is
 * how a screen ends up quoting a yield the claim will not pay.
 */
export const computeStakeMonths = (start: string, end: string) =>
  Math.max(
    1,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / (30 * 86_400_000))
  );

/** The duration the server opened the stake for, falling back to the dates. */
export const stakeDurationMonths = (stake: {
  durationMonths?: number;
  startDate: string;
  endDate: string;
}) =>
  Number.isFinite(stake.durationMonths) && (stake.durationMonths as number) > 0
    ? (stake.durationMonths as number)
    : computeStakeMonths(stake.startDate, stake.endDate);

/**
 * Has the stake matured? The server's own verdict wins; the clock comparison is
 * the fallback, and it is the device's clock — a phone set a day ahead would
 * otherwise show "claim now" on a button the server answers with a 400.
 *
 * This replaced an exported `isStakeReady(endDate)`, which every caller reached
 * for because it was the only thing on offer — including the header dot and the
 * drawer badge, two screens away from the stake they were counting.
 */
export const stakeIsMatured = (stake: { matured?: boolean; endDate: string }, now = Date.now()) =>
  typeof stake.matured === 'boolean' ? stake.matured : new Date(stake.endDate).getTime() <= now;

/**
 * A rate for display: one decimal at most, a whole number when it is whole, and
 * the reader's own decimal separator.
 *
 * `toFixed(1)` was doing this, and it always emits a DOT — so the Russian UI
 * printed "Ставка 6.3%" one line above "+13,8 тыс." from `formatCompact`, two
 * separators for two numbers in the same card.
 */
export const formatStakeRatePercent = (value: number) => formatNumber(Math.round(value * 10) / 10);

/** The band a stake was opened in — `null` for a level-0 (no band) stake. */
export const findLevelDef = (levels: StakeLevelDefinition[], level: number) =>
  levels.find(l => l.level === level) ?? null;

/**
 * The band a deposit falls into — the highest `minDeposit` it clears — or
 * `null` when it clears none. This is the ONLY definition of a stake's level:
 * the player never picks one, and the server derives it again on write, so the
 * screen and the ledger cannot disagree.
 *
 * It used to fall back to the cheapest level for any amount, which is what made
 * "below the minimum" a state the confirm button had to refuse. There is no
 * minimum any more — a deposit under the first band is a valid stake that
 * simply earns the plain duration APR.
 */
export const findLevelForDeposit = (
  levels: StakeLevelDefinition[],
  amount: number
): StakeLevelDefinition | null =>
  [...levels]
    .sort((a, b) => a.minDeposit - b.minDeposit)
    .filter(lv => amount >= lv.minDeposit)
    .pop() ?? null;

export const findNextLevelOver = (levels: StakeLevelDefinition[], amount: number) => {
  const sorted = [...levels].sort((a, b) => a.minDeposit - b.minDeposit);
  return sorted.find(lv => lv.minDeposit > amount) ?? null;
};

export const computeStakeProgress = (start: string, end: string, now = Date.now()) => {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const total = Math.max(1, endMs - startMs);
  const elapsed = Math.max(0, now - startMs);
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
};

export const formatStakeRelative = (iso: string | null, t: Dictionary, now = Date.now()) => {
  // `completedAt` is nullable on the wire. Unguarded, `new Date(null|undefined)`
  // makes every comparison below false and the row prints "NaN d ago".
  const at = iso ? new Date(iso).getTime() : NaN;
  if (!Number.isFinite(at)) return t('just now');
  const ago = Math.max(0, (now - at) / 1000);
  if (ago < 60) return t('just now');
  if (ago < 3600) return t('{n}m ago', { n: Math.floor(ago / 60) });
  if (ago < 86400) return t('{n}h ago', { n: Math.floor(ago / 3600) });
  if (ago < 86400 * 2) return t('yesterday');
  return t('{n}d ago', { n: Math.floor(ago / 86400) });
};

export const sortStakesReadyFirst = <T extends { endDate: string }>(
  stakes: T[],
  now = Date.now()
) =>
  [...stakes].sort((a, b) => {
    const aReady = new Date(a.endDate).getTime() <= now ? 0 : 1;
    const bReady = new Date(b.endDate).getTime() <= now ? 0 : 1;
    if (aReady !== bReady) return aReady - bReady;
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  });

/**
 * Completion instant as a sortable number. A missing `completedAt` sorts to the
 * bottom instead of turning the comparator into NaN, which makes the sort order
 * depend on the input order.
 */
export const stakeCompletedAtMs = (entry: Pick<StakeHistoryEntry, 'completedAt'>) => {
  const at = entry.completedAt ? new Date(entry.completedAt).getTime() : NaN;
  return Number.isFinite(at) ? at : 0;
};

export const sortHistoryNewestFirst = (history: StakeHistoryEntry[]) =>
  [...history].sort((a, b) => stakeCompletedAtMs(b) - stakeCompletedAtMs(a));

/**
 * AP the player actually keeps from a finished stake. A cancelled stake keeps
 * its `apAwarded` row in the database — the server never zeroes it — but that
 * AP was revoked off the balance, so history must not present it as earned.
 */
export const stakeApKept = (entry: Pick<StakeHistoryEntry, 'outcome' | 'apAwarded'>) =>
  entry.outcome === 'completed' ? entry.apAwarded : 0;
