'use client';

import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface LabTournamentsHeadingProps {
  /** How many upcoming tournaments the strip is standing in front of. */
  count: number;
  className?: string;
}

/**
 * The heading every option here adds and the live strip has not got: what the
 * row is, how many there are, and a way out to the full catalog. Today the
 * carousel is the only path to a tournament from Home, and it names neither
 * itself nor its length.
 */
export function LabTournamentsHeading({ count, className }: LabTournamentsHeadingProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex items-baseline justify-between px-4', className)}>
      <h4 className="text-[13px] font-extrabold text-white">{t('tournaments')}</h4>
      <span className="text-pink-secondary flex items-center gap-0.5 text-[11px] font-bold">
        {t('view all')}
        <span className="tabular-nums">{count}</span>
        <ChevronRight className="h-3 w-3" />
      </span>
    </div>
  );
}
