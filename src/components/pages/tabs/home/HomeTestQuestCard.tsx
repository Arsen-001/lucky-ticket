'use client';

import { ChevronRight, FlaskConical, Gift } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import { useGetTestQuestQuery } from '@/api/testQuest.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * Compact Home entry into the dedicated Test-Quest screen — the flagship launch
 * quest. Shows the current climb level and pulses a "claim" affordance when a
 * daily level is ready. Links to {@link routes.testQuest}; always renders (even
 * pre-data) so the entry point is stable.
 */
export function HomeTestQuestCard() {
  const t = useAppTranslations();
  const { data } = useGetTestQuestQuery();

  const claimable = data?.claimableToday ?? false;
  const level = data?.level;

  return (
    <div className="px-4">
      <Link
        href={routes.testQuest}
        className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-electric-pink/30 bg-gradient-to-r from-electric-purple/15 to-electric-pink/10 p-3 transition-transform active:scale-[0.98]"
      >
        <span className="flex-center h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-electric-pink to-electric-purple shadow-md shadow-black/30">
          <FlaskConical size={20} className="text-white" />
        </span>

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-extrabold">{t('test quest chain title')}</span>
          <span className="truncate text-[11px] text-pink-secondary">
            {t('test quest chain blurb')}
          </span>
        </span>

        {claimable ? (
          <span className="flex-center shrink-0 gap-1 rounded-full bg-pink-gradient px-2.5 py-1 text-[11px] font-bold text-white animate-task-pulse">
            <Gift size={12} />
            {t('claim')}
          </span>
        ) : level != null ? (
          <span className="flex-center shrink-0 flex-col rounded-xl bg-white/5 px-2.5 py-1 leading-none">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">
              {t('level')}
            </span>
            <span className="text-base font-extrabold tabular-nums">{level}</span>
          </span>
        ) : null}

        <ChevronRight size={18} className="shrink-0 text-white/40" />
      </Link>
    </div>
  );
}
