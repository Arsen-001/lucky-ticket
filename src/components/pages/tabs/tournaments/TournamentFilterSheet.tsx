'use client';

import type { LucideIcon } from 'lucide-react';
import { Check, Clock, Coins, RotateCcw, Sparkles, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { Button } from '@/components/shared/buttons/Button';
import { TournamentTypeChips } from '@/components/pages/tabs/tournaments/TournamentTypeChips';
import type { TournamentType } from '@/types/types/tournaments.types';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useOverlayPresence } from '@/hooks/useOverlayPresence';

/** Matches the panel's `duration-300` slide. */
const ANIMATION_MS = 300;

export type SortOption = 'soonest' | 'prize-pool' | 'team-size';

interface SortItem {
  key: SortOption;
  label: string;
  icon: LucideIcon;
}

interface TournamentFilterSheetProps {
  open: boolean;
  onClose: () => void;
  selectedTypes: TournamentType[];
  onTypesChange: (types: TournamentType[]) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
}

export function TournamentFilterSheet({
  open,
  onClose,
  selectedTypes,
  onTypesChange,
  sortBy,
  onSortChange,
  onReset,
}: TournamentFilterSheetProps) {
  const t = useAppTranslations();
  // Closed → nothing in the DOM (see useOverlayPresence).
  const { mounted, visible } = useOverlayPresence(open, ANIMATION_MS);

  const sortItems: SortItem[] = [
    { key: 'soonest', label: t('starts soonest'), icon: Clock },
    { key: 'prize-pool', label: t('highest prize pool'), icon: Coins },
    { key: 'team-size', label: t('best odds (smallest team)'), icon: Users },
  ];

  if (!mounted) return null;

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={twMerge(
          'fixed inset-0 z-100 flex items-end transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-fade backdrop-blur-[2px]" onClick={onClose} />

        {/* Sheet panel */}
        <div
          className={twMerge(
            'relative w-full bg-[var(--color-background)] rounded-t-3xl transition-transform duration-300 ease-in-out max-h-[85vh] flex flex-col shadow-[0_-12px_40px_rgba(0,0,0,0.5)]',
            visible ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          {/* Drag handle */}
          <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-white/25" />
          </div>

          {/* Header */}
          <div className="flex-shrink-0 px-5 pt-3 pb-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 leading-none">
                <Sparkles className="w-4 h-4 text-pink-secondary shrink-0" />
                <h3 className="text-base font-extrabold uppercase tracking-[0.16em] leading-none">
                  {t('filters')}
                </h3>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 text-xs font-bold text-pink-secondary hover:text-white transition-colors leading-none"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.4} />
                <span className="leading-none">{t('reset')}</span>
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 h-px bg-white/10" />

          {/* Scrollable filter content */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden px-5 py-5 flex flex-col gap-6">
            {/* Ticket type */}
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/55 leading-none">
                {t('ticket type')}
              </p>
              <TournamentTypeChips selected={selectedTypes} onChange={onTypesChange} />
            </div>

            {/* Sort by */}
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/55 leading-none">
                {t('sort by')}
              </p>
              <div className="flex flex-col gap-1.5">
                {sortItems.map(item => {
                  const Icon = item.icon;
                  const isActive = sortBy === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onSortChange(item.key)}
                      className={twMerge(
                        'inline-flex items-center justify-between gap-2 w-full py-3 px-4 rounded-xl border transition-all duration-150 active:scale-99 leading-none',
                        isActive
                          ? 'bg-white/10 border-pink-secondary'
                          : 'bg-white/5 border-transparent hover:bg-white/10'
                      )}
                    >
                      <span className="inline-flex items-center gap-2 leading-none">
                        <Icon
                          className={twMerge(
                            'w-4 h-4 shrink-0',
                            isActive ? 'text-pink-secondary' : 'text-pink-secondary/70'
                          )}
                          strokeWidth={2.4}
                        />
                        <span
                          className={twMerge(
                            'text-sm font-bold leading-none',
                            isActive ? 'text-white' : 'text-white/70'
                          )}
                        >
                          {item.label}
                        </span>
                      </span>
                      {isActive && <Check size={16} className="text-pink-secondary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Apply button — fixed bottom; safe-area inset keeps it above the
              iOS home indicator in fullscreen Mini App mode */}
          <div className="flex-shrink-0">
            <div className="h-px bg-white/10" />
            <div className="px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                onClick={onClose}
                className="w-full py-3 rounded-full text-xs font-extrabold uppercase tracking-[0.16em] leading-none shadow-[0_6px_18px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.28)] active:scale-99 transition-transform"
              >
                <span className="leading-none">{t('apply')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}
