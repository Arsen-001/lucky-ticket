import type { TicketType } from '@/types/types/ticket.types';

/** Что можно купить у одного Тикки. */
export type TikkiUpgradeKind = 'clicker' | 'passive' | 'window' | 'tap';

/**
 * Один Тикки, каким его прислал сервер.
 *
 * Цены здесь ГОТОВЫЕ, а не считаются экраном: считает их сервер, он же и
 * списывает. `null` вместо цены значит «лестница кончилась» — стрелки на этой
 * покупке нет, а не «нет денег».
 */
export interface TikkiUnit {
  id: string;
  tier: TicketType;
  level: number;
  base: number;
  passiveLevel: number;
  passiveBase: number;
  tapLevel: number;
  windowLevel: number;
  /** Сколько LC лежит в кликере и ждёт нажатий. */
  fill: number;
  /** Сколько в кликер влезает: доход в час × окно. */
  capacity: number;
  clickerPerHour: number;
  passivePerHour: number;
  windowHours: number;
  tapValue: number;
  /** Сколько нажатий нужно, чтобы вынести полный кликер. */
  tapPresses: number;
  selected: boolean;
  cost: {
    clicker: number | null;
    passive: number | null;
    window: number | null;
    tap: number | null;
  };
  /**
   * Что станет после каждой покупки — тоже считает сервер. Окно покупки
   * показывает «было → станет», и выводить «станет» на клиенте значило бы
   * держать там вторую копию экономики, которая однажды разойдётся с первой.
   */
  next: {
    clickerPerHour: number;
    clickerCapacity: number;
    passivePerHour: number;
    windowHours: number;
    windowCapacity: number;
    tapValue: number;
    tapPresses: number;
  };
}

export interface TikkiState {
  /** Баланс LC игрока — тот же, что и везде. Своего счёта у Тикки нет. */
  balance: number;
  units: TikkiUnit[];
  buyCost: Record<string, number>;
  merge: {
    size: number;
    /** Тиры, где уже набралось на сплав. */
    ready: TicketType[];
    costByTier: Record<string, number>;
  };
  config: {
    maxLevel: number;
    maxHours: number;
    startHours: number;
    tapMinPresses: number;
    awayDays: number;
    mergeSize: number;
    stepUpPercent: Record<string, number>;
    /** База каждого тира — из неё экран считает ПОКАЗ результата сплава. */
    tierBase: Record<string, number>;
    /** Срок окупаемости покупки — его пишет строка каждого тира. */
    buyPaybackDays: number;
  };
}

export interface TikkiTapBody {
  unitId: string;
  /** Сколько нажатий накопилось с прошлого запроса. */
  count: number;
}

export interface TikkiIdBody {
  unitId: string;
}

export interface TikkiUpgradeBody {
  unitId: string;
  kind: TikkiUpgradeKind;
}

export interface TikkiBuyBody {
  tier: TicketType;
}

export interface TikkiMergeBody {
  unitIds: string[];
}
