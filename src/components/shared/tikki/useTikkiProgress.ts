'use client';

import { useCallback, useEffect, useState } from 'react';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import {
  idleCapHours,
  maxLevel,
  perHourPerLevel,
  tikkiTiers,
  upgradeCost,
  type TikkiTier,
} from './tikki.constants';

export interface TikkiState {
  /** 0 — тир ещё не открыт. */
  level: number;
  /** Когда доход снимали в прошлый раз. */
  claimedAt: number;
}

export interface TikkiProgress {
  balance: number;
  tikki: Record<TikkiTier, TikkiState>;
}

const STORAGE_KEY = 'tikki-clicker-v1';

const emptyProgress = (): TikkiProgress => ({
  balance: 0,
  tikki: tikkiTiers.reduce(
    (acc, tier) => ({
      ...acc,
      [tier]: { level: tier === TicketsEnum.BRONZE ? 1 : 0, claimedAt: Date.now() },
    }),
    {} as Record<TikkiTier, TikkiState>
  ),
});

/**
 * Прогресс кликера. Живёт в localStorage этого устройства и НИЧЕГО не пишет в
 * настоящий баланс — страница черновая. Когда механика поедет в игру, отсюда
 * останется только форма данных, а считать будет сервер: иначе накрутить доход
 * можно из консоли.
 */
export function useTikkiProgress() {
  const [progress, setProgress] = useState<TikkiProgress>(emptyProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as TikkiProgress;
        // Форма могла измениться между версиями — берём только знакомые поля.
        setProgress(prev => ({
          balance: Number(saved.balance) || 0,
          tikki: tikkiTiers.reduce(
            (acc, tier) => ({
              ...acc,
              [tier]: {
                level: Number(saved.tikki?.[tier]?.level) || prev.tikki[tier].level,
                claimedAt: Number(saved.tikki?.[tier]?.claimedAt) || Date.now(),
              },
            }),
            {} as Record<TikkiTier, TikkiState>
          ),
        }));
      }
    } catch {
      // Приватное окно или запрет на хранилище — играем с чистого листа.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Не смогли сохранить — прогресс живёт до перезагрузки, но экран работает.
    }
  }, [progress, ready]);

  const tap = useCallback((amount: number) => {
    setProgress(prev => ({ ...prev, balance: prev.balance + amount }));
  }, []);

  const claim = useCallback((tier: TikkiTier, amount: number) => {
    setProgress(prev => ({
      ...prev,
      balance: prev.balance + amount,
      tikki: { ...prev.tikki, [tier]: { ...prev.tikki[tier], claimedAt: Date.now() } },
    }));
  }, []);

  const upgrade = useCallback((tier: TikkiTier) => {
    setProgress(prev => {
      const state = prev.tikki[tier];
      if (state.level >= maxLevel) return prev;
      const cost = upgradeCost(tier, state.level);
      if (prev.balance < cost) return prev;
      return {
        balance: prev.balance - cost,
        tikki: { ...prev.tikki, [tier]: { ...state, level: state.level + 1 } },
      };
    });
  }, []);

  const unlock = useCallback((tier: TikkiTier, cost: number) => {
    setProgress(prev => {
      if (prev.tikki[tier].level > 0 || prev.balance < cost) return prev;
      return {
        balance: prev.balance - cost,
        tikki: { ...prev.tikki, [tier]: { level: 1, claimedAt: Date.now() } },
      };
    });
  }, []);

  const reset = useCallback(() => setProgress(emptyProgress()), []);

  return { progress, ready, tap, claim, upgrade, unlock, reset };
}

/** Сколько накопилось у тира к моменту `now`, с учётом потолка простоя. */
export const pendingFor = (tier: TikkiTier, state: TikkiState, now: number) => {
  if (state.level < 1) return 0;
  const hours = Math.min((now - state.claimedAt) / 3_600_000, idleCapHours);
  return Math.floor(perHourPerLevel(tier, state.level) * Math.max(hours, 0));
};
