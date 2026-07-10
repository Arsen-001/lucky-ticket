'use client';
import type { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export type QuantityStepperButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function QuantityStepperButton({
  className,
  children,
  ...rest
}: QuantityStepperButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={twMerge(
        'flex-center h-8 w-8 rounded-lg bg-white/8 text-white transition-all hover:bg-white/15 active:scale-95 disabled:opacity-30',
        className
      )}
    >
      {children}
    </button>
  );
}
