'use client';

import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { DUEL_TIERS } from '@/components/pages/out-tabs/tabs-extra/duel/DuelTierPicker';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

export interface DuelTierFilterProps {
  /** `null` — показывать столы всех лиг. */
  value: DuelTier | null;
  /** Сколько столов открыто в каждой лиге. */
  counts: Readonly<Record<DuelTier, number>>;
  total: number;
  onChange: (tier: DuelTier | null) => void;
  className?: string;
}

/**
 * Фильтр столов по лигам — сверху, а не разбивка списка на группы.
 *
 * Группы отвечали на «какие лиги вообще есть», но платили заголовками пустых
 * лиг и списком, который нельзя сузить. Фильтр отвечает на то же самое —
 * цифра на самой кнопке говорит, где есть с кем играть, — и убирает лишнее
 * одним тапом. Пустая лига видна и гаснет: тапать по ней незачем.
 */
export function DuelTierFilter({ value, counts, total, onChange, className }: DuelTierFilterProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('scrollbar-hidden flex gap-1 overflow-x-auto', className)}>
      <button
        type="button"
        aria-pressed={value === null}
        onClick={() => onChange(null)}
        className={twMerge(
          'duel-rim flex h-9 shrink-0 items-center gap-1 rounded-xl px-2.5',
          'text-[11px] font-black tracking-[0.06em] uppercase',
          value === null ? 'duel-rim-on text-gold' : 'text-pink-secondary'
        )}
      >
        {t('duel filter all')}
        <b className={twMerge('text-[13px] tabular-nums', value === null ? '' : 'text-white')}>
          {total}
        </b>
      </button>

      {DUEL_TIERS.map(tier => {
        const count = counts[tier] ?? 0;
        return (
          <button
            key={tier}
            type="button"
            aria-pressed={value === tier}
            onClick={() => onChange(tier)}
            className={twMerge(
              'duel-rim flex h-9 shrink-0 items-center gap-1 rounded-xl px-2',
              value === tier && 'duel-rim-on',
              count < 1 && 'opacity-35'
            )}
          >
            <Ticket
              type={tier}
              width={20}
              height={20}
              className="h-[13px] w-[20px] object-contain"
            />
            <b
              className={twMerge(
                'text-[13px] font-extrabold tabular-nums',
                value === tier ? 'text-gold' : 'text-white'
              )}
            >
              {count}
            </b>
          </button>
        );
      })}
    </div>
  );
}
