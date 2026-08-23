'use client';

import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

/** Порядок лиг — от расходной бронзы к редкому алмазу, как везде в игре. */
export const DUEL_TIERS: readonly DuelTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

export interface DuelTierPickerProps {
  value: DuelTier;
  /** Билеты по лигам: лига без билетов не выбирается. */
  balances: Readonly<Record<DuelTier, number>>;
  onChange: (tier: DuelTier) => void;
  className?: string;
}

/**
 * Лига матча — то есть каким билетом играют.
 *
 * Показывает сам билет, а не название цвета: игрок узнаёт свою бронзу и своё
 * золото по картинке раньше, чем прочитает слово. Под каждым — сколько их у
 * него; пустая лига гаснет и не нажимается, потому что войти в неё всё равно
 * не выйдет (сервер откажет), а серая плитка объясняет это без тапа.
 */
export function DuelTierPicker({ value, balances, onChange, className }: DuelTierPickerProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('grid grid-cols-[repeat(5,minmax(0,1fr))] gap-2', className)}>
      {DUEL_TIERS.map(tier => {
        const count = balances[tier] ?? 0;
        const empty = count < 1;
        return (
          <button
            key={tier}
            type="button"
            aria-pressed={value === tier}
            disabled={empty}
            onClick={() => onChange(tier)}
            className={twMerge(
              'duel-rim flex flex-col items-center justify-center gap-1 rounded-xl p-1.5 transition',
              empty && 'opacity-35',
              value === tier && 'duel-rim-on'
            )}
          >
            {/* По пропорциям билета, а не квадратом: иначе остаток висел на
                восемь пустых пикселей ниже картинки, к которой он относится. */}
            <Ticket type={tier} width={36} height={19} className="object-contain" />
            <span
              className={twMerge(
                'text-[11px] font-extrabold tabular-nums',
                value === tier ? 'text-gold' : 'text-white'
              )}
            >
              {count}
            </span>
            <span className="text-pink-secondary max-w-full truncate text-[8px] tracking-[0.08em] uppercase">
              {t(tier)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
