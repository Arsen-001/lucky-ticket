'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useBuyTikkiMutation,
  useGetTikkiQuery,
  useMergeTikkiMutation,
  useSelectTikkiMutation,
  useTapTikkiMutation,
  useUpgradeTikkiMutation,
} from '@/api/tikki.api';
import type { TikkiUpgradeKind } from '@/types/interfaces/tikki.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { noPending, projectTikki, tikkiAfterBatch, type TikkiPending } from './tikki.taps';

/** Старое имя буста — экраны знают его под ним. */
export type TikkiUpgrade = TikkiUpgradeKind;

/**
 * Как часто нажатия уходят на сервер.
 *
 * Не на каждое: тап повторяют десятками подряд, и запрос на каждый стоил бы
 * дороже самого нажатия. Полсекунды — столько, сколько игрок не замечает, и
 * достаточно, чтобы пачка выходила осмысленной.
 */
const TAP_FLUSH_MS = 500;

/** Как часто состояние перечитывается, пока экран открыт. */
const POLL_MS = 30_000;

/** Пачка, которая ещё не уехала: сколько раз нажали и на сколько LC. */
interface Batch {
  id: string;
  count: number;
  taken: number;
}

const noBatch: Batch = { id: '', count: 0, taken: 0 };

/**
 * Прогресс Тикки.
 *
 * 🔴 Считает СЕРВЕР. Клиент рисует отдачу сразу — иначе тап ощущался бы через
 * сеть, — но всё, что стоит денег, приезжает готовым: цены, доход, вместимость,
 * сила нажатия. До 03.09.2026 механика жила целиком в браузере, в localStorage
 * устройства, и накрутить доход можно было из консоли за секунду.
 *
 * Между ответами кликер досчитывается ЛОКАЛЬНО и только для показа: полоса
 * должна ползти, а не дёргаться раз в тридцать секунд. Настоящее число всё
 * равно приходит с сервера и перетирает нарисованное. Арифметика очереди
 * нажатий — в `tikki.taps.ts`, там же и почему она такая.
 */
export function useTikkiProgress() {
  const { data, isLoading, isError, refetch } = useGetTikkiQuery(undefined, {
    pollingInterval: POLL_MS,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
  });

  const [tapTikki] = useTapTikkiMutation();
  const [selectTikki] = useSelectTikkiMutation();
  const [upgradeTikki] = useUpgradeTikkiMutation();
  const [buyTikki] = useBuyTikkiMutation();
  const [mergeTikki] = useMergeTikkiMutation();

  /** Что игрок уже нажал, а сервер ещё не подтвердил — рисуем это сразу. */
  const [pending, setPending] = useState<TikkiPending>(noPending);
  const [tick, setTick] = useState(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queued = useRef<Batch>(noBatch);

  // Когда состояние в последний раз пришло с сервера — от этой точки кликер и
  // досчитывается вперёд. Идентичность `data` меняется на каждый ответ.
  // Состоянием, а не ссылкой: читать ref в теле рендера React Compiler не
  // разрешает, а нарисовать полосу без этой метки нечем. Ноль до первого
  // ответа — досчитывать тогда ещё нечего.
  const [syncedAt, setSyncedAt] = useState(0);
  useEffect(() => {
    setSyncedAt(Date.now());
  }, [data]);

  // Полоса кликера ползёт сама: доход капает непрерывно, и ждать следующего
  // ответа сервера, чтобы её сдвинуть, значит рисовать рывками.
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const flush = useCallback(() => {
    const sent = queued.current;
    queued.current = noBatch;
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = null;
    if (!sent.id || sent.count <= 0) return;
    void tapTikki({ unitId: sent.id, count: sent.count })
      .unwrap()
      .catch(() => {
        // Отказ (не хватило, слишком часто) — экран перерисуется следующим
        // ответом; своего счёта у него нет, врать ему нечем.
      })
      // Из ожидаемого вычитается ровно эта пачка, а не всё: нажатия, сделанные
      // пока она летела, в ответе ещё не учтены — см. tikkiAfterBatch.
      .finally(() => setPending(p => tikkiAfterBatch(p, sent)));
  }, [tapTikki]);

  // Уходя с экрана, дописываем то, что не успело уехать: пять нажатий и сразу
  // переход на другой экран иначе теряли бы все пять.
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      flush();
    };
  }, [flush]);

  const tap = useCallback(
    (unitId: string, value: number) => {
      // Брать нечего — нет ни цифры, ни запроса. Иначе пустой Тикки рисовал бы
      // «+1», которое сервер тут же отнимал, а каждое нажатие шло в минутный
      // потолок сервера.
      if (value <= 0) return;
      // Сменили персонажа с неотправленной пачкой — она уезжает сейчас, иначе
      // нажатия по прежнему пропали бы вместе с очередью.
      if (queued.current.id && queued.current.id !== unitId) flush();
      const q = queued.current.id === unitId ? queued.current : noBatch;
      queued.current = { id: unitId, count: q.count + 1, taken: q.taken + value };
      setPending(p =>
        p.id === unitId ? { id: unitId, taken: p.taken + value } : { id: unitId, taken: value }
      );
      if (!flushTimer.current) flushTimer.current = setTimeout(flush, TAP_FLUSH_MS);
    },
    [flush]
  );

  const select = useCallback(
    (unitId: string) => {
      selectTikki({ unitId })
        .unwrap()
        .catch(() => {
          /* выбор не сохранился — состояние придёт следующим ответом */
        });
    },
    [selectTikki]
  );

  const upgrade = useCallback(
    (unitId: string, kind: TikkiUpgradeKind) => upgradeTikki({ unitId, kind }).unwrap(),
    [upgradeTikki]
  );

  const buy = useCallback((tier: TicketType) => buyTikki({ tier }).unwrap(), [buyTikki]);

  const merge = useCallback((unitIds: string[]) => mergeTikki({ unitIds }).unwrap(), [mergeTikki]);

  return {
    state: data ? projectTikki(data, pending, tick, syncedAt) : undefined,
    isLoading,
    isError,
    refetch,
    tap,
    select,
    upgrade,
    buy,
    merge,
  };
}
