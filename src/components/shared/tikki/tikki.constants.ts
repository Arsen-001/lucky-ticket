import { TicketsEnum } from '@/types/enums/ticket.enums';

/**
 * Рабочие числа страницы Тикки.
 *
 * 🔴 Это ЧЕРНОВИК, а не экономика. Страница ничего не пишет в баланс и не ходит
 * на бэкенд: прогресс лежит в localStorage этого устройства. Прежде чем сажать
 * механику на настоящие LC, числа должны пройти через `DOCS/DOCS.md` и админку,
 * как остальная экономика — тут они выставлены только чтобы кликер было на чём
 * щупать.
 */
export const tikkiTiers = [
  TicketsEnum.BRONZE,
  TicketsEnum.SILVER,
  TicketsEnum.GOLD,
  TicketsEnum.PLATINUM,
  TicketsEnum.DIAMOND,
] as const;

export type TikkiTier = (typeof tikkiTiers)[number];

interface TikkiTierRates {
  /** LC за один тап на первом уровне. */
  tap: number;
  /** LC в час на первом уровне. */
  perHour: number;
  /** Цена первого апгрейда; дальше растёт на `upgradeStep`. */
  upgradeBase: number;
  /** Сколько стоит открыть тир. Бронза открыта сразу. */
  unlock: number;
}

export const tikkiRates: Record<TikkiTier, TikkiTierRates> = {
  [TicketsEnum.BRONZE]: { tap: 1, perHour: 30, upgradeBase: 500, unlock: 0 },
  [TicketsEnum.SILVER]: { tap: 3, perHour: 90, upgradeBase: 2_000, unlock: 5_000 },
  [TicketsEnum.GOLD]: { tap: 8, perHour: 240, upgradeBase: 8_000, unlock: 25_000 },
  [TicketsEnum.PLATINUM]: { tap: 20, perHour: 600, upgradeBase: 30_000, unlock: 120_000 },
  [TicketsEnum.DIAMOND]: { tap: 50, perHour: 1_500, upgradeBase: 100_000, unlock: 500_000 },
};

/** Во сколько раз дорожает каждый следующий уровень. */
export const upgradeStep = 1.55;

export const maxLevel = 20;

/**
 * Сколько часов копится доход, пока игрока нет. Потолок обязателен: без него
 * достаточно не заходить неделю, и кликер платит больше, чем игра за неделю.
 */
export const idleCapHours = 8;

export const tapPerLevel = (tier: TikkiTier, level: number) =>
  Math.round(tikkiRates[tier].tap * level);

export const perHourPerLevel = (tier: TikkiTier, level: number) =>
  Math.round(tikkiRates[tier].perHour * level);

export const upgradeCost = (tier: TikkiTier, level: number) =>
  Math.round(tikkiRates[tier].upgradeBase * Math.pow(upgradeStep, level - 1));
