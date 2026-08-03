'use client';

import { RotateCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { FullScreenStatus } from './FullScreenStatus';

/**
 * Blocking screen shown while the browser reports no connectivity. It clears
 * itself when the `online` event fires; the retry button hard-reloads in case
 * the connection returned without firing the event.
 */
export function OfflineOverlay() {
  const t = useAppTranslations();

  return (
    <FullScreenStatus
      accentClassName="bg-error/15 text-error-text"
      icon={<WifiOff size={36} strokeWidth={2.2} />}
      title={t('no internet connection')}
      description={t('check connection and retry')}
      action={
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          icon={<RotateCw />}
          iconSize={16}
          className="px-6"
        >
          {t('retry')}
        </Button>
      }
    />
  );
}
