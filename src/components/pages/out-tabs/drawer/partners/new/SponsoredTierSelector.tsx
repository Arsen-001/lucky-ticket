'use client';

import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TournamentType } from '@/types/types/tournaments.types';

const TIERS: TournamentType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

export interface SponsoredTierSelectorProps {
  value: TournamentType;
  onChange: (tier: TournamentType) => void;
}

/** Single-select tier picker (medals) for the sponsored-tournament builder. */
export function SponsoredTierSelector({ value, onChange }: SponsoredTierSelectorProps) {
  const t = useAppTranslations();

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {TIERS.map(tier => {
        const active = tier === value;
        return (
          <button
            key={tier}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tier)}
            className={twMerge(
              'flex flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-bold leading-none transition-all duration-200 active:scale-95',
              active
                ? 'border-pink-secondary bg-white/10 text-white'
                : 'border-white/15 bg-white/5 text-white/65 hover:border-white/35 hover:text-white'
            )}
          >
            <Medal type={tier} height={28} />
            <span className="capitalize leading-none">{t(tier)}</span>
          </button>
        );
      })}
    </div>
  );
}
