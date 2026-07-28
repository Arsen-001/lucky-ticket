'use client';

import { Gift } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import { useGetTestQuestQuery } from '@/api/testQuest.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * Home entry into the dedicated Test-Quest screen (the flagship launch quest).
 * Shares the top row with the compact jackpot chip and takes the remaining
 * width, so it carries the title + blurb and the current climb level. When a
 * daily level is ready it swaps to a pulsing gift badge (icon-only — a text
 * "claim" pill would crowd the title on a phone row; the full CTA lives on the
 * destination). Always renders (even pre-data) so the entry point is stable.
 * Links to {@link routes.testQuest}.
 */
export function HomeTestQuestCard() {
  const t = useAppTranslations();
  const { data } = useGetTestQuestQuery();

  const claimable = data?.claimableToday ?? false;
  const level = data?.level;

  return (
    <Link
      href={routes.testQuest}
      aria-label={t('test quest chain title')}
      className="relative flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-3xl border border-electric-pink/30 bg-gradient-to-r from-electric-purple/15 to-electric-pink/10 p-2.5 transition-transform active:scale-[0.98]"
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-extrabold leading-tight">
          {t('test quest chain title')}
        </span>
        <span className="truncate text-[10px] leading-tight text-pink-secondary">
          {t('test quest chain blurb')}
        </span>
      </span>

      {claimable ? (
        <span className="flex-center h-7 w-7 shrink-0 rounded-full bg-pink-gradient text-white animate-task-pulse">
          <Gift size={14} />
        </span>
      ) : level != null ? (
        <span className="flex-center shrink-0 flex-col rounded-lg bg-white/5 px-2 py-1 leading-none">
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/50">
            {t('level')}
          </span>
          <span className="text-sm font-extrabold tabular-nums">{level}</span>
        </span>
      ) : null}
    </Link>
  );
}
