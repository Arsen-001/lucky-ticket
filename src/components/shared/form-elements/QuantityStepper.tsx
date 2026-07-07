'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { QuantityStepperButton } from '@/components/shared/form-elements/QuantityStepperButton';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  classNames?: { container?: string; value?: string };
}

/**
 * Tournament-bet-style quantity counter: MIN / − / big tap-to-type value / + /
 * MAX in one rounded row. Controlled; `min` is re-applied on blur so a cleared
 * field can't confirm 0.
 */
export function QuantityStepper({
  value,
  onChange,
  max,
  min = 1,
  classNames,
}: QuantityStepperProps) {
  const t = useAppTranslations();
  const [isEditing, setIsEditing] = useState(false);

  const isMinReached = value <= min;
  const isMaxReached = value >= max;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const num = parseInt(raw);
    if (!isNaN(num)) onChange(Math.min(max, Math.max(0, num)));
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (value < min) onChange(min);
  };

  return (
    <div
      className={twMerge(
        'flex-center w-full gap-3 rounded-2xl border border-white/10 bg-white/5 py-3',
        classNames?.container
      )}
    >
      <QuantityStepperButton
        onClick={() => onChange(min)}
        disabled={isMinReached}
        className="px-2 text-[10px] font-extrabold uppercase tracking-wider"
      >
        {t('min')}
      </QuantityStepperButton>
      <QuantityStepperButton
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={isMinReached}
      >
        <Minus size={18} className="stroke-3" />
      </QuantityStepperButton>

      {isEditing ? (
        <input
          type="number"
          value={value || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={e => e.key === 'Enter' && handleInputBlur()}
          autoFocus
          className="w-14 border-none bg-transparent text-center text-3xl font-black tabular-nums text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={twMerge(
            'min-w-14 cursor-pointer text-center text-3xl font-black tabular-nums leading-none text-white',
            classNames?.value
          )}
        >
          {value}
        </span>
      )}

      <QuantityStepperButton
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={isMaxReached}
      >
        <Plus size={18} className="stroke-3" />
      </QuantityStepperButton>
      <QuantityStepperButton
        onClick={() => onChange(max)}
        disabled={isMaxReached}
        className="px-2 text-[10px] font-extrabold uppercase tracking-wider"
      >
        {t('max')}
      </QuantityStepperButton>
    </div>
  );
}
