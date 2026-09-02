'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { tikkiMergeSize, tikkiTiers, type TikkiTier, type TikkiUnit } from './tikki.constants';
import { nextTikkiTier, tikkiClickerRate } from './tikki.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerStyle } from '@/utils/global/animation.utils';
import { TikkiMergeCard } from './TikkiMergeCard';
import { TikkiMergeResult } from './TikkiMergeResult';

export interface TikkiMergeScreenProps {
  units: readonly TikkiUnit[];
  balance: number;
  onBack: () => void;
  onMerge: (ids: string[]) => void;
  className?: string;
}

/** Слабейшие первыми — «4 младших» отдаёт именно их. */
const byRate = (a: TikkiUnit, b: TikkiUnit) => tikkiClickerRate(a) - tikkiClickerRate(b);

/** Тир, с которого экран открывается: первый, где уже набралось на сплав. */
const firstReadyTier = (units: readonly TikkiUnit[]): TikkiTier =>
  tikkiTiers.find(
    tier => nextTikkiTier(tier) && units.filter(unit => unit.tier === tier).length >= tikkiMergeSize
  ) ?? tikkiTiers[0];

/**
 * Экран сплава.
 *
 * Не одна кнопка с автовыбором: сколько карточек положить — решение игрока, и
 * оно стоит денег ровно ноль (цена фиксированная), а даёт тем больше, чем
 * больше положил. Автовыбор из четырёх молча отбирал бы у него эту разницу.
 */
export function TikkiMergeScreen({
  units,
  balance,
  onBack,
  onMerge,
  className,
}: TikkiMergeScreenProps) {
  const t = useAppTranslations();
  const [tier, setTier] = useState<TikkiTier>(() => firstReadyTier(units));
  const [picked, setPicked] = useState<string[]>(() =>
    units
      .filter(unit => unit.tier === firstReadyTier(units))
      .sort(byRate)
      .slice(0, tikkiMergeSize)
      .map(unit => unit.id)
  );

  const list = units.filter(unit => unit.tier === tier).sort(byRate);
  const selected = list.filter(unit => picked.includes(unit.id));
  const enough = selected.length >= tikkiMergeSize;

  const openTier = (next: TikkiTier) => {
    setTier(next);
    setPicked(
      units
        .filter(unit => unit.tier === next)
        .sort(byRate)
        .slice(0, tikkiMergeSize)
        .map(unit => unit.id)
    );
  };

  const toggle = (id: string) =>
    setPicked(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));

  const quick =
    'flex-available rounded-xl border border-white/10 bg-white/5 py-2 text-[11px] font-bold';

  return (
    <div className={twMerge('flex flex-col gap-3 px-[14px] pt-2.5', className)}>
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('back')}
          className="focus-visible:outline-teal flex size-9 flex-none items-center justify-center rounded-full border border-white/12 bg-white/5 focus-visible:outline focus-visible:outline-2"
        >
          <ChevronLeft size={19} aria-hidden />
        </button>
        <h1 className="flex-available text-xl font-extrabold">{t('merge')}</h1>
        <span className="text-muted text-[11px] font-bold uppercase tracking-wide">
          {t('all tikki', { count: units.length })}
        </span>
      </header>

      <div className="scrollbar-hidden flex gap-2 overflow-x-auto">
        {tikkiTiers.map(item => {
          const count = units.filter(unit => unit.tier === item).length;
          if (!count) return null;
          const ready = count >= tikkiMergeSize && !!nextTikkiTier(item);

          return (
            <button
              key={item}
              type="button"
              onClick={() => openTier(item)}
              disabled={!ready}
              className={twMerge(
                'flex flex-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold capitalize',
                item === tier
                  ? 'bg-pink-gradient border-transparent'
                  : 'text-muted border-white/10 bg-white/5',
                !ready && 'opacity-40'
              )}
            >
              {t(item)}
              <span className="tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="text-muted text-xs leading-snug">
        {enough
          ? t('merge hint', { count: tikkiMergeSize })
          : t('merge needs more', { count: tikkiMergeSize - selected.length })}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          className={quick}
          onClick={() => setPicked(list.slice(0, tikkiMergeSize).map(unit => unit.id))}
        >
          {t('youngest {count}', { count: tikkiMergeSize })}
        </button>
        <button
          type="button"
          className={quick}
          onClick={() => setPicked(list.map(unit => unit.id))}
        >
          {t('all {count}', { count: list.length })}
        </button>
        <button type="button" className={quick} onClick={() => setPicked([])}>
          {t('clear')}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {list.map((unit, index) => (
          <TikkiMergeCard
            key={unit.id}
            unit={unit}
            checked={picked.includes(unit.id)}
            order={picked.indexOf(unit.id) + 1}
            onToggle={() => toggle(unit.id)}
            className="animate-slide-in-bottom"
            style={staggerStyle(index, 50)}
          />
        ))}
      </div>

      {enough && (
        <TikkiMergeResult
          selected={selected}
          balance={balance}
          onMerge={() => onMerge(selected.map(unit => unit.id))}
        />
      )}
    </div>
  );
}
