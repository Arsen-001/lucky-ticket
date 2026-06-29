'use client';

import type { HTMLAttributes } from 'react';
import { Megaphone } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TournamentSponsor } from '@/types/interfaces/tournaments.interfaces';

export interface TournamentSponsorBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  sponsor: TournamentSponsor;
}

/**
 * Pill marking a sponsored (advertiser-funded) tournament. Shows "Created by
 * you" when the current demo user is the advertiser, otherwise a neutral
 * "Sponsored" tag. Sits beside the tournament name on the card.
 */
export function TournamentSponsorBadge({
  sponsor,
  className,
  ...rest
}: TournamentSponsorBadgeProps) {
  const t = useAppTranslations();
  const label = sponsor.createdByMe ? t('created by you') : t('sponsored');

  return (
    <span
      title={sponsor.name}
      className={twMerge(
        'bg-electric-purple/15 text-electric-purple inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wide',
        className
      )}
      {...rest}
    >
      <Megaphone className="h-3 w-3 shrink-0" strokeWidth={2.4} />
      <span className="truncate">{label}</span>
    </span>
  );
}
