'use client';

import { FlaskConical, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { TikkiUnit } from './tikki.constants';
import { tikkiCapacity } from './tikki.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerStyle } from '@/utils/global/animation.utils';
import { TikkiCollectionItem } from './TikkiCollectionItem';

export interface TikkiCollectionProps {
  units: readonly TikkiUnit[];
  selectedId: string;
  /** Где-то набралось четыре одинаковых — сплав открыт, чип светится. */
  mergeReady: boolean;
  onSelect: (id: string) => void;
  onBuy: () => void;
  onMerge: () => void;
  className?: string;
}

const action =
  'flex w-[54px] flex-none flex-col items-center justify-center gap-1 rounded-2xl border ' +
  'px-1 py-2 text-[9px] font-bold uppercase leading-none tracking-wide ' +
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
 *
 * Поля лента не трогает: у главной и у `/tikki` они разные, а отрицательные
 * márgin'ы под одно из них ломали бы второе.
 */
export function TikkiCollection({
  units,
  selectedId,
  mergeReady,
  onSelect,
  onBuy,
  onMerge,
  className,
}: TikkiCollectionProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex items-stretch gap-2', className)}>
      <div className="scrollbar-hidden flex flex-available gap-2 overflow-x-auto py-1">
        {units.map((unit, index) => (
          <TikkiCollectionItem
            key={unit.id}
            unit={unit}
            active={unit.id === selectedId}
            full={unit.fill >= tikkiCapacity(unit)}
            onSelect={() => onSelect(unit.id)}
            className="animate-slide-in-bottom"
            style={staggerStyle(index, 50)}
          />
        ))}
      </div>

      <div className="flex flex-none items-stretch gap-2 py-1">
        <button
          type="button"
          onClick={onMerge}
          disabled={!mergeReady}
          className={twMerge(
            action,
            mergeReady
              ? 'border-electric-purple/60 bg-electric-purple/15 text-white'
              : 'text-muted border-white/10 bg-white/4 opacity-55'
          )}
        >
          <FlaskConical size={17} aria-hidden />
          {t('merge')}
        </button>

        <button
          type="button"
          onClick={onBuy}
          className={twMerge(action, 'text-muted border-white/10 bg-white/4')}
        >
          <Plus size={17} aria-hidden />
          {t('buy')}
        </button>
      </div>
    </div>
  );
}
