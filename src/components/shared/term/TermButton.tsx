'use client';
import { Button, type ButtonProps } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { twMerge } from 'tailwind-merge';

export interface TermButtonProps extends ButtonProps {
  actionType?: 'accept' | 'deny';
}

export function TermButton({ actionType, children, className, ...props }: TermButtonProps) {
  const t = useAppTranslations();
  return (
    <Button
      variant={actionType === 'accept' ? 'primary' : 'secondary'}
      className={twMerge('w-full p-3 ', actionType !== 'accept' && 'bg-purple-gradient', className)}
      {...props}
    >
      {children ?? t(actionType === 'accept' ? 'accept' : 'deny')}
    </Button>
  );
}
