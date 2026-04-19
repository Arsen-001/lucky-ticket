'use client';

import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import type { TournamentType } from '@/types/types/tournaments.types';
import { useAppTranslations } from '@/hooks/useAppTranslations';

const ALL_TYPES: TournamentType[] = ['bronze', 'silver', 'gold', 'diamond', 'platinum'];

interface TournamentTypeChipsProps {
  selected: TournamentType[];
  onChange: (types: TournamentType[]) => void;
}

export function TournamentTypeChips({ selected, onChange }: TournamentTypeChipsProps) {
  const t = useAppTranslations();

  const toggle = (type: TournamentType) => {
    if (selected.includes(type)) {
      onChange(selected.filter(s => s !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
      {ALL_TYPES.map(type => {
        const isActive = selected.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={twMerge(
              'flex-shrink-0 flex items-center gap-1.5 rounded-full py-1.5 px-3 text-xs font-semibold border transition-all duration-200 active:scale-95',
              isActive
                ? 'bg-pink-gradient border-transparent text-white'
                : 'bg-transparent border-white/30 text-white/70 hover:border-white/60 hover:text-white'
            )}
          >
            <Medal type={type} height={20} />
            <span className="capitalize">{t(type)}</span>
          </button>
        );
      })}
    </div>
  );
}
