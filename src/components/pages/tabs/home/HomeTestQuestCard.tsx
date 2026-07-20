'use client';

import { FlaskConical, Gift } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import { useGetTestQuestQuery } from '@/api/testQuest.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * Compact Home tile — shares the top row with the jackpot capsule and links to
 * the dedicated Test-Quest screen (the flagship launch quest). The flask icon
 * carries the quest identity; the tile shows the current climb level, and swaps
 * to a pulsing gift badge when a daily level is ready to claim (the full
 * "claim" CTA lives on the destination screen — a text pill would widen the
 * tile and clip the jackpot number beside it). Always renders (even pre-data)
 * so the entry point is stable, and keeps a constant width across states.
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
      className="relative flex shrink-0 items-center gap-2 overflow-hidden rounded-3xl border border-electric-pink/30 bg-gradient-to-br from-electric-purple/25 to-electric-pink/10 px-3 transition-transform active:scale-[0.98]"
    >
      <span className="flex-center h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-electric-pink to-electric-purple shadow-md shadow-black/30">
        <FlaskConical size={18} className="text-white" />
      </span>

      {claimable ? (
        <span className="flex-center h-6 w-6 shrink-0 rounded-full bg-pink-gradient text-white animate-task-pulse">
          <Gift size={13} />
        </span>
      ) : level != null ? (
        <span className="flex shrink-0 flex-col items-center pr-0.5 leading-none">
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/50">
            {t('level')}
          </span>
          <span className="text-base font-extrabold tabular-nums text-white">{level}</span>
        </span>
      ) : null}
    </Link>
  );
}
