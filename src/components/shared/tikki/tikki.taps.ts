import type { TikkiState, TikkiUnit } from '@/types/interfaces/tikki.interfaces';

/**
 * Нажатия, которые экран уже показал, а сервер ещё не подтвердил.
 *
 * Чистая арифметика очереди тапов — без React и без сети, чтобы её можно было
 * проверить числами. Хук `useTikkiProgress` только вызывает её в нужные
 * моменты: на нажатии, на отправке пачки и на ответе.
 */
export interface TikkiPending {
  id: string;
  taken: number;
}

export const noPending: TikkiPending = { id: '', taken: 0 };

/**
 * Сколько нажатие унесёт НА САМОМ ДЕЛЕ: не больше, чем лежит целыми. Ноль —
 * брать нечего, и тогда ни цифры на экране, ни запроса на сервер.
 *
 * Сервер считает так же: `min(N × сила, floor(что лежит))`. Рисовать полную
 * силу при полупустом кликере значило бы показать «+4», из которых сервер
 * подтвердит «+2», и цифра под пальцем дёрнулась бы назад.
 */
export const tikkiTapTake = (fill: number, tapValue: number) =>
  Math.max(0, Math.min(tapValue, Math.floor(fill)));

/**
 * Что осталось ждать после ответа на пачку: вычитается РОВНО отправленное.
 *
 * Обнулять всё нельзя. Пачка уходит раз в полсекунды, а ответ идёт ещё столько
 * же, и нажатия, сделанные за это время, в ответе сервера ещё не учтены. До
 * 06.09.2026 ответ стирал и их: число под пальцем откатывалось на два-три
 * нажатия назад на каждый ответ, то есть при быстром тапе — постоянно.
 */
export const tikkiAfterBatch = (pending: TikkiPending, sent: TikkiPending): TikkiPending =>
  pending.id === sent.id
    ? { id: pending.id, taken: Math.max(0, pending.taken - sent.taken) }
    : pending;

/**
 * Состояние, каким его надо НАРИСОВАТЬ: серверное плюс то, что уже произошло
 * на экране и ещё не подтверждено.
 *
 * Две поправки, обе только для показа. Кликер досчитывается вперёд от того,
 * что прислал сервер, — полоса должна ползти, а не дёргаться раз в полминуты.
 * Неподтверждённые нажатия сразу сняты с кликера и добавлены к счёту: иначе
 * цифра под пальцем отставала бы на полсекунды, а это ровно то, ради чего в
 * такую игру и заходят.
 */
export const projectTikki = (
  state: TikkiState,
  pending: TikkiPending,
  now: number,
  syncedAt: number
): TikkiState => {
  // Пока метка не проставлена (первый кадр) — досчитывать нечего.
  const hours = syncedAt > 0 && now > 0 ? Math.max(0, now - syncedAt) / 3_600_000 : 0;
  const units = state.units.map((u): TikkiUnit => {
    const grown = Math.min(u.capacity, u.fill + u.clickerPerHour * hours);
    const mine = u.id === pending.id ? pending.taken : 0;
    return { ...u, fill: Math.max(0, Math.min(u.capacity, grown - mine)) };
  });
  return { ...state, balance: state.balance + pending.taken, units };
};
