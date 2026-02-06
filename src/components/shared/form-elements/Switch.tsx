'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  initialChecked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  initialChecked = false,
  disabled = false,
  loading = false,
  className,
}: SwitchProps) {
  const [innerChecked, setInnerChecked] = useState(initialChecked);
  const isChecked = checked !== undefined ? checked : innerChecked;

  const handleToggle = () => {
    if (disabled || loading) return;

    const nextChecked = !isChecked;
    if (checked === undefined) {
      setInnerChecked(nextChecked);
    }
    onChange?.(nextChecked);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || loading}
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
