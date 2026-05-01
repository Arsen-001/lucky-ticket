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

export const computeStakeReturnCoins = (deposit: number, months: number) => {
  const apr = computeStakeAprPercent(months);
  return Math.round((deposit * apr * months) / (12 * 100));
};

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
