'use client';

import { useEffect } from 'react';
import { AppErrorFallback } from '@/components/shared/error/AppErrorFallback';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Segment-level error boundary. Catches any render crash below the root layout
 * (a bad data shape, a thrown component) and shows a recoverable fallback inside
 * the app shell instead of a white screen. Lives within the i18n provider.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <AppErrorFallback onRetry={reset} />;
}
