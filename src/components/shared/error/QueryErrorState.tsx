'use client';

import { RotateCw } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface QueryErrorStateProps {
  /** Re-run the failed query (`refetch`). */
  onRetry?: () => void;
  /** Override the default "couldn't load data" line. */
  message?: string;
  className?: string;
}

/**
 * Inline error block for a container whose query failed (backend down, 404/500).
 * Replaces a silently-empty screen with a clear "couldn't load · retry" so the
 * user knows it's a failure, not real emptiness, and can recover.
 */
export function QueryErrorState({ onRetry, message, className }: QueryErrorStateProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge('flex flex-col items-center gap-4 px-4 pb-6 pt-12 text-center', className)}
    >
      <p className="text-white-secondary text-sm font-medium">
        {message ?? t('couldnt load data')}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          icon={<RotateCw />}
          iconSize={16}
          className="px-5 py-2.5 text-sm"
        >
          {t('retry')}
        </Button>
      )}
    </div>
  );
}
