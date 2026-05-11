'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface LeaderboardErrorStateProps {
  onRetry: () => void;
  loading?: boolean;
}

export function LeaderboardErrorState({ onRetry, loading }: LeaderboardErrorStateProps) {
  const t = useAppTranslations();
  return (
    <div className="bg-background-overlay flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-6 text-center">
      <div className="bg-error/15 border-error/30 flex-center h-12 w-12 rounded-full border">
        <AlertTriangle size={22} className="text-error" strokeWidth={2.2} />
      </div>
      <p className="text-sm font-bold text-white">{t('failed to load')}</p>
      <Button
        variant="primary"
        loading={loading}
        onClick={onRetry}
        icon={<RefreshCcw />}
        iconSize={14}
        className="h-9 rounded-xl px-4 py-0 text-xs font-extrabold"
      >
        {t('retry')}
      </Button>
    </div>
  );
}
