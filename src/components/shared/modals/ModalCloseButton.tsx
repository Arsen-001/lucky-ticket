'use client';

import { X } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export function ModalCloseButton({ onClick, className, ...props }: ButtonProps) {
  const t = useAppTranslations();

  return (
    <Button
      variant="transparent"
      onClick={onClick}
      // The glyph is the whole button, so without a name every dialog's way
      // out is announced as "button" and nothing else — on all 40 of them at
      // once, since `Modal` renders this one. Set before the spread so a
      // caller can still say something more specific.
      aria-label={t('close')}
      className={twMerge(
        'absolute end-2 top-2 p-2 text-white/70 hover:text-white transition-colors',
        className
      )}
      {...props}
    >
      <X size={20} />
    </Button>
  );
}
