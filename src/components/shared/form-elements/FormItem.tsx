'use client';

import { type RegisterOptions, useFormContext, useFormState } from 'react-hook-form';
import { cloneElement, type ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

export interface FormItemProps {
  name: string;
  label?: string;
  rules?: RegisterOptions;
  children: ReactElement;
  layout?: 'vertical' | 'horizontal';
  infoMessage?: string;
  noStyle?: boolean;
  className?: string;
  classNames?: {
    label?: string;
    info?: string;
  };
}

export function FormItem({
  name,
  label,
  rules,
  children,
  className,
  infoMessage,
  layout = 'vertical',
  noStyle,
  classNames,
}: FormItemProps) {
  const { register } = useFormContext();
  // Subscribe to this field's errors with a local `useFormState` subscription:
  // reading `formState.errors` off the context is invisible to the React
  // Compiler's memoization, so error changes never re-rendered the item.
  const { errors } = useFormState({ name });

  const error = errors[name]?.message as string | undefined;

  const isHorizontal = layout === 'horizontal';

  if (noStyle) {
    return cloneElement(children, {
      ...register(name, rules),
    });
  }

  return (
    <div
      className={twMerge(
        'mb-1',
        isHorizontal ? 'flex items-center gap-4' : 'flex flex-col gap-1',
        className
      )}
    >
      {label && (
        <label
          htmlFor={name}
          className={twMerge(
            ' text-sm font-medium text-white-secondary',
            isHorizontal ? `transform -translate-y-3` : '',
            classNames?.label
          )}
        >
          {label}
        </label>
      )}

      <div className="flex flex-col w-full">
        {cloneElement(children, {
          ...register(name, rules),
        })}
        <p
          className={twMerge(
            'h-5 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold',
            error ? 'text-error' : 'text-white-secondary/50',
            classNames?.info
          )}
        >
          {error || infoMessage || ''}
        </p>
      </div>
    </div>
  );
}
