'use client';

import { RotateCw, Wrench } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useTelegramChrome } from '@/hooks/useTelegramChrome';
import { FullScreenStatus } from './FullScreenStatus';

export interface MaintenanceScreenProps {
  /**
   * Re-ask whether the work is over. Passed only on the boot path, where this
   * screen replaces the whole app and nothing else is polling the backend —
   * inside a running app the overlay clears itself on the first request that
   * succeeds, so a button there would be decoration.
   */
  onRetry?: () => void;
  /** A re-check is in flight (the retry button's own spinner). */
  loading?: boolean;
}

/**
 * The blocking "under maintenance" screen. Shown two ways, and they must look
 * identical because to a player they are the same event:
 *
 *  - at boot, in place of the app AND in place of the pre-launch countdown
 *    (@see PreLaunchGate) — the backend says the platform is closed for this
 *    person before anything else is rendered;
 *  - mid-session, over the running app, when a request comes back 503
 *    (@see AppStatusOverlay).
 */
export function MaintenanceScreen({ onRetry, loading = false }: MaintenanceScreenProps) {
  const t = useAppTranslations();
  // Only matters on the boot path — inside the app the provider already did it,
  // and doing it twice costs nothing. @see useTelegramChrome
  useTelegramChrome();

  return (
    <FullScreenStatus
      accentClassName="bg-orange/15 text-orange"
      icon={<Wrench size={34} strokeWidth={2.2} />}
      title={t('under maintenance')}
      description={t('maintenance description')}
      action={
        onRetry && (
          <Button
            variant="secondary"
            onClick={onRetry}
            loading={loading}
            icon={<RotateCw />}
            iconSize={16}
            className="px-6"
          >
            {t('retry')}
          </Button>
        )
      }
    />
  );
}
