'use client';

import Link from 'next/link';
import { Activity, ChevronRight } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { computeActivityTier } from '@/constants/global.constants';
import { routes } from '@/constants/routes';

export interface ProfileActivityCardProps {
  activityPoints: number;
}

export function ProfileActivityCard({ activityPoints }: ProfileActivityCardProps) {
  const t = useAppTranslations();
  const tier = computeActivityTier(activityPoints);
  const accent = `var(--color-${tier})`;

  return (
    <Link
      href={routes.activity}
      className="bg-background-overlay flex items-center gap-3 rounded-2xl p-4 transition-all active:scale-99"
    >
      <div
        className="flex-center h-11 w-11 shrink-0 rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}
      >
        <Activity size={20} strokeWidth={2.4} />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
          {t('activity points')}
        </span>
        <span className="text-xl font-black leading-tight tabular-nums text-white">
          {activityPoints.toLocaleString()}
        </span>
      </div>
      <span
        className="rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider"
        style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}
      >
        {t(tier)}
      </span>
      <ChevronRight size={18} className="shrink-0 text-white/35" />
    </Link>
  );
}
