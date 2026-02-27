'use client';

import { Search, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Tabs, type TabsProps } from '@/components/shared/Tabs';
import { Button } from '@/components/shared/buttons/Button';
import { DebouncedInput } from '@/components/shared/form-elements/inputs/DebouncedInput';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export type TournamentFilterType = 'all' | 'participated' | 'top';

interface TournamentFiltersProps {
  filter: TournamentFilterType;
  onFilterChange: (filter: TournamentFilterType) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

export function TournamentFilters({
  filter,
  onFilterChange,
  searchValue,
  onSearchChange,
  isSearchOpen,
  setIsSearchOpen,
}: TournamentFiltersProps) {
  const t = useAppTranslations();

  const filters: TabsProps['items'] = [
    { key: 'all', title: t('all') },
    { key: 'participated', title: t('participated-filter') },
    { key: 'top', title: t('top') },
  ];

  return (
    <div className="flex items-center justify-between">
      <div
        className={twMerge(
          'flex-1 mr-2 transition-all duration-300 ease-in-out origin-left flex items-center overflow-hidden',
          isSearchOpen ? 'max-w-0 opacity-0 invisible' : 'max-w-full opacity-100 visible'
        )}
      >
        <div className="min-w-max">
          <Tabs
            items={filters}
            activeKey={filter}
            onTabChange={key => onFilterChange(key as TournamentFilterType)}
            className="w-fit"
            classNames={{
              container: 'bg-transparent',
            }}
          />
        </div>
      </div>

      <div
        className={twMerge(
          'flex items-center transition-all duration-300 ease-in-out',
          isSearchOpen ? 'flex-1' : 'w-10 overflow-hidden'
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
            className="p-2 min-w-10 h-10 flex-center ml-auto"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={20} className="text-white/60" />
          </Button>
        )}
      </div>
    </div>
  );
}
