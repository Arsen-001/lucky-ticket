'use client';

import { type InputHTMLAttributes, type ReactNode, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  loading?: boolean;
  classNames?: {
    input?: string;
    prefix?: string;
    suffix?: string;
  };
}

export function Input({ className, classNames, prefix, suffix, loading, ...rest }: InputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const focusInput = () => {
    containerRef.current?.querySelector('input')?.focus();
  };
  return (
    <div
      ref={containerRef}
      className={twMerge(
        'flex items-center gap-2 bg-background-overlay text-sm p-4 rounded-lg w-full focus-outline',
        className
      )}
    >
      {prefix && (
        <span onClick={focusInput} className={twMerge('shrink-0', classNames?.prefix)}>
          {prefix}
        </span>
      )}

      <input
        className={twMerge(
          'bg-transparent outline-none w-full font-semibold',
          'selection:bg-pink selection:text-white',
          classNames?.input
        )}
        id={rest?.name}
        // Most fields in this app are labelled by their placeholder alone, and a
        // placeholder stops being a name the moment the user types — so the field
        // a screen reader was reading as "edit text" goes anonymous exactly when
        // it has content. A real <label> is better; this is the floor.
        aria-label={rest['aria-label'] ?? rest.placeholder}
        {...rest}
        disabled={loading || rest.disabled}
      />

      {(suffix || loading) && (
        <span
          onClick={focusInput}
          className={twMerge(
            'shrink-0 inline-flex items-center justify-center',
            classNames?.suffix
          )}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : suffix}
        </span>
      )}
    </div>
  );
}
