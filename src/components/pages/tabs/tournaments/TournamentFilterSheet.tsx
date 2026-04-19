'use client';

import { Check, ShieldCheck } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { Button } from '@/components/shared/buttons/Button';
import { TournamentTypeChips } from '@/components/pages/tabs/tournaments/TournamentTypeChips';
import type { TournamentType } from '@/types/types/tournaments.types';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export type SortOption = 'soonest' | 'prize-pool' | 'guaranteed' | 'team-size';

interface SortItem {
  key: SortOption;
  label: string;
}

interface TournamentFilterSheetProps {
  open: boolean;
  onClose: () => void;
  selectedTypes: TournamentType[];
  onTypesChange: (types: TournamentType[]) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  hasGuaranteedOnly: boolean;
  onGuaranteedChange: (v: boolean) => void;
  onReset: () => void;
}

export function TournamentFilterSheet({
  open,
  onClose,
  selectedTypes,
  onTypesChange,
  sortBy,
  onSortChange,
  hasGuaranteedOnly,
  onGuaranteedChange,
  onReset,
}: TournamentFilterSheetProps) {
  const t = useAppTranslations();

  const sortItems: SortItem[] = [
    { key: 'soonest', label: t('starts soonest') },
    { key: 'prize-pool', label: t('highest prize pool') },
    { key: 'guaranteed', label: t('highest guaranteed') },
    { key: 'team-size', label: t('best odds (smallest team)') },
  ];

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={twMerge(
          'fixed inset-0 z-100 flex items-end transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-fade backdrop-blur-[1px]" onClick={onClose} />

        {/* Sheet panel */}
        <div
          className={twMerge(
            'relative w-full bg-[var(--color-background)] rounded-t-2xl transition-transform duration-300 ease-in-out max-h-[85vh] flex flex-col',
            open ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          {/* Fixed top: drag handle + header */}
          <div className="flex-shrink-0">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-5 pt-2 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{t('filters')}</h3>
                <button
                  type="button"
                  onClick={onReset}
                  className="text-sm text-pink-secondary hover:text-white transition-colors"
                >
                  {t('reset')}
                </button>
              </div>
            </div>

            <div className="h-px bg-white/10" />
          </div>

          {/* Scrollable filter content */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden px-5 py-6 flex flex-col gap-6">
            {/* Ticket type */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-white/70">{t('ticket type')}</p>
              <TournamentTypeChips selected={selectedTypes} onChange={onTypesChange} />
            </div>

            {/* Sort by */}
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-white/70 mb-2">{t('sort by')}</p>
              {sortItems.map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSortChange(item.key)}
                  className="flex items-center justify-between w-full py-3 px-4 rounded-xl transition-colors bg-white/5 hover:bg-white/10 active:bg-white/15"
                >
                  <span
                    className={twMerge(
                      'text-sm font-medium transition-colors',
                      sortBy === item.key ? 'text-white' : 'text-white/60'
                    )}
                  >
                    {item.label}
                  </span>
                  {sortBy === item.key && (
                    <Check size={16} className="text-[var(--color-pink)] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Rewards */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-white/70">{t('rewards')}</p>
              <Button
                variant={hasGuaranteedOnly ? 'primary' : 'outlined'}
                icon={<ShieldCheck />}
                iconSize={16}
                className="w-full py-2.5 text-sm rounded-xl justify-start"
                onClick={() => onGuaranteedChange(!hasGuaranteedOnly)}
              >
                {t('guaranteed only')}
              </Button>
            </div>
          </div>

          {/* Fixed bottom: apply button */}
          <div className="flex-shrink-0">
            <div className="h-px bg-white/10" />
            <div className="px-5 py-4">
              <Button className="w-full" onClick={onClose}>
                {t('apply')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}
