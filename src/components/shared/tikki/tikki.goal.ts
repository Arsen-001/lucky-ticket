import type { TikkiState } from '@/types/interfaces/tikki.interfaces';
import type { TikkiTier } from './tikki.constants';
import { nextTikkiTier } from './tikki.utils';

/**
 * Ближайшая цель игрока на сцене: собрать четыре Тикки выбранного тира и
 * сплавить их в следующий.
 *
 * С одним Тикки экран отвечал на «что дальше» пустым небом над головой и
 * лентой из одной карточки. Цель — то, чем это небо занято с 06.09.2026:
 * карточка под счётом, призрачные места в ленте и реплика персонажа читают
 * одну и ту же запись, поэтому считается она в одном месте и без React.
 */
export interface TikkiGoal {
  tier: TikkiTier;
  /** Во что сплавятся четыре таких. */
  next: TikkiTier;
  /** Сколько Тикки этого тира уже есть. */
  count: number;
  /** Сколько нужно на сплав. */
  size: number;
  /** Набралось: цель — сплав, а не покупка. */
  ready: boolean;
  /** Цена шага: ещё одного такого же, пока не набралось, и сплава — когда набралось. */
  price: number;
  /** Сколько пустых мест дорисовать в ленте, чтобы стойка читалась на четверых. */
  ghosts: number;
}

/** Алмаз сплавлять некуда — у него цели нет, и сцена остаётся как была. */
export const tikkiGoal = (
  state: Pick<TikkiState, 'units' | 'buyCost' | 'merge'>,
  tier: TikkiTier
): TikkiGoal | null => {
  const next = nextTikkiTier(tier);
  if (!next) return null;

  const size = state.merge.size;
  const count = state.units.filter(unit => unit.tier === tier).length;
  const ready = count >= size;

  return {
    tier,
    next,
    count,
    size,
    ready,
    price: ready ? (state.merge.costByTier[tier] ?? 0) : (state.buyCost[tier] ?? 0),
    ghosts: ready ? 0 : size - count,
  };
};

/**
 * Что Тикки говорит над головой. Состояние кликера важнее цели: полный просит
 * забрать, пустой — подождать, и только спокойный говорит о том, что дальше.
 * Ключи словаря здесь как данные: экран переводит сам, а это — арифметика.
 */
export type TikkiSpeech =
  | { key: 'tikki says full' }
  | { key: 'tikki says empty' }
  | { key: 'tikki says lonely'; count: number; next: TikkiTier }
  | { key: 'tikki says merge'; count: number }
  | { key: 'tikki says tap' };

export interface TikkiSpeechInput {
  full: boolean;
  empty: boolean;
  goal: TikkiGoal | null;
}

export const tikkiSpeech = ({ full, empty, goal }: TikkiSpeechInput): TikkiSpeech => {
  if (full) return { key: 'tikki says full' };
  if (empty) return { key: 'tikki says empty' };
  if (goal && goal.ready) return { key: 'tikki says merge', count: goal.size };
  if (goal) return { key: 'tikki says lonely', count: goal.size - goal.count, next: goal.next };
  return { key: 'tikki says tap' };
};
