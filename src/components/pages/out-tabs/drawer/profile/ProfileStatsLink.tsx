import Link from 'next/link';
import { BarChart3, ChevronRight } from 'lucide-react';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * Entry point to the own-profile lifetime stats screen.
 *
 * Rendered only on your own profile: the numbers behind it (tickets claimed,
 * total earned, streaks) are personal history, not part of the public card
 * another player sees.
 */
export function ProfileStatsLink() {
  const t = useAppTranslations();

  return (
    <Link
      href={routes.profile.stats}
      className="bg-background-overlay flex items-center gap-3 rounded-2xl p-3.5 transition-all active:scale-99"
    >
      <span className="flex-center bg-electric-purple/12 text-electric-purple size-10 shrink-0 rounded-xl">
        <BarChart3 className="size-5" />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-sm font-semibold text-white">{t('my stats')}</span>
        <span className="text-xs text-white/50">{t('all time')}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-white/35" />
    </Link>
  );
}
