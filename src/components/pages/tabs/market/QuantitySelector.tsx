'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface QuantitySelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 100,
  className,
  disabled,
  ...rest
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div
      {...rest}
      className={twMerge('flex items-center gap-2 bg-white/5 rounded-full p-1 w-fit', className)}
    >
      <Button
        variant="transparent"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-6 aspect-square p-0 rounded-full flex-center bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
      >
        <Minus className="w-4 aspect-square text-white!" />
      </Button>
      <span className="text-white font-bold min-w-[2ch] text-center">{value}</span>
      <Button
        variant="transparent"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="w-6 aspect-square p-0 rounded-full flex-center bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
      >
        <Plus className="w-4 aspect-square text-white" />
      </Button>
    </div>
  );
}
