'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';

interface ModalCloseButtonProps {
  onClick: () => void;
  className?: string;
}

export function ModalCloseButton({ onClick, className }: ModalCloseButtonProps) {
  return (
    <Button
      variant="transparent"
      onClick={onClick}
      className={twMerge(
        'absolute right-2 top-2 p-2 text-white/70 hover:text-white transition-colors',
        className
      )}
    >
      <X size={20} />
    </Button>
  );
}
