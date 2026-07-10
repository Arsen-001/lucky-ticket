'use client';
import { twMerge } from 'tailwind-merge';

export interface FilterPillsProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

export function FilterPills({ options, value, onChange }: FilterPillsProps) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 scrollbar-hidden">
      <div className="flex w-max gap-2 pr-3">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={twMerge(
              'rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all',
              value === opt.value
                ? 'border-electric-pink bg-electric-pink/20 text-electric-pink'
                : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
