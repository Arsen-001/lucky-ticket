'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface DuelSeriesChipProps {
  /** Счёт глазами игрока: «вы : соперник». */
  mine: number;
  theirs: number;
  className?: string;
}

/**
 * Счёт серии реваншей — латунным жетоном поперёк стола.
 *
 * Серия — это не подпись к матчу, а то, ради чего играется следующий: строкой
 * мелким шрифтом под шапкой её не замечали. Жетон лежит там же, где лежала
 * бы фишка счёта на настоящем столе, и читается за один взгляд.
 */
export function DuelSeriesChip({ mine, theirs, className }: DuelSeriesChipProps) {
  const t = useAppTranslations();

  return (
    <span
      className={twMerge(
        'duel-chip mx-auto flex w-fit items-center gap-1.5 rounded-lg px-3 py-1',
        'text-gold text-[11px] font-black tracking-[0.14em] uppercase tabular-nums',
        className
      )}
    >
      {/* Ключ тот же, что везде: «Серия 2 : 1» одной строкой — второе слово
          для того же понятия развело бы экраны. */}
      {t('duel series', { mine, theirs })}
    </span>
  );
}
