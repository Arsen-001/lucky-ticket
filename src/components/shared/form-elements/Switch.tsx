'use client';

import { useState, type ButtonHTMLAttributes, type MouseEvent } from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'checked' | 'type'
> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  initialChecked?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function Switch({
  checked,
  onChange,
  initialChecked = false,
  disabled = false,
  loading = false,
  className,
  onClick,
  ...rest
}: SwitchProps) {
  const [innerChecked, setInnerChecked] = useState(initialChecked);
  const isChecked = checked !== undefined ? checked : innerChecked;

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (disabled || loading) return;

    // A switch is a control in its own right, and it is usually dropped into a
    // clickable settings row. Without this the row's handler ran too, so one tap
    // toggled twice — harmless only because both calls happened to compute the
    // same value, while still sending two writes for one tap.
    event.stopPropagation();

    const nextChecked = !isChecked;
    if (checked === undefined) {
      setInnerChecked(nextChecked);
    }
    onChange?.(nextChecked);
  };

  return (
    <button
      type="button"
      // Without these the state exists only as a colour and a knob position:
      // assistive tech sees an unlabeled button and cannot say whether the thing
      // it controls is on or off. Callers pass the name via `aria-label`.
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      disabled={disabled || loading}
      {...rest}
      className={twMerge(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2',
        isChecked ? 'bg-gradient-lightpink' : 'bg-white/10',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={twMerge(
          'pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          isChecked ? 'translate-x-5' : 'translate-x-0'
        )}
      >
        {loading && <Loader2 size={12} className="animate-spin text-pink" />}
      </span>
    </button>
  );
}
