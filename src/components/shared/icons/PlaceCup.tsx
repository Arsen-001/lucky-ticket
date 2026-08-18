'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import type { TournamentType } from '@/types/types/tournaments.types';

export type CupPlace = 1 | 2 | 3;

/**
 * Podium cup: the "1st / 2nd / 3rd" badge art, in the metal of the tournament's
 * own tier.
 *
 * It exists because the tier medal (`Medal`) does NOT mean placement — bronze /
 * silver / gold there are the tournament's tier, and using them for 1st / 2nd /
 * 3rd said the wrong thing on every tournament whose tier wasn't gold. The cup
 * carries both: the place is printed on it, the metal is the tier.
 *
 * File names are not uniform (`golden-1st` but `gold-2nd`), so the map is
 * written out rather than templated from the tier.
 */
const CUP_SRC: Record<TournamentType, Record<CupPlace, string>> = {
  bronze: {
    1: '/assets/icons/badges/bronze-1st-badge.webp',
    2: '/assets/icons/badges/bronze-2nd-badge.webp',
    3: '/assets/icons/badges/bronze-3th-badge.webp',
  },
  silver: {
    1: '/assets/icons/badges/silver-1st-badge.webp',
    2: '/assets/icons/badges/silver-2nd-badge.webp',
    3: '/assets/icons/badges/silver-3th-badge.webp',
  },
  gold: {
    1: '/assets/icons/badges/golden-1st-badge.webp',
    2: '/assets/icons/badges/gold-2nd-badge.webp',
    3: '/assets/icons/badges/golden-3th-badge.webp',
  },
  platinum: {
    1: '/assets/icons/badges/platinum-1st-badge.webp',
    2: '/assets/icons/badges/platinum-2nd-badge.webp',
    3: '/assets/icons/badges/platinum-3th-badge.webp',
  },
  diamond: {
    1: '/assets/icons/badges/diamond-1st-badge.webp',
    2: '/assets/icons/badges/diamond-2nd-badge.webp',
    3: '/assets/icons/badges/diamond-3th-badge.webp',
  },
};

export interface PlaceCupProps {
  tier: TournamentType;
  place: CupPlace;
  /** Rendered width in px; height follows the art's aspect ratio. */
  size?: number;
  className?: string;
}

export function PlaceCup({ tier, place, size = 132, className }: PlaceCupProps) {
  return (
    <Image
      src={CUP_SRC[tier][place]}
      alt=""
      width={size}
      height={size}
      className={twMerge('drop-shadow-2xl drop-shadow-black/50', className)}
      style={{ width: size, height: 'auto' }}
      aria-hidden
    />
  );
}
