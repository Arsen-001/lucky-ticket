import { Button, type ButtonProps } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';

export function TournamentBetActionButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="transparent"
      className={twMerge(
        'py-1 px-2 hover:bg-white/10 rounded-lg transition-colors text-white',
        className
      )}
      {...props}
    />
  );
}
