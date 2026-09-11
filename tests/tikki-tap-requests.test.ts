import { describe, expect, it } from 'vitest';
import { makeStore } from '@/lib/rtk/store';
import { meApi } from '@/api/me.api';
import { tikkiApi } from '@/api/tikki.api';

/**
 * Тап не должен стоить второго запроса.
 *
 * Тап — единственная мутация, которую повторяют десятками раз подряд: пачка
 * уходит раз в полсекунды, то есть до 120 запросов в минуту с одного игрока.
 * До 11.09.2026 каждая из них инвалидировала `me`, и на главном экране —
 * а Тикки и есть первый экран главной — следом летел ещё и `GET /me`. Вдвое
 * больше запросов за числом, которое уже лежало в ответе тапа, и цифра в
 * шапке отставала от цифры на сцене на целый круг до сервера.
 *
 * Ответ тапа несёт `balance` — это `user.coins`, ровно то, что печатает
 * шапка, — и он переписывается в кэш `me` руками. Проверяется и то и другое:
 * баланс в шапке стал новым И запроса за ним не было.
 */

/** Дождаться первого ответа на запрос. */
const settled = async <T extends { status: string; fulfilledTimeStamp?: number }>(
  read: () => T
): Promise<T> => {
  for (let i = 0; i < 100; i++) {
    const entry = read();
    if (entry.status === 'fulfilled') return entry;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`запрос так и не ответил (status: ${read().status})`);
};

describe('нажатие по Тикки двигает шапку, не спрашивая сервер второй раз', () => {
  it('баланс в `me` новый, а перезапроса не было', async () => {
    const store = makeStore();

    const me = () => meApi.endpoints.getMe.select()(store.getState());
    store.dispatch(meApi.endpoints.getMe.initiate());
    const before = await settled(me);
    const coinsBefore = before.data!.coins;

    const state = await store.dispatch(tikkiApi.endpoints.getTikki.initiate()).unwrap();
    const unit = state.units.find(u => u.fill >= 1);
    expect(unit, 'в фикстуре должен быть Тикки, с которого есть что взять').toBeTruthy();

    const tapped = await store
      .dispatch(tikkiApi.endpoints.tapTikki.initiate({ unitId: unit!.id, count: 5 }))
      .unwrap();

    // Положительный контроль: если тап ничего не начислил, две проверки ниже
    // сошлись бы на старом числе и позеленели, ничего не проверив.
    expect(tapped.balance).toBeGreaterThan(coinsBefore);

    // Шапка читает `me.coins` — там уже новое число, из ответа самого тапа.
    expect(me().data!.coins).toBe(tapped.balance);

    // И это не результат перезапроса: ответ в кэше `me` всё тот же, первый.
    expect(me().fulfilledTimeStamp).toBe(before.fulfilledTimeStamp);
  }, 30_000);
});
