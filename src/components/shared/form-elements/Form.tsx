'use client';

import { type FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface FormProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  children: ReactNode;
  errorMessage?: string;
  noStyle?: boolean;
}

export function Form<T extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  errorMessage,
  noStyle,
}: FormProps<T>) {
  const { handleSubmit } = form;
  return (
    <FormProvider {...form}>
      {!noStyle && (
        <p
          className={twMerge(
            'my-1 text-sm text-error font-semibold transition-all duration-500 ease-in-out',
            errorMessage
              ? 'opacity-100 translate-y-0 max-h-10'
              : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden'
          )}
        >
          {errorMessage || ' '}
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="on" spellCheck={false}>
        {children}
      </form>
    </FormProvider>
  );
}
