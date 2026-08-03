'use client';

import { Ban } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { FullScreenStatus } from './FullScreenStatus';

/**
 * Blocking screen shown when the backend reports the account is banned
 * (403 'BANNED'). Purely informational and permanent for the session — the
 * opaque background hides the app entirely, and there is no dismiss action.
 */
export function BannedOverlay() {
  const t = useAppTranslations();

  return (
    <FullScreenStatus
      accentClassName="bg-error/15 text-error-text"
      icon={<Ban size={34} strokeWidth={2.2} />}
      title={t('account blocked')}
      description={t('account blocked description')}
    />
  );
}
