'use client';

import { FlaskConical, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { staggerStyle } from '@/utils/global/animation.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TikkiUnit } from '@/types/interfaces/tikki.interfaces';
import type { TikkiTier } from './tikki.constants';
import { TikkiCollectionItem } from './TikkiCollectionItem';
import { TikkiGhostSlot } from './TikkiGhostSlot';

export interface TikkiCollectionProps {
  units: readonly TikkiUnit[];
  selectedId: string;
  /** Где-то набралось четыре одинаковых — сплав открыт, чип светится розовым. */
  mergeReady: boolean;
  /** Сколько пустых мест дорисовать после настоящих — до четырёх выбранного тира. */
  ghosts?: number;
  /** Чей силуэт стоит в пустых местах. Без тира призраков нет. */
  ghostTier?: TikkiTier;
  onSelect: (id: string) => void;
  onBuy: () => void;
  onMerge: () => void;
  className?: string;
}

/** Та же коробка 52×52, что и у Тикки: лента должна читаться одним рядом. */
const action =
  'flex size-[52px] flex-none flex-col items-center justify-center gap-px rounded-[13px] bg-white/4 ' +
  'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] ' +
  'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

/**
 * Лента коллекции под сценой.
 *
 * Потолка у коллекции нет вовсе — держать можно сколько угодно Тикки, и это
 * сделано нарочно: на сплав собирают по четыре и больше, а чем больше положил,
 * тем сильнее выйдет новый. Поэтому лента горизонтальная и не сворачивается.
 *
 * Сплав и покупка НЕ едут вместе с лентой. Внутри неё они уезжали за правый
 * край на пятом Тикки — ровно на том, где сплав как раз и открывается.
 */
export function TikkiCollection({
  units,
  selectedId,
  mergeReady,
  ghosts = 0,
  ghostTier,
  onSelect,
  onBuy,
  onMerge,
  className,
}: TikkiCollectionProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex items-start gap-[7px]', className)}>
      <div className="scrollbar-hidden flex flex-available gap-[7px] overflow-x-auto pb-0.5 pt-2">
        {units.map((unit, index) => (
          <TikkiCollectionItem
            key={unit.id}
            unit={unit}
            active={unit.id === selectedId}
            full={unit.fill >= unit.capacity}
            onSelect={() => onSelect(unit.id)}
            className="animate-slide-in-bottom"
            style={staggerStyle(index, 50)}
          />
        ))}
        {ghostTier &&
          Array.from({ length: ghosts }, (_, index) => (
            <TikkiGhostSlot
              key={`ghost-${index}`}
              tier={ghostTier}
              onClick={onBuy}
              className="animate-slide-in-bottom"
              style={staggerStyle(units.length + index, 50)}
            />
          ))}
      </div>

      <div className="flex flex-none gap-[7px] pb-0.5 pt-2">
        <button
          type="button"
          onClick={onMerge}
          disabled={!mergeReady}
          className={twMerge(action, !mergeReady && 'opacity-55')}
          style={
            mergeReady
              ? { boxShadow: 'inset 0 0 0 1.5px rgba(222,0,155,0.6), 0 0 18px -6px #de009b' }
              : undefined
          }
        >
          <FlaskConical
            size={16}
            aria-hidden
            className={mergeReady ? 'text-electric-pink' : 'text-[#d4c9c9]'}
          />
          <span
            className={twMerge(
              'text-[8px] font-extrabold uppercase leading-none',
              mergeReady ? 'text-electric-pink' : 'text-[#7d7391]'
            )}
          >
            {t('merge')}
          </span>
        </button>

        <button type="button" onClick={onBuy} className={action}>
          <Plus size={16} aria-hidden className="text-[#d4c9c9]" />
          <span className="text-[8px] font-extrabold uppercase leading-none text-[#7d7391]">
            {t('buy')}
          </span>
        </button>
      </div>
    </div>
  );
}
