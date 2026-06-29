'use client';

import type { TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  classNames?: {
    textarea?: string;
  };
}

export function Textarea({ className, classNames, rows = 3, ...rest }: TextareaProps) {
  return (
    <div
      className={twMerge(
        'bg-background-overlay text-sm p-4 rounded-lg w-full focus-outline',
        className
      )}
    >
      <textarea
        id={rest?.name}
        rows={rows}
        className={twMerge(
          'bg-transparent outline-none w-full resize-none font-semibold',
          'selection:bg-pink selection:text-white',
          classNames?.textarea
        )}
        {...rest}
      />
    </div>
  );
}
