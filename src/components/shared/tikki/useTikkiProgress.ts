'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import { tikkiMaxLevel, tikkiMergeSize, type TikkiTier, type TikkiUnit } from './tikki.constants';
import {
  buyTikkiUnit,
  mergeTikkiUnits,
  tikkiBuyCost,
  tikkiClickerLevelCost,
  tikkiFillAt,
  tikkiMergeCost,
  tikkiPassiveEarned,
  tikkiPassiveLevelCost,
  tikkiTapCost,
  tikkiTapValue,
  tikkiWindowCost,
} from './tikki.utils';

export type TikkiUpgrade = 'clicker' | 'passive' | 'window' | 'tap';

export interface TikkiProgress {
  balance: number;
  units: TikkiUnit[];
  selectedId: string;
  /** Из чего берутся id новых Тикки — растёт и не переиспользуется. */
  seq: number;
}

const STORAGE_KEY = 'tikki-clicker-v2';
const SAVE_THROTTLE_MS = 1_500;

/** Первый бронзовый бесплатный — иначе в фичу нечем войти. */
const firstProgress = (now: number): TikkiProgress => {
  const first = buyTikkiUnit(TicketsEnum.BRONZE, 'tikki-1', now);
  return { balance: 0, units: [first], selectedId: first.id, seq: 1 };
};

/**
 * Догнать время: кликер наполнить, пассив зачислить на счёт.
 *
 * Обе величины считаются от собственной метки Тикки, а не от общего «когда
 * заходили». Пассив держится `tikkiAwayDays` без захода и дальше стоит — иначе
 * достаточно не открывать игру месяц, чтобы вернуться богаче любого, кто играл.
 */
const settleAt = (progress: TikkiProgress, now: number): TikkiProgress => {
  let earned = 0;

  const units = progress.units.map(unit => {
    earned += tikkiPassiveEarned(unit, now);
    return { ...unit, fill: tikkiFillAt(unit, now), filledAt: now, paidAt: now };
  });

  return { ...progress, balance: progress.balance + earned, units };
};

/** Числа могли приехать из прошлой версии или из чужих рук — чиним форму. */
const reviveUnit = (raw: Partial<TikkiUnit> | undefined, index: number): TikkiUnit | null => {
  const tier = raw?.tier;
  if (!tier) return null;

  const seed = buyTikkiUnit(tier as TikkiTier, raw?.id || `tikki-${index + 1}`, Date.now());
  const num = (value: unknown, fallback: number) =>
    Number.isFinite(Number(value)) ? Number(value) : fallback;

  return {
    ...seed,
    base: num(raw?.base, seed.base),
    passiveBase: num(raw?.passiveBase, seed.passiveBase),
    level: Math.min(tikkiMaxLevel, Math.max(1, num(raw?.level, 1))),
    passiveLevel: Math.min(tikkiMaxLevel, Math.max(1, num(raw?.passiveLevel, 1))),
    tapLevel: Math.min(tikkiMaxLevel, Math.max(1, num(raw?.tapLevel, 1))),
    windowLevel: Math.max(1, num(raw?.windowLevel, 1)),
    fill: Math.max(0, num(raw?.fill, 0)),
    filledAt: num(raw?.filledAt, Date.now()),
    paidAt: num(raw?.paidAt, Date.now()),
  };
};

/** Цена одной покупки — в одном месте, чтобы экран и хук не разошлись. */
export const upgradeCost = (unit: TikkiUnit, kind: TikkiUpgrade) => {
  if (kind === 'clicker') return tikkiClickerLevelCost(unit);
  if (kind === 'passive') return tikkiPassiveLevelCost(unit);
  if (kind === 'window') return tikkiWindowCost(unit);
  return tikkiTapCost(unit);
};

/** Что покупка меняет в самом Тикки. */
export const applyUpgrade = (unit: TikkiUnit, kind: TikkiUpgrade): TikkiUnit => {
  if (kind === 'clicker') return { ...unit, level: unit.level + 1 };
  if (kind === 'passive') return { ...unit, passiveLevel: unit.passiveLevel + 1 };
  if (kind === 'window') return { ...unit, windowLevel: unit.windowLevel + 1 };
  return { ...unit, tapLevel: unit.tapLevel + 1 };
};

/**
 * Прогресс Тикки.
 *
 * 🔴 Живёт в localStorage ЭТОГО устройства и настоящего баланса не касается.
 * Механика перенесена сюда целиком, чтобы тестировщики видели её всю; когда она
 * поедет на настоящие LC, считать обязан сервер — иначе доход накручивается из
 * консоли за секунду. Отсюда останется форма данных и формулы, не хранилище.
 */
export function useTikkiProgress() {
  const [progress, setProgress] = useState<TikkiProgress>(() => firstProgress(Date.now()));
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Последнее состояние — чтобы дописать его на выходе, когда `progress` из
  // замыкания эффекта уже устарел.
  const latest = useRef(progress);

  const save = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latest.current));
    } catch {
      // Не смогли сохранить — прогресс живёт до перезагрузки, экран работает.
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<TikkiProgress>;
        const units = (Array.isArray(saved.units) ? saved.units : [])
          .map((unit, index) => reviveUnit(unit, index))
          .filter((unit): unit is TikkiUnit => unit !== null);

        if (units.length) {
          const selected = units.some(unit => unit.id === saved.selectedId)
            ? String(saved.selectedId)
            : units[0].id;
          setProgress(
            settleAt(
              {
                balance: Math.max(0, Number(saved.balance) || 0),
                units,
                selectedId: selected,
                seq: Math.max(units.length, Number(saved.seq) || 0),
              },
              now
            )
          );
        }
      }
    } catch {
      // Приватное окно или запрет на хранилище — играем с чистого листа.
    }
    setReady(true);
  }, []);

  // Кликер наполняется, пассив капает — обе цифры на экране должны идти сами,
  // поэтому время догоняется в состоянии, а не пересчитывается в каждом месте.
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setProgress(prev => settleAt(prev, Date.now())), 1000);
    return () => clearInterval(id);
  }, [ready]);

  /**
   * Запись НЕ на каждый тик: состояние двигается раз в секунду, а localStorage
   * синхронный — писать в него по разу на тик значит дёргать главный поток
   * ровно там, где идёт анимация тапа.
   *
   * 🪤 И не debounce, каким это было сначала: состояние меняется чаще, чем
   * длится задержка (секунда против полутора), поэтому таймер снимался и
   * ставился заново БЕСКОНЕЧНО и не срабатывал НИ РАЗУ. Прогресс держался
   * только тем, что дописывался на выходе, — то есть терялся весь целиком,
   * стоило приложению закрыться иначе. Здесь throttle: первый же тик заводит
   * таймер, и дальше он не сдвигается, пока не отработает.
   */
  useEffect(() => {
    latest.current = progress;
    if (!ready || saveTimer.current) return;
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      save();
    }, SAVE_THROTTLE_MS);
  }, [progress, ready]);

  // Отложенная запись теряла последние полторы секунды: уйти со сцены сразу
  // после пяти нажатий значило не сохранить ни одного — таймер снимался
  // размонтированием. Копится доход от МЕТОК времени, поэтому пропущенные
  // секунды догоняются сами, а вот тапы — нет: их надо дописать на выходе.
  useEffect(() => {
    if (!ready) return;
    const flush = () => save();
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = null;
      flush();
    };
  }, [ready]);

  const select = useCallback((id: string) => {
    setProgress(prev =>
      prev.units.some(unit => unit.id === id) ? { ...prev, selectedId: id } : prev
    );
  }, []);

  /** Нажатие: уносит из кликера столько, сколько стоит тап, и ни LC больше. */
  const tap = useCallback((id: string) => {
    setProgress(prev => {
      const unit = prev.units.find(item => item.id === id);
      if (!unit) return prev;

      const taken = Math.min(tikkiTapValue(unit), Math.floor(unit.fill));
      if (taken <= 0) return prev;

      return {
        ...prev,
        balance: prev.balance + taken,
        units: prev.units.map(item =>
          item.id === id ? { ...item, fill: item.fill - taken } : item
        ),
      };
    });
  }, []);

  const buy = useCallback((tier: TikkiTier) => {
    setProgress(prev => {
      const price = tikkiBuyCost(tier);
      if (prev.balance < price) return prev;

      const seq = prev.seq + 1;
      const bought = buyTikkiUnit(tier, `tikki-${seq}`, Date.now());
      return {
        balance: prev.balance - price,
        units: [...prev.units, bought],
        selectedId: bought.id,
        seq,
      };
    });
  }, []);

  const upgrade = useCallback((id: string, kind: TikkiUpgrade) => {
    setProgress(prev => {
      const unit = prev.units.find(item => item.id === id);
      if (!unit) return prev;

      const price = upgradeCost(unit, kind);
      if (!Number.isFinite(price) || prev.balance < price) return prev;

      return {
        ...prev,
        balance: prev.balance - price,
        units: prev.units.map(item => (item.id === id ? applyUpgrade(item, kind) : item)),
      };
    });
  }, []);

  /** Сплав мгновенный: отмеченные исчезают, на их месте один следующего тира. */
  const merge = useCallback((ids: readonly string[]) => {
    setProgress(prev => {
      const chosen = prev.units.filter(unit => ids.includes(unit.id));
      if (chosen.length < tikkiMergeSize) return prev;
      if (chosen.some(unit => unit.tier !== chosen[0].tier)) return prev;

      const price = tikkiMergeCost(chosen[0].tier);
      if (!price || prev.balance < price) return prev;

      const seq = prev.seq + 1;
      const merged = mergeTikkiUnits(chosen, `tikki-${seq}`, Date.now());
      if (!merged) return prev;

      return {
        balance: prev.balance - price,
        units: [...prev.units.filter(unit => !ids.includes(unit.id)), merged],
        selectedId: merged.id,
        seq,
      };
    });
  }, []);

  const reset = useCallback(() => setProgress(firstProgress(Date.now())), []);

  return { progress, ready, select, tap, buy, upgrade, merge, reset };
}
