'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface NotificationsHeroCardProps {
  total: number;
  unread: number;
  onMarkAllAsRead?: () => void;
  isMarkingAll?: boolean;
}

export function NotificationsHeroCard({
  total,
  unread,
  onMarkAllAsRead,
  isMarkingAll,
}: NotificationsHeroCardProps) {
  const t = useAppTranslations();
  const allCaughtUp = unread === 0;

  return (
    <div
      className="shine-card relative overflow-hidden rounded-2xl p-3"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-pink)' }}
    >
      <span
        aria-hidden
        className="bg-electric-pink/12 pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
      />

      <div className="relative flex items-center gap-3">
        <div className="bg-electric-pink/15 ring-electric-pink/30 flex-center relative h-10 w-10 flex-shrink-0 rounded-xl ring-1">
          <Bell size={20} className="text-electric-pink" strokeWidth={2.2} />
          {unread > 0 && (
            <>
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-gold/70"
              />
              <span
                aria-hidden
                className="bg-gold absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full"
                style={{ boxShadow: '0 0 6px rgba(248,189,62,0.85)' }}
              />
            </>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-sm font-extrabold leading-tight text-white">{t('notifications')}</h2>
          <p className="text-pink-secondary truncate text-[11px]">
            {allCaughtUp ? t('all caught up') : t('notifications hero subtitle')}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end">
          <span className="text-base font-extrabold leading-none tabular-nums text-white">
            {total}
          </span>
          <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
            {t('total')}
          </span>
        </div>
      </div>

      {/* The label sits on its own full-width row, never beside the counter:
          "Отметить все как прочитанные" / "Alle als gelesen markieren" are
          twice the length of the English one and wrapped inside a fixed-height
          h-7 button, spilling the second line outside it. */}
      {!allCaughtUp && (
        <div className="relative mt-2.5 flex flex-col gap-2 rounded-xl bg-black/25 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="bg-gold/20 flex-center h-7 w-7 flex-shrink-0 rounded-lg">
              <span className="bg-gold h-2 w-2 rounded-full" />
            </span>
            <span className="text-gold flex-1 text-xs font-bold tabular-nums">
              {t('{count} unread', { count: unread })}
            </span>
          </div>
          {onMarkAllAsRead && (
            <Button
              variant="primary"
              loading={isMarkingAll}
              onClick={onMarkAllAsRead}
              icon={<CheckCheck />}
              iconSize={14}
              className="bg-pink-gradient min-h-9 w-full rounded-lg px-3 py-1.5 text-[11px] font-extrabold leading-tight text-white"
            >
              {t('mark all as read')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
