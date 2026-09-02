import { describe, expect, it } from 'vitest';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import {
  tikkiMaxHours,
  tikkiMaxLevel,
  tikkiMergeSize,
  tikkiTapMinPresses,
  type TikkiUnit,
} from '@/components/shared/tikki/tikki.constants';
import {
  buyTikkiUnit,
  mergeTikkiUnits,
  tikkiBuyCost,
  tikkiCapacity,
  tikkiClickerLevelCost,
  tikkiDayIncome,
  tikkiMergeCost,
  tikkiMergeResult,
  tikkiPassiveLevelCost,
  tikkiTapCost,
  tikkiTapMaxed,
  tikkiTapValue,
  tikkiWindowCost,
  tikkiWindowHours,
} from '@/components/shared/tikki/tikki.utils';

/**
 * Числа Тикки решались весь день 02.09.2026 и стоят в коде как решены. Тест
 * держит именно их — не «примерно столько», а до рубля: каждое из них было
 * посчитано из срока окупаемости, и любая правка формулы, которая их сдвинет,
 * молча меняет экономику фичи.
 */

const bronze = () => buyTikkiUnit(TicketsEnum.BRONZE, 'b', 0);

/** Тот же Тикки, но с выкрученным бустом/уровнем — цены зависят от порядка. */
const withLevels = (unit: TikkiUnit, patch: Partial<TikkiUnit>): TikkiUnit => ({
  ...unit,
  ...patch,
});

describe('Тикки: доход', () => {
  it('бронза первого уровня — 460 кликером и 600 пассивом в день', () => {
    const unit = bronze();
    expect(tikkiCapacity(unit)).toBe(100); // 25 в час × 4 часа окна
    expect(tikkiDayIncome(unit)).toBe(1060);
  });

  it('окно стартует с четырёх часов и упирается в двенадцать', () => {
    expect(tikkiWindowHours(bronze())).toBe(4);
    expect(tikkiWindowHours(withLevels(bronze(), { windowLevel: 9 }))).toBe(tikkiMaxHours);
    // Дальше двенадцати ступень не продаётся — покупать было бы некому.
    expect(tikkiWindowHours(withLevels(bronze(), { windowLevel: 40 }))).toBe(tikkiMaxHours);
  });
});

describe('Тикки: цены', () => {
  it('покупка любого тира окупается за 395 дней', () => {
    expect(tikkiBuyCost(TicketsEnum.BRONZE)).toBe(418_700);
    // Ступень тира вчетверо — и в доходе, и в цене, поэтому срок один на всех.
    expect(tikkiBuyCost(TicketsEnum.SILVER)).toBe(418_700 * 4);
    expect(tikkiBuyCost(TicketsEnum.DIAMOND)).toBe(418_700 * 256);
  });

  it('ступень кликера — 6 716 при окне 4 ч и 8 760 при 12 ч', () => {
    expect(tikkiClickerLevelCost(bronze())).toBe(6_716);
    expect(tikkiClickerLevelCost(withLevels(bronze(), { windowLevel: 9 }))).toBe(8_760);
  });

  it('ступень пассива ровная вдоль всей лестницы', () => {
    expect(tikkiPassiveLevelCost(bronze())).toBe(8_760);
    expect(tikkiPassiveLevelCost(withLevels(bronze(), { passiveLevel: 99 }))).toBe(8_760);
    expect(tikkiPassiveLevelCost(withLevels(bronze(), { passiveLevel: tikkiMaxLevel }))).toBe(
      Infinity
    );
  });

  it('первый час окна стоит 21 200 и дальше дешевеет', () => {
    expect(tikkiWindowCost(bronze())).toBe(21_200);
    const second = tikkiWindowCost(withLevels(bronze(), { windowLevel: 2 }));
    expect(second).toBeLessThan(21_200);
    expect(tikkiWindowCost(withLevels(bronze(), { windowLevel: 9 }))).toBe(Infinity);
  });

  it('первая ступень тапа — 1 367', () => {
    expect(tikkiTapCost(bronze())).toBe(1_367);
  });
});

describe('Тикки: тап', () => {
  it('нажатие не уносит больше десятой части кликера', () => {
    // Пол по нажатиям: 100 LC в кликере ⇒ максимум 10 за нажатие, сколько бы
    // ни был прокачан тап. «Забрать всё» одним нажатием не бывает никогда.
    const pumped = withLevels(bronze(), { tapLevel: tikkiMaxLevel });
    expect(tikkiTapValue(pumped)).toBe(tikkiCapacity(pumped) / tikkiTapMinPresses);
    expect(tikkiTapMaxed(pumped)).toBe(true);
  });

  it('на первом уровне тап забирает 1', () => {
    expect(tikkiTapValue(bronze())).toBe(1);
    expect(tikkiTapMaxed(bronze())).toBe(false);
  });
});

describe('Тикки: сплав', () => {
  it('цена = цена покупки нового тира и от числа карточек не зависит', () => {
    expect(tikkiMergeCost(TicketsEnum.BRONZE)).toBe(1_674_800);
    expect(tikkiMergeCost(TicketsEnum.SILVER)).toBe(6_699_200);
    expect(tikkiMergeCost(TicketsEnum.GOLD)).toBe(26_796_800);
    expect(tikkiMergeCost(TicketsEnum.PLATINUM)).toBe(107_187_200);
    expect(tikkiMergeCost(TicketsEnum.DIAMOND)).toBe(0); // дальше алмаза некуда

    const four = Array.from({ length: tikkiMergeSize }, () => bronze());
    const twenty = Array.from({ length: 20 }, () => bronze());
    expect(tikkiMergeResult(four)?.cost).toBe(tikkiMergeResult(twenty)?.cost);
  });

  it('процент идёт на полный результат, а не только на подарок', () => {
    // Пример, на котором правило и решалось: десять бронзовых ур.1 →
    // (250 суммой + 100 база серебра) × 1,01 = 354.
    const ten = Array.from({ length: 10 }, () => bronze());
    const result = tikkiMergeResult(ten);
    expect(result?.percent).toBe(1);
    expect(result?.base).toBe(354);
    expect(result?.passiveBase).toBe(354);
  });

  it('класть больше четверых выгоднее — цена та же, база больше', () => {
    const four = tikkiMergeResult(Array.from({ length: 4 }, () => bronze()));
    const ten = tikkiMergeResult(Array.from({ length: 10 }, () => bronze()));
    expect(four?.base).toBe(202);
    expect(ten!.base).toBeGreaterThan(four!.base);
    expect(ten!.cost).toBe(four!.cost);
  });

  it('новый рождается первого уровня, с окном 4 ч и тапом своего тира', () => {
    const merged = mergeTikkiUnits(
      Array.from({ length: 4 }, () => bronze()),
      'm',
      0
    )!;
    expect(merged.tier).toBe(TicketsEnum.SILVER);
    expect(merged.level).toBe(1);
    expect(merged.passiveLevel).toBe(1);
    expect(tikkiWindowHours(merged)).toBe(4);
    expect(tikkiTapValue(merged)).toBe(4); // как у купленного серебряного
    expect(merged.base).toBe(202);
  });

  it('сплав окупается примерно как покупка — за 395 дней', () => {
    const four = Array.from({ length: 4 }, () => bronze());
    const merged = mergeTikkiUnits(four, 'm', 0)!;
    const gain = tikkiDayIncome(merged) - four.reduce((sum, u) => sum + tikkiDayIncome(u), 0);
    const days = tikkiMergeCost(TicketsEnum.BRONZE) / gain;
    expect(Math.round(days)).toBe(387);
  });
});
