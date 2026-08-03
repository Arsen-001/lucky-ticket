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
  const errorId = `${name}-error`;

  /**
   * What makes the error exist for anything but the eye. Without these the
   * message was red text next to a field that still reported itself as valid:
   * a screen-reader user submitted, heard nothing, and had no way to learn why
   * the form had not gone anywhere. `role="alert"` is what announces it on
   * appearance; `aria-describedby` is what ties it to the field afterwards.
   */
  const validationProps = error ? { 'aria-invalid': true, 'aria-describedby': errorId } : undefined;

  const isHorizontal = layout === 'horizontal';

  if (noStyle) {
    return cloneElement(children, {
      ...register(name, rules),
      ...validationProps,
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
          ...validationProps,
        })}
        <p
          id={errorId}
          role={error ? 'alert' : undefined}
          className={twMerge(
            'h-5 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold',
            error ? 'text-error-text' : 'text-white-secondary/50',
            classNames?.info
          )}
        >
          {error || infoMessage || ''}
        </p>
      </div>
    </div>
  );
}
