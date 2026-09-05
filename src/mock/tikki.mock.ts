import type { FetchArgs } from '@reduxjs/toolkit/query';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TicketType } from '@/types/types/ticket.types';
import type {
  TikkiBuyBody,
  TikkiIdBody,
  TikkiMergeBody,
  TikkiState,
  TikkiTapBody,
  TikkiUnit,
  TikkiUpgradeBody,
} from '@/types/interfaces/tikki.interfaces';
import { mockDb } from '@/mock/backend/db';
import {
  tikkiAwayDays,
  tikkiBuyPaybackDays,
  tikkiMaxHours,
  tikkiMaxLevel,
  tikkiMergeSize,
  tikkiStartHours,
  tikkiTapMinPresses,
  tikkiTiers,
  type TikkiTier,
  type TikkiUnit as TikkiUnitState,
} from '@/components/shared/tikki/tikki.constants';
import {
  buyTikkiUnit,
  mergeTikkiUnits,
  nextTikkiTier,
  tikkiBuyCost,
  tikkiCapacity,
  tikkiClickerLevelCost,
  tikkiClickerRate,
  tikkiFillAt,
  tikkiMergeCost,
  tikkiMergeStepUpPercentByTier,
  tikkiPassiveEarned,
  tikkiPassiveLevelCost,
  tikkiPassiveRate,
  tikkiTapCost,
  tikkiTapPresses,
  tikkiTapValue,
  tikkiTierBase,
  tikkiWindowCost,
  tikkiWindowHours,
} from '@/components/shared/tikki/tikki.utils';

/**
 * Мок Тикки — считает теми же функциями, что и экран, и держит состояние в
 * общем `mockDb`, поэтому баланс двигается по-настоящему: списал на прокачку —
 * упало в шапке.
 *
 * Настоящий сервер считает СВОИМИ копиями этих формул (`src/tikki/tikki-math.ts`
 * в бэкенде), и одинаковость двух реализаций держат два теста с одинаковыми
 * числами. Мок нужен, чтобы экран было на чём смотреть без бэкенда, — но
 * поймать расхождение он не умеет: он и есть клиентская сторона.
 */
interface MockUnit extends TikkiUnitState {
  selected: boolean;
}

let seq = 0;
const units: MockUnit[] = [];

const seed = () => {
  if (units.length) return;
  const first = buyTikkiUnit(TicketsEnum.BRONZE, `tikki-${++seq}`, Date.now());
  units.push({ ...first, selected: true });
};

/** Догнать время: пассив — на счёт, кликер — в себя, до потолка окна. */
const settle = () => {
  const now = Date.now();
  let credit = 0;
  for (const u of units) {
    const rate = tikkiPassiveRate(u);
    const earned = tikkiPassiveEarned(u, now);
    const whole = Math.floor(earned);
    credit += whole;
    u.fill = tikkiFillAt(u, now);
    u.filledAt = now;
    // Дробный остаток не теряется: метка отводится назад ровно на его цену.
    u.paidAt = now - Math.round(rate > 0 ? ((earned - whole) / rate) * 3_600_000 : 0);
  }
  if (credit > 0) mockDb.user.coins += credit;
};

const finite = (n: number): number | null => (Number.isFinite(n) ? n : null);

const toView = (u: MockUnit): TikkiUnit => ({
  id: u.id,
  tier: u.tier,
  level: u.level,
  base: u.base,
  passiveLevel: u.passiveLevel,
  passiveBase: u.passiveBase,
  tapLevel: u.tapLevel,
  windowLevel: u.windowLevel,
  fill: u.fill,
  capacity: tikkiCapacity(u),
  clickerPerHour: tikkiClickerRate(u),
  passivePerHour: tikkiPassiveRate(u),
  windowHours: tikkiWindowHours(u),
  tapValue: tikkiTapValue(u),
  tapPresses: tikkiTapPresses(u),
  selected: u.selected,
  cost: {
    clicker: finite(tikkiClickerLevelCost(u)),
    passive: finite(tikkiPassiveLevelCost(u)),
    window: finite(tikkiWindowCost(u)),
    tap: finite(tikkiTapCost(u)),
  },
  next: {
    clickerPerHour: tikkiClickerRate({ ...u, level: u.level + 1 }),
    clickerCapacity: tikkiCapacity({ ...u, level: u.level + 1 }),
    passivePerHour: tikkiPassiveRate({ ...u, passiveLevel: u.passiveLevel + 1 }),
    windowHours: tikkiWindowHours({ ...u, windowLevel: u.windowLevel + 1 }),
    windowCapacity: tikkiCapacity({ ...u, windowLevel: u.windowLevel + 1 }),
    tapValue: tikkiTapValue({ ...u, tapLevel: u.tapLevel + 1 }),
    tapPresses: tikkiTapPresses({ ...u, tapLevel: u.tapLevel + 1 }),
  },
});

const state = (): TikkiState => {
  const counts = new Map<TicketType, number>();
  for (const u of units) counts.set(u.tier, (counts.get(u.tier) ?? 0) + 1);

  const costByTier: Record<string, number> = {};
  const buyCost: Record<string, number> = {};
  for (const tier of tikkiTiers) {
    buyCost[tier] = tikkiBuyCost(tier);
    if (nextTikkiTier(tier)) costByTier[tier] = tikkiMergeCost(tier);
  }

  return {
    balance: mockDb.user.coins,
    units: units.map(toView),
    buyCost,
    merge: {
      size: tikkiMergeSize,
      ready: tikkiTiers.filter(t => nextTikkiTier(t) && (counts.get(t) ?? 0) >= tikkiMergeSize),
      costByTier,
    },
    config: {
      maxLevel: tikkiMaxLevel,
      maxHours: tikkiMaxHours,
      startHours: tikkiStartHours,
      tapMinPresses: tikkiTapMinPresses,
      awayDays: tikkiAwayDays,
      mergeSize: tikkiMergeSize,
      stepUpPercent: tikkiMergeStepUpPercentByTier(),
      tierBase: Object.fromEntries(tikkiTiers.map(t => [t, tikkiTierBase(t)])),
      buyPaybackDays: tikkiBuyPaybackDays,
    },
  };
};

const spend = (price: number | null) => {
  if (price === null || !Number.isFinite(price)) throw new Error('maxed');
  if (mockDb.user.coins < price) throw new Error('poor');
  mockDb.user.coins -= price;
};

export const tikkiMock: Record<string, (args: FetchArgs) => unknown> = {
  tikki: () => {
    seed();
    settle();
    return state();
  },

  'tikki/tap': ({ body }) => {
    seed();
    settle();
    const { unitId, count } = body as TikkiTapBody;
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      const taken = Math.min(Math.max(1, count) * tikkiTapValue(unit), Math.floor(unit.fill));
      if (taken > 0) {
        unit.fill -= taken;
        mockDb.user.coins += taken;
      }
    }
    return state();
  },

  'tikki/select': ({ body }) => {
    seed();
    settle();
    const { unitId } = body as TikkiIdBody;
    if (units.some(u => u.id === unitId)) for (const u of units) u.selected = u.id === unitId;
    return state();
  },

  'tikki/upgrade': ({ body }) => {
    seed();
    settle();
    const { unitId, kind } = body as TikkiUpgradeBody;
    const unit = units.find(u => u.id === unitId);
    if (!unit) return state();

    if (kind === 'clicker') {
      spend(finite(tikkiClickerLevelCost(unit)));
      unit.level += 1;
    } else if (kind === 'passive') {
      spend(finite(tikkiPassiveLevelCost(unit)));
      unit.passiveLevel += 1;
    } else if (kind === 'window') {
      spend(finite(tikkiWindowCost(unit)));
      unit.windowLevel += 1;
    } else {
      spend(finite(tikkiTapCost(unit)));
      unit.tapLevel += 1;
    }
    return state();
  },

  'tikki/buy': ({ body }) => {
    seed();
    settle();
    const { tier } = body as TikkiBuyBody;
    spend(tikkiBuyCost(tier as TikkiTier));
    units.push({
      ...buyTikkiUnit(tier as TikkiTier, `tikki-${++seq}`, Date.now()),
      selected: false,
    });
    return state();
  },

  'tikki/merge': ({ body }) => {
    seed();
    settle();
    const { unitIds } = body as TikkiMergeBody;
    const chosen = units.filter(u => unitIds.includes(u.id));
    if (chosen.length < tikkiMergeSize) return state();
    if (chosen.some(u => u.tier !== chosen[0].tier)) return state();

    spend(tikkiMergeCost(chosen[0].tier));
    const merged = mergeTikkiUnits(chosen, `tikki-${++seq}`, Date.now());
    if (merged) {
      for (let i = units.length - 1; i >= 0; i -= 1)
        if (unitIds.includes(units[i].id)) units.splice(i, 1);
      for (const u of units) u.selected = false;
      units.push({ ...merged, selected: true });
    }
    return state();
  },
};
