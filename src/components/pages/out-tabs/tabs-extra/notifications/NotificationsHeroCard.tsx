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
    <div className="bg-pink-gradient relative overflow-hidden rounded-2xl p-4">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"
      />

      <div className="relative flex items-center gap-3">
        <div className="bg-white/20 flex-center relative h-10 w-10 flex-shrink-0 rounded-xl">
          <Bell size={20} className="text-white" strokeWidth={2.4} />
          {unread > 0 && (
            <>
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-white/70"
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
          <h2 className="text-base font-extrabold leading-tight text-white">
            {t('notifications')}
          </h2>
          <p className="truncate text-[11px] text-white/80">
            {allCaughtUp ? t('all caught up') : t('notifications hero subtitle')}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end">
          <span className="text-base font-extrabold leading-none tabular-nums text-white">
            {total}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
            {t('total')}
          </span>
        </div>
      </div>

      {!allCaughtUp && (
        <div className="relative mt-3 flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2">
          <span className="bg-gold/20 flex-center h-7 w-7 rounded-lg">
            <span className="bg-gold h-2 w-2 rounded-full" />
          </span>
          <span className="text-gold flex-1 text-xs font-bold tabular-nums">
            {t('{count} unread', { count: unread })}
          </span>
          {onMarkAllAsRead && (
            <Button
              variant="transparent"
              loading={isMarkingAll}
              onClick={onMarkAllAsRead}
              icon={<CheckCheck />}
              iconSize={14}
              className="text-electric-pink h-7 rounded-lg bg-white px-2.5 py-0 text-[11px] font-extrabold hover:bg-white/90"
            >
              {t('mark all as read')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
