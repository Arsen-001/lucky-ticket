import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ChipMintCostRowProps {
  icon: ReactNode;
  label: string;
  owned: number;
  required: number;
  ok: boolean;
}

export function ChipMintCostRow({ icon, label, owned, required, ok }: ChipMintCostRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-white/65 uppercase tracking-wider">{label}</span>
      </div>
      <span className={twMerge('tabular-nums', ok ? 'text-white' : 'text-error-text')}>
        {owned} / {required}
      </span>
    </div>
  );
}
