'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { DebouncedInput } from '@/components/shared/form-elements/inputs/DebouncedInput';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  TournamentFiltersTabs,
  type TournamentFilterKey,
  type TournamentFilterTab,
} from './TournamentFiltersTabs';

export type TournamentFilterType = TournamentFilterKey;

interface TournamentFiltersProps {
  filter: TournamentFilterType;
  onFilterChange: (filter: TournamentFilterType) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  activeFilterCount: number;
  onFilterSheetOpen: () => void;
  tabs: TournamentFilterTab[];
}

export function TournamentFilters({
  filter,
  onFilterChange,
  searchValue,
  onSearchChange,
  isSearchOpen,
  setIsSearchOpen,
  activeFilterCount,
  onFilterSheetOpen,
  tabs,
}: TournamentFiltersProps) {
  const t = useAppTranslations();

  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <div
        className={twMerge(
          'min-w-0 flex-1 transition-all duration-300 ease-in-out origin-left flex items-center overflow-hidden',
          isSearchOpen ? 'max-w-0 opacity-0 invisible' : 'max-w-full opacity-100 visible'
        )}
      >
        <TournamentFiltersTabs
          active={filter}
          onChange={onFilterChange}
          tabs={tabs}
          className="w-full"
        />
      </div>

      <div
        className={twMerge(
          'flex items-center gap-1 transition-all duration-300 ease-in-out flex-shrink-0',
          isSearchOpen ? 'flex-1' : ''
        )}
      >
        {isSearchOpen ? (
          <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
            <DebouncedInput
              autoFocus
              className="bg-purple-gradient py-1 pt1.5 px-4 h-10 border-none rounded-full"
              placeholder={t('search')}
              value={searchValue}
              onChange={onSearchChange}
              suffix={
                <Button
                  variant="transparent"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange('');
                  }}
                  className="p-1"
                >
                  <X size={18} className="text-white/60" />
                </Button>
              }
            />
          </div>
        ) : (
          <Button
            variant="transparent"
            className="p-2 w-10 h-10 flex-center"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={20} className="text-white/60" />
          </Button>
        )}

        {!isSearchOpen && (
          <div className="relative">
            <Button
              variant="transparent"
              className="p-2 w-10 h-10 flex-center"
              onClick={onFilterSheetOpen}
              aria-label={t('filters')}
            >
              <SlidersHorizontal
                size={20}
                className={activeFilterCount > 0 ? 'text-[var(--color-pink)]' : 'text-white/60'}
              />
            </Button>
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-gradient text-[10px] font-bold flex-center pointer-events-none">
                {activeFilterCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
