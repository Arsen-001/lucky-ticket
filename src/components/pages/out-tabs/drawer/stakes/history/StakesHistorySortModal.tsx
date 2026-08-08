'use client';

import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export type StakeHistorySortId = 'newest' | 'oldest' | 'highest' | 'level';

interface SortOption {
  id: StakeHistorySortId;
  labelKey: 'newest' | 'oldest' | 'highest yield' | 'by level';
}

export const STAKE_HISTORY_SORTS: SortOption[] = [
  { id: 'newest', labelKey: 'newest' },
  { id: 'oldest', labelKey: 'oldest' },
  { id: 'highest', labelKey: 'highest yield' },
  { id: 'level', labelKey: 'by level' },
];

export interface StakesHistorySortModalProps {
  open: boolean;
  onClose: () => void;
  value: StakeHistorySortId;
  onChange: (value: StakeHistorySortId) => void;
}

/**
 * Sort picker for the stakes history — the project's custom Modal in place of a
 * native `<select>`, so it matches the app's dark theme and option styling.
 */
export function StakesHistorySortModal({
  open,
  onClose,
  value,
  onChange,
}: StakesHistorySortModalProps) {
  const t = useAppTranslations();

  const handleSelect = (id: StakeHistorySortId) => {
    onChange(id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} label={t('sort by')}>
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-background-overlay p-5">
        <h2 className="text-base font-extrabold text-white">{t('sort by')}</h2>
        <div className="flex flex-col gap-1.5">
          {STAKE_HISTORY_SORTS.map(({ id, labelKey }) => {
            const active = id === value;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelect(id)}
                aria-pressed={active}
                className={twMerge(
                  'flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition-colors',
                  active
                    ? 'border-electric-pink/40 bg-electric-pink/15 text-white'
                    : 'border-white/10 bg-white/5 text-white-secondary'
                )}
              >
                <span>{t(labelKey)}</span>
                {active && <Check size={16} className="text-electric-pink shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
