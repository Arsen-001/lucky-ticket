'use client';

import { ChevronLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button, type ButtonProps } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * The back control on every screen header.
 *
 * Its only content is an icon, and an icon has no text for a screen reader to
 * read — so it announced as an unnamed button on every screen that has one.
 * The name is defaulted rather than required, because a caller that has to
 * remember it is a caller that will forget it; passing `aria-label` still wins
 * where a screen wants to be more specific than "back".
 */
export function BackButton({ className, ...props }: ButtonProps) {
  const t = useAppTranslations();

  return (
    <Button
      variant="transparent"
      aria-label={t('back')}
      className={twMerge(
        'py-1 px-1.5 rounded-lg bg-back-button-background flex items-center justify-center',
        className
      )}
      {...props}
    >
      <ChevronLeft className="w-5 h-5 -translate-x-px text-white" />
    </Button>
  );
}
