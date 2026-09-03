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
import type { TikkiState, TikkiUnit, TikkiUpgradeKind } from '@/types/interfaces/tikki.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

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
 * равно приходит с сервера и перетирает нарисованное.
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

  /** Что игрок уже нажал, но сервер ещё не подтвердил — рисуем это сразу. */
  const [pending, setPending] = useState({ id: '', taken: 0 });
  const [tick, setTick] = useState(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queued = useRef({ id: '', count: 0 });

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
    const { id, count } = queued.current;
    queued.current = { id: '', count: 0 };
    flushTimer.current = null;
    if (!id || count <= 0) return;
    void tapTikki({ unitId: id, count })
      .unwrap()
      .catch(() => {
        // Отказ (не хватило, слишком часто) — экран перерисуется следующим
        // ответом; своего счёта у него нет, врать ему нечем.
      })
      .finally(() => setPending({ id: '', taken: 0 }));
  }, [tapTikki]);

  // Уходя с экрана, дописываем то, что не успело уехать: пять нажатий и сразу
  // переход на другой экран иначе теряли бы все пять.
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flush();
    };
  }, [flush]);

  const tap = useCallback(
    (unitId: string, value: number) => {
      queued.current =
        queued.current.id === unitId
          ? { id: unitId, count: queued.current.count + 1 }
          : { id: unitId, count: 1 };
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
    state: data ? projected(data, pending, tick, syncedAt) : undefined,
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

/**
 * Состояние, каким его надо НАРИСОВАТЬ: серверное плюс то, что уже произошло на
 * экране и ещё не подтверждено.
 *
 * Две поправки, обе только для показа. Кликер досчитывается вперёд от того, что
 * прислал сервер, — полоса должна ползти. Неподтверждённые нажатия сразу сняты
 * с кликера и добавлены к счёту: иначе цифра под пальцем отставала бы на
 * полсекунды, а это ровно то, ради чего в такую игру и заходят.
 */
const projected = (
  state: TikkiState,
  pending: { id: string; taken: number },
  now: number,
  syncedAt: number
): TikkiState => {
  // Пока эффект не проставил метку (первый кадр) — досчитывать нечего.
  const hours = syncedAt > 0 && now > 0 ? Math.max(0, now - syncedAt) / 3_600_000 : 0;
  const units = state.units.map((u): TikkiUnit => {
    const grown = Math.min(u.capacity, u.fill + u.clickerPerHour * hours);
    const mine = u.id === pending.id ? pending.taken : 0;
    return { ...u, fill: Math.max(0, Math.min(u.capacity, grown - mine)) };
  });
  return { ...state, balance: state.balance + pending.taken, units };
};
