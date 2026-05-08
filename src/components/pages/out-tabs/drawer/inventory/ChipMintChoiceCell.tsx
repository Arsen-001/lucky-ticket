import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ChipMintChoiceCellProps {
  active: boolean;
  accent: string;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

export function ChipMintChoiceCell({
  active,
  accent,
  onClick,
  icon,
  label,
}: ChipMintChoiceCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors',
        active ? 'text-white' : 'text-white/65 hover:text-white/85'
      )}
      style={{
        borderColor: active
          ? `color-mix(in srgb, ${accent} 65%, transparent)`
          : 'color-mix(in srgb, white 12%, transparent)',
        backgroundColor: active ? `color-mix(in srgb, ${accent} 16%, transparent)` : 'transparent',
      }}
    >
      {icon}
      <span className="text-[12px] font-extrabold uppercase tracking-wider">{label}</span>
    </button>
  );
}
