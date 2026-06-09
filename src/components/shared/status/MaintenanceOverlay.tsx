'use client';

import { Wrench } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { FullScreenStatus } from './FullScreenStatus';

/**
 * Blocking screen shown while `appConfig.maintenance.enabled` is true. Purely
 * informational — there's no action the user can take but wait, so no button.
 */
export function MaintenanceOverlay() {
  const t = useAppTranslations();

  return (
    <FullScreenStatus
      accentClassName="bg-orange/15 text-orange"
      icon={<Wrench size={34} strokeWidth={2.2} />}
      title={t('under maintenance')}
      description={t('maintenance description')}
    />
  );
}
