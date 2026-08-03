'use client';

import { RotateCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface AppErrorFallbackProps {
  /** Re-render the crashed segment (Next.js `reset`) or refetch. */
  onRetry?: () => void;
  title?: string;
  description?: string;
}

/**
 * Full-screen fallback shown when a render crashes. Used by `app/error.tsx`.
 * Turns a white-screen crash into a recoverable "something went wrong · retry".
 */
export function AppErrorFallback({ onRetry, title, description }: AppErrorFallbackProps) {
  const t = useAppTranslations();

  return (
    <div className="flex-center min-h-[70vh] flex-col gap-4 px-6 text-center">
      <div className="flex-center bg-error/15 text-error-text h-16 w-16 rounded-full">
        <TriangleAlert size={30} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-bold text-white">{title ?? t('something went wrong')}</h2>
        <p className="text-white-secondary max-w-[18rem] text-sm font-medium">
          {description ?? t('please try again')}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          icon={<RotateCw />}
          iconSize={16}
          className="px-6"
        >
          {t('retry')}
        </Button>
      )}
    </div>
  );
}
