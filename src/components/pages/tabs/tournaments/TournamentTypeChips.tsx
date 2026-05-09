'use client';

import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import type { TournamentType } from '@/types/types/tournaments.types';
import { useAppTranslations } from '@/hooks/useAppTranslations';

const ALL_TYPES: TournamentType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

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
    <div className="grid grid-cols-5 gap-1.5">
      {ALL_TYPES.map(type => {
        const isActive = selected.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={twMerge(
              'flex flex-col items-center justify-center gap-1 rounded-xl border py-2 px-1 text-[11px] font-bold transition-all duration-200 active:scale-95 leading-none',
              isActive
                ? 'bg-white/10 border-pink-secondary text-white'
                : 'bg-white/5 border-white/15 text-white/65 hover:border-white/35 hover:text-white'
            )}
          >
            <Medal type={type} height={28} />
            <span className="leading-none capitalize">{t(type)}</span>
          </button>
        );
      })}
    </div>
  );
}
