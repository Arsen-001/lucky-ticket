'use client';

import { X } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';

export function ModalCloseButton({ onClick, className, ...props }: ButtonProps) {
  return (
    <Button
      variant="transparent"
      onClick={onClick}
      className={twMerge(
        'absolute right-2 top-2 p-2 text-white/70 hover:text-white transition-colors',
        className
      )}
      {...props}
    >
      <X size={20} />
    </Button>
  );
}
