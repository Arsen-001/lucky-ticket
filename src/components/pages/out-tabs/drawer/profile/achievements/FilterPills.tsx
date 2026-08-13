'use client';
import { twMerge } from 'tailwind-merge';

export interface FilterPillsProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

export function FilterPills({ options, value, onChange }: FilterPillsProps) {
  return (
    // The pills are 30px tall, and `overflow-x` computes `overflow-y: auto`
    // alongside it — so a 44px hit zone inside a strip only 30px tall gets
    // clipped away, which is how these read 15 owned points of 25. The padding
    // buys the zone its room and the negative margin gives the layout back, so
    // nothing on screen moves.
    <div className="-mx-5 -my-[7px] overflow-x-auto px-5 py-[7px] scrollbar-hidden">
      <div className="flex w-max gap-2 pr-3">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={twMerge(
              'tap-target relative rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all',
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
