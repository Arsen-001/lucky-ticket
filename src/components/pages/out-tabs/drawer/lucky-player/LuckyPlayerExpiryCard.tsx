'use client';

import dayjs from 'dayjs';
import { CalendarClock } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface LuckyPlayerExpiryCardProps {
  expiresAt: string;
}

export function LuckyPlayerExpiryCard({ expiresAt }: LuckyPlayerExpiryCardProps) {
  const t = useAppTranslations();
  const expiry = dayjs(expiresAt);
  const daysLeft = Math.max(0, expiry.diff(dayjs(), 'day'));
  const isExpiringSoon = daysLeft <= 3;

  const accent = isExpiringSoon ? 'var(--color-warning)' : 'var(--color-electric-pink)';

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-center h-9 w-9 rounded-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 22%, transparent)` }}
        >
          <CalendarClock size={18} style={{ color: accent }} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
            {t('expires')}
          </span>
          <span className="text-sm font-semibold text-white">{expiry.format('DD MMM YYYY')}</span>
        </div>
      </div>
      <span
        className="rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
          color: accent,
        }}
      >
        {t('{days} days left', { days: daysLeft })}
      </span>
    </div>
  );
}
