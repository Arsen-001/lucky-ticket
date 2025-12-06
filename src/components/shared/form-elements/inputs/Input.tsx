import { type InputHTMLAttributes, type ReactNode, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'prefix'
> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  classNames?: {
    input?: string;
    prefix?: string;
    suffix?: string;
  };
}

export function Input({
  className,
  classNames,
  prefix,
  suffix,
  ...rest
}: InputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const focusInput = () => {
    containerRef.current?.querySelector('input')?.focus();
  };
  return (
    <div
      ref={containerRef}
      className={twMerge(
        'flex items-center gap-2 bg-background/40 text-sm p-4 rounded-lg w-full focus-within:ring-1 focus-within:ring-white',
        className
      )}
    >
      {prefix && (
        <span
          onClick={focusInput}
          className={twMerge('flex-shrink-0', classNames?.prefix)}
        >
          {prefix}
        </span>
      )}

      <input
        className={twMerge(
          'bg-transparent outline-none w-full font-semibold',
          classNames?.input
        )}
        id={rest?.name}
        {...rest}
      />

      {suffix && (
        <span
          onClick={focusInput}
          className={twMerge('flex-shrink-0', classNames?.suffix)}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
