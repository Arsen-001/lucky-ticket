import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InventoryFilterChipProps {
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
}

export function InventoryFilterChip({ active, onClick, icon, children }: InventoryFilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-colors',
        active
          ? 'border-electric-pink/60 bg-electric-pink/15 text-white'
          : 'border-white/10 bg-white/3 text-white/55 hover:text-white/85'
      )}
    >
      {icon}
      {children}
    </button>
  );
}
