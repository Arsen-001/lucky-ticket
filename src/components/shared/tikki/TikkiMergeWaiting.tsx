'use client';

import Image from 'next/image';
import { tikkiImages } from './tikki.images';
import type { TikkiTier } from './tikki.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TikkiMergeWaitingProps {
  tier: TikkiTier;
  /** Сколько ещё нужно отметить до сплава. */
  missing: number;
  /** Сколько кладут за раз — на нём стоит вся подсказка про выгоду. */
  mergeSize: number;
}

/**
 * Пока отмечено меньше нужного, на месте панели результата стоит Тикки с
 * вопросом над головой.
 *
 * Место было пустым: панель появлялась только при четвёртой карточке, и до неё
 * низ экрана представлял собой ничто — а именно там игрок и решает, класть ли
 * пятую. Персонаж занимает тот же прямоугольник, что и результат, поэтому
 * четвёртое нажатие не роняет вёрстку на полэкрана вверх.
 */
export function TikkiMergeWaiting({ tier, missing, mergeSize }: TikkiMergeWaitingProps) {
  const t = useAppTranslations();

  return (
    <section className="flex items-center gap-3 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-3">
      <Image
        src={tikkiImages[tier].think}
        alt=""
        width={44}
        height={48}
        className="h-12 w-11 flex-none object-contain opacity-90"
      />

      <div className="flex flex-available flex-col gap-1">
        <span className="text-sm font-bold text-white">
          {t('merge needs more', { count: missing })}
        </span>
        <span className="text-muted text-[11px] leading-snug">
          {t('merge hint', { count: mergeSize })}
        </span>
      </div>
    </section>
  );
}
