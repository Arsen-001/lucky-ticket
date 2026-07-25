'use client';

import { ShieldAlert } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * Shown instead of the QR + address when the backend reports no treasury. There
 * is deliberately no address to copy: any TON sent while deposits are off could
 * not be attributed to the player, so offering a target would lose their money.
 */
export function DepositUnavailableNotice() {
  const t = useAppTranslations();

  return (
    <div className="bg-background-overlay flex flex-col items-center gap-2 rounded-2xl p-6 text-center">
      <div className="bg-warning/15 border-warning/30 flex-center h-12 w-12 rounded-2xl border">
        <ShieldAlert size={22} className="text-warning" strokeWidth={2.2} />
      </div>
      <p className="text-sm font-bold text-white">{t('deposits unavailable')}</p>
      <p className="text-pink-secondary text-[11px] font-medium leading-snug">
        {t('deposits unavailable description')}
      </p>
    </div>
  );
}
