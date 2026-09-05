import { describe, expect, it } from 'vitest';
import {
  noPending,
  projectTikki,
  tikkiAfterBatch,
  tikkiTapTake,
} from '@/components/shared/tikki/tikki.taps';
import type { TikkiState } from '@/types/interfaces/tikki.interfaces';

/**
 * Очередь нажатий Тикки — арифметика, а не React.
 *
 * Два глюка показа, найденные 05.09.2026 по коду и закрытые 06.09: при
 * быстром тапе число откатывалось назад на каждый ответ сервера, а тап по
 * пустому Тикки рисовал «+1» и всё равно слал запрос. Оба — про то, что
 * экран считает между ответами, поэтому и проверяются числами: хук только
 * вызывает эти функции в нужные моменты.
 */

const state = (units: { id: string; fill: number; capacity: number; perHour: number }[]) =>
  ({
    balance: 1_000,
    units: units.map(u => ({
      id: u.id,
      fill: u.fill,
      capacity: u.capacity,
      clickerPerHour: u.perHour,
    })),
  }) as unknown as TikkiState;

describe('сколько нажатие унесёт на самом деле', () => {
  it('не больше, чем лежит целыми', () => {
    expect(tikkiTapTake(100, 1)).toBe(1);
    expect(tikkiTapTake(2.5, 4)).toBe(2); // сила 4, лежит два с половиной
    expect(tikkiTapTake(0.9, 1)).toBe(0); // меньше целого — брать нечего
    expect(tikkiTapTake(0, 4)).toBe(0);
  });
});

describe('ответ на пачку вычитает ровно отправленное', () => {
  it('нажатия, сделанные пока пачка летела, остаются на экране', () => {
    // Три нажатия → пачка ушла → ещё два, пока она летела → ответ.
    const afterThree = { id: 'a', taken: 3 };
    const sent = afterThree;
    const afterFive = { id: 'a', taken: 5 };

    expect(tikkiAfterBatch(afterFive, sent)).toEqual({ id: 'a', taken: 2 });
    // Было до 06.09.2026: ответ обнулял всё, и число падало на два назад.
    expect(tikkiAfterBatch(afterFive, sent).taken).not.toBe(0);
  });

  it('ответ по другому персонажу ничего не трогает', () => {
    expect(tikkiAfterBatch({ id: 'b', taken: 4 }, { id: 'a', taken: 3 })).toEqual({
      id: 'b',
      taken: 4,
    });
  });

  it('ниже нуля не уходит, даже если сервер ответил на больше, чем ждём', () => {
    expect(tikkiAfterBatch({ id: 'a', taken: 2 }, { id: 'a', taken: 5 }).taken).toBe(0);
    expect(tikkiAfterBatch(noPending, { id: 'a', taken: 5 })).toEqual(noPending);
  });
});

describe('что рисуется между ответами', () => {
  it('неподтверждённые нажатия уже на счету и уже сняты с кликера', () => {
    const s = projectTikki(
      state([{ id: 'a', fill: 40, capacity: 100, perHour: 0 }]),
      { id: 'a', taken: 15 },
      0,
      0
    );
    expect(s.balance).toBe(1_015);
    expect(s.units[0].fill).toBe(25);
  });

  it('кликер досчитывается вперёд от ответа сервера и упирается в окно', () => {
    // 3 600 в час — по одному LC в секунду; десять секунд после ответа.
    const grown = projectTikki(
      state([{ id: 'a', fill: 40, capacity: 100, perHour: 3_600 }]),
      noPending,
      11_000,
      1_000
    );
    expect(grown.units[0].fill).toBe(50);

    const capped = projectTikki(
      state([{ id: 'a', fill: 95, capacity: 100, perHour: 3_600 }]),
      noPending,
      61_000,
      1_000
    );
    expect(capped.units[0].fill).toBe(100);
  });

  it('до первого ответа не досчитывает ничего', () => {
    const s = projectTikki(
      state([{ id: 'a', fill: 40, capacity: 100, perHour: 3_600 }]),
      noPending,
      99_000,
      0
    );
    expect(s.units[0].fill).toBe(40);
  });

  it('снятое с кликера не уводит его ниже нуля', () => {
    const s = projectTikki(
      state([{ id: 'a', fill: 3, capacity: 100, perHour: 0 }]),
      { id: 'a', taken: 10 },
      0,
      0
    );
    expect(s.units[0].fill).toBe(0);
  });
});
