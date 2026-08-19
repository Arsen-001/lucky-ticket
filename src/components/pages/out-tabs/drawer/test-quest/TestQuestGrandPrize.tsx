'use client';

import { Crown, Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TestQuestGrandPrizeProps {
  /** The prize itself, once it is decided. Absent ⇒ the slot reads "coming soon". */
  title?: string;
  /** One line under the title — what it gives, or how it is handed over. */
  note?: string;
  /** Day the prize lands on — the top of the climb (31). */
  day: number;
  className?: string;
}

/**
 * The one prize that is not a daily drop: it belongs to everyone who finishes the
 * whole daily ladder, however the leaderboard then ranks them.
 *
 * The card holds its place from day 1 — an empty gold slot still says "there is
 * something at the top", which is why it sits above today's card instead of at
 * the end of {@link TestQuestAheadList}, where a 26-row scroll would bury it.
 *
 * Deliberately prop-driven and empty for now: `title`/`note` are the two fields
 * the prize will arrive in (from `GET /test-quest`, beside the ladder), so
 * filling the slot becomes a data change rather than a layout one.
 */
export function TestQuestGrandPrize({ title, note, day, className }: TestQuestGrandPrizeProps) {
  const t = useAppTranslations();
  const announced = Boolean(title);

  return (
    <div
      className={twMerge(
        'flex items-center gap-2.5 rounded-2xl border p-2.5',
        announced
          ? 'border-gold/45 bg-gradient-to-r from-gold/[0.12] to-orange/[0.06]'
          : 'border-dashed border-gold/35 bg-gold/[0.04]',
        className
      )}
    >
      <span
        className={twMerge(
          'flex-center h-10 w-10 shrink-0 rounded-xl',
          announced
            ? 'bg-gradient-to-b from-gold to-orange text-black/75'
            : 'bg-gold/[0.12] text-gold/70'
        )}
      >
        <Gift size={20} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold">
          <Crown size={11} />
          {t('grand prize')}
        </span>
        <span
          className={twMerge(
            'text-[13.5px] font-extrabold leading-tight',
            announced ? 'text-white' : 'text-white/70'
          )}
        >
          {title ?? t('grand prize soon')}
        </span>
        <span className="text-[11px] font-semibold leading-snug text-white/50">
          {note ?? t('grand prize for level 1')}
        </span>
      </div>

      {/* `capitalize` for the same reason the reward panel carries it: the `day`
          key is lowercase, and every other day caption on this screen is not. */}
      <span className="flex-center shrink-0 rounded-full bg-gold/15 px-2 py-1 text-[10.5px] font-extrabold capitalize tabular-nums text-gold ring-1 ring-inset ring-gold/35">
        {t('day')} {day}
      </span>
    </div>
  );
}
