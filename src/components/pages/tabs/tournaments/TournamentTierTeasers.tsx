'use client';

import { TournamentTierTeaser } from './TournamentTierTeaser';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerMs } from '@/utils/global/animation.utils';
import type { TournamentType } from '@/types/types/tournaments.types';

export interface TournamentTierTeasersProps {
  /** Tiers with nothing to join yet, already in ladder order. */
  tiers: TournamentType[];
}

/**
 * The rest of the tier ladder, under the tournaments that are actually open.
 *
 * One card per tier — Silver, then Gold, Platinum, Diamond — so the catalog
 * shows where it goes next instead of ending at Bronze. A tier drops out of
 * this section the moment a real tournament of it appears in the list above,
 * which is what keeps the two halves of the screen from ever showing the same
 * tier twice.
 */
export function TournamentTierTeasers({ tiers }: TournamentTierTeasersProps) {
  const t = useAppTranslations();

  if (tiers.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 pb-5">
      <div className="flex flex-col gap-1">
        <h4 className="text-[11px] leading-none font-extrabold tracking-[0.14em] text-white/50 uppercase">
          {t('next tiers title')}
        </h4>
        <p className="text-[11px] leading-snug text-white/35">{t('next tiers description')}</p>
      </div>

      {tiers.map((tier, index) => (
        <TournamentTierTeaser
          key={tier}
          tier={tier}
          className="animate-slide-in-bottom"
          style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
        />
      ))}
    </section>
  );
}
