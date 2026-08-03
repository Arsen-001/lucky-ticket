'use client';

import { Unplug, RotateCw } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { FullScreenStatus } from '@/components/shared/status/FullScreenStatus';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import '@/styles/components/telegram-splash.css';

interface TelegramSplashProps {
  /** When true, shows the auth-failed state with a retry action. */
  error?: boolean;
  onRetry?: () => void;
}

/**
 * Full-screen branded launch screen shown while the Telegram session
 * authenticates on boot (and, on failure, with a retry). The loading state is a
 * proper splash — the shimmering LuckyTicket365 wordmark over the app's brand
 * background — instead of a bare spinner. The error state reuses the app's
 * blocking-status shell so it matches the no-internet / maintenance screens.
 */
export function TelegramSplash({ error = false, onRetry }: TelegramSplashProps) {
  const t = useAppTranslations();

  if (error) {
    return (
      <FullScreenStatus
        accentClassName="bg-error/15 text-error-text"
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
    <div className="bg-background animate-fade-in fixed inset-0 z-[1100] flex flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      {/* Ambient brand glows — same palette as the app's status screens. */}
      <span
        aria-hidden
        className="bg-electric-pink/15 pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
      />
      <span
        aria-hidden
        className="bg-electric-purple/15 pointer-events-none absolute -bottom-24 -right-16 h-60 w-60 rounded-full blur-3xl"
      />

      <h1 className="tg-splash__wordmark animate-slide-in-bottom relative">
        {GlobalConstants.projectName}
      </h1>

      <div className="animate-fade-in relative flex flex-col items-center gap-4">
        <p className="text-white-secondary max-w-[20rem] text-sm font-medium">
          {t('connecting to telegram description')}
        </p>
        <span aria-hidden className="tg-splash__bar" />
      </div>
    </div>
  );
}
