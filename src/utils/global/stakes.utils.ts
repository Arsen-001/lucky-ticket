import { GlobalConstants } from '@/constants/global.constants';
import type { StakeHistoryEntry, StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';

export const computeStakeAprPercent = (months: number) => {
  const {
    stakeDurationMinMonths: minM,
    stakeDurationMaxMonths: maxM,
    stakeAprMinPercent: minApr,
    stakeAprMaxPercent: maxApr,
  } = GlobalConstants;
  const clamped = Math.min(Math.max(months, minM), maxM);
  const ratio = (clamped - minM) / (maxM - minM);
  return minApr + ratio * (maxApr - minApr);
};

export const computeStakeReturnCoins = (
  deposit: number,
  months: number,
  isLuckyPlayer = false,
  isVip = false
) => {
  const ratePercent = computeStakeAprPercent(months);
  const base = (deposit * ratePercent) / 100;
  // VIP supersedes LP — the higher-tier yield boost wins, never stacks.
  const statusBoostPct = isVip
    ? GlobalConstants.vipStakeYieldBoostPct
    : isLuckyPlayer
      ? GlobalConstants.luckyPlayerStakeYieldBoostPct
      : 0;
  return Math.round(base * (1 + statusBoostPct / 100));
};

/**
 * Base AP credited the moment a stake starts: `deposit × months ÷ stakeApDivisor`
 * (DOCS §5.3 / §18.3). Retained even if the stake is cancelled early.
 */
export const computeStakeBaseAp = (deposit: number, months: number) =>
  Math.round((deposit * months) / GlobalConstants.stakeApDivisor);

/**
 * Completion bonus AP granted only when the stake runs to the end —
 * `stakeApCompletionBonusPercent` of the base. Forfeited on early cancellation.
 */
export const computeStakeCompletionBonusAp = (deposit: number, months: number) => {
  const base = (deposit * months) / GlobalConstants.stakeApDivisor;
  return Math.round((base * GlobalConstants.stakeApCompletionBonusPercent) / 100);
};

/** Total AP across the lifecycle = base (on start) + completion bonus (on claim). */
export const computeStakeActivityPoints = (deposit: number, months: number) =>
  computeStakeBaseAp(deposit, months) + computeStakeCompletionBonusAp(deposit, months);

/** Guaranteed Stars paid out on full completion (forfeited on cancel). */
export const computeStakeCompletionStars = (months: number, levelDef: StakeLevelDefinition) =>
  months * levelDef.completionStarsPerMonth;

/** Whole-Star base used by both stake fee and cancel fee: `ceil(deposit / feeStep)`. */
export const computeStakeFeeBase = (deposit: number) =>
  Math.ceil(deposit / GlobalConstants.stakeFeeStep);

/**
 * Volume discount % keyed to the deposit size — uses the boosted bracket set
 * when the user holds Lucky Player (DOCS §18.5).
 */
export const computeStakeVolumeDiscountPercent = (deposit: number, isLuckyPlayer: boolean) => {
  const brackets = isLuckyPlayer
    ? GlobalConstants.stakeFeeVolumeDiscount.luckyPlayer
    : GlobalConstants.stakeFeeVolumeDiscount.default;
  let percent = 0;
  for (const b of brackets) {
    if (deposit >= b.threshold) percent = b.percent;
  }
  return percent;
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
 * Stake-start fee in Stars. The first `bronzeFreeStartCount` Bronze stakes
 * opened lifetime cost nothing; everything else: `max(feeMin, ceil(base × (1 − total/100)))`.
 */
export const computeStakeFee = (
  deposit: number,
  months: number,
  isLuckyPlayer: boolean,
  level: number,
  bronzeStakesOpened: number
): StakeFeeBreakdown => {
  const base = computeStakeFeeBase(deposit);
  const volumeDiscountPercent = computeStakeVolumeDiscountPercent(deposit, isLuckyPlayer);
  const monthDiscountPercent = months * GlobalConstants.stakeFeeMonthDiscountPercent;
  const totalDiscountPercent = Math.min(99, volumeDiscountPercent + monthDiscountPercent);
  const free = level === 1 && bronzeStakesOpened < GlobalConstants.stakeBronzeFreeStartCount;
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

/** Whole months a stake runs, derived from its start/end dates. */
export const computeStakeMonths = (start: string, end: string) =>
  Math.max(
    1,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / (30 * 86_400_000))
  );

export const findLevelDef = (levels: StakeLevelDefinition[], level: number) =>
  levels.find(l => l.level === level);

export const findLevelForDeposit = (levels: StakeLevelDefinition[], amount: number) => {
  const sorted = [...levels].sort((a, b) => a.minDeposit - b.minDeposit);
  let chosen = sorted[0];
  for (const lv of sorted) {
    if (amount >= lv.minDeposit) chosen = lv;
  }
  return chosen;
};

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

export const isStakeReady = (end: string, now = Date.now()) => new Date(end).getTime() <= now;

export const formatStakeRelative = (iso: string, t: Dictionary, now = Date.now()) => {
  const ago = Math.max(0, (now - new Date(iso).getTime()) / 1000);
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

export const sortHistoryNewestFirst = (history: StakeHistoryEntry[]) =>
  [...history].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
