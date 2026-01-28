import { ChevronLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button, type ButtonProps } from '@/components/shared/buttons/Button';

export function BackButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="transparent"
      className={twMerge(
        'py-1.25 px-2 rounded-lg bg-back-button-background flex items-center justify-center',
        className
      )}
      {...props}
    >
      <ChevronLeft className="w-6 h-6 -translate-x-px text-white" />
    </Button>
  );
}
