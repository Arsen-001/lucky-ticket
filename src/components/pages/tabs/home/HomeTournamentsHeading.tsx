'use client';

import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export interface HomeTournamentsHeadingProps {
  /** Upcoming tournaments behind the strip; omitted while they load. */
  count?: number;
  className?: string;
}

/**
 * Names the strip below it and gives Home a way out to the catalog.
 *
 * Without it the carousel was both the label and the only road: nothing said
 * what the row was, how many tournaments stood behind it, or where the rest
 * lived — the player had to guess that swiping was the whole catalog.
 */
export function HomeTournamentsHeading({ count, className }: HomeTournamentsHeadingProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex items-baseline justify-between px-4', className)}>
      <h4 className="text-[13px] font-extrabold text-white">{t('tournaments')}</h4>

      <Link
        href={routes.tournaments.index}
        className="text-pink-secondary flex items-center gap-0.5 text-[11px] font-bold"
      >
        {t('view all')}
        {count != null && <span className="tabular-nums">{count}</span>}
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
