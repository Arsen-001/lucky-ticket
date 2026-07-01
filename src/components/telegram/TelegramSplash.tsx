'use client';

import { Loader2, Unplug, RotateCw } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { FullScreenStatus } from '@/components/shared/status/FullScreenStatus';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface TelegramSplashProps {
  /** When true, shows the auth-failed state with a retry action. */
  error?: boolean;
  onRetry?: () => void;
}

/**
 * Full-screen launch state shown while the Telegram session authenticates on
 * boot (and on failure, with a retry). Reuses the app's blocking-status shell
 * so it matches the no-internet / maintenance screens.
 */
export function TelegramSplash({ error = false, onRetry }: TelegramSplashProps) {
  const t = useAppTranslations();

  if (error) {
    return (
      <FullScreenStatus
        accentClassName="bg-error/15 text-error"
        icon={<Unplug size={36} strokeWidth={2.2} />}
        title={t('telegram auth failed')}
        description={t('telegram auth failed description')}
        action={
          <Button
            variant="secondary"
            onClick={onRetry}
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

  return (
    <FullScreenStatus
      accentClassName="bg-electric-purple/15 text-electric-purple"
      icon={<Loader2 size={34} className="animate-spin" />}
      title={t('connecting to telegram')}
      description={t('connecting to telegram description')}
    />
  );
}
