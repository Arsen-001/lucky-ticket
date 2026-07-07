import type { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface QuantityStepperButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function QuantityStepperButton({ className, ...rest }: QuantityStepperButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={twMerge(
        'flex-center h-9 w-9 rounded-xl bg-white/8 text-white transition-all hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30',
        className
      )}
    />
  );
}
