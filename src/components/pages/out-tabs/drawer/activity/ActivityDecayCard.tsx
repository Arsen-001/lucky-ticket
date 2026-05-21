'use client';

import { Flame, ShieldAlert, TrendingDown } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { computeApDecay } from '@/utils/global/activity.utils';

export interface ActivityDecayCardProps {
  lastActivityAt?: string;
  activityPoints?: number;
}

export function ActivityDecayCard({ lastActivityAt, activityPoints }: ActivityDecayCardProps) {
  const t = useAppTranslations();
  const decay = computeApDecay(lastActivityAt, activityPoints);

  const { Icon, color, title, sub } = {
    active: {
      Icon: Flame,
      color: 'var(--color-success)',
      title: t('activity active'),
      sub: t('keep playing to hold your AP'),
    },
    grace: {
      Icon: ShieldAlert,
      color: 'var(--color-warning)',
      title: t('decay in {n} days', { n: decay.daysUntilDecay }),
      sub: t('play any action to reset the timer'),
    },
    decaying: {
      Icon: TrendingDown,
      color: 'var(--color-error)',
      title: t('decay active'),
      sub: t('losing {n} AP per day until you return', { n: decay.decayPerDay }),
    },
  }[decay.state];

  return (
    <section
      className="flex items-center gap-3 rounded-2xl border p-4"
      style={{
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}
    >
      <div
        className="flex-center h-10 w-10 shrink-0 rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
      >
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-extrabold text-white">{title}</span>
        <span className="text-white-secondary text-[11px]">{sub}</span>
      </div>
    </section>
  );
}
