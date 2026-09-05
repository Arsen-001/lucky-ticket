import { describe, expect, it } from 'vitest';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TikkiState } from '@/types/interfaces/tikki.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';
import { formatTikkiCountdown, tikkiMsToFull } from '@/components/shared/tikki/tikki.countdown';
import { tikkiGoal, tikkiSpeech } from '@/components/shared/tikki/tikki.goal';

/**
 * Цель на сцене Тикки — арифметика, а не React: карточка под счётом,
 * призраки в ленте и реплика над головой читают одну запись, и если она
 * ошибётся, ошибутся все трое разом. Поэтому проверяется запись, а не экран.
 */

const state = (tiers: TicketsEnum[]): Pick<TikkiState, 'units' | 'buyCost' | 'merge'> => ({
  units: tiers.map((tier, index) => ({ id: `u${index}`, tier }) as TikkiState['units'][number]),
  buyCost: { bronze: 418_700, silver: 1_674_800 },
  merge: { size: 4, ready: [], costByTier: { bronze: 1_674_800, silver: 6_699_200 } },
});

describe('ближайшая цель выбранного тира', () => {
  it('с одним бронзовым: серебро, 1 из 4, цена ещё одного бронзового, три призрака', () => {
    const goal = tikkiGoal(state([TicketsEnum.BRONZE]), TicketsEnum.BRONZE);
    expect(goal).toEqual({
      tier: 'bronze',
      next: 'silver',
      count: 1,
      size: 4,
      ready: false,
      price: 418_700,
      ghosts: 3,
    });
  });

  it('чужой тир не считается: три бронзовых и серебряный — это 3 из 4', () => {
    const goal = tikkiGoal(
      state([TicketsEnum.BRONZE, TicketsEnum.SILVER, TicketsEnum.BRONZE, TicketsEnum.BRONZE]),
      TicketsEnum.BRONZE
    );
    expect(goal?.count).toBe(3);
    expect(goal?.ghosts).toBe(1);
  });

  it('набралось четыре — цель сплав по цене сплава, призраков нет', () => {
    const goal = tikkiGoal(state(new Array(4).fill(TicketsEnum.BRONZE)), TicketsEnum.BRONZE);
    expect(goal?.ready).toBe(true);
    expect(goal?.price).toBe(1_674_800);
    expect(goal?.ghosts).toBe(0);
  });

  it('больше четырёх — всё ещё сплав, а не отрицательные призраки', () => {
    const goal = tikkiGoal(state(new Array(6).fill(TicketsEnum.BRONZE)), TicketsEnum.BRONZE);
    expect(goal?.ready).toBe(true);
    expect(goal?.ghosts).toBe(0);
  });

  it('у алмаза цели нет: сплавлять некуда', () => {
    expect(tikkiGoal(state([TicketsEnum.DIAMOND]), TicketsEnum.DIAMOND)).toBeNull();
  });
});

describe('что Тикки говорит', () => {
  const goal = tikkiGoal(state([TicketsEnum.BRONZE]), TicketsEnum.BRONZE);

  it('полный просит забрать — цель подождёт', () => {
    expect(tikkiSpeech({ full: true, empty: false, goal })).toEqual({ key: 'tikki says full' });
  });

  it('пустой просит подождать', () => {
    expect(tikkiSpeech({ full: false, empty: true, goal })).toEqual({ key: 'tikki says empty' });
  });

  it('спокойный и один — говорит, сколько ещё таких нужно', () => {
    expect(tikkiSpeech({ full: false, empty: false, goal })).toEqual({
      key: 'tikki says lonely',
      count: 3,
      next: 'silver',
    });
  });

  it('набралось четыре — зовёт сплавлять', () => {
    const ready = tikkiGoal(state(new Array(4).fill(TicketsEnum.BRONZE)), TicketsEnum.BRONZE);
    expect(tikkiSpeech({ full: false, empty: false, goal: ready })).toEqual({
      key: 'tikki says merge',
      count: 4,
    });
  });

  it('без цели — просто «тапни»', () => {
    expect(tikkiSpeech({ full: false, empty: false, goal: null })).toEqual({
      key: 'tikki says tap',
    });
  });
});

describe('время до полного', () => {
  const t = ((key: string) =>
    ({ full: 'Full', 'hour short': 'h', 'minute short': 'm' })[key] ?? key) as Dictionary;

  it('пустой бронзовый набирается четыре часа', () => {
    const ms = tikkiMsToFull({ fill: 0, capacity: 100, clickerPerHour: 25 });
    expect(ms).toBe(4 * 3_600_000);
    expect(formatTikkiCountdown(ms, t)).toBe('4h 00m');
  });

  it('меньше часа — только минуты; полный — слово', () => {
    expect(
      formatTikkiCountdown(tikkiMsToFull({ fill: 90, capacity: 100, clickerPerHour: 25 }), t)
    ).toBe('24m');
    expect(formatTikkiCountdown(0, t)).toBe('Full');
  });

  it('нулевой доход не делит на ноль', () => {
    expect(tikkiMsToFull({ fill: 0, capacity: 100, clickerPerHour: 0 })).toBe(0);
  });
});
